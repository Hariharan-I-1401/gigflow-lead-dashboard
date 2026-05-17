import axios from 'axios';

// Create a central Axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // This connects your frontend to your backend!
});

// The "Interceptor": Automatically attaches your ID Badge (Token) to every request
api.interceptors.request.use(
    (config) => {
        // Grab the token from the browser's storage
        const token = localStorage.getItem('token');
        
        // If the token exists, attach it to the Authorization header
        if (token) {
            // ✨ THE FIX: Ensures headers object exists before attaching the token ✨
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;