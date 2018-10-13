var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, undefined]
      }
    }
  });

  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  User.createLocalStrategy = function(operation) {
    var options = { usernameField: 'email' }
    switch (operation) {
      case 'register':
        return new LocalStrategy(options, function(email, password, done) {
          User.create({
            email: email,
            password: password
          }).then(function(user) {
            return done(null, user);
          }).catch(function(err) {
            err.errors.forEach(function(error) {
              if (error.type === 'unique violation' && error.path === 'email') {
                return done(null, false, { message: 'کاربری با این ایمیل قبلاً ثبت شده است.' });
              }
            });
            return done(err);
          });
        });
      case 'login':
        return new LocalStrategy(options, function(email, password, done) {
          User.findOne({ where: { email: email } }).then(function(user) {
            if (!user) {
              return done(null, false, { message: 'ایمیل اشتباه است.' });
            }
            if (!user.validPassword(password)) {
              return done(null, false, { message: 'رمز عبور اشتباه است.' });
            }
            return done(null, user);
          }).catch(function(err) {
            return done(err);
          });
        });
    }
  };

  User.createBasicStrategy = function() {
    return new BasicStrategy(function(email, password, done) {
      User.findOne({ where: { email: email } }).then(function(user) {
        if (!user) { return done(null, false); }
        if (!user.validPassword(password)) { return done(null, false); }
        return done(null, user);
      }).catch(function(err) {
        return done(err);
      });
    });
  };

  User.serializeUser = function() {
    return function(user, done) {
      done(null, user.id);
    };
  };

  User.deserializeUser = function() {
    return function(id, done) {
      User.findById(id).then(function(user) {
        done(null, user);
      }).catch(function(err) {
        done(err);
      });
    };
  }

  User.beforeCreate(function(user, options) {
    user.password = bcrypt.hashSync(user.password, 10);
  });

  User.associate = function(models) {
    User.hasMany(models.Note, {
      onDelete: 'CASCADE'
    });
  };
  
  return User;
};
