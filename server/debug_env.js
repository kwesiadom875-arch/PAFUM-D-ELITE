const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('Resolved .env path:', path.resolve(__dirname, '.env'));
