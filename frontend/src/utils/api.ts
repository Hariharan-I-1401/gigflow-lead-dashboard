import axios from 'axios';

const api = axios.create({
    // It will look for the .env variable first. If it can't find it, it safely falls back.
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', 
});
// Add a Request Interceptor to automatically attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;