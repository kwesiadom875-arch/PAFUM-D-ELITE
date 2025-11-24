// Script to auto-verify existing users (run once after deployment)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

mongoose.connect(dbAddress)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Find all users who don't have the isVerified field or it's false
    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { 
        $set: { isVerified: true },
        $unset: { verificationToken: "", verificationTokenExpiry: "" }
      }
    );
    
    console.log(`✅ Auto-verified ${result.modifiedCount} existing users`);
    console.log('All existing users can now log in without email verification.');
    
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
