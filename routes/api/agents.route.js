'use strict';
const passport = require('passport');
const jwtUserAuth = passport.authenticate('user', { session: false });
const Agent = require('../../models/Agent');

module.exports = app => {
  app.patch('/api/agent/queueshare', jwtUserAuth, (req, res) => {
    const org = req.user.org;
    const { id, mobile, supeng, techcheck } = req.body;

    const queueShare = {
      mobile,
      supeng,
      techcheck,
    };

    if (!id) {
      res.status(400).json({ message: 'Id required' });
    }

    Agent.findOneAndUpdate({ org: org, _id: id }, { queueShare }, { new: true })
      .then(document => {
        if (!document) {
          throw { status: 400, statusText: 'Unable to complete request.' };
        }
        res.status(200).json(document.serialize());
      })
      .catch(error => {
        const { status, statusText } = error;
        res.status(status).json({ statusText });
      });
  });

  app.patch('/api/agent/pause', jwtUserAuth, (req, res) => {
    const org = req.user.org;
    const { id, paused } = req.body;

    if (!id) {
      res.status(400).json({ message: 'Id required. ' });
    }

    Agent.findOneAndUpdate({ org: org, _id: id }, { paused }, { new: true })
      .then(document => {
        if (!document) {
          throw { status: 400, statusText: 'Unable to complete request.' };
        }
        res.status(200).json(document.serialize());
      })
      .catch(error => {
        const { status, statusText } = error;
        res.status(status).json({ statusText });
      });
  });
};
