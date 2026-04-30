import axios from 'axios';

const api = axios.create({
  baseURL: window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api',
});

export default api;
