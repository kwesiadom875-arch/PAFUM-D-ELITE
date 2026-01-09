const axios = require('axios');

const testData = {
  userData: {
    _id: "user123",
    username: "Kwesi Adom",
    email: "agyakwesiadom@gmail.com",
    totalSpent: 5500
  },
  oldTier: "Gold",
  newTier: "Diamond"
};

async function testTierWebhook() {
  try {
    console.log('Sending tier upgrade webhook request...');
    const response = await axios.post('http://localhost:5000/api/webhooks/trigger/tier', testData);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testTierWebhook();
