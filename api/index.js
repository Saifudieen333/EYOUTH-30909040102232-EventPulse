// api/index.js — Vercel serverless entry point
const app = require('../app');
const connectDB = require('../config/db');

connectDB(); // cloud must connect on startup (server.js doesn't run on Vercel)

module.exports = app;