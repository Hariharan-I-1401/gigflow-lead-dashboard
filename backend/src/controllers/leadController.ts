import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Lead from '../models/Lead';

const escapeRegex = (value: string): string => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 1. CREATE a new Lead
export const createLead = async (req: Request, res: Response): Promise<void> => {
    try {
        // ✨ FIXED: Added 'source' to the destructuring so it actually saves to your database!
        const { name, email, phone, status, source, value, notes } = req.body;
        const userId = (req as any).user?.id; 

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const newLead = new Lead({
            name,
            email,
            phone,
            status,
            source, // Included source here!
            value,
            notes,
            assignedTo: userId
        });

        const savedLead = await newLead.save();
        res.status(201).json(savedLead);
    } catch (error) {
        console.error("--- CREATE LEAD BACKEND ERROR ---", error);
        res.status(500).json({ message: 'Error creating lead', error });
    }
};

// 2. GET all leads (✨ FIXED: Now includes Pagination, Search, Filtering & Sorting!)
export const getLeads = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role; 

        // --- 1. PAGINATION SETUP ---
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // --- 2. BUILD THE QUERY (Filters & Search) ---
        const query: any = {};
        
        // RBAC: Sales users only see their own leads. Admins see all leads.
        if (userRole !== 'Admin') {
            query.assignedTo = userId;
        }

        // Apply Dropdown Filters safely using allowed enum values
        const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Lost'];
        const allowedSources = ['Website', 'Instagram', 'Referral'];

        const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim() : '';
        if (statusFilter && allowedStatuses.includes(statusFilter)) {
            query.status = statusFilter;
        }

        const sourceFilter = typeof req.query.source === 'string' ? req.query.source.trim() : '';
        if (sourceFilter && allowedSources.includes(sourceFilter)) {
            query.source = sourceFilter;
        }

        // Apply Advanced Search (Matches name OR email, case-insensitive)
        if (typeof req.query.search === 'string') {
            const searchTerm = req.query.search.trim();
            if (searchTerm.length > 0) {
                const safeSearch = escapeRegex(searchTerm);
                const searchRegex = new RegExp(safeSearch, 'i');
                query.$or = [
                    { name: searchRegex },
                    { email: searchRegex }
                ];
            }
        }

        // --- 3. SORTING SETUP ---
        let sortOptions: any = { createdAt: -1 }; // Default: Newest first
        if (req.query.sort === 'Oldest') sortOptions = { createdAt: 1 };
        if (req.query.sort === 'A-Z') sortOptions = { name: 1 };
        if (req.query.sort === 'Z-A') sortOptions = { name: -1 };

        // --- 4. EXECUTE DATABASE QUERIES ---
        const leads = await Lead.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        // Count total matching documents for the pagination math
        const totalRecords = await Lead.countDocuments(query);
        const totalPages = Math.ceil(totalRecords / limit);

        // --- 5. SEND FORMATTED RESPONSE ---
        res.status(200).json({
            data: leads,
            metadata: {
                totalRecords,
                totalPages,
                currentPage: page
            }
        });

    } catch (error) {
        console.error("--- GET LEADS BACKEND ERROR ---", error);
        res.status(500).json({ message: 'Error fetching leads', error });
    }
};

// 3. VIEW a single lead
export const getLeadById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const leadId = String(req.params.id).trim();

        if (!mongoose.Types.ObjectId.isValid(leadId)) {
            res.status(400).json({ message: 'Invalid lead id' });
            return;
        }

        const lead = await Lead.findOne({ _id: new mongoose.Types.ObjectId(leadId), assignedTo: userId });
        if (!lead) {
            res.status(404).json({ message: 'Lead not found' });
            return;
        }
        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lead', error });
    }
};

// 4. UPDATE a lead by ID
export const updateLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        // Only allow specific lead fields to be updated
        const allowedFields = ['name', 'email', 'phone', 'status', 'source', 'value', 'notes'];
        const updateData: any = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: 'No valid fields provided for update' });
            return;
        }

        // Verify ownership (or allow if Admin)
        const query: any = { _id: id };
        if (userRole !== 'Admin') query.assignedTo = userId;

        const updatedLead = await Lead.findOneAndUpdate(
            query,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedLead) {
            res.status(404).json({ message: 'Lead not found or unauthorized' });
            return;
        }

        res.status(200).json(updatedLead);
    } catch (error) {
        console.error("--- UPDATE LEAD BACKEND ERROR ---", error);
        res.status(500).json({ message: 'Error updating lead records', error });
    }
};

// 5. DELETE a lead
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        // Verify ownership (or allow if Admin)
        const query: any = { _id: id };
        if (userRole !== 'Admin') query.assignedTo = userId;

        const lead = await Lead.findOne(query);
        if (!lead) {
            res.status(404).json({ message: 'Lead not found or unauthorized' });
            return;
        }

        await Lead.findByIdAndDelete(id);
        res.status(200).json({ message: 'Lead successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting lead', error });
    }
};