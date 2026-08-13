const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

/* ---------- helpers ---------- */

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const badRequest = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

// category (id OR name) + city + date range
const buildEventFilter = async (query) => {
  const filter = {};

  if (query.category) {
    if (mongoose.isValidObjectId(query.category)) {
      // aggregation does NOT auto-cast strings → convert manually
      filter.category = new mongoose.Types.ObjectId(query.category);
    } else {
      const matches = await Category.find({
        name: { $regex: new RegExp(escapeRegExp(query.category), 'i') },
      }).select('_id');
      filter.category = { $in: matches.map((c) => c._id) };
    }
  }

  if (query.city) {
    filter.city = { $regex: new RegExp(escapeRegExp(query.city), 'i') };
  }

  const from = query.from || query.startDate;
  const to = query.to || query.endDate;
  if (from || to) {
    filter.date = {};
    if (from) {
      const d = new Date(from);
      if (isNaN(d.getTime())) throw badRequest('Invalid "from" date — use YYYY-MM-DD');
      filter.date.$gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (isNaN(d.getTime())) throw badRequest('Invalid "to" date — use YYYY-MM-DD');
      filter.date.$lte = d;
    }
  }

  return filter;
};

// ?sort=date | -date | popular | -popular
const buildSort = (sortParam) => {
  switch (sortParam) {
    case '-date':
      return { date: -1 };
    case 'popular':
      return { registrationCount: -1, date: 1 }; // most registered FIRST
    case '-popular':
      return { registrationCount: 1, date: 1 };
    default:
      return { date: 1 }; // soonest first
  }
};

/* ---------- CRUD ---------- */

// GET /api/events  + filters + search + sort + pagination
const getEvents = asyncHandler(async (req, res) => {
  const filter = await buildEventFilter(req.query);

  // TEXT SEARCH across title + description (combines with filters)
  if (req.query.search) {
    const r = new RegExp(escapeRegExp(req.query.search), 'i');
    filter.$or = [{ title: r }, { description: r }];
  }

  // PAGINATION with safe defaults and a cap
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;
  const skip = (page - 1) * limit;

  const result = await Event.aggregate([
    { $match: filter },
    // count registrations per event (powers "popular" sorting)
    {
      $lookup: {
        from: 'registrations',
        localField: '_id',
        foreignField: 'event',
        as: 'registrations',
      },
    },
    { $addFields: { registrationCount: { $size: '$registrations' } } },
    { $project: { registrations: 0 } },
    // attach full category details (the populate equivalent)
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    { $sort: buildSort(req.query.sort) },
    // paginate + count total in ONE database query
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        meta: [{ $count: 'total' }],
      },
    },
  ]);

  const data = result[0].data;
  const total = result[0].meta[0] ? result[0].meta[0].total : 0;

  res.json({
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    count: data.length,
    data,
  });
});

// GET /api/events/:id
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('category');
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
});

// POST /api/events (admin only — enforced in routes)
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json({ success: true, data: event });
});

// PUT /api/events/:id
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category');
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
});

// DELETE /api/events/:id
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, message: 'Event deleted' });
});

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };