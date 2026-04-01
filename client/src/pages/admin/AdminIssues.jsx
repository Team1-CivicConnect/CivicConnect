import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Filter, FileSpreadsheet, Eye, MessageSquare, AlertTriangle } from 'lucide-react';

export default function AdminIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchIssues();
    }, [page, statusFilter, categoryFilter, searchQuery]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 15
            });
            if (statusFilter) params.append('status', statusFilter);
            if (categoryFilter) params.append('category', categoryFilter);
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

    return (
        <div className="p-8 bg-ub-bg-surface min-h-full">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-ub-text-primary">Master Ticket Pipeline</h1>
                    <p className="text-sm text-ub-text-secondary mt-1">Manage, filter, and export all citizen reports directly.</p>
                </div>
                <button onClick={exportCSV} className="btn-secondary !py-2 flex items-center gap-2 text-sm bg-white hover:bg-gray-50 text-ub-green-dark border-ub-green-medium">
                    <FileSpreadsheet size={16} /> Export to CSV
                </button>
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
                </div>
            </div>

            <div className="bg-white rounded-xl border border-ub-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-ub-bg-surface text-ub-text-muted font-bold uppercase tracking-wider text-xs border-b border-ub-border">
                            <tr>
                                <th className="px-6 py-4">Issue Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">AI Insight</th>
                                <th className="px-6 py-4">Resolution Pipeline</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ub-border">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-ub-text-muted">Fetching datatable...</td></tr>
                            ) : issues.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-12 font-bold text-ub-text-muted">No tickets match your filters.</td></tr>
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
                                        {issue.aiPriorityLevel === 'high' ? (
                                            <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-lg w-max border border-red-100">
                                                <AlertTriangle size={14} /> High
                                            </div>
                                        ) : issue.aiPriorityLevel === 'medium' ? (
                                            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-lg w-max border border-amber-100">
                                                Medium
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-ub-green-medium font-bold text-xs bg-green-50 px-2 py-1 rounded-lg w-max border border-green-100">
                                                Low
                                            </div>
                                        )}
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
        </div>
    );
}
