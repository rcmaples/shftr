'use strict';
const { RRule } = require('rrule');

const Appointment = require('../models/Appointment');
const Agent = require('../models/Agent');
const OfflineTicket = require('../models/OfflineTicket');

const { assignTicket, findAvailableAgents } = require('./ticketAssignment');

const findActiveAgents = async () => {
  const activeAgents = await Agent.find({ activated: true }).exec();
  let activeAgentIds = [];
  activeAgents.map(doc => {
    activeAgentIds.push(doc._id.toHexString());
  });
  return activeAgentIds;
};

const findAgentAppointments = async arr => {
  const availableAppointments = await Appointment.find({ agent: { $in: arr } }).exec();
  return availableAppointments;
};

const isOnline = async () => {
  const now = new Date();

  let activeIds = await findActiveAgents();
  let activeAppointments = await findAgentAppointments(activeIds);
  let onlineIds = [];

  activeAppointments.map(appt => {
    let apptLength = appt.endDate.getTime() - appt.startDate.getTime();
    let apptStartDate = appt.startDate.toISOString().split('-').join('').split(':').join('').slice(0, 15).concat('Z');
    let apptRule;
    let latestShiftStart;
    let shiftEnd;
    let excludedDates = [];
    let excluded = false;

    // console.log('appt:\n', appt);

    if (!!appt.exDate) {
      let apptExdateArray = appt.exDate.split(',');
      apptExdateArray.map(string => {
        let year = string.slice(0, 4);
        let month = string.slice(4, 6);
        let day = string.slice(6, 8);
        let t = string.slice(8, 9);
        let hour = string.slice(9, 11);
        let minute = string.slice(11, 13);
        let seconds = string.slice(13, 15);
        excludedDates.push(new Date(`${year}-${month}-${day}${t}${hour}:${minute}:${seconds}.000+00:00`));
      });
    }

    if (!appt.rRule) {
      latestShiftStart = appt.startDate;
      shiftEnd = appt.endDate;
    } else {
      if (!!appt.rRule.includes('RRULE:')) {
        apptRule = RRule.fromString(`DTSTART:${apptStartDate}\nRRULE:${appt.rRule.split(':')[1]}`);
        // console.log('apptStartDate\n', apptStartDate);
        // console.log('appt.rRule.split\n', `${appt.rRule.split(':')[1]}`);
        // console.log('line 65:\n', apptRule);
      } else if (!appt.rRule.includes('RRULE:')) {
        apptRule = RRule.fromString(`DTSTART:${apptStartDate}\nRRULE:${appt.rRule}`);
        // console.log('line 66:\n', apptRule);
      }

      try {
        latestShiftStart = apptRule.before(now, true);
        // console.log('line 70:\n', latestShiftStart);
      } catch (error) {
        console.log('error:\n', error);
      }

      shiftEnd = new Date(latestShiftStart.getTime() + apptLength);
    }

    if (excludedDates.length > 0) {
      excludedDates.map(shift => {
        let excludedShiftStart = shift;
        let excludedShiftEnd = new Date(shift.getTime() + apptLength);
        if (excludedShiftStart.getTime() < now.getTime() && now.getTime() < excludedShiftEnd.getTime()) {
          excluded = true;
        }
      });
    }

    if (latestShiftStart.getTime() < now.getTime() && now.getTime() < shiftEnd.getTime() && !excluded) {
      onlineIds.push(appt.agent);
    }
  });
  return onlineIds;
};

const setOnline = async () => {
  let now = new Date();
  console.log(`${now} - Checking online status...`);
  let activeIds = await findActiveAgents();
  let onlineIds = await isOnline();
  console.log(`${now} - Setting the following ids online: `, onlineIds);

  activeIds.map(async activeId => {
    if (onlineIds.indexOf(activeId) != -1) {
      await Agent.findByIdAndUpdate(activeId, { $set: { online: true } })
        .exec()
        .catch(error => console.log(error));
    } else {
      await Agent.findByIdAndUpdate(activeId, { $set: { online: false } })
        .exec()
        .catch(error => console.log(error));
    }
  });
  return;
};

const emptyOfflineQueue = async () => {
  let now = new Date();
  console.log(`${now} - Checking for offline tickets...`);
  let tickets = await OfflineTicket.find({}).lean();
  let availableAgents = await findAvailableAgents();
  console.log(`${now} - There are ${tickets.length} tickets in the offline queue.`);

  if (tickets.length < 1) {
    console.log(`${now} - The offline queue is all clear! Huzzah!`);
    return;
  }

  if (availableAgents < 1) {
    console.log(`${now} - There are no available agents. Going back to sleep.`);
    return;
  }

  tickets.map(async ticket => {
    const { ticketId, org } = ticket;
    assignTicket(ticket, org);
    OfflineTicket.findOneAndDelete({ org: org, ticketId: ticketId })
      .then(document => {
        if (!document) {
          throw 'Error deleting offline ticket.';
        }
        return;
      })
      .catch(error => console.log(error));
  });
};

module.exports = { isOnline, setOnline, emptyOfflineQueue };
