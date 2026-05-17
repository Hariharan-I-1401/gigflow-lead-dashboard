import { Document } from 'mongoose';

export type UserRole = 'Admin' | 'Sales';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    comparePassword(candidatePassword: string): Promise<boolean>;
}