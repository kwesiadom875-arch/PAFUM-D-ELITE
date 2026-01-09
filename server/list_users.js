const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dbAddress = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parfum_delite';

// Parse Arguments
const args = process.argv.slice(2);
const showAdminsOnly = args.includes('--admin');
const showVerifiedOnly = args.includes('--verified');
const exportFlagIndex = args.findIndex(arg => arg.startsWith('--export='));
const tierFlagIndex = args.findIndex(arg => arg.startsWith('--tier='));

const exportPath = exportFlagIndex !== -1 ? args[exportFlagIndex].split('=')[1] : null;
const targetTier = tierFlagIndex !== -1 ? args[tierFlagIndex].split('=')[1] : null;

mongoose.connect(dbAddress)
  .then(async () => {
    console.log('Connected to DB');
    console.log('Fetching users...');

    // Build Query
    const query = {};
    if (showAdminsOnly) query.isAdmin = true;
    if (showVerifiedOnly) query.isVerified = true;
    if (targetTier) query.tier = new RegExp(`^${targetTier}$`, 'i'); // Case-insensitive tier match

    // Fetch Users
    const users = await User.find(query);

    if (users.length === 0) {
      console.log('No users found matching criteria.');
      process.exit();
    }

    // Prepare Data for Display/Export
    const formattedUsers = users.map(u => ({
      ID: u._id.toString(),
      Username: u.username,
      Email: u.email,
      Tier: u.tier,
      Spent: `GH₵${u.spending}`,
      Orders: u.orderHistory ? u.orderHistory.length : 0,
      Verified: u.isVerified ? 'Yes' : 'No',
      Admin: u.isAdmin ? 'Yes' : 'No'
    }));

    // Display Table
    console.log(`\nFound ${users.length} users:\n`);
    console.table(formattedUsers);

    // Export to CSV if requested
    if (exportPath) {
      const headers = Object.keys(formattedUsers[0]).join(',');
      const rows = formattedUsers.map(u => Object.values(u).join(','));
      const csvContent = [headers, ...rows].join('\n');

      const filePath = path.resolve(__dirname, exportPath);
      fs.writeFileSync(filePath, csvContent);
      console.log(`\nSuccessfully exported users to: ${filePath}`);
    }

    process.exit();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
