import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, getUsers, deleteUser } from '../controllers/auth.controller';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// 🚦 Define specific limits using the official express-rate-limit package
// Stricter limit for auth to prevent brute-force login attacks
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Standard limit for admin dashboard actions
const adminRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 1. Public Authentication Gates (Protected by Auth Limiter)
router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);

// 2. User Management Routes (Protected to logged-in Admins only + Admin Limiter)
router.get('/', adminRateLimiter, protect, admin, getUsers); 
router.delete('/:id', adminRateLimiter, protect, admin, deleteUser);

export default router;