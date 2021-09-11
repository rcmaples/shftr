'use strict';
const fetch = require('node-fetch');
const passport = require('passport');
// const jwtAuth = passport.authenticate('jwt', { session: false });

const jwtUserAuth = passport.authenticate('user', { session: false });
const jwtKeyAuth = passport.authenticate('key', { session: false });

const ZendeskConfig = require('../../models/ZendeskConfig');
const Agent = require('../../models/Agent');

const { validateZendeskInformation, validateZendeskTest } = require('../../validation/zendeskConfig');

const validateAgentUpdate = require('../../validation/agents');
const { assignTicket } = require('../../utils/ticketAssignment');

module.exports = app => {
  app.post('/api/zendesk-configs', jwtUserAuth, (req, res) => {
    const { errors, isValid } = validateZendeskInformation(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { subdomain, userString, zendeskToken } = req.body;
    const org = req.user.org;

    ZendeskConfig.findOne({ subdomain }).then(document => {
      if (document) {
        return res.status(400).json({ code: 400, reason: 'DuplicateEntry', message: 'Subdomain already exists' });
      } else {
        const newZendeskConfig = new ZendeskConfig({
          org,
          subdomain,
          userString,
          zendeskToken,
        });

        newZendeskConfig
          .save()
          .then(document => res.json(document.serialize()))
          .catch(error => console.log(error));
      }
    });
  });

  app.get('/api/zendesk-configs', jwtUserAuth, (req, res) => {
    ZendeskConfig.findOne({ org: req.user.org })
      .then(configDoc => {
        res.status(200).json(configDoc.serialize());
      })
      .catch(error => res.status(500).json(error));
  });

  app.post('/api/zendesk-test', jwtUserAuth, async (req, res) => {
    const { errors, isValid } = validateZendeskTest(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { subdomain, userString, zendeskToken } = req.body;

    let zendeskUrl = `https://${subdomain}.zendesk.com/api/v2/users/me`;
    let userToken = `${userString}:${zendeskToken}`;
    let tokenBuffer = Buffer.from(userToken, 'utf8');
    let base64token = tokenBuffer.toString('base64');
    let options = {
      method: 'GET',
      headers: {
        Authorization: `Basic ${base64token}`,
      },
    };
    fetch(zendeskUrl, options)
      .then(response => {
        const { status, statusText } = response;
        if (status >= 200 && status < 300) {
          return response.json();
        } else {
          throw { status, statusText };
        }
      })
      .then(data => {
        if (data.user.id) {
          let returnObject = {
            code: 200,
            zendeskId: data.user.id,
            zendeskRole: data.user.role,
            zendeskActive: data.user.active,
          };
          res.status(200).json(returnObject);
        } else {
          throw { status: 401, statusText: 'Invalid User' };
        }
      })
      .catch(error => {
        const { status, statusText } = error;
        if (status === 404) {
          res.status(500).json({ response: `${status} ${statusText}`, message: `${subdomain} not found.` });
        } else {
          res.status(500).json({ response: `${status} ${statusText}`, message: `Internal Server Error` });
        }
      });
  });

  app.post('/api/zendesk-agents', jwtUserAuth, (req, res) => {
    const org = req.user.org;

    ZendeskConfig.findOne({ org })
      .then(async document => {
        if (!document) {
          return res.status(400).json({ code: 400, reason: 'NoConfigWithId', message: 'Config not found' });
        } else {
          const { org, subdomain, userString, zendeskToken } = document;

          let zendeskAdminsUrl = `https://${subdomain}.zendesk.com/api/v2/users?role=2`; // admins
          let zendeskStaffUrl = `https://${subdomain}.zendesk.com/api/v2/users?permission_set=3090907`; // staff
          let zendeskGroupsUrl = `https://${subdomain}.zendesk.com/api/v2/groups.json`; // groups

          let userToken = `${userString}:${zendeskToken}`;
          let tokenBuffer = Buffer.from(userToken, 'utf8');
          let base64token = tokenBuffer.toString('base64');
          let options = {
            method: 'GET',
            headers: {
              Authorization: `Basic ${base64token}`,
            },
          };

          let zendeskGroups = await fetch(zendeskGroupsUrl, options)
            .then(response => response.json())
            .then(data => {
              return data.groups;
            })
            .catch(error => console.log(error));

          await fetch(zendeskAdminsUrl, options)
            .then(response => response.json())
            .then(data => {
              const { users } = data;
              users.map(user => {
                let defaultZendeskGroupName = zendeskGroups.find(group => group.id === user.default_group_id).name;

                Agent.findOne({ zendeskId: user.id }).then(agent => {
                  if (!agent) {
                    const newAgent = new Agent({
                      name: user.name,
                      email: user.email,
                      zendeskId: user.id,
                      org: org,
                      activated: false,
                      online: false,
                      text: user.name,
                      defaultZendeskGroupId: user.default_group_id,
                      defaultZendeskGroupName: defaultZendeskGroupName,
                    });

                    newAgent
                      .save()
                      .then(agent => {
                        return;
                      })
                      .catch(error => console.log(error));
                  }
                });
              });
            })
            .catch(error => console.log(error));

          await fetch(zendeskStaffUrl, options)
            .then(response => response.json())
            .then(data => {
              // console.log('inside Staff: ', zendeskGroups);
              const { users } = data;
              users.map(user => {
                let defaultZendeskGroupName = zendeskGroups.find(group => group.id === user.default_group_id).name;

                Agent.findOne({ zendeskId: user.id }).then(agent => {
                  if (!agent) {
                    const newAgent = new Agent({
                      name: user.name,
                      email: user.email,
                      zendeskId: user.id,
                      org: org,
                      activated: false,
                      online: false,
                      text: user.name,
                      defaultZendeskGroupId: user.default_group_id,
                      defaultZendeskGroupName: defaultZendeskGroupName,
                    });

                    newAgent
                      .save()
                      .then(agent => {
                        return;
                      })
                      .catch(error => console.log(error));
                  }
                });
              });
            })
            .catch(error => console.log(error));
        }
      })
      .then(async () => {
        Agent.find({ org }).then(agents => {
          let serialized = [];
          agents.map(async agent => {
            await serialized.push(agent.serialize());
          });
          res.status(200).json(serialized);
        });
      })
      .catch(error => console.log(error));
  });

  app.get('/api/zendesk-agents/:status?', jwtUserAuth, (req, res) => {
    const org = req.user.org;
    const status = req.query.status;

    if (status === 'active') {
      Agent.find({ org: org, activated: true })
        .then(agents => {
          let serialized = [];
          agents.map(agent => {
            serialized.push(agent.serialize());
          });
          res.status(200).json(serialized);
        })
        .catch(error => res.status(500).send(error));
    } else {
      Agent.find({ org: org })
        .then(agents => {
          let serialized = [];
          agents.map(agent => {
            serialized.push(agent.serialize());
          });
          res.status(200).json(serialized);
        })
        .catch(error => res.status(500).send(error));
    }
  });

  app.patch('/api/zendesk-agents', jwtUserAuth, (req, res) => {
    const { errors, isValid } = validateAgentUpdate(req.body);
    let ids = [];
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const requestedChanges = req.body;
    requestedChanges.map(item => {
      ids.push(item.id);
    });

    Agent.bulkWrite(
      requestedChanges.map(changeRequest => {
        return {
          updateOne: {
            filter: { _id: changeRequest.id },
            update: {
              $set: changeRequest,
            },
            upsert: true,
          },
        };
      })
    ).catch(error => res.status(500).json(error));

    Agent.find({ _id: { $in: ids } })
      .then(documents => {
        res.status(200).json(documents);
      })
      .catch(error => res.status(500).json(error));
  });

  app.delete('/api/zendesk-agents', jwtUserAuth, (req, res) => {
    let ids = [];
    let requestedDeletes = req.body;
    requestedDeletes.map(item => {
      ids.push(item.id);
    });

    Agent.deleteMany({ _id: ids })
      .then(documents => {
        res.status(200).json('Deleted');
      })
      .catch(error => res.status(500).json(error));
  });

  app.get('/api/zendesk-views', jwtUserAuth, async (req, res) => {
    const { org } = req.user;
    const zendeskOrg = await ZendeskConfig.findOne({ org: org }).exec();
    const { subdomain, userString, zendeskToken } = zendeskOrg;

    let zendeskUrl = `https://${subdomain}.zendesk.com/api/v2/views.json?active=true&group_id=27998298`;
    let userToken = `${userString}:${zendeskToken}`;
    let tokenBuffer = Buffer.from(userToken, 'utf8');
    let base64token = tokenBuffer.toString('base64');
    let options = {
      method: 'GET',
      headers: {
        Authorization: `Basic ${base64token}`,
      },
    };
    fetch(zendeskUrl, options)
      .then(response => response.json())
      .then(data => {
        res.status(200).json(data);
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });

  app.post('/api/zendesk-ticket', jwtKeyAuth, (req, res) => {
    const org = req.user.org;
    assignTicket(req.body, org);
    res.status(200).json(req.body);
  });
};
