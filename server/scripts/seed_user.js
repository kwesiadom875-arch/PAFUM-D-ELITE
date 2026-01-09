require('dotenv').config();
const mongoose = require('mongoose');
const argon2 = require('argon2');
const User = require('../models/User');

const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

mongoose.connect(dbAddress)
  .then(async () => {
    console.log('Connected to DB');

    const email = 'agyakwesiadom@gmail.com';
    const password = 'pass';
    const username = 'Agya Kwesi'; // Default username

    // Check if exists first (though we know it doesn't)
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User already exists. Updating password...');
      existing.password = await argon2.hash(password);
      await existing.save();
      console.log('Password updated.');
    } else {
      console.log('Creating new user...');
      const hashedPassword = await argon2.hash(password);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        tier: 'Gold', // Give them Gold status for fun
        spending: 5000
      });
      await newUser.save();
      console.log('User created successfully.');
    }

    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
