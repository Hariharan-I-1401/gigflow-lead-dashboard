import express from 'express';
import { registerUser, loginUser, getUsers, deleteUser } from '../controllers/auth.controller';
import { protect, admin } from '../middlewares/authMiddleware';

// 🛡️ Custom Rate Limiter Utility
const createRateLimiter = (windowMs: number, maxRequests: number) => {
    const clients = new Map<string, { count: number; resetAt: number }>();

    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const key = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        const now = Date.now();
        const entry = clients.get(key);

        if (!entry || now > entry.resetAt) {
            clients.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }

        if (entry.count >= maxRequests) {
            res.status(429).json({ message: 'Too many requests, please try again later.' });
            return;
        }

        entry.count += 1;
        clients.set(key, entry);
        next();
    };
};

const router = express.Router();

// 🚦 Define specific limits
// Stricter limit for auth to prevent brute-force login attacks
const authRateLimiter = createRateLimiter(15 * 60 * 1000, 10); 
// Standard limit for admin dashboard actions
const adminRateLimiter = createRateLimiter(15 * 60 * 1000, 100); 

// 1. Public Authentication Gates (Protected by Auth Limiter)
router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);

// 2. User Management Routes (Protected to logged-in Admins only + Admin Limiter)
// ✨ This fix removes the "Loading user accounts..." freeze AND adds rate limiting!
router.get('/', adminRateLimiter, protect, admin, getUsers); 
router.delete('/:id', adminRateLimiter, protect, admin, deleteUser);

export default router;