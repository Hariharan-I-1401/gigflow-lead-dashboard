import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, LogOut, User, Sun, Moon, Shield, UserPlus, Trash2, X, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import Toast from '../components/Toast';

interface Lead {
    _id: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Won';
}

interface TeamMember {
    _id: string;
    username?: string; 
    name?: string; // Flexible fallback for structural schema variants
    email: string;
    role: 'Admin' | 'Sales User';
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const userRole = localStorage.getItem('userRole') || 'Sales User';
    const isAdmin = userRole === 'Admin';

    // Form states for adding a new user
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'Admin' | 'Sales User'>('Sales User');

    // Custom Confirmation Modals States
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

    const fetchDashboardData = async () => {
        try {
            const leadsRes = await api.get('/leads');
            setLeads(leadsRes.data || []);

            if (isAdmin) {
                const teamRes = await api.get('/auth'); 
                // Checks if array exists, otherwise defaults to empty array to drop loading screen
                setTeam(Array.isArray(teamRes.data) ? teamRes.data : []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setTeam([]); // Prevents infinite loading visual block on failure
        }
    };

    useEffect(() => { fetchDashboardData(); }, [isAdmin]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { 
                username: newUserName, 
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole
            });
            showToast(`${newUserRole} created successfully!`, 'success');
            setIsAddUserModalOpen(false);
            setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setNewUserRole('Sales User');
            fetchDashboardData();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to create user.';
            showToast(errorMsg, 'error');
        }
    };

