import { Request, Response } from 'express';
import Lead from '../models/Lead';

// 1. CREATE a new Lead
export const createLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, status, value, notes } = req.body;
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
            value,
            notes,
            assignedTo: userId
        });

        const savedLead = await newLead.save();
        res.status(201).json(savedLead);
    } catch (error) {
        console.error("--- CREATE LEAD BACKEND ERROR ---", error); // Logs the exact issue to terminal if it fails!
        res.status(500).json({ message: 'Error creating lead', error });
    }
};

// 2. GET all leads assigned to the logged-in user
export const getLeads = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const leads = await Lead.find({ assignedTo: userId }).sort({ createdAt: -1 });
        res.status(200).json(leads);
    } catch (error) {
        console.error("--- GET LEADS BACKEND ERROR ---", error);
        res.status(500).json({ message: 'Error fetching leads', error });
    }
};
// Add this new function to view a single lead
export const getLeadById = async (req: Request, res: Response): Promise<void> => {
    try {
        const lead = await Lead.findOne({ _id: req.params.id, assignedTo: (req as any).user.id });
        if (!lead) {
            res.status(404).json({ message: 'Lead not found' });
            return;
        }
        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lead', error });
    }
};
// 3. UPDATE a lead by ID
export const updateLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        // Verify ownership first
        const lead = await Lead.findOne({ _id: id, assignedTo: userId });
        if (!lead) {
            res.status(404).json({ message: 'Lead not found or unauthorized' });
            return;
        }

        // Overwrites all text input structures safely via $set
        const updatedLead = await Lead.findByIdAndUpdate(
            id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedLead);
    } catch (error) {
        console.error("--- UPDATE LEAD BACKEND ERROR ---", error);
        res.status(500).json({ message: 'Error updating lead records', error });
    }
};
// 4. DELETE a lead
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const lead = await Lead.findOne({ _id: id, assignedTo: userId });
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