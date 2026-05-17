import { Document, Schema } from 'mongoose';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Won';

export interface ILead extends Document {
    name: string;
    email: string;
    phone?: string;
    status: LeadStatus;
    value: number; // For your dashboard metric tracking calculations
    assignedTo: Schema.Types.ObjectId; // References the Sales/Admin User model
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}