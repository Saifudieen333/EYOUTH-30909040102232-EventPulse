const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');

const getAnnouncements = asyncHandler(async (req, res) => {
  const messages = await Message.find({ event: req.params.eventId })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email role')
    .populate('event', 'title date city');

  res.json({ success: true, count: messages.length, data: messages });
});

module.exports = { getAnnouncements };