const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be 500 characters or less'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);