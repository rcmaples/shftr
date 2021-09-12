const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentRecordSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  zendeskUserId: {
    type: Number,
    required: true,
  },
  ticketId: {
    type: String,
    required: true,
  },
  ticketUrl: {
    type: String,
    required: true,
  },
  groupName: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = AssignmentRecord = mongoose.model('assignmentRecords', AssignmentRecordSchema);
