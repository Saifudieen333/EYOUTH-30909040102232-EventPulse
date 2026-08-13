// tests/events.test.js
process.env.JWT_SECRET = 'test_secret';

const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../app');
const User = require('../models/User');
const Category = require('../models/Category');

let adminToken;
let category;

beforeAll(async () => {
  // SEPARATE test database — never touches your real data
  await mongoose.connect('mongodb://127.0.0.1:27017/eventpulse_test');

  const admin = await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'hashed_placeholder',
    role: 'admin',
  });

  adminToken = jwt.sign({ id: admin._id.toString(), role: 'admin' }, process.env.JWT_SECRET);
  category = await Category.create({ name: 'TestCategory' });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Events API (integration with Supertest)', () => {
  let eventId;

  test('CREATE: admin can create an event', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Jest Night',
        description: 'Created by the test suite',
        date: '2026-12-01T20:00:00.000Z',
        capacity: 50,
        city: 'Cairo',
        category: category._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Jest Night');
    eventId = res.body.data._id;
  });

  test('CREATE: no token → 401', async () => {
    const res = await request(app).post('/api/events').send({ title: 'Nope' });
    expect(res.status).toBe(401);
  });

  test('CREATE: invalid body → 422 with structured errors', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '', capacity: 'abc' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  test('LIST: returns events with category populated', async () => {
    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    const mine = res.body.data.find((e) => e._id === eventId);
    expect(mine).toBeDefined();
    expect(mine.category.name).toBe('TestCategory');
  });

  test('FILTER: by city', async () => {
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Alex Meetup',
        description: 'filter me',
        date: '2026-12-02T20:00:00.000Z',
        capacity: 10,
        city: 'Alexandria',
        category: category._id.toString(),
      });

    const res = await request(app).get('/api/events?city=alexandria');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Alex Meetup');
  });

  test('FILTER: by date range', async () => {
    const res = await request(app).get('/api/events?from=2026-12-02&to=2026-12-03');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Alex Meetup');
  });
});