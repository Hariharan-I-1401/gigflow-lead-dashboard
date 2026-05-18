import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
    name: string;
    email: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Lost'|'Won';
    source: 'Website' | 'Instagram' | 'Referral';
    assignedTo: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const leadSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Won'], 
        default: 'New' 
    },
    source: { 
        type: String, 
        enum: ['Website', 'Instagram', 'Referral'], 
        default: 'Website' 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { 
    timestamps: true // This automatically creates and manages 'createdAt' and 'updatedAt'
});

export default mongoose.model<ILead>('Lead', leadSchema);