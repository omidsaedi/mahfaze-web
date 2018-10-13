var express = require('express');
var ensureNotLoggedIn = require('connect-ensure-login').ensureNotLoggedIn;

var passport = require('../config/passport');

var router = express.Router();

/* GET home page. */
router.get('/', ensureNotLoggedIn('/notes'), function(req, res, next) {
  res.render('index');
});

router.get('/register', ensureNotLoggedIn('/notes'), function(req, res, next) {
  res.render('register', { failureMessage: req.flash('error') });
});

router.post('/register', ensureNotLoggedIn('/notes'), passport.authenticate('local-register', {
  successReturnToOrRedirect: '/notes',
  failureRedirect: '/register',
  failureFlash: true
}));

router.get('/login', ensureNotLoggedIn('/notes'), function(req, res, next) {
  res.render('login', { failureMessage: req.flash('error') });
});

router.post('/login', ensureNotLoggedIn('/notes'), passport.authenticate('local-login', {
  successReturnToOrRedirect: '/notes',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
