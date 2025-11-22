const isProduction = import.meta.env.MODE === 'production';
const API_URL = isProduction 
  ? 'https://parfum-delite-backend.onrender.com' 
  : 'http://127.0.0.1:5000';
export default API_URL;