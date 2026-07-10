import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle global errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';

    // Login/Register apne khud ke error already dikhate hain (authSlice ke
    // rejectWithValue se). In requests par hard-redirect NAHI karna hai,
    // warna wrong-password par bhi poora page reload ho jayega.
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthAttempt) {
      // Yeh sirf tab chalega jab ek already-logged-in user ka token
      // expire/invalid ho gaya ho (kisi protected route par).
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default API;