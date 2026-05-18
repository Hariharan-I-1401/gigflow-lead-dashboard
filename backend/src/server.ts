import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes'; // <-- Import the routes

dotenv.config();

// Connect to MongoDB Cloud Atlas
connectDB();

const app = express();

// 1. Root Health Check 
app.get('/', (req, res) => {
    res.status(200).json({ message: 'GigFlow Backend API is running! Please navigate to /api for endpoints.' });
});

// 2. API Health Check 
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Welcome to the GigFlow API! Server is running smoothly.' });
});

// Global Middlewares
app.use(cors());
app.use(express.json());
import leadRoutes from './routes/leadRoutes';

// API Routes
app.use('/api/auth', authRoutes); // <-- Mount auth routes at /api/auth
app.use('/api/leads', leadRoutes); // <-- Mount lead routes at /api/leads

// Server Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'GigFlow API is running securely!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});