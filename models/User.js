const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleId: {
    type: String,
    unique: true,
  },
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
  password: {
    type: String,
  },
  org: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

/**
 * A User has the following methods:
 *   - serialize - to prevent direct DB Data from being returned
 *   - comparePassword - to make sure passwords match
 */
UserSchema.plugin(findOrCreate);
UserSchema.methods.serialize = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    org: this.org,
  };
};

UserSchema.methods.generateJWT = function () {
  const token = jwt.sign(
    {
      expiresIn: 432000,
      id: this._id,
      name: this.name,
      org: this.org,
      email: this.email,
    },
    process.env.JWT_SECRET
  );
  return token;
};

UserSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return callback(err);
    }
    callback(null, isMatch);
  });
};

module.exports = User = mongoose.model('users', UserSchema);
