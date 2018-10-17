var express = require('express');
var router = express.Router();

var passport = require('../config/passport');

var sequelize = require('../models').sequelize;
var User = require('../models').User;
var Note = require('../models').Note;

router.post('/users', function(req, res) {
  User.findOrCreate({
    where: { email: req.body.email },
    defaults: { password: req.body.password }
  }).spread(function(user, created) {
    if (created) {
      res.status(201).send(user);
    } else {
      if (user.validPassword(req.body.password)) {
        res.send(user);
      } else {
        res.status(401).end();
      }
    }
  }).catch(function(err) {
    res.status(500).end();
  });
});

router.post('/users/login', function(req, res) {
  User.findOne({
    where: { email: req.body.email }
  }).then(function(user) {
    if (user) {
      if (user.validPassword(req.body.password)) {
        res.send(user);
      } else {
        res.status(401).end();
      }
    } else {
      res.status(404).end();
    }
  }).catch(function(err) {
    res.status(500).end();
  });
});

router.get('/notes', passport.authenticate('basic', { session: false }), function(req, res) {
  req.user.getNotes({ paranoid: false }).then(function(notes) {
    res.send(notes);
  }).catch(function(err) {
    res.status(500).end();
  });
});

router.post('/notes', passport.authenticate('basic', { session: false }), function(req, res) {
  req.user.createNote(req.body, {
    fields: ['id', 'text', 'createdAt', 'updatedAt', 'deletedAt'],
    overwriteTimestamps: req.body
  }).then(function(note) {
    res.status(201).send(note);
  }).catch(function(err) {
    res.status(500).end();
  });
});

router.get('/notes/:id', passport.authenticate('basic', { session: false }), function(req, res) {
  Note.findById(req.params.id, { paranoid: false, include: [User] }).then(function(note) {
    if (note) {
      if (note.user.equals(req.user)) {
        res.send(note);
      } else {
        res.status(403).end();
      }
    } else {
      res.status(404).end();
    }
  }).catch(function(err) {
    res.status(500).end();
  });
});

router.put('/notes/:id', passport.authenticate('basic', { session: false }), function(req, res) {
  Note.findById(req.params.id, { paranoid: false, include: [User] }).then(function(note) {
    if (note) {
      if (note.user.equals(req.user)) {
        return note.update(req.body, {
          fields: ['text', 'updatedAt', 'deletedAt'],
          overwriteTimestamps: req.body
        });
      } else {
        res.status(403).end();
      }
    } else {
      res.status(404).end();
    }
  }).then(function(note) {
    res.send(note);
  }).catch(function(err) {
    res.status(500).end();
  });
});

router.delete('/notes/:id', passport.authenticate('basic', { session: false }), function(req, res) {
  Note.findById(req.params.id, { include: [User] }).then(function(note) {
    if (note) {
      if (note.user.equals(req.user)) {
        return note.destroy();
      } else {
        res.status(403).end();
      }
    } else {
      res.status(404).end();
    }
  }).then(function() {
    res.status(204).end();
  }).catch(function(err) {
    res.status(500).end();
  });
});

router.post('/notes/batch', passport.authenticate('basic', { session: false }), function(req, res) {
  sequelize.transaction(function(t) {
    var queries = [];
    req.body.inserts.forEach(function(values) {
      queries.push(req.user.createNote(values, {
        fields: ['id', 'text', 'createdAt', 'updatedAt', 'deletedAt'],
        transaction: t,
        overwriteTimestamps: values
      }));
    });
    req.body.updates.forEach(function(values) {
      queries.push(Note.findById(values.id, { paranoid: false, include: [User] }).then(function(note) {
        if (!note || !note.user.equals(req.user)) {
          throw new Error();
        }
        return note.update(values, {
          fields: ['text', 'updatedAt', 'deletedAt'],
          transaction: t,
          overwriteTimestamps: values
        });
      }));
    });
    return Promise.all(queries);
  }).then(function(result) {
    res.status(204).end();
  }).catch(function(err) {
    res.status(500).end();
  });
});

module.exports = router;
