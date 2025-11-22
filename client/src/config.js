const isProduction = import.meta.env.MODE === 'production';
const API_URL = isProduction 
  ? 'https://pafum-d-elite.onrender.com' 
  : 'http://127.0.0.1:5000';
export default API_URL;