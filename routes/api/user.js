const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
// bcrypt is to hash the password
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//Load Input Validation
const validateRegisterInput = require('../../validation/Register');
const validateLoginInput = require('../../validation/Login');

// Here we load the user Model from the Schema
const User = require('../../models/User');

//We don't have to assign /api/users/test because in the server.js,
//We already assigned the routes above to user
// res.json is similar to res.send but the only difference is that it output json structured text or data

router.get('/test', (req, res) => res.json({ msg: 'Users works' }));

//Since we don't want a user to register with an already used email, we'll bring in userSchema and perform findOne.

router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = 'Email already exists';
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route GET api/users/login
//@desc Login User / Returning the JWT token
//@access Public

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Now we find the user by email using mongoose
  User.findOne({ email }) //This will give a promise so .then
    .then(user => {
      //Check for user: If there's no users then we'll return res.status(Not found)
      if (!user) {
        errors.email = 'User not found';
        return res.status(404).json(errors);
      }
      //After finding the user email, we need to check the password
      //NB: the password that the user type up there is plain text but the password that is in the database is hash
      //So we use bcrypt to compare the two
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          const payload = { id: user.id, name: user.name, avatar: user.avatar };

          //Sign Token (See as well Json documentation)
          // We need to send an expiration if we want it to expire after a certain amount of time

          //Create JWT payload

          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              });
            }
          );
        } else {
          errors.password = 'Password incorrect';
          return res.status(400).json(errors);
        }
      });
    });
});

//@route GET api/users/current
//@desc  Return current user
//@access Private

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

// We have to exports the route for the server.js to pick it up
module.exports = router;
