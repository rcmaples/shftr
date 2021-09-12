const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeySchema = new Schema({
  secret: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

KeySchema.methods.serialize = function () {
  return {
    id: this._id,
    userId: this.userId,
    org: this.org,
  };
};

module.exports = Key = mongoose.model('keys', KeySchema);
