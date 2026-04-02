import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Filter, FileSpreadsheet, Eye, MessageSquare, AlertTriangle, Download, Users, X, Check, XCircle } from 'lucide-react';

export default function AdminIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchIssues();
    }, [page, statusFilter, categoryFilter, priorityFilter, searchQuery]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 15
            });
            if (statusFilter) params.append('status', statusFilter);
            if (categoryFilter) params.append('category', categoryFilter);
            if (priorityFilter) params.append('priority', priorityFilter);
            // Backend might not support generic search purely natively without Atlas Search,
            // but if the route supports it, we pass it:
            if (searchQuery) params.append('search', searchQuery);

            const { data } = await api.get(`/admin/issues?${params.toString()}`);
            setIssues(data.issues);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error('Failed to load issues table');
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityUpdate = async (id, newPriority) => {
        try {
            const { data } = await api.patch(`/issues/${id}/priority`, { priority: newPriority });
            setIssues(issues.map(i => i._id === id ? { ...i, priority: newPriority, priorityOverride: true } : i));
            toast.success('Priority updated successfully');
        } catch (err) {
            toast.error('Failed to update priority');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const { data } = await api.patch(`/admin/issues/${id}/status`, { status: newStatus });
            setIssues(issues.map(i => i._id === id ? data.issue : i));
            toast.success('Status updated successfully');
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const exportCSV = () => {
        try {
            const headers = ['Issue ID', 'Title', 'Category', 'Status', 'Reported Date', 'AI Priority', 'Upvotes'];
            const rows = issues.map(i => [
                i.issueId,
                `"${i.title.replace(/"/g, '""')}"`,
                i.category,
                i.status,
                new Date(i.createdAt).toLocaleDateString(),
                i.aiPriorityLevel || 'Normal',
                i.upvoteCount
            ]);

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `ubayog-civic-export-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (err) {
            toast.error('CSV Export failed');
        }
    };

    // PDF Export
    const [pdfLoading, setPdfLoading] = useState(false);
    const exportPDF = async () => {
        setPdfLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (categoryFilter) params.append('category', categoryFilter);
            if (priorityFilter) params.append('priority', priorityFilter);
            const response = await api.get(`/export/issues/pdf?${params.toString()}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'civicconnect-issues-export.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('PDF Export failed');
        } finally {
            setPdfLoading(false);
        }
    };

    // Volunteer modal state
    const [volModal, setVolModal] = useState(null); // issueId
    const [volList, setVolList] = useState([]);
    const [volLoading, setVolLoading] = useState(false);

    const openVolunteersModal = async (issueId) => {
        setVolModal(issueId);
        setVolLoading(true);
        try {
            const { data } = await api.get(`/issues/${issueId}/volunteers`);
            setVolList(data.volunteers);
        } catch (err) {
            toast.error('Failed to load volunteers');
        } finally {
            setVolLoading(false);
        }
    };

    const handleVolunteerAction = async (volunteerId, status, adminNote = '') => {
        try {
            await api.patch(`/volunteers/${volunteerId}`, { status, adminNote });
            setVolList(volList.map(v => v._id === volunteerId ? { ...v, status } : v));
            toast.success(`Volunteer ${status}`);
        } catch (err) {
            toast.error('Action failed');
        }
    };

    return (
        <div className="p-8 bg-ub-bg-surface min-h-full">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-ub-text-primary">Master Ticket Pipeline</h1>
                    <p className="text-sm text-ub-text-secondary mt-1">Manage, filter, and export all citizen reports directly.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportCSV} className="btn-secondary !py-2 flex items-center gap-2 text-sm bg-white hover:bg-gray-50 text-ub-green-dark border-ub-green-medium">
                        <FileSpreadsheet size={16} /> Export CSV
                    </button>
                    <button onClick={exportPDF} disabled={pdfLoading} className="btn-secondary !py-2 flex items-center gap-2 text-sm bg-white hover:bg-gray-50 text-red-700 border-red-300 disabled:opacity-50">
                        <Download size={16} /> {pdfLoading ? 'Generating...' : 'Export PDF'}
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-ub-border shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ub-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search ticket Title or ID..."
                        className="w-full pl-10 pr-4 py-2 border border-ub-border rounded-lg text-sm focus:outline-none focus:border-ub-blue-hero"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-ub-text-muted" size={16} />
                        <select
                            className="pl-9 pr-8 py-2 border border-ub-border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:border-ub-blue-hero"
                            value={categoryFilter}
                            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Categories</option>
                            <option value="pothole">Potholes</option>
                            <option value="street_light">Street Lights</option>
                            <option value="garbage">Garbage / Waste</option>
                            <option value="water_leak">Water Leaks</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-ub-text-muted" size={16} />
                        <select
                            className="pl-9 pr-8 py-2 border border-ub-border rounded-lg text-sm appearance-none bg-white font-bold focus:outline-none focus:border-ub-blue-hero"
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Statuses</option>
                            <option value="submitted">Pending Action</option>
                            <option value="under_review">Under Review</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-ub-text-muted" size={16} />
                        <select
                            className="pl-9 pr-8 py-2 border border-ub-border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:border-ub-blue-hero"
                            value={priorityFilter}
                            onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-ub-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-ub-bg-surface text-ub-text-muted font-bold uppercase tracking-wider text-xs border-b border-ub-border">
                            <tr>
                                <th className="px-6 py-4">Issue Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Priority (Score)</th>
                                <th className="px-6 py-4">Resolution Pipeline</th>
                                <th className="px-6 py-4 text-center">Volunteers</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ub-border">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-12 text-ub-text-muted">Fetching datatable...</td></tr>
                            ) : issues.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-12 font-bold text-ub-text-muted">No tickets match your filters.</td></tr>
                            ) : issues.map(issue => (
                                <tr key={issue._id} className="hover:bg-ub-bg-surface transition-colors cursor-default">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {issue.photos?.[0] ? (
                                                <img src={issue.photos[0].url} className="w-10 h-10 rounded border object-cover shrink-0" alt="thumb" />
                                            ) : (
                                                <div className="w-10 h-10 rounded border bg-gray-50 flex items-center justify-center shrink-0 text-[10px] text-gray-400">N/A</div>
                                            )}
                                            <div>
                                                <div className="font-mono text-[10px] text-ub-blue-hero font-bold tracking-widest">{issue.issueId}</div>
                                                <div className="font-bold text-ub-text-primary text-sm max-w-[200px] truncate" title={issue.title}>{issue.title}</div>
                                                <div className="text-[10px] text-ub-text-muted mt-0.5">{new Date(issue.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold uppercase tracking-wider text-[10px] bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                            {issue.category.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            {/* Priority Badge */}
                                            {issue.priority === 'critical' ? (
                                                <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-lg w-max border border-red-100">
                                                    <AlertTriangle size={14} /> Critical
                                                </div>
                                            ) : issue.priority === 'high' ? (
                                                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-lg w-max border border-amber-100">
                                                    High
                                                </div>
                                            ) : issue.priority === 'medium' ? (
                                                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-lg w-max border border-blue-100">
                                                    Medium
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-gray-600 font-bold text-xs bg-gray-50 px-2 py-1 rounded-lg w-max border border-gray-100">
                                                    Low
                                                </div>
                                            )}
                                            {/* Priority Dropdown */}
                                            <select
                                                value={issue.priority || 'medium'}
                                                onChange={(e) => handlePriorityUpdate(issue._id, e.target.value)}
                                                className="text-xs border border-ub-border rounded p-1 outline-none mt-1 w-max cursor-pointer"
                                            >
                                                <option value="low">Set Low</option>
                                                <option value="medium">Set Medium</option>
                                                <option value="high">Set High</option>
                                                <option value="critical">Set Critical</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={issue.status}
                                            onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                                            className={`text-xs font-extrabold uppercase tracking-widest rounded-lg px-4 py-2 border-2 outline-none cursor-pointer transition-colors
                        ${issue.status === 'resolved' ? 'border-ub-green-medium text-ub-green-dark bg-ub-green-mint' : ''}
                        ${issue.status === 'submitted' ? 'border-red-400 text-red-700 bg-red-50' : ''}
                        ${issue.status === 'under_review' || issue.status === 'in_progress' ? 'border-amber-400 text-amber-700 bg-amber-50' : ''}
                        ${issue.status === 'rejected' ? 'border-gray-400 text-gray-700 bg-gray-100' : ''}
                      `}
                                        >
                                            <option value="submitted">Submitted</option>
                                            <option value="under_review">Under Review</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => openVolunteersModal(issue._id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                                        >
                                            <Users size={14} />
                                            {(issue.volunteers || []).length || 0}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            <Link to={`/admin/issue/${issue._id}`} className="text-ub-text-muted hover:text-ub-blue-hero transition-colors" title="Deep Dive">
                                                <Eye size={18} />
                                            </Link>
                                            <Link to={`/admin/issue/${issue._id}`} className="text-ub-text-muted hover:text-ub-green-medium transition-colors" title="Message Citizen">
                                                <MessageSquare size={18} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Basic Pagination Strip */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-ub-border bg-gray-50">
                        <button
                            disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            className="text-xs font-bold text-ub-text-secondary disabled:opacity-50 hover:text-ub-blue-hero"
                        >
                            ← Previous Page
                        </button>
                        <div className="text-xs font-semibold text-ub-text-muted">Page {page} of {totalPages}</div>
                        <button
                            disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                            className="text-xs font-bold text-ub-text-secondary disabled:opacity-50 hover:text-ub-blue-hero"
                        >
                            Next Page →
                        </button>
                    </div>
                )}
            </div>

            {/* Volunteers Modal */}
            {volModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setVolModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-black text-gray-900 text-lg">Issue Volunteers</h3>
                            <button onClick={() => setVolModal(null)} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {volLoading ? (
                                <div className="text-center text-gray-400 font-bold py-8">Loading...</div>
                            ) : volList.length === 0 ? (
                                <div className="text-center text-gray-400 font-bold py-8">No volunteers yet.</div>
                            ) : (
                                <div className="space-y-4">
                                    {volList.map(v => (
                                        <div key={v._id} className="border border-gray-200 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{v.userId?.name || 'Unknown'}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold">{v.userId?.email}</div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                                    v.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    v.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                }`}>{v.status}</span>
                                            </div>
                                            {v.skills && v.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {v.skills.map(s => (
                                                        <span key={s} className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded">{s}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {v.message && <div className="text-xs text-gray-600 mb-2 italic">"{v.message}"</div>}
                                            <div className="text-[10px] text-gray-400 font-bold mb-3">Signed up: {new Date(v.signedUpAt).toLocaleDateString()}</div>
                                            {v.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleVolunteerAction(v._id, 'approved')}
                                                        className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleVolunteerAction(v._id, 'rejected')}
                                                        className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
