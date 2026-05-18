import axios from 'axios';

// Create the central Axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Make sure this matches your backend!
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