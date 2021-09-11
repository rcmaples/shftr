'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

const clientUrl = process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_DEV;

exports.login = function (req, res, next) {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password } = req.body;

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(400).json({ code: 400, reason: 'InvalidUser', message: 'Email not found.' });
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user.id,
          name: user.name,
          org: user.org,
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: 432000 }, // 5 days
          (err, token) => {
            res.json({
              success: true,
              token: `Bearer ${token}`,
            });
          }
        );
      } else {
        return res.status(401).json({ code: 401, reason: 'IncorrectPassword', message: 'Incorrect password.' });
      }
    });
  });
};

// sign up
exports.register = (req, res, next) => {
  const { email, name, password, org } = req.body;
  if (!email.endsWith('@fullstory.com')) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // See if user already exists
  // If it doesn't make one.

  User.findOne({ email: email }).then(user => {
    if (user) {
      return res.status(400).json({ code: 400, reason: 'ValidationError', message: 'Email already exists' });
    } else {
      const newUser = new User({
        name,
        email,
        password,
        org,
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user.serialize()))
            .catch(error => console.log(error));
        });
      });
    }
  });
};

exports.google = (req, res, nex) => {
  let cookieDomain = clientUrl.split('://')[1];
  if (cookieDomain.indexOf(':') !== -1) {
    cookieDomain = cookieDomain.split(':')[0];
  }
  const token = req.user.generateJWT();
  res.append('access-control-expose-headers', 'Set-Cookie');
  res.cookie('token', token, { expires: new Date(Date.now() + 432000000), domain: cookieDomain });
  res.redirect(clientUrl);
};
