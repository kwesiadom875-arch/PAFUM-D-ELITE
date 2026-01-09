require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

mongoose.connect(dbAddress)
  .then(async () => {
    console.log('Connected to DB');
    const user = await User.findOne({ email: 'agyakwesiadom@gmail.com' });
    if (user) {
      console.log('User found:', user);
    } else {
      console.log('User NOT found');
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
