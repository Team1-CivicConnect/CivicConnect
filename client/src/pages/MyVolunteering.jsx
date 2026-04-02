import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Trash2, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusBadge = (status) => {
    if (status === 'approved') return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full"><CheckCircle size={12} /> Approved</span>;
    if (status === 'rejected') return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full"><XCircle size={12} /> Rejected</span>;
    return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full"><Clock size={12} /> Pending</span>;
};

const issueStatusBadge = (status) => {
    const colors = {
        resolved: 'bg-green-50 text-green-700 border-green-200',
        submitted: 'bg-red-50 text-red-700 border-red-200',
        under_review: 'bg-amber-50 text-amber-700 border-amber-200',
        in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{(status || '').replace('_', ' ')}</span>;
};

export default function MyVolunteering() {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyVolunteering();
    }, []);

    const fetchMyVolunteering = async () => {
        try {
            const { data } = await api.get('/volunteers/my');
            setVolunteers(data.volunteers);
        } catch (err) {
            toast.error('Failed to load your volunteering data');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (volunteerId) => {
        try {
            await api.delete(`/volunteers/${volunteerId}`);
            setVolunteers(volunteers.filter(v => v._id !== volunteerId));
            toast.success('Volunteer signup withdrawn');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to withdraw');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-black text-gray-400 tracking-widest uppercase">Loading...</div>;

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Volunteering</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Issues you've signed up to help resolve.</p>
                    </div>
                    <Link to="/profile" className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-lg transition-colors">
                        ← Back to Profile
                    </Link>
                </div>

                {volunteers.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                        <div className="text-4xl mb-3">🤝</div>
                        <p className="font-bold text-gray-400 text-sm">You haven't volunteered for any issues yet.</p>
                        <Link to="/map" className="mt-4 inline-block bg-gray-900 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-black transition-colors">
                            Browse Issues
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {volunteers.map(v => (
                            <div key={v._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {v.issueId ? (
                                                <Link to={`/issue/${v.issueId._id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors truncate flex items-center gap-1.5">
                                                    {v.issueId.title || 'Issue'}
                                                    <ExternalLink size={12} className="shrink-0 text-gray-400" />
                                                </Link>
                                            ) : (
                                                <span className="font-bold text-gray-400">Issue deleted</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {v.issueId && issueStatusBadge(v.issueId.status)}
                                            {statusBadge(v.status)}
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Signed up {new Date(v.signedUpAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {v.skills && v.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {v.skills.map(s => (
                                                    <span key={s} className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="shrink-0">
                                        {v.status === 'pending' && (
                                            <button
                                                onClick={() => handleWithdraw(v._id)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} /> Withdraw
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
