const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { eventCreateRules, eventUpdateRules } = require('../utils/validators');
const validate = require('../middleware/validate');

router.route('/')
  .get(getEvents)
  .post(requireAuth, requireRole('admin'), eventCreateRules, validate, createEvent);

router.route('/:id')
  .get(getEvent)
  .put(requireAuth, requireRole('admin'), eventUpdateRules, validate, updateEvent)
  .patch(requireAuth, requireRole('admin'), eventUpdateRules, validate, updateEvent)
  .delete(requireAuth, requireRole('admin'), deleteEvent);

module.exports = router;