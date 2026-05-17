import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import api from '../utils/api'; 
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await api.post('/auth/login', { username, password });
            
            // ✨ CRITICAL RBAC ADDITIONS: Save all user data to local storage ✨
            
            // 1. Save the token (this sits at the top level of the response)
            localStorage.setItem('token', response.data.token);
            
            // 2. Grab the nested 'user' object from the backend response
            const userData = response.data.user;
            
            // 3. Save the role, name, and email from that user object
            localStorage.setItem('userRole', userData?.role || 'Sales User'); 
            localStorage.setItem('userName', userData?.username || username); 
            localStorage.setItem('userEmail', userData?.email || '');

            // Trigger the beautiful new success banner!
            showToast('Logged in successfully! Redirecting...', 'success');
            console.log('Login Success:', response.data);

            // Automatically sweep them to the dashboard after a brief moment for the toast to display
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
            
        } catch (err: any) {
            // Captures "Invalid credentials" or any error message sent from your backend into a custom toast
            const errorMsg = err.response?.data?.message || 'Invalid username or password.';
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
                    GigFlow
                </h1>
                <p className="mt-2 text-sm text-gray-600 font-medium">
                    Smart Leads Dashboard
                </p>
            </div>

            {/* Login Card */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-sm text-gray-500 mt-1">Please enter your details to sign in.</p>
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
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#120085]/20 focus:border-[#120085] transition-colors sm:text-sm"
                                    placeholder="Enter your username"
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
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#120085]/20 focus:border-[#120085] transition-colors sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#120085] hover:bg-[#0a0066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#120085] active:scale-[0.98] transition-all duration-200"
                            >
                                Sign in
                                <ArrowRight className="ml-2 h-4 w-4" />
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
                                    New to GigFlow?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/register" className="text-sm font-medium text-[#120085] hover:text-[#0a0066] hover:underline transition-colors">
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;