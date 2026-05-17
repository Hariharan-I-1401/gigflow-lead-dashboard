import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import api from '../utils/api'; // Central Axios instance
import Toast from '../components/Toast';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await api.post('/auth/register', { username, email, password });
            
            // Save the JWT token to local storage for authenticating future requests
            localStorage.setItem('token', response.data.token);
            
            // Trigger the beautiful new success banner!
            showToast('Account created successfully! Redirecting...', 'success');
            
            // Clear Form
            setUsername('');
            setEmail('');
            setPassword('');
            
            console.log("Registration Success:", response.data);

            // Automatically sweep them to the dashboard after a brief moment for the toast to display
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (err: any) {
            // Captures the exact error message sent from your backend controller into a custom toast
            const errorMsg = err.response?.data?.message || 'Something went wrong during registration.';
            showToast(errorMsg, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            {/* 🔔 Premium Toast Notification Banner Placement */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Branding Header */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto h-12 w-12 bg-[#120085] rounded-xl flex items-center justify-center shadow-lg mb-4">
                    <span className="text-white font-bold text-2xl">G</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Join GigFlow
                </h1>
                <p className="mt-2 text-sm text-gray-600 font-medium">
                    Smart Leads Dashboard
                </p>
            </div>

            {/* Registration Card */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
                        <p className="text-sm text-gray-500 mt-1">Please fill in your details to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    id="username" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required 
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#120085]/20 focus:border-[#120085] transition-colors sm:text-sm"
                                    placeholder="Choose a username"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="type" 
                                    id="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#120085]/20 focus:border-[#120085] transition-colors sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#120085]/20 focus:border-[#120085] transition-colors sm:text-sm"
                                    placeholder="Create a strong password"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#120085] hover:bg-[#0a0066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#120085] active:scale-[0.98] transition-all duration-200"
                            >
                                Register
                                <UserPlus className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </form>

                    {/* Footer / Divider */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <button 
                                onClick={() => navigate('/login')} 
                                className="text-sm font-medium text-[#120085] hover:text-[#0a0066] hover:underline transition-colors bg-transparent border-none cursor-pointer focus:outline-none"
                            >
                                Sign in here
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;