const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AgentSchema = new Schema({
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
  zendeskId: {
    type: Number,
    required: true,
  },
  org: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  activated: {
    type: Boolean,
    default: false,
    required: false,
  },
  online: {
    type: Boolean,
    default: false,
    required: false,
  },
  color: {
    type: String,
    trim: true,
    required: false,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  queueShare: {
    techcheck: { type: Number, default: 0.0 },
    supeng: { type: Number, default: 0.0 },
    mobile: { type: Number, default: 0.0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  defaultZendeskGroupId: {
    type: Number,
  },
  defaultZendeskGroupName: {
    type: String,
  },
});

AgentSchema.methods.serialize = function () {
  return {
    id: this._id,
    zendeskId: this.zendeskId,
    name: this.name,
    activated: this.activated,
    online: this.online,
    color: this.color,
    org: this.org,
    text: this.text,
    queueShare: this.queueShare,
    defaultZendeskGroupId: this.defaultZendeskGroupId,
    defaultZendeskGroupName: this.defaultZendeskGroupName,
  };
};

module.exports = Agent = mongoose.model('agents', AgentSchema);
