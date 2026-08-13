require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Event = require('./models/Event');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const categoryData = [
      { name: 'Music', description: 'Concerts and festivals' },
      { name: 'Technology', description: 'Meetups and hackathons' },
      { name: 'Sports', description: 'Matches and tournaments' },
    ];

    const categories = [];
    for (const data of categoryData) {
      const doc = await Category.findOneAndUpdate({ name: data.name }, data, {
        new: true,
        upsert: true,
        runValidators: true,
      });
      categories.push(doc);
    }

    const eventData = [
      {
        title: 'Cairo Jazz Night',
        description: 'Live jazz evening in the heart of Cairo',
        date: '2026-09-15T20:00:00.000Z',
        capacity: 200,
        city: 'Cairo',
        category: categories[0]._id,
      },
      {
        title: 'Egypt Tech Summit',
        description: 'Annual summit for developers and startups',
        date: '2026-10-05T09:00:00.000Z',
        capacity: 500,
        city: 'Giza',
        category: categories[1]._id,
      },
      {
        title: 'Alex Football Cup',
        description: 'Friendly football tournament',
        date: '2026-11-20T15:00:00.000Z',
        capacity: 1000,
        city: 'Alexandria',
        category: categories[2]._id,
      },
    ];

    for (const data of eventData) {
      await Event.updateOne({ title: data.title }, data, {
        upsert: true,
        runValidators: true,
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first');
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        role: 'admin',
      });
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }

    /* Summary */
    console.log('Seed finished:', {
      users: await User.countDocuments(),
      categories: await Category.countDocuments(),
      events: await Event.countDocuments(),
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed FAILED:', err.message);
    process.exit(1);
  }
};

seed();