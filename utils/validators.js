// utils/validators.js
const { body } = require('express-validator');

/* AUTH */
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

/* USERS */
const userCreateRules = [
  ...registerRules,
  body('role').optional().isIn(['attendee', 'organizer', 'admin'])
    .withMessage('Role must be attendee, organizer or admin'),
];

const userUpdateRules = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['attendee', 'organizer', 'admin'])
    .withMessage('Role must be attendee, organizer or admin'),
];

/* CATEGORIES */
const categoryCreateRules = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim().isLength({ max: 500 })
    .withMessage('Description must be 500 characters or less'),
];

const categoryUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('description').optional().trim().isLength({ max: 500 })
    .withMessage('Description must be 500 characters or less'),
];

/* EVENTS */
const eventCreateRules = [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('description').trim().notEmpty().withMessage('Event description is required'),
  body('date').notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Event date must be a valid date'),
  body('capacity').notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1 }).withMessage('Capacity must be a whole number of at least 1'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('category').notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Category must be a valid ID'),
];

const eventUpdateRules = [
  body('title').optional().trim().notEmpty().withMessage('Event title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Event description cannot be empty'),
  body('date').optional().isISO8601().withMessage('Event date must be a valid date'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a whole number of at least 1'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('category').optional().isMongoId().withMessage('Category must be a valid ID'),
];

/* REGISTRATIONS */
const registrationCreateRules = [
  body('event').notEmpty().withMessage('Event is required')
    .isMongoId().withMessage('Event must be a valid ID'),
];

module.exports = {
  registerRules,
  loginRules,
  userCreateRules,
  userUpdateRules,
  categoryCreateRules,
  categoryUpdateRules,
  eventCreateRules,
  eventUpdateRules,
  registrationCreateRules,
};