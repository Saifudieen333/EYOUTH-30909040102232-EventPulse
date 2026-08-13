// app.js
const express = require('express');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'EventPulse API is running' });
});

// HEALTH ENDPOINT — server + database state
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

app.get('/health', (req, res) => {
  const database = DB_STATES[mongoose.connection.readyState];
  const ok = mongoose.connection.readyState === 1;

  res.status(ok ? 200 : 503).json({
    success: ok,
    message: ok ? 'Service available' : 'Database not connected',
    server: 'up',
    database,
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/events/:eventId/announcements', messageRoutes);

app.use(errorHandler);

module.exports = app;