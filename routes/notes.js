var createError = require('http-errors');
var express = require('express');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

var User = require('../models').User;
var Note = require('../models').Note;

var router = express.Router();

router.use(ensureLoggedIn('/login'));

router.get('/', function(req, res, next) {
  req.user.getNotes({ order: [['updatedAt', 'DESC']] }).then(function(notes) {
    res.render('notes/index', { notes: notes });
  }).catch(function(err) {
    next(err);
  });
});

router.post('/', function(req, res, next) {
  req.user.createNote(req.body, { fields: ['text'] }).then(function(note) {
    res.redirect('/notes/' + note.id + '/edit');
  }).catch(function(err) {
    next(err);
  });
});

router.get('/search', function(req, res, next) {
  req.user.getNotes({
    where: { text: { $like: '%' + req.query.q + '%' } },
    order: [['updatedAt', 'DESC']]
  }).then(function(notes) {
    res.render('notes/index', { notes: notes });
  }).catch(function(err) {
    next(err);
  });
});

router.get('/:id/edit', function(req, res, next) {
  Note.findById(req.params.id, { include: [User] }).then(function(note) {
    if (note) {
      if (note.user.equals(req.user)) {
        res.render('notes/edit', { note: note });
      } else {
        next(createError(403));
      }
    } else {
      next(createError(404));
    }
  }).catch(function(err) {
    next(err);
  });
});

router.put('/:id', function(req, res, next) {
  Note.findById(req.params.id, { include: [User] }).then(function(note) {
    if (note) {
      if (note.user.equals(req.user)) {
        return note.update(req.body, { fields: ['text'] });
      } else {
        next(createError(403));
      }
    } else {
      next(createError(404));
    }
  }).then(function(note) {
    res.redirect('/notes');
  }).catch(function(err) {
    next(err);
  });
});

router.delete('/:id', function(req, res, next) {
  Note.findById(req.params.id, { include: [User] }).then(function(note) {
    if (note) {
      if (note.user.equals(req.user)) {
        return note.destroy();
      } else {
        next(createError(403));
      }
    } else {
      next(createError(404));
    }
  }).then(function() {
    res.redirect('/notes');
  }).catch(function(err) {
    next(err);
  });
});

module.exports = router;
