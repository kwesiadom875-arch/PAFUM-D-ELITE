const axios = require('axios');

const testProduct = {
  _id: "prod789",
  name: "Santal 33",
  image: "https://example.com/santal.jpg",
  stockQuantity: 5, // Simulating low stock
  category: "Niche",
  price: 280
};

async function testStockWebhook() {
  try {
    console.log('Sending stock alert webhook request...');
    const response = await axios.post('http://localhost:5000/api/webhooks/trigger/stock-alert', testProduct);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testStockWebhook();
