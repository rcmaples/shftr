'use strict';
// require('../config/config');
const passport = require('passport');
const jwtUserAuth = passport.authenticate('user', { session: false });
const AssignmentRecord = require('../../models/AssignmentRecord');

module.exports = app => {
  app.get('/api/history', jwtUserAuth, (req, res) => {
    let org = req.user.org;
    AssignmentRecord.find({ org: org })
      .then(documents => {
        if (documents.length < 1) {
          throw { status: 404, statusText: 'No records found.' };
        }

        let returnedDocs = [];
        documents.map(document => returnedDocs.push(document));
        res.status(200).json(returnedDocs);
      })
      .catch(error => {
        res.status(error.status).send(error.statusText);
      });
  });
};
