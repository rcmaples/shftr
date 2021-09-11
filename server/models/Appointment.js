const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  agent: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  rRule: {
    type: String,
    required: false,
  },
  exDate: {
    type: String,
    required: false,
  },
  gCalEventId: {
    type: String,
  },
  gCalCalendarId: {
    type: String,
  },
  group: {
    type: String,
  },
  org: {
    type: String,
    required: true,
  },
});

AppointmentSchema.methods.serialize = function () {
  return {
    id: this._id,
    gCalEventId: this.gCalEventId,
    gCalCalendarId: this.gCalCalendarId,
    title: this.title,
    agent: this.agent,
    group: this.group,
    startDate: this.startDate,
    endDate: this.endDate,
    rRule: this.rRule,
    exDate: this.exDate,
    org: this.org,
  };
};

module.exports = Appointment = mongoose.model('appointments', AppointmentSchema);