    const triggerDeleteUser = (id: string) => {
        setUserToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/auth/${userToDelete}`);
            showToast('User access revoked.', 'success');
            fetchDashboardData();
        } catch (error) {
            showToast('Failed to delete user.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === 'Won').length;
    const activeLeads = leads.filter(l => l.status === 'New' || l.status === 'Contacted' || l.status === 'Qualified').length;
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans overflow-hidden transition-colors duration-200">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <style>{`
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
                .dark ::-webkit-scrollbar-thumb { background-color: #475569; }
            `}</style>

            {/* LOGOUT CONFIRMATION MODAL */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border dark:border-slate-700 text-center relative">
                        <div className="mx-auto h-12 w-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-4">
                            <LogOut className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Ready to leave?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">You will need to sign back in to access the leads workspace.</p>
                        <div className="flex justify-center space-x-3">
                            <button onClick={() => setIsLogoutModalOpen(false)} className="px-5 py-2.5 border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-all">Cancel</button>
                            <button onClick={confirmLogout} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md">Sign Out</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE USER CONFIRMATION MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border dark:border-slate-700 text-center relative">
                        <div className="mx-auto h-12 w-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Revoke Access?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to remove this user from the system? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-3">
                            <button onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }} className="px-5 py-2.5 border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-all">Cancel</button>
                            <button onClick={confirmDeleteUser} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md">Yes, Revoke Access</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD USER MODAL (Admin Only) */}
            {isAddUserModalOpen && isAdmin && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl relative border dark:border-slate-700">
                        <button onClick={() => setIsAddUserModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="h-5 w-5" /></button>
                        <h3 className="text-xl font-bold mb-4 flex items-center"><UserPlus className="h-5 w-5 mr-2 text-[#120085] dark:text-blue-400"/> Add User</h3>
                        <form onSubmit={handleAddUser} className="space-y-4 text-left">
                            <input type="text" value={newUserName} onChange={(e)=>setNewUserName(e.target.value)} required placeholder="Username" className="w-full p-2.5 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none dark:text-white" />
                            <input type="email" value={newUserEmail} onChange={(e)=>setNewUserEmail(e.target.value)} required placeholder="Email Address" className="w-full p-2.5 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none dark:text-white" />
                            <input type="password" value={newUserPassword} onChange={(e)=>setNewUserPassword(e.target.value)} required placeholder="Temporary Password" className="w-full p-2.5 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none dark:text-white" />
                            <select value={newUserRole} onChange={(e)=>setNewUserRole(e.target.value as any)} className="w-full p-2.5 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none dark:text-white">
                                <option value="Sales User">Sales User</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 border dark:border-slate-600 rounded-xl text-sm dark:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-[#120085] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-md">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="hidden md:flex w-16 hover:w-64 bg-[#120085] text-white flex-col justify-between shadow-xl transition-all duration-300 group z-30">
                <div>
                    <div className="p-4 border-b border-white/10 flex items-center space-x-4 overflow-hidden h-16 shrink-0">
                        <div className="h-8 w-8 bg-white text-[#120085] rounded-lg flex items-center justify-center font-bold text-lg shrink-0">G</div>
                        <span className="text-lg font-bold tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">GigFlow</span>
                    </div>
                    <nav className="mt-6 px-2 space-y-1 overflow-hidden">
                        <button onClick={() => navigate('/dashboard')} className="w-full flex items-center space-x-4 bg-white/10 text-white px-3 py-3 rounded-lg text-sm font-medium transition-all text-left truncate">
                            <LayoutDashboard className="h-5 w-5 shrink-0" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Executive Dashboard</span>
                        </button>
                        <button onClick={() => navigate('/leads')} className="w-full flex items-center space-x-4 text-white/70 hover:bg-white/5 hover:text-white px-3 py-3 rounded-lg text-sm font-medium transition-all text-left truncate">
                            <Users className="h-5 w-5 shrink-0" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Leads Workspace</span>
                        </button>
                    </nav>
                </div>
                <div className="p-2 border-t border-white/10 overflow-hidden">
                    <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center space-x-4 text-white/70 hover:bg-rose-600 hover:text-white px-3 py-3 rounded-lg text-sm font-medium transition-all text-left truncate">
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 shadow-sm z-10 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Executive Dashboard</h2>
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold rounded uppercase tracking-wider">{userRole}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                        </button>
                        <button onClick={() => navigate('/profile')} className="flex items-center space-x-2 group/btn cursor-pointer hover:opacity-80 transition-all">
                            <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm border border-transparent group-hover/btn:border-blue-500"><User className="h-5 w-5" /></div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Agent Profile</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        
                        {/* LIVE METRICS */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors duration-200">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Leads Handled</p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totalLeads}</p>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-[#120085] dark:text-blue-400 rounded-lg"><Users className="h-6 w-6" /></div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors duration-200">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Win Rate</p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{conversionRate}%</p>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><BarChart3 className="h-6 w-6" /></div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors duration-200">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Opportunities</p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{activeLeads}</p>
                                </div>
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Shield className="h-6 w-6" /></div>
                            </div>
                        </div>

                        {/* 🛡️ ADMIN ONLY: USER MANAGEMENT PANEL */}
                        {isAdmin && (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden mt-8 transition-colors duration-200">
                                <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Management</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add or remove user credentials from your CRM instance.</p>
                                    </div>
                                    <button onClick={() => setIsAddUserModalOpen(true)} className="px-4 py-2 bg-[#120085] hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center shadow-sm transition-all">
                                        <UserPlus className="h-4 w-4 mr-2" /> Add User
                                    </button>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-left text-sm">
                                        <thead className="bg-slate-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 uppercase font-semibold text-xs tracking-wider">
                                            <tr>
                                                <th className="px-6 py-3">User</th>
                                                <th className="px-6 py-3">System Role</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-gray-900 dark:text-gray-300">
                                            {team.length === 0 ? (
                                                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No user accounts found.</td></tr>
                                            ) : (
                                                team.map((member) => (
                                                    <tr key={member._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            {/* ✨ Dual evaluation fallback checks for username OR name */}
                                                            <div className="font-bold text-[#120085] dark:text-blue-400">{member.username || member.name || 'System Account'}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                                                                member.role === 'Admin' 
                                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' 
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                                            }`}>
                                                                {member.role || 'Sales User'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => triggerDeleteUser(member._id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-all" title="Revoke Access">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;