const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated: token missing' });
  }

  const token = header.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const reason = err.name === 'TokenExpiredError' ? 'token expired' : 'invalid or tampered token';
    return res.status(401).json({ success: false, message: `Not authenticated: ${reason}` });
  }

  const user = await User.findById(payload.id).select('-password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated: user no longer exists' });
  }

  req.user = user;
  next();
});

module.exports = requireAuth;