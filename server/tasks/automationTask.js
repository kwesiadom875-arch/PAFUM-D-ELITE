const cron = require('node-cron');
const User = require('../models/User');
const { sendAIPersonalizedEmail } = require('../services/emailService');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('--- Running Daily Luxury Automation Tasks ---');
    try {
        const users = await User.find();
        const today = new Date();

        for (const user of users) {
            // 1. Check for purchase anniversary
            if (user.orderHistory && user.orderHistory.length > 0) {
                const firstPurchase = new Date(user.orderHistory[0].date);
                if (firstPurchase.getMonth() === today.getMonth() && firstPurchase.getDate() === today.getDate()) {
                    console.log(`Anniversary for ${user.username}`);
                    await sendAIPersonalizedEmail(user, 'PURCHASE_ANNIVERSARY', { years: 1 });
                }
            }

            // 2. Weekly/Monthly personalized recommendations (Optional logic)
            // ...
        }
    } catch (err) {
        console.error('Automation task failed:', err);
    }
});
