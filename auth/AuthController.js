var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');
var VerifyToken = require('./VerifyToken');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

router.post('/register', function (req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  },
  function (err, user) {
    if (err) return res.status(500).send("There was a problem registering the user.");

    // create a token
    var token = jwt.sign(
      { id: user._id },
      config.secret,
      { expiresIn: 86400 }
      // expires in 24 hours
    );

    res.status(200).send({ auth: true, token: token });
  });
});

router.post('/login', function(req, res) {

  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    var token = jwt.sign(
      { id: user._id },
      config.secret,
      { expiresIn: 86400 }
    );

    res.status(200).send({ auth: true, token: token });
  });

});

// { password: 0 }: we can see all values of the user but password.
router.get('/me', function (req, res) {

  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    User.findById(decoded.id,
     { password: 0 }, 
     function (err, user) {
      if (err) return res.status(500).send('There was a problem finding the user.');
      if (!user) return res.status(404).send('No user found.');

      res.status(200).send(user);
    });
  });
});

// Disclaimer: The logout endpoint is not needed.
// The act of logging out can solely be done through the client side.
// A token is usually kept in a cookie or the browser’s localstorage.
// Logging out is as simple as destroying the token on the client.
// This /logout endpoint is created to logically depict what happens when you log out.
// The token gets set to null.
router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null })
});

module.exports = router;
