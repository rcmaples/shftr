'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Key = require('../../models/Key');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
require('../../auth/strategies');

const jwtUserAuth = passport.authenticate('user', { session: false });

module.exports = app => {
  app.get('/api/keys/generate', jwtUserAuth, (req, res) => {
    const { org, id } = req.user;

    User.findById(id).then(user => {
      if (!user) {
        res.status(500).end();
      }

      let secret = uuidv4();

      const newKey = new Key({
        org,
        userId: id,
        secret,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newKey.secret, salt, async (err, hash) => {
          if (err) throw err;
          newKey.secret = hash;
          const key = await newKey.save();

          const payload = {
            id: key._id,
            userId: key.userId,
            org: key.org,
          };

          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3124202400 }, // 99 years
            (err, token) => {
              res.status(200).json({
                success: true,
                token,
              });
            }
          );
        });
      });
    });
  });
};
