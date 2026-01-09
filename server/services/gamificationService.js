const User = require('../models/User');

const awardPoints = async (userId, action) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return;
    }

    let points = 0;
    switch (action) {
      case 'purchase':
        points = 10;
        break;
      case 'review':
        points = 5;
        break;
      default:
        break;
    }

    user.points += points;

    // Check for new badges
    if (user.points >= 100 && !user.badges.some(b => b.name === 'Centurion')) {
      user.badges.push({ name: 'Centurion' });
    }
    if (user.orderHistory.length >= 10 && !user.badges.some(b => b.name === 'Collector')) {
      user.badges.push({ name: 'Collector' });
    }

    await user.save();
  } catch (error) {
    console.error('Error awarding points:', error);
  }
};

module.exports = { awardPoints };
