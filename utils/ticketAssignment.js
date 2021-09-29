'use strict';
const fetch = require('node-fetch');
const Agent = require('../models/Agent');
const ZendeskConfig = require('../models/ZendeskConfig');
const OfflineTicket = require('../models/OfflineTicket');
const AssignmentRecord = require('../models/AssignmentRecord');

const groupsDict = {
  supeng: 'Support Engineers',
  techcheck: 'Tech Check',
  mobile: 'Native Mobile',
};

const findAvailableAgents = async () => {
  // hard coding this to finding support engineers for now until we decide to start doing auto assignment for main queue
  const onlineAgents = await Agent.find({ online: true, activated: true, defaultZendeskGroupName: 'Support Engineers' })
    .lean()
    .exec();
  let availableAgents = [];
  onlineAgents.map(doc => {
    const { email, name, queueShare, zendeskId, _id: id } = doc;
    const serializedDoc = {
      name,
      email,
      zendeskId,
      queueShare,
      id: id.toHexString(),
    };
    availableAgents.push(serializedDoc);
  });
  return availableAgents;
};

const infiniteImprobabilityDrive = async groupName => {
  let availableAgents = await findAvailableAgents();
  let totalAvailability = 0;
  let bowlOfPetunias = 0;
  let bottom = 0;
  let top = 0;

  if (availableAgents.length < 1) {
    console.log('No agents available.');
    return totalAvailability;
  }

  availableAgents.map(agent => {
    totalAvailability += agent.queueShare[`${groupName}`];
  });

  if (totalAvailability > 0) {
    bowlOfPetunias = Math.floor(Math.random() * totalAvailability);
  }

  for (let i = 0; i < availableAgents.length; i++) {
    let theAgent = availableAgents[i];
    top = bottom + theAgent.queueShare[`${groupName}`];
    if (bowlOfPetunias >= bottom && bowlOfPetunias < top) {
      return theAgent;
    }
    bottom = top;
  }
};

const assignTicket = async (theTicket, org) => {
  const connectionInfo = await ZendeskConfig.findOne({ org }).lean().exec();
  const { subdomain, userString, zendeskToken } = connectionInfo;

  const { groupName, ticketId, ticketUrl } = theTicket;
  let ticketGroup = Object.keys(groupsDict).find(key => groupsDict[key] === groupName);

  let winningAgent = await infiniteImprobabilityDrive(ticketGroup);

  if (winningAgent === 0) {
    console.log('Winning agent: ', winningAgent); // temp, to be removed.
    addToOfflineQueue(theTicket, org);
    return;
  }

  let { zendeskId, email, name } = winningAgent;

  let zendeskTicketUrl = `https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}.json`;
  let userToken = `${userString}:${zendeskToken}`;
  let tokenBuffer = Buffer.from(userToken, 'utf8');
  let base64token = tokenBuffer.toString('base64');

  let body = JSON.stringify({
    ticket: {
      assignee_email: email,
    },
  });

  let options = {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${base64token}`,
      'Content-Type': 'application/json',
    },
    body,
    redirect: 'follow',
  };

  console.log(`Attempting to assign ticket ${ticketId} to ${email} (${zendeskId}).`);

  return fetch(zendeskTicketUrl, options)
    .then(response => {
      if (!response.ok) {
        throw { status: response.status, message: response.statusText };
      }
      return response.json();
    })
    .then(result => {
      console.log(`Assigned ticket ${ticketId} to ${result.ticket['assignee_id']}`);
      AssignmentRecord.findOne({ ticketId: ticketId }).then(document => {
        if (document) {
          console.log(`A record for ${ticketId} already exists.`);
          return;
        } else {
          const newAssignmentRecord = new AssignmentRecord({
            name,
            email,
            zendeskUserId: zendeskId,
            groupName,
            ticketUrl,
            ticketId,
            org,
          });
          newAssignmentRecord
            .save()
            .then(doc => {
              console.log('Logging the ticket.');
              return;
            })
            .catch(error => console.log(error));
        }
      });
    })
    .catch(error => console.log(error));
};

const addToOfflineQueue = (theTicket, org) => {
  const { ticketId, groupName, ticketUrl } = theTicket;
  console.log(`Adding ticket ${ticketId} to the offline queue.`);
  OfflineTicket.findOne({ ticketId: ticketId }).then(document => {
    if (!document) {
      const newOfflineTicket = new OfflineTicket({
        ticketId,
        groupName,
        ticketUrl,
        org,
      });

      newOfflineTicket
        .save()
        .then(offlineTicket => {
          console.log(offlineTicket);
          return;
        })
        .catch(error => console.log(error));
    } else {
      console.log(`Ticket ${ticketId} is already in the offline queue.`);
      return;
    }
  });
};

module.exports = { assignTicket, infiniteImprobabilityDrive, findAvailableAgents };
