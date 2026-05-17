import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, LogOut, Trash2, Edit3, X, 
    Search, Plus, ChevronDown, FolderArchive, Sun, Moon, 
    AlertTriangle, User, Eye, FilterX, ChevronLeft, ChevronRight, Download, ArrowUpDown
} from 'lucide-react';
import api from '../utils/api';
import Toast from '../components/Toast';

interface Lead {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Won';
    source: 'Website' | 'Instagram' | 'Referral';
    value: number;
    notes?: string;
    createdAt: string;
}

const LeadsManagement: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // 🛡️ ROLE-BASED ACCESS CONTROL (RBAC)
    const userRole = localStorage.getItem('userRole') || 'Sales User'; 
    const isAdmin = userRole === 'Admin';

    // 🧮 SERVER-SIDE PAGINATION STATE METADATA
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 10; 

    // 🔍 Search, Filtering & Sorting States
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); 
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterSource, setFilterSource] = useState<string>('All'); 
    const [filterDate, setFilterDate] = useState<string>(''); 
    const [sortOption, setSortOption] = useState<string>('Newest');
    const [groupByStatus, setGroupByStatus] = useState(false);

    // 🌗 Theme State
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

    // ✨ DEBOUNCED SEARCH LOGIC (Waits 300ms after user stops typing)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Modals States
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); 
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
    const [viewingLead, setViewingLead] = useState<Lead | null>(null);
    
    // Unified Add/Edit Form State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
    
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editStatus, setEditStatus] = useState<Lead['status']>('New');
    const [editSource, setEditSource] = useState<Lead['source']>('Website');
    const [editNotes, setEditNotes] = useState('');

    const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

    // ✨ FIXED: Fetch leads using server-side queries for pagination & filtering
    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads', {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    status: filterStatus !== 'All' ? filterStatus : undefined,
                    source: filterSource !== 'All' ? filterSource : undefined,
                    search: debouncedSearchQuery !== '' ? debouncedSearchQuery : undefined,
                    sort: sortOption
                }
            });

            // Extract paginated layout data out from the operational payload envelope
            if (response.data && response.data.data) {
                setLeads(response.data.data);
                setTotalPages(response.data.metadata?.totalPages || 1);
                setTotalRecords(response.data.metadata?.totalRecords || 0);
            } else {
                // Fallback support for older endpoint data structural configurations
                setLeads(response.data);
            }
        } catch (error) {
            showToast('Failed to load leads pipeline.', 'error');
        }
    };

    // Re-fetch data whenever any pagination, filtering, search, or sorting query state changes
    useEffect(() => { 
        fetchLeads(); 
    }, [currentPage, debouncedSearchQuery, filterStatus, filterSource, sortOption]);

    // Reset pagination window tracking indices back to index 1 whenever a filter drops down
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, filterStatus, filterSource, sortOption]);

    const clearFilters = () => {
        setSearchQuery('');
        setDebouncedSearchQuery('');
        setFilterStatus('All');
        setFilterSource('All');
        setFilterDate('');
        setSortOption('Newest');
        setCurrentPage(1);
    };

    const exportToCSV = () => {
        if (!isAdmin) return; 
        if (leads.length === 0) {
            showToast('No data available to export.', 'error');
            return;
        }
        const headers = ['Lead Name', 'Email', 'Phone', 'Status', 'Source', 'Date Created', 'Notes'];
        const csvRows = leads.map(lead => [
            `"${lead.name}"`, `"${lead.email}"`, `"${lead.phone || ''}"`, `"${lead.status}"`, 
            `"${lead.source}"`, `"${lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ''}"`, `"${lead.notes || ''}"`
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `GigFlow_Leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV Export Downloaded Successfully!', 'success');
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.put(`/leads/${id}`, { status: newStatus });
            showToast(`Status updated to ${newStatus}!`, 'success');
            fetchLeads(); 
        } catch (error) {
            showToast('Failed to update status.', 'error');
        }
    };

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const openFormModal = (lead?: Lead) => {
        if (lead) {
            setEditingLeadId(lead._id);
            setEditName(lead.name);
            setEditEmail(lead.email);
            setEditPhone(lead.phone || '');
            setEditStatus(lead.status);
            setEditSource(lead.source || 'Website');
            setEditNotes(lead.notes || '');
        } else {
            setEditingLeadId(null);
            setEditName('');
            setEditEmail('');
            setEditPhone('');
            setEditStatus('New');
            setEditSource('Website');
            setEditNotes('');
        }
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: editName, email: editEmail, phone: editPhone,
                status: editStatus, source: editSource, notes: editNotes
            };

            if (editingLeadId) {
                await api.put(`/leads/${editingLeadId}`, payload);
                showToast('Lead updated successfully!', 'success');
            } else {
                await api.post('/leads', payload);
                showToast('New lead added successfully!', 'success');
            }
            setIsFormModalOpen(false);
            fetchLeads();
        } catch (error) {
            showToast(editingLeadId ? 'Failed to update lead.' : 'Failed to create lead.', 'error');
        }
    };

    const triggerDeleteModal = (id: string) => {
        if (!isAdmin) return;
        setLeadToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!leadToDelete || !isAdmin) return;
        try {
            await api.delete(`/leads/${leadToDelete}`);
            showToast('Lead deleted.', 'success');
            setIsDeleteModalOpen(false);
            setLeadToDelete(null);
            fetchLeads();
        } catch (error) {
            showToast('Failed to delete lead.', 'error');
            setIsDeleteModalOpen(false);
        }
    };

    const statuses: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Lost', 'Won'];
    const sources: Lead['source'][] = ['Website', 'Instagram', 'Referral'];

    const getStatusColors = (status: string) => {
        switch (status) {
            case 'Won': return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400';
            case 'Lost': return 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/40 dark:border-rose-800 dark:text-rose-400';
            case 'Qualified': return 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/40 dark:border-purple-800 dark:text-purple-400';
            default: return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-400';
        }
    };

    // Calculate item entry position numbers dynamically using database state tracking values
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans overflow-hidden relative transition-colors duration-200">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #334155; }
                .dark input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.6; cursor: pointer; }
                
                select option { background-color: #ffffff; color: #1e293b; }
                .dark select option { background-color: #1e293b; color: #ffffff; }
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

            {/* VIEW SINGLE LEAD DETAILS MODAL */}
            {viewingLead && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative border dark:border-slate-700">
                        <button onClick={() => setViewingLead(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="h-5 w-5" /></button>
                        <div className="flex items-center space-x-4 mb-6 border-b dark:border-slate-700 pb-4">
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 text-[#120085] dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                                {viewingLead.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{viewingLead.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{viewingLead.email}</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400">Current Status:</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColors(viewingLead.status)}`}>{viewingLead.status}</span>
                            </div>
                            <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400">Acquisition Source:</span>
                                <span className="font-medium">{viewingLead.source}</span>
                            </div>
                            <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                                <span className="font-semibold text-gray-500 dark:text-gray-400">Timestamp:</span>
                                <span className="font-medium">{viewingLead.createdAt ? new Date(viewingLead.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button onClick={() => setViewingLead(null)} className="px-5 py-2 bg-[#120085] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-md">Close Details</button>
                        </div>
                    </div>
                </div>
            )}

            {/* UNIFIED ADD/EDIT FORM MODAL */}
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl relative border dark:border-slate-700">
                        <button onClick={() => setIsFormModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="h-5 w-5" /></button>
                        <h3 className="text-xl font-bold mb-4">{editingLeadId ? 'Modify Lead' : 'Register New Lead'}</h3>
                        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                            <input type="text" value={editName} onChange={(e)=>setEditName(e.target.value)} required placeholder="Name" className="w-full p-2.5 border dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none dark:text-white" />
                            <input type="email" value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} required placeholder="Email" className="w-full p-2.5 border dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none dark:text-white" />
                            <input type="text" value={editPhone} onChange={(e)=>setEditPhone(e.target.value)} placeholder="Phone" className="w-full p-2.5 border dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none dark:text-white" />
                            <select value={editStatus} onChange={(e)=>setEditStatus(e.target.value as any)} className="w-full p-2.5 border dark:border-slate-600 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white dark:bg-slate-800">
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select value={editSource} onChange={(e)=>setEditSource(e.target.value as any)} className="w-full p-2.5 border dark:border-slate-600 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white dark:bg-slate-800">
                                {sources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <textarea rows={2} value={editNotes} onChange={(e)=>setEditNotes(e.target.value)} placeholder="Summary notes..." className="w-full p-2.5 border dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm resize-none focus:outline-none dark:text-white" />
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 border dark:border-slate-600 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all dark:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-[#120085] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-md transition-all">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl text-center border dark:border-slate-700 relative">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 mb-4">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Delete Lead?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to permanently delete this lead? This action cannot be undone.</p>
                        <div className="flex space-x-3 justify-center">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all rounded-xl text-sm font-medium dark:text-white">Cancel</button>
                            <button onClick={executeDelete} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white transition-all rounded-xl text-sm font-semibold shadow-md">Yes, Delete</button>
                        </div>
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
                        <button onClick={() => navigate('/dashboard')} className="w-full flex items-center space-x-4 text-white/70 hover:bg-white/5 hover:text-white px-3 py-3 rounded-lg text-sm font-medium transition-all text-left truncate">
                            <LayoutDashboard className="h-5 w-5 shrink-0" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Dashboard Matrix</span>
                        </button>
                        <button onClick={() => navigate('/leads')} className="w-full flex items-center space-x-4 bg-white/10 text-white px-3 py-3 rounded-lg text-sm font-medium transition-all text-left truncate">
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

            {/* MAIN OPERATIONAL SURFACE */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 shadow-sm z-10 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Lead Management Control</h2>
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

                <main className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
                    <div className="w-full mx-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-md overflow-hidden flex flex-col transition-colors duration-200">
                        
                        {/* CONTROLS DECK */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-start gap-3">
                            <button onClick={() => openFormModal()} className="px-4 py-2 bg-[#120085] hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center shadow-sm transition-all">
                                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add New Lead
                            </button>
                            
                            <button onClick={() => setGroupByStatus(!groupByStatus)} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center shadow-sm transition-all ${groupByStatus ? 'bg-purple-600 text-white border-transparent' : 'border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                                <FolderArchive className="h-3.5 w-3.5 mr-1.5" /> Group By Status
                            </button>

                            {/* 🛡️ CSV EXPORT BUTTON */}
                            {isAdmin && (
                                <button onClick={exportToCSV} className="px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold flex items-center shadow-sm transition-all">
                                    <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
                                </button>
                            )}

                            {/* SORT DROPDOWN */}
                            <div className="relative flex items-center ml-auto">
                                <ArrowUpDown className="absolute left-2.5 h-3.5 w-3.5 text-gray-500" />
                                <select 
                                    value={sortOption} 
                                    onChange={(e) => setSortOption(e.target.value)} 
                                    className="pl-8 pr-6 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold shadow-sm focus:outline-none cursor-pointer appearance-none"
                                >
                                    <option value="Newest">Sort: Newest</option>
                                    <option value="Oldest">Sort: Oldest</option>
                                    <option value="A-Z">Sort: A-Z</option>
                                    <option value="Z-A">Sort: Z-A</option>
                                </select>
                            </div>
                            
                            {(searchQuery !== '' || filterStatus !== 'All' || filterSource !== 'All' || filterDate !== '' || sortOption !== 'Newest') && (
                                <button onClick={clearFilters} className="px-4 py-2 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center border border-rose-200 dark:border-rose-800 shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all">
                                    <FilterX className="h-3.5 w-3.5 mr-1.5" /> Clear Filters
                                </button>
                            )}
                        </div>

                        {/* COLUMN HEADERS & FILTERS */}
                        <div className="bg-slate-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 grid grid-cols-12 text-left text-xs font-bold text-gray-600 dark:text-gray-300 select-none">
                            <div className="col-span-3 p-3 border-r border-gray-200 dark:border-slate-600 flex flex-col justify-between gap-3">
                                <span className="uppercase tracking-wider text-gray-500 dark:text-gray-400">Lead Identity</span>
                                <div className="relative w-full">
                                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search names or emails..." 
                                        value={searchQuery} 
                                        onChange={(e) => setSearchQuery(e.target.value)} 
                                        className="w-full pl-7 pr-2 py-1.5 font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-[11px] focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors" 
                                    />
                                </div>
                            </div>
                            <div className="col-span-2 p-3 border-r border-gray-200 dark:border-slate-600 flex flex-col justify-between gap-3">
                                <span className="uppercase tracking-wider text-gray-500 dark:text-gray-400">Source</span>
                                <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="w-full p-1.5 font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-[11px] focus:outline-none cursor-pointer text-gray-900 dark:text-white transition-colors">
                                    <option value="All">All Sources</option>
                                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 p-3 border-r border-gray-200 dark:border-slate-600 flex flex-col justify-between gap-3">
                                <span className="uppercase tracking-wider text-gray-500 dark:text-gray-400">Timestamp</span>
                                <input 
                                    type="date" 
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="w-full p-1.5 font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-[11px] focus:outline-none cursor-pointer text-gray-900 dark:text-white uppercase transition-colors"
                                />
                            </div>
                            <div className="col-span-3 p-3 border-r border-gray-200 dark:border-slate-600 flex flex-col justify-between gap-3">
                                <span className="uppercase tracking-wider text-gray-500 dark:text-gray-400">Pipeline Status</span>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-1.5 font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-[11px] focus:outline-none cursor-pointer text-gray-900 dark:text-white transition-colors">
                                    <option value="All">All Statuses</option>
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 p-3 text-right flex items-center justify-end">
                                <span className="uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-2">Actions</span>
                            </div>
                        </div>

                        {/* GRID MATRIX WITH CUSTOM SCROLLBAR */}
                        <div className="custom-scrollbar divide-y divide-gray-200 dark:divide-slate-700 overflow-y-auto text-xs max-h-[50vh]">
                            {leads.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 font-medium bg-slate-50 dark:bg-slate-800/50">No leads match your criteria.</div>
                            ) : groupByStatus ? (
                                statuses.map(currentStatus => {
                                    const statusLeads = leads.filter(l => l.status === currentStatus);
                                    if (statusLeads.length === 0) return null;

                                    return (
                                        <div key={currentStatus} className="bg-slate-50/40 dark:bg-slate-900/10">
                                            <div className="p-2.5 bg-slate-200/60 dark:bg-slate-700 font-extrabold text-slate-700 dark:text-slate-200 flex items-center space-x-2 border-b border-gray-200 dark:border-slate-600">
                                                <ChevronDown className="h-4 w-4 text-slate-500" />
                                                <span>{currentStatus}</span>
                                                <span className="text-[10px] font-bold bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full">{statusLeads.length}</span>
                                            </div>
                                            
                                            <div className="divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                                {statusLeads.map(lead => (
                                                    <div key={lead._id} className="grid grid-cols-12 items-center p-3 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                                                        <div className="col-span-3 font-semibold text-gray-900 dark:text-white flex flex-col pr-2">
                                                            <span className="text-sm font-bold text-[#120085] dark:text-blue-400 truncate">{lead.name}</span>
                                                            <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{lead.email}</span>
                                                        </div>
                                                        <div className="col-span-2 font-medium text-slate-600 dark:text-slate-300">{lead.source}</div>
                                                        <div className="col-span-2 flex flex-col justify-center">
                                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                                                                {lead.createdAt ? new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-3 pr-4">
                                                            <select 
                                                                value={lead.status} 
                                                                onChange={(e) => handleStatusChange(lead._id, e.target.value)} 
                                                                className={`w-full p-1.5 rounded-xl font-bold border-2 text-[11px] cursor-pointer focus:outline-none transition-all ${getStatusColors(lead.status)}`}
                                                            >
                                                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="col-span-2 text-right space-x-1 flex justify-end">
                                                            <button onClick={() => setViewingLead(lead)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-all" title="View Details"><Eye className="h-3.5 w-3.5" /></button>
                                                            <button onClick={() => openFormModal(lead)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-all"><Edit3 className="h-3.5 w-3.5" /></button>
                                                            {isAdmin && (
                                                                <button onClick={() => triggerDeleteModal(lead._id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                leads.map((lead) => (
                                    <div key={lead._id} className="grid grid-cols-12 items-center p-3 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-all text-gray-900 dark:text-gray-300">
                                        <div className="col-span-3 font-semibold flex flex-col pr-2">
                                            <span className="text-sm font-bold text-[#120085] dark:text-blue-400 truncate">{lead.name}</span>
                                            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5 truncate">{lead.email}</span>
                                        </div>
                                        <div className="col-span-2 font-medium text-slate-600 dark:text-slate-300">{lead.source}</div>
                                        <div className="col-span-2 flex flex-col justify-center">
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                                                {lead.createdAt ? new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <div className="col-span-3 pr-4">
                                            <select 
                                                value={lead.status} 
                                                onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                                className={`w-full p-1.5 rounded-xl font-bold border-2 text-[11px] cursor-pointer focus:outline-none transition-all ${getStatusColors(lead.status)}`}
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2 text-right space-x-1 flex justify-end">
                                            <button onClick={() => setViewingLead(lead)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-all" title="View Details"><Eye className="h-3.5 w-3.5" /></button>
                                            <button onClick={() => openFormModal(lead)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-all"><Edit3 className="h-3.5 w-3.5" /></button>
                                            {isAdmin && (
                                                <button onClick={() => triggerDeleteModal(lead._id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* PAGINATION PANEL */}
                        {!groupByStatus && totalRecords > itemsPerPage && (
                            <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors duration-200">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Showing <span className="font-bold text-gray-800 dark:text-gray-200">{indexOfFirstItem + 1}</span> to{' '}
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(indexOfFirstItem + leads.length, totalRecords)}</span> of{' '}
                                    <span className="font-bold text-[#120085] dark:text-blue-400">{totalRecords}</span> entries
                                </span>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"><ChevronLeft className="h-4 w-4" /></button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                        <button key={num} onClick={() => setCurrentPage(num)} className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${currentPage === num ? 'bg-[#120085] text-white' : 'border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>{num}</button>
                                    ))}
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"><ChevronRight className="h-4 w-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LeadsManagement;