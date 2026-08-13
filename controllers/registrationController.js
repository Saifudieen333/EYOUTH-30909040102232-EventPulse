// controllers/registrationController.js
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/registrations  (logged-in user registers; user comes from the TOKEN)
const createRegistration = asyncHandler(async (req, res) => {
  const eventId = req.body.event;

  if (!eventId) {
    return res.status(400).json({ success: false, message: 'Event is required' });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  // Duplicate registration → rejected
  const existing = await Registration.findOne({ user: req.user._id, event: eventId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You are already registered for this event' });
  }

  // Capacity → count must NEVER exceed capacity
  const count = await Registration.countDocuments({ event: eventId });
  if (count >= event.capacity) {
    return res.status(400).json({
      success: false,
      message: `Event is full (${count}/${event.capacity})`,
    });
  }

  const registration = await Registration.create({ user: req.user._id, event: eventId });
  res.status(201).json({ success: true, data: registration });
});

// GET /api/registrations/me  (ONLY the current user's registrations + event details)
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id })
    .populate({ path: 'event', populate: { path: 'category' } });
  res.json({ success: true, count: registrations.length, data: registrations });
});

// DELETE /api/registrations/:id  (cancel my own; admin can cancel any)
const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const isOwner = registration.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: you can only cancel your own registrations',
    });
  }

  await Registration.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Registration cancelled — place freed' });
});

// GET /api/registrations  (admin only — full list)
const getRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find()
    .populate('user', 'name email')
    .populate('event', 'title date city');
  res.json({ success: true, count: registrations.length, data: registrations });
});

module.exports = {
  createRegistration,
  getMyRegistrations,
  cancelRegistration,
  getRegistrations,
};