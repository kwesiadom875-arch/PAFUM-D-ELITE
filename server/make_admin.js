const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

mongoose.connect(dbAddress)
  .then(async () => {
    console.log('Connected to DB');
    const email = 'adomagyakwesi1@gmail.com';
    const res = await User.updateOne({ email: email }, { $set: { isAdmin: true } });
    console.log(`Updated ${email} to admin:`, res);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
