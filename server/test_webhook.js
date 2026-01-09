const axios = require('axios');

const testOrder = {
  _id: "test12345",
  username: "John Doe",
  email: "agyakwesiadom@gmail.com",
  productName: "Baccarat Rouge 540",
  productImage: "https://example.com/image.jpg",
  quantity: 1,
  originalPrice: 500,
  finalPrice: 450,
  status: "pending",
  date: "2025-11-26",
  tier: "Gold"
};

async function testWebhook() {
  try {
    console.log('Sending webhook request...');
    const response = await axios.post('http://localhost:5000/api/webhooks/trigger/order', testOrder);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testWebhook();
