'use strict';

const passport = require('passport');
const User = require('../models/User');
const Key = require('../models/Key');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const serverUrl = process.env.NODE_ENV === 'production' ? process.env.SERVER_URL_PROD : process.env.SERVER_URL_DEV;

const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const { JWT_SECRET } = require('../config/config');

const tokenExtractor = req => {
  let token = null;
  if (req && req.cookies && req.cookies['token']) {
    token = req.cookies['token'];
    console.log('cookie token:\n', token);
  } else {
    return token;
  }
  return token;
};

const localOptions = { usernameField: 'email' };
const localStrategy = new LocalStrategy(localOptions, (email, password, done) => {
  User.findOne({ email: email }, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }
    user.comparePassword(password, function (err, isMatch) {
      if (err) {
        return done(err);
      }
      if (!isMatch) {
        return done(null, false);
      }
      return done(null, user);
    });
  });
});

const jwtCookieOptions = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: tokenExtractor,
  algorithms: ['HS256'],
};

const jwtHeaderOptions = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  algorithms: ['HS256'],
};

const jwtCookieStrategy = new JwtStrategy(jwtCookieOptions, (payload, done) => {
  User.findById(payload.id, function (err, user) {
    if (err) {
      return done(err, false);
    }
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

const jwtApiStrategy = new JwtStrategy(jwtHeaderOptions, (payload, done) => {
  Key.findById(payload.id, (err, key) => {
    if (err) {
      return done(err, false);
    }
    if (key) {
      done(null, key);
    } else {
      done(null, false);
    }
  });
});

const googleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${serverUrl}${process.env.GOOGLE_CALLBACK_URL}`,
};

const googleStrategy = new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ email: profile._json.email });
    if (existingUser) {
      return done(null, existingUser);
    }
  } catch (error) {
    console.log('Error: \n', error);
  }

  let orgName = profile._json.email.split('@')[1].split('.')[0];

  try {
    const newUser = await new User({
      googleId: profile.id,
      email: profile._json.email,
      name: profile.displayName,
      org: orgName,
    }).save();
    done(null, newUser);
  } catch (error) {
    console.log('Error: \n', error);
  }
});

passport.use(localStrategy);
passport.use('google', googleStrategy);
passport.use('user', jwtCookieStrategy);
passport.use('key', jwtApiStrategy);
module.exports = { localStrategy, jwtCookieStrategy, jwtApiStrategy };
