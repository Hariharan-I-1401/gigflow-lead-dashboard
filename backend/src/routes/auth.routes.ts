import express from 'express';
import { registerUser, loginUser, getUsers, deleteUser } from '../controllers/auth.controller';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// 1. Public Authentication Gates
router.post('/register', registerUser);
router.post('/login', loginUser);

// 2. User Management Routes (Protected to logged-in Admins only)
// ✨ This fix removes the "Loading user accounts..." freeze!
router.get('/', protect, admin, getUsers); 
router.delete('/:id', protect, admin, deleteUser);

export default router;