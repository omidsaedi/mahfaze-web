var passport = require('passport');

var User = require('../models').User;

passport.use('local-register', User.createLocalStrategy('register'));

passport.use('local-login', User.createLocalStrategy('login'));

passport.use(User.createBasicStrategy());

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

module.exports = passport;
