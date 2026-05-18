import express from 'express';
import { createLead, getLeads, updateLead, deleteLead, getLeadById } from '../controllers/leadController';
import { protect } from '../middlewares/authMiddleware';

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
const leadRateLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes

// All routes are guarded behind our secure login middleware AND explicit rate limiters
router.route('/')
    .post(leadRateLimiter, protect, createLead)
    .get(leadRateLimiter, protect, getLeads);

router.route('/:id')
    .get(leadRateLimiter, protect, getLeadById) // Grouped cleanly!
    .put(leadRateLimiter, protect, updateLead)
    .delete(leadRateLimiter, protect, deleteLead);

export default router;