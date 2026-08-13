// app.js
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
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

// HEALTH ENDPOINT — waits for the DB on serverless
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.asPromise(); // Wait for the handshake to finish
    return res.json({
      success: true,
      message: 'Service available',
      server: 'up',
      database: 'connected',
      time: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
      server: 'up',
      database: DB_STATES[mongoose.connection.readyState],
      time: new Date().toISOString(),
    });
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/events/:eventId/announcements', messageRoutes);

app.use(errorHandler);

module.exports = app;