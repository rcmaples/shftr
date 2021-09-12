'use strict';
// require('../config/config');
const passport = require('passport');
const jwtUserAuth = passport.authenticate('user', { session: false });
const Appointment = require('../../models/Appointment');
const Agent = require('../../models/Agent');
const { createGoogleEvent, deleteGoogleEvent, modifyGoogleEvent } = require('../../utils/googleCalendar');

const calId = process.env.GOOGLE_CALENDAR_ID;

module.exports = app => {
  app.post('/api/appointments', jwtUserAuth, async (req, res) => {
    const org = req.user.org;
    const body = req.body;

    if (body.length > 1) {
      const responseBody = [];
      body.map(async appt => {
        let group = await Agent.findById(appt.agent).select('defaultZendeskGroupName -_id').lean();
        const newAppointment = new Appointment({
          title: appt.title,
          agent: appt.agent,
          group: group,
          startDate: appt.startDate,
          endDate: appt.endDate,
          rRule: appt.rRule,
          exDate: appt.exDate,
          org,
        });

        newAppointment
          .save()
          .then(async appointment => {
            const googleDetails = await createGoogleEvent(appointment);
            let gCalEventId = googleDetails.id;
            let gCalCalendarId = calId;

            let googledAppointment = await Appointment.findByIdAndUpdate(
              appointment._id,
              { gCalEventId, gCalCalendarId },
              { new: true }
            )
              .then(document => {
                responseBody.push(document.serialize());
                return document;
              })
              .catch(error => {
                console.log(error);
                return error;
              });
          })
          .catch(error => console.log(error));
      });
      res.status(200).json(responseBody);
    } else {
      let group = await Agent.findById(body.agent).select('defaultZendeskGroupName -_id').lean();
      const newAppointment = new Appointment({
        title: body.title,
        agent: body.agent,
        group: group.defaultZendeskGroupName,
        startDate: body.startDate,
        endDate: body.endDate,
        rRule: body.rRule,
        exDate: body.exDate,
        org,
      });

      newAppointment
        .save()
        .then(async appointment => {
          const googleDetails = await createGoogleEvent(appointment);
          let gCalEventId = googleDetails.id;
          let gCalCalendarId = calId;

          let googledAppointment = await Appointment.findByIdAndUpdate(
            appointment._id,
            { gCalEventId, gCalCalendarId },
            { new: true }
          )
            .then(document => {
              res.status(200).json(document.serialize());
              return document;
            })
            .catch(error => {
              console.log(error);
              return error;
            });
        })
        .catch(error => {
          console.log(error);
          res.status(500).json(error);
        });
    }
  });

  app.patch('/api/appointments/:id', jwtUserAuth, (req, res) => {
    let org = req.user.org;
    let id = req.params.id;

    if (!id) {
      res.status(400).json({ message: 'Id required.' });
    }

    Appointment.findOneAndUpdate({ org: org, _id: id }, req.body, { new: true })
      .then(async document => {
        if (!document) {
          throw { status: 401, statusText: 'Appointment not found.' };
        }

        let updatedGoogleDetails = await modifyGoogleEvent(document);
        if (!updatedGoogleDetails.id) {
          throw { status: 500, statusText: updatedGoogleDetails };
        }

        res.status(200).json(document.serialize());
      })
      .catch(error => {
        const { status, statusText } = error;
        res.status(status).json({ statusText });
      });
  });

  app.get('/api/appointments/:id?', jwtUserAuth, (req, res) => {
    let org = req.user.org;
    let id = req.params.id;
    if (id) {
      Appointment.findOne({ org: org, _id: id })
        .then(document => {
          res.status(200).json(document);
        })
        .catch(error => {
          res.status(500).json(error);
        });
    }

    if (!id) {
      Appointment.find({ org: org })
        .then(documents => {
          let returnedDocs = [];
          documents.map(document => returnedDocs.push(document.serialize()));
          res.status(200).json(returnedDocs);
        })
        .catch(error => {
          res.status(500).json(error);
        });
    }
  });

  app.delete('/api/appointments/:id', jwtUserAuth, (req, res) => {
    let org = req.user.org;
    let id = req.params.id;

    Appointment.findOneAndDelete({ org: org, _id: id })
      .then(async document => {
        if (!document) {
          throw { status: 400, statusText: 'Error deleting appointment.' };
        }
        let { gCalEventId } = document;
        let deletedGoogleEvent = await deleteGoogleEvent(gCalEventId);
        console.log(deletedGoogleEvent);
        res.status(200).json({ message: 'ok' });
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });
};
