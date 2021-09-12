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

const cookieExtractor = req => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['token'];
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

const jwtOptions = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: cookieExtractor,
  algorithms: ['HS256'],
};

const jwtStrategy = new JwtStrategy(jwtOptions, (payload, done) => {
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

const jwtApiStrategy = new JwtStrategy(jwtOptions, (payload, done) => {
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
  // console.log('Google profile: \n', profile);
  try {
    const existingUser = await User.findOne({ email: profile.email });
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
passport.use('user', jwtStrategy);
passport.use('key', jwtApiStrategy);
module.exports = { localStrategy, jwtStrategy, jwtApiStrategy };
