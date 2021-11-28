'use strict';
// https://dev.to/maartennnn/google-calendar-integration-with-nodejs-without-oauth-2-0-5256
// https://github.com/r-alias/airreserve-api-sample/blob/38129fecb49a5e203e344afc7da9a9a8b38cece7/google-calendar.js#L59

// Google Service Account:
// GCP Project Service Account -> https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts?supportedpurview=project
// Add Domain wide delegation
// Create Key of type JSON; then we convert json to string and then encode in base64.
//
// Domain-wide Delegation Scopes added in Google Admin -> Security -> API Controls
// https://admin.google.com/ac/owl/domainwidedelegation
//    https://www.googleapis.com/auth/calendar
//    https://www.googleapis.com/auth/calendar.events

require('../config/config');

const { google } = require('googleapis');
const { addWeeks } = require('date-fns');

const Agent = require('../models/Agent');
const gsa = process.env.GOOGLE_SERVICE_ACCOUNT;
const calId = process.env.GOOGLE_CALENDAR_ID;
const b64Creds = process.env.GOOGLE_SA_CREDENTIALS;
const credentials = JSON.parse(Buffer.from(b64Creds, 'base64').toString('utf-8'));

const scopes = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

const client = new google.auth.GoogleAuth({
  clientOptions: {
    subject: 'rc@rcmaples.io', // Service account has to impseronate a real user, I think we can use the support days email here.
  },
  credentials,
  scopes,
});

const listEvents = async (from, until) => {
  return await new Promise((resolve, reject) => {
    const googleCalendar = google.calendar({ version: 'v3', auth: client });
    googleCalendar.events.list(
      {
        calendarId: calId,
        timeMin: from || new Date().toISOString(),
        timeMax: until || addWeeks(new Date(), 1).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      },
      (err, res) => {
        if (err) {
          console.log(`The API returned an error: ${err}`);
          reject(err);
          return;
        }
        resolve(res.data.items);
      }
    );
  });
};

const createGoogleEvent = async shftrEvent => {
  const { title, startDate, endDate, rRule, exDate, agent } = shftrEvent;
  let attendee = await Agent.findById(agent).select('email -_id').lean();
  let attendeeEmail = attendee.email;
  let recurrenceArray = [];

  const googleEvent = {
    // creator: 'ADD ME',
    start: {
      dateTime: startDate,
      timeZone: 'Etc/UTC',
    },
    end: {
      dateTime: endDate,
      timeZone: 'Etc/UTC',
    },
    attendees: [
      {
        email: attendeeEmail,
      },
    ],
    summary: title,
  };

  if (exDate) {
    recurrenceArray.push(`EXDATE;VALUE=DATE:${exDate.slice(0, 8)}`);
  }

  if (rRule) {
    let correct = rRule.includes('RRULE:');
    if (correct) {
      recurrenceArray.push(`${rRule}`);
    } else {
      recurrenceArray.push(`RRULE:${rRule}`);
    }
  }

  if (recurrenceArray.length > 0) {
    googleEvent.recurrence = recurrenceArray;
  }

  const event = new Promise((resolve, reject) => {
    const googleCalendar = google.calendar({ version: 'v3', auth: client });
    googleCalendar.events.insert(
      {
        auth: client,
        calendarId: calId,
        resource: googleEvent,
      },
      (err, event) => {
        if (err) {
          console.log(`There was an error creating the event on Google Calender: ${err} `);
          reject(err);
          return;
        }
        console.log(`Successfully created the event: ${event.data.id}`);
        // console.log(event.data);
        // event.data.etag, event.data.id,
        resolve(event.data);
      }
    );
  });
  event
    .then(data => {
      return data;
    })
    .catch(error => console.error(error));

  return event;
};

const deleteGoogleEvent = async eventId => {
  const deletedEvent = await new Promise((resolve, reject) => {
    const googleCalendar = google.calendar({ version: 'v3', auth: client });
    googleCalendar.events.delete(
      {
        calendarId: calId,
        eventId: eventId,
      },
      (err, _res) => {
        if (err) {
          reject(`There was an error deleting the event: ${err}`);
          return;
        }
        resolve(`Successfully deleted the event: ${eventId}`);
      }
    );
  });
  // deletedEvent
  //   .then(data => {
  //     return data;
  //   })
  //   .catch(error => console.error(error));

  return deletedEvent;
};

const modifyGoogleEvent = async shftrEvent => {
  const { title, startDate, endDate, rRule, exDate, agent, gCalEventId, gCalCalendarId } = shftrEvent;
  let attendee = await Agent.findById(agent).select('email -_id').lean();
  let attendeeEmail = attendee.email;
  let recurrenceArray = [];

  const googleEvent = {
    sendUpdates: 'All',
    start: {
      dateTime: startDate,
      timeZone: 'Etc/UTC',
    },
    end: {
      dateTime: endDate,
      timeZone: 'Etc/UTC',
    },
    attendees: [
      {
        email: attendeeEmail,
      },
    ],
    summary: title,
  };

  if (exDate) {
    // recurrenceArray.push(`EXDATE;VALUE=DATE:${exDate.slice(0, 8)}`);
    recurrenceArray.push(`EXDATE;VALUE=DATE:${exDate}`);
  }

  if (rRule) {
    let correct = rRule.includes('RRULE:');
    if (correct) {
      recurrenceArray.push(`${rRule}`);
    } else {
      recurrenceArray.push(`RRULE:${rRule}`);
    }
  }

  if (recurrenceArray.length > 0) {
    googleEvent.recurrence = recurrenceArray;
  }

  console.log('recurrence:\n', googleEvent.recurrence);

  const updatedEvent = new Promise((resolve, reject) => {
    const googleCalendar = google.calendar({ version: 'v3', auth: client });
    googleCalendar.events.update(
      {
        auth: client,
        calendarId: gCalCalendarId,
        eventId: gCalEventId,
        resource: googleEvent,
      },
      (err, event) => {
        if (err) {
          console.log(`There was an error creating the event on Google Calender: ${err}`);
          reject(err);
          return;
        }
        console.log(`Successfully updated the event: ${event.data.id}`);
        resolve(event.data);
      }
    );
  });
  updatedEvent
    .then(data => {
      return data;
    })
    .catch(error => console.error(error));
  console.log('updatedEvent', updatedEvent);

  return updatedEvent;
};

module.exports = { listEvents, createGoogleEvent, deleteGoogleEvent, modifyGoogleEvent };
