// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  // Bad ObjectId in URL
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Mongoose validation → also 422 + structured fields
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = {};
    Object.values(err.errors).forEach((e) => {
      errors[e.path] = e.message;
    });
  }

  // Duplicate unique value
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate value for: ${Object.keys(err.keyValue).join(', ')}`;
  }

  // Unexpected error → hide internals, log for us only
  if (statusCode === 500) {
    console.error('UNHANDLED ERROR:', err);
    message = 'Server error — please try again later';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = errorHandler;