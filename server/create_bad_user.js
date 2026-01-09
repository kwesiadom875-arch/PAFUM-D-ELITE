const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/parfum_delite')
  .then(async () => {
    try {
      // Delete if exists
      await User.deleteOne({ email: 'badpass@example.com' });
      
      const user = new User({
        username: 'badpass',
        email: 'badpass@example.com',
        password: 'plain_text_password_not_hashed' 
      });
      await user.save();
      console.log("User created with bad password");
    } catch (e) {
      console.error(e);
    }
    process.exit();
  });
