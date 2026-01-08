import axios from 'axios';

// Erstellt eine Axios-Instanz mit deiner Backend-URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Dieser Teil schickt das Token automatisch im Header mit, 
// sobald Max eingeloggt ist (Interceptors)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;