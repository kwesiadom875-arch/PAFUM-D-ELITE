import axios from 'axios';

// Automatically switches between Localhost and Render
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_URL,
});

export default api;