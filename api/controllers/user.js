const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tokens = require('csrf');

const User = require('../models/user');

exports.get_user = (req, res, next) => {
  res
    .status(200)

    .json({
      message:
        'If you are reading this, the request has passed the server side user authentication middleware'
    });
};

exports.signup = (req, res, next) => {
  if (req.body.password !== req.body.passwordConfirm) {
    res.status(500).json({
      error: 'Passwords do not match'
    });
  }
  if (
    req.body.username &&
    req.body.password &&
    req.body.passwordConfirm &&
    req.body.password === req.body.passwordConfirm
  ) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) return next(err);
        const password = hash;
        const userData = {
          _id: new mongoose.Types.ObjectId(),
          username: req.body.username,
          password: password,
          passwordConfirm: password
        };

        User.create(userData, (err, user) => {
          if (err) {
            return next(err);
          } else {
            const tokens = new Tokens();
            const secret = tokens.secretSync();
            const csrfToken = tokens.create(secret);
            const token = jwt.sign(
              {
                username: user.username,
                userId: user._id,
                csrfToken
              },
              process.env.JWT_KEY,
              {
                expiresIn: '1h'
              }
            );
            res
              .status(200)
              .cookie('id_token', token, {
                httpOnly: true,
                path: '/',
                secure: true,
                maxAge: 40000000
              })
              .json({
                message: 'new user created',
                createdUser: {
                  _id: user._id,
                  token: token,

                  request: {
                    type: 'POST'
                  }
                }
              });
          }
        });
      });
    });
  } else {
    res.status(400).json({
      error: 'Please complete all fields'
    });
  }
};

exports.login = (req, res, next) => {
  User.find({ username: req.body.username }, (err, user) => {
    if (err) next(err);
    if (user.length < 1) {
      return res.status(401).json({
        message: 'Authorization Failed'
      });
    }
    bcrypt.compare(req.body.password, user[0].password, (err, result) => {
      if (err) {
        return res.status(401).json({
          message: 'Authorization Failed'
        });
      }
      if (result) {
        //const secret = Tokens.secretSync();
        console.log(result);
        const tokens = new Tokens();
        const secret = tokens.secretSync();
        const csrfToken = tokens.create(secret);
        const token = jwt.sign(
          {
            username: user[0].username,
            userId: user[0]._id,
            csrfToken
          },
          process.env.JWT_KEY,
          {
            expiresIn: '1h'
          }
        );
        return res
          .status(200)
          .cookie('id_token', token, {
            httpOnly: false,
            path: '/',
            secure: false,
            maxAge: 40000000
          })
          .json({
            message: 'found user',
            token: token
          });
      }
      res.status(401).json({
        message: 'Authorization Failed'
      });
    });
  });
};

exports.user_delete = (req, res, next) => {
  User.remove({ _id: req.body.userId })
    .exec()

    .then(result => {
      res
        .status(200)
        .clearCookie('id_token')
        .json({
          message: 'User deleted'
        });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

exports.logout = (req, res, next) => {
  return res
    .status(200)
    .clearCookie('id_token')
    .json({
      message: 'logged out'
    });
};
