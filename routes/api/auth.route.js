'use strict';
const Authentication = require('../../auth/authentication');
const passport = require('passport');
require('../../auth/strategies');

const jwtUserAuth = passport.authenticate('user', { session: false });
const localAuth = passport.authenticate('local', { session: false });
const googleAuth = passport.authenticate('google', {
  session: false,
  failureRedirect: '/',
  scope: ['profile', 'email'],
});

module.exports = app => {
  app.post('/api/users/register', Authentication.register);

  app.post('/api/users/login', localAuth, Authentication.login);

  app.get('/auth/google', googleAuth);

  app.get('/auth/google/callback', googleAuth, Authentication.google);

  app.get('/api/users/currentuser', jwtUserAuth, (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  });
};
