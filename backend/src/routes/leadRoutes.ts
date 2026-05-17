import express from 'express';
import { createLead, getLeads, updateLead, deleteLead, getLeadById } from '../controllers/leadController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are guarded behind our secure login middleware
router.route('/')
    .post(protect, createLead)
    .get(protect, getLeads);

router.route('/:id')
    .put(protect, updateLead)    
    .delete(protect, deleteLead);
    router.get('/:id', protect, getLeadById);

export default router;