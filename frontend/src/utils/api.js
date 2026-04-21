import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attaching Bearer token to every request automatically
// Reads fresh from localStorage each time so it always has the latest token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// handles session state via AuthContext. Auto-redirecting here caused
// localStorage to be wiped in a loop before the token could be read.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;