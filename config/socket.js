// config/socket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const roomName = (eventId) => `event:${eventId}`;

const initSocket = (httpServer) => {
  const io = new Server(httpServer);

  // Sockets authenticate with the SAME JWT as REST
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth && socket.handshake.auth.token) ||
      (socket.handshake.headers.authorization || '').replace('Bearer ', '') ||
      socket.handshake.query.token;

    if (!token) return next(new Error('Not authenticated: token missing'));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      socket.userRole = payload.role;
      next();
    } catch (err) {
      next(new Error('Not authenticated: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} | user: ${socket.userId} | role: ${socket.userRole}`);

    // Join your event room
    socket.on('join:event', (eventId) => {
      if (!eventId || typeof eventId !== 'string') return;
      socket.join(roomName(eventId));
      console.log(`Socket ${socket.id} joined ${roomName(eventId)}`);
      socket.emit('join:confirmed', { event: eventId });
    });

    // Broadcast (admin only) + save to MongoDB
    socket.on('announcement:create', async (payload) => {
      try {
        if (socket.userRole !== 'admin') {
          return socket.emit('announcement:error', {
            message: 'Forbidden: only admins can broadcast',
          });
        }

        const { event, text } = payload || {};
        if (!event || !text) {
          return socket.emit('announcement:error', { message: 'Event and text are required' });
        }

        const saved = await Message.create({ event, sender: socket.userId, text });
        const full = await Message.findById(saved._id)
          .populate('sender', 'name email role')
          .populate('event', 'title date city');

        // ONLY the target room receives the live message
        io.to(roomName(event)).emit('announcement:new', full);
        console.log(`Announcement saved + broadcast to ${roomName(event)}`);
      } catch (err) {
        socket.emit('announcement:error', { message: err.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

module.exports = initSocket;