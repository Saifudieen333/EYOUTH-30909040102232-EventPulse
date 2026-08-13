// middleware/validate.js
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const structured = {};
    errors.array().forEach((e) => {
      structured[e.path] = e.msg;
    });

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: structured,
    });
  }

  next();
};

module.exports = validate;