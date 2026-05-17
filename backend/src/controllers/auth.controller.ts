import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// ==========================================
// TEAM MANAGEMENT CONTROLLERS
// ==========================================

// Get all users (For Admin Dashboard)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Find all users except the currently logged-in admin
        const currentUserId = (req as any).user?._id || (req as any).user?.id; 
        const users = await User.find({ _id: { $ne: currentUserId } }).select('-password');
        
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching users' });
    }
};

// Delete a user (Revoke Access)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.status(200).json({ message: 'User access revoked successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting user' });
    }
};

// Generate JWT Token string matching payload roles
const generateToken = (id: string, role?: string) => {
    return jwt.sign(
        { id, role }, 
        process.env.JWT_SECRET || 'super_secret_fallback_key', 
        { expiresIn: '30d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, role } = req.body;

        // 1. Validation check for missing fields
        if (!username || !email || !password) {
            res.status(400).json({ success: false, message: 'Please provide all required fields' });
            return;
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            res.status(400).json({ success: false, message: 'Username or Email already registered' });
            return;
        }

        // ✨ THE FIX: Map frontend variant 'Sales User' down to backend strict enum token 'Sales'
        let targetRole = role || 'Sales';
        if (targetRole === 'Sales User') {
            targetRole = 'Sales';
        }

        // 3. Create the new user (Password gets auto-hashed via Mongoose pre-save hook)
        const user = await User.create({
            username,
            email,
            password,
            role: targetRole
        });

        // 4. Respond with user data and the secure JWT token
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: generateToken(user._id.toString(), user.role),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("--- BACKEND REGISTRATION ERROR ---", error);
        res.status(500).json({ message: 'Server Error during registration' });
    }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        // 1. Validation check
        if (!username || !password) {
            res.status(400).json({ success: false, message: 'Please provide both username and password' });
            return;
        }

        // 2. Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        // 3. Match entered password with hashed database password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        // 4. Respond with token if password is correct
        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token: generateToken(user._id.toString(), user.role),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("--- BACKEND LOGIN ERROR ---", error);
        res.status(500).json({ message: 'Server Error during login' });
    }
};