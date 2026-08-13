// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    text: {
      type: String,
      required: [true, 'Announcement text is required'],
      trim: true,
      minlength: [2, 'Announcement must be at least 2 characters'],
    },
  },
  { timestamps: true } // createdAt = the announcement time
);

module.exports = mongoose.model('Message', messageSchema);