const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const {
  createRegistration,
  getMyRegistrations,
  cancelRegistration,
  getRegistrations,
} = require('../controllers/registrationController');
const { registrationCreateRules } = require('../utils/validators');
const validate = require('../middleware/validate');

router.post('/', requireAuth, registrationCreateRules, validate, createRegistration);
router.get('/me', requireAuth, getMyRegistrations);
router.delete('/:id', requireAuth, cancelRegistration);
router.get('/', requireAuth, requireRole('admin'), getRegistrations);

module.exports = router;