import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Update token handling
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('Sending token:', token); // Debug log
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No token found in localStorage');
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Modify response interceptor to handle 403 errors gracefully and redirect on auth errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !error.config.url.includes('/login')) {
      // Handle unauthorized errors by clearing localStorage and redirecting to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Removed the global toast for 403 Forbidden errors
    return Promise.reject(error);
  }
);

export default apiClient;
