import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Sun, Moon } from 'lucide-react';
import api from '../utils/api'; 
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    // 🌗 Theme State
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await api.post('/auth/login', { username, password });
            
            // CRITICAL RBAC ADDITIONS
            localStorage.setItem('token', response.data.token);
            const userData = response.data.user;
            localStorage.setItem('userRole', userData?.role || 'Sales User'); 
            localStorage.setItem('userName', userData?.username || username); 
            localStorage.setItem('userEmail', userData?.email || '');

            showToast('Logged in successfully! Redirecting...', 'success');
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
            
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Invalid username or password.';
            showToast(errorMsg, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-200 relative">
            
            {/* Dark Mode Toggle */}
            <button 
                onClick={() => setDarkMode((prev) => !prev)} 
                className="absolute top-6 right-6 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all z-50"
            >
                {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Premium Toast Notification Banner Placement */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Branding Header */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto h-12 w-12 bg-[#120085] rounded-xl flex items-center justify-center shadow-lg mb-4">
                    <span className="text-white font-bold text-2xl">G</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    GigFlow
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Smart Leads Dashboard
                </p>
            </div>

            {/* Login Card */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-slate-700 transition-colors duration-200">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Username
                                Username <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <input 
                                    type="text" 
                                    id="username" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required 
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#120085]/20 dark:focus:ring-blue-500/20 focus:border-[#120085] dark:focus:border-blue-500 transition-colors sm:text-sm"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#120085]/20 dark:focus:ring-blue-500/20 focus:border-[#120085] dark:focus:border-blue-500 transition-colors sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#120085] hover:bg-[#0a0066] dark:bg-[#120085] dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#120085] dark:focus:ring-offset-slate-800 active:scale-[0.98] transition-all duration-200"
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
                                <div className="w-full border-t border-gray-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors">
                                    New to GigFlow?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/register" className="text-sm font-medium text-[#120085] dark:text-blue-400 hover:text-[#0a0066] dark:hover:text-blue-300 hover:underline transition-colors">
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