import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // ✨ State for Logout Modal

    const userName = localStorage.getItem('userName') || 'Agent Operator';
    const userEmail = localStorage.getItem('userEmail') || 'agent.operator@gigflow.io';
    const userRole = localStorage.getItem('userRole') || 'Sales User';

    useEffect(() => {
        const isDark = localStorage.getItem('theme') === 'dark';
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-200 flex items-center justify-center p-4">
            
            {/* LOGOUT CONFIRMATION MODAL */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border dark:border-slate-700 text-center relative">
                        <div className="mx-auto h-12 w-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-4">
                            <LogOut className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Confirm Log Out</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to terminate your active session?</p>
                        <div className="flex justify-center space-x-3">
                            <button onClick={() => setIsLogoutModalOpen(false)} className="px-5 py-2.5 border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-all">Cancel</button>
                            <button onClick={confirmLogout} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md">Terminate Session</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 max-w-md w-full p-6 text-center relative overflow-hidden transition-all duration-200">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                
                <div className="mx-auto h-24 w-24 bg-blue-100 dark:bg-blue-900/50 text-[#120085] dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-4xl shadow-md mb-4 mt-4 uppercase">
                    {userName.charAt(0)}
                </div>
                
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{userName}</h2>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-1">Status: Active Duty</p>
                
                <div className="mt-6 border-t border-gray-100 dark:border-slate-700 pt-4 space-y-3 text-left text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate font-medium">{userEmail}</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Role Privilege: {userRole}</span>
                    </div>
                </div>
                
                <div className="mt-6 space-y-3">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-2.5 bg-[#120085] hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all active:scale-95"
                    >
                        Return to Mission Operations
                    </button>

                    {/* ✨ CHANGED: Trigger custom modal instead of logging out instantly ✨ */}
                    <button 
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center justify-center py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-semibold rounded-xl text-sm transition-all active:scale-95"
                    >
                        <LogOut className="h-4 w-4 mr-2" /> Complete Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;