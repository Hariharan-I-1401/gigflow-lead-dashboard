import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// 1. Protect routes (Ensure user is logged in)
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // ✨ THE FIX: Added the exact same fallback key here so they always match! ✨
            const secret = process.env.JWT_SECRET || 'super_secret_fallback_key';
            const decoded: any = jwt.verify(token, secret);
            
            // Fetch user and attach to request
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                res.status(401).json({ message: 'Not authorized, user deleted' });
                return;
            }
            
            (req as any).user = user;
            next();
        } catch (error) {
            // This will log the exact reason to your backend terminal if it fails!
            console.error("JWT Verification Error:", error); 
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// 2. 🛡️ ADMIN ONLY MIDDLEWARE
export const admin = (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (user && user.role === 'Admin') {
        next(); // User is admin, let them proceed
    } else {
        res.status(403).json({ message: 'Not authorized as an Admin' });
    }
};