require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

mongoose.connect(dbAddress)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Delete all users
    const result = await User.deleteMany({});
    
    console.log(`🗑️  Deleted ${result.deletedCount} user accounts`);
    console.log('✨ Database reset complete - starting with a clean slate!');
    
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
