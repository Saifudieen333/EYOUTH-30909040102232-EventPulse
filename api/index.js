// api/index.js — Vercel serverless entry point (no process.exit!)
const mongoose = require('mongoose');
const app = require('../app');

// Vercel doesn't run server.js, so we connect here without crashing if it fails
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
} else {
  console.error('MONGODB_URI is not set on the platform!');
}

module.exports = app;