const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ZendeskConfigSchema = new Schema(
  {
    org: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subdomain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userString: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    zendeskToken: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

ZendeskConfigSchema.methods.serialize = function () {
  return {
    id: this._id,
    subdomain: this.subdomain,
    userString: this.userString,
    org: this.org,
  };
};

module.exports = ZendeskConfig = mongoose.model('zendeskconfigs', ZendeskConfigSchema);
