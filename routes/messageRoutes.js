const express = require('express');
const router = express.Router({ mergeParams: true });
const { getAnnouncements } = require('../controllers/messageController');

router.get('/', getAnnouncements);

module.exports = router;