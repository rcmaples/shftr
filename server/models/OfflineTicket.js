const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfflineTicketSchema = new Schema({
  ticketId: {
    type: String,
    required: true,
  },
  groupName: {
    type: String,
    required: true,
  },
  ticketUrl: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

module.exports = OfflineTicket = mongoose.model('offlineTickets', OfflineTicketSchema);
