import express from 'express';
import rateLimit from 'express-rate-limit';
import { createLead, getLeads, updateLead, deleteLead, getLeadById } from '../controllers/leadController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// 🚦 Official express-rate-limit implementation
const leadRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// All routes are guarded behind our secure login middleware AND explicit rate limiters
router.route('/')
    .post(leadRateLimiter, protect, createLead)
    .get(leadRateLimiter, protect, getLeads);

router.route('/:id')
    .get(leadRateLimiter, protect, getLeadById)
    .put(leadRateLimiter, protect, updateLead)
    .delete(leadRateLimiter, protect, deleteLead);

export default router;