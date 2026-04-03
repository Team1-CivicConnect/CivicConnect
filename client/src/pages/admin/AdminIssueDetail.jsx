import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { ShieldCheck, MessageSquare, AlertTriangle, RefreshCw, FileText, Bot, Briefcase, UserCheck } from 'lucide-react';

const createIcon = (color) => L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

export default function AdminIssueDetail() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newComment, setNewComment] = useState('');
    const [isInternalNode, setIsInternalNote] = useState(false);

    // Modification states
    const [updateStatus, setUpdateStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [assignDept, setAssignDept] = useState('');

    useEffect(() => {
        fetchIssueData();
    }, [id]);

    const fetchIssueData = async () => {
        try {
            const [issueRes, commentsRes, volRes] = await Promise.all([
                api.get(`/issues/${id}`),
                api.get(`/issues/${id}/comments`),
                api.get(`/issues/${id}/volunteers`).catch(() => ({ data: { volunteers: [] } }))
            ]);
            setIssue(issueRes.data.issue);
            setUpdateStatus(issueRes.data.issue.status);
            setAssignDept(issueRes.data.issue.department || 'Other');
            setComments(commentsRes.data.comments);
            setVolunteers(volRes.data.volunteers || []);
        } catch (err) {
            toast.error('Failed to load deep dive ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChangeSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.patch(`/admin/issues/${id}/status`, {
                status: updateStatus,
                note: statusNote || `Status changed to ${updateStatus}`
            });
            setIssue(data.issue);
            setStatusNote('');
            toast.success('Status formally escalated');
        } catch (err) {
            toast.error('Failed to change status timeline');
        }
    };

    const handleAssignDepartment = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.patch(`/admin/issues/${id}/assign`, { department: assignDept });
            setIssue(prev => ({ ...prev, department: data.issue.department }));
            toast.success(`Routed to ${assignDept}`);
        } catch (err) {
            toast.error('Failed to assign department');
        }
    };

    const handleVolunteerReview = async (volId, action) => {
        try {
            const { data } = await api.patch(`/volunteers/${volId}`, { status: action });
            setVolunteers(prev => prev.map(v => v._id === volId ? { ...v, status: action } : v));
            toast.success(`Volunteer successfully ${action}`);
        } catch (err) {
            toast.error(`Failed to ${action} volunteer`);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        try {
            const { data } = await api.post(`/issues/${id}/comments`, {
                text: newComment,
                isInternalOnly: isInternalNode
            });
            // The backend will echo the saved comment
            setComments([...comments, { ...data.comment, author: { _id: user.id, name: user.name } }]);
            setNewComment('');
            setIsInternalNote(false);
            toast.success(isInternalNode ? 'Internal Note Logged' : 'Public Comment Posted');
        } catch (err) {
            toast.error('Failed to thread communication');
        }
    };

    if (loading) return <div className="p-12 text-center text-ub-text-muted">Analyzing Ticket Graph...</div>;
    if (!issue) return <div className="p-12 text-center text-red-500 font-bold">Ticket Registry Error.</div>;

    return (
        <div className="p-8 bg-ub-bg-surface min-h-full">
            <div className="flex gap-2 text-xs font-bold text-ub-text-muted uppercase tracking-widest mb-4">
                <Link to="/admin/issues" className="hover:text-ub-blue-hero">Pipeline</Link>
                <span>/</span>
                <span>Ticket {issue.issueId}</span>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Workspace (Left) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Core Ticket Info */}
                    <div className="ub-card !p-0 overflow-hidden border-2 border-ub-border shadow-sm">
                        <div className="bg-ub-blue-hero px-6 py-3 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                <FileText size={16} /> Incident Briefing
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <h1 className="text-2xl font-black text-ub-text-primary mb-2">
                                {issue.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-ub-text-secondary mb-6 pb-6 border-b border-ub-border">
                                <span className="font-mono bg-blue-50 text-ub-blue-hero font-bold px-2 py-0.5 rounded">{issue.issueId}</span>
                                <span className="bg-gray-100 text-ub-text-primary px-2 font-bold uppercase text-[10px] tracking-widest py-1 border border-gray-200 rounded">{issue.category.replace('_', ' ')}</span>
                                <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 font-bold uppercase text-[10px] tracking-widest py-1 rounded">Dept: {issue.department || 'Unassigned'}</span>
                                <span className="text-xs font-semibold">{new Date(issue.createdAt).toLocaleString()}</span>
                            </div>

                            <div className="prose max-w-none text-ub-text-primary mb-8 leading-relaxed font-medium">
                                {issue.description}
                            </div>

                            {issue.photos && issue.photos.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                    {issue.photos.map((p, idx) => (
                                        <a key={idx} href={p.url} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-ub-border hover:shadow-md transition-shadow">
                                            <img src={p.url} alt="Evidence" className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Resolution Critique (Feedback Loop) */}
                            {issue.resolutionRating && (
                                <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-ub-green-medium mb-4 flex items-center gap-2">
                                        <ShieldCheck size={16} /> Citizen Resolution Critique
                                    </h3>
                                    <div className="bg-ub-green-medium/5 border-2 border-ub-green-medium/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} className={`text-lg ${star <= issue.resolutionRating ? 'grayscale-0' : 'grayscale opacity-20'}`}>⭐</span>
                                                ))}
                                            </div>
                                            <span className="text-xs font-black text-ub-green-dark ml-2">SCORE: {issue.resolutionRating}/5</span>
                                        </div>
                                        {issue.resolutionFeedback && (
                                            <p className="text-sm font-bold text-ub-green-dark italic leading-relaxed">
                                                "{issue.resolutionFeedback}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Claude Engine Intelligence Block */}
                    <div className="ub-card !px-6 !py-5 bg-gradient-to-r from-purple-50 to-white border border-purple-100">
                        <h2 className="text-sm font-black flex items-center gap-2 mb-3 text-purple-900 uppercase tracking-widest"><Bot size={18} /> DeepVerify Intelligence</h2>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-32 shrink-0">
                                <div className="text-[10px] uppercase font-bold text-purple-600 tracking-wider mb-1">Priority Matrix</div>
                                <div className={`text-xl font-black ${issue.aiPriorityLevel === 'high' ? 'text-red-600' : 'text-purple-700'}`}>
                                    {issue.aiPriorityLevel ? issue.aiPriorityLevel.toUpperCase() : 'NORMAL'}
                                </div>
                                {issue.aiPriorityScore && <div className="text-xs font-bold text-purple-500 mt-1">Score: {issue.aiPriorityScore}/100</div>}
                            </div>
                            <div className="w-px bg-purple-200 hidden md:block"></div>
                            <div className="flex-1">
                                <div className="text-[10px] uppercase font-bold text-purple-600 tracking-wider mb-1">Algorithmic Reasoning</div>
                                <p className="text-sm text-purple-900 italic font-medium leading-relaxed">
                                    "{issue.aiReasoning || 'The AI categorization engine processed this report but provided no specific anomalous reasoning string.'}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Messaging Thread */}
                    <div className="ub-card !p-0 overflow-hidden border border-gray-200 shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2"><MessageSquare size={18} className="text-ub-blue-hero" /> Citizen Liaison & Internal Notes</h2>
                        </div>

                        <div className="p-6 max-h-[400px] overflow-y-auto bg-gray-50/50 space-y-4">
                            {comments.length === 0 ? (
                                <div className="text-center text-ub-text-muted text-sm py-4 italic font-bold">No communications logged on this ticket.</div>
                            ) : (
                                comments.map(c => (
                                    <div key={c._id} className={`flex gap-3 p-4 rounded-xl border ${c.isInternalOnly ? 'bg-amber-50 border-amber-200' : c.isAdminComment ? 'bg-white border-blue-100 shadow-sm' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <div className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center shrink-0 ${c.isAdminComment ? 'bg-ub-blue-hero' : 'bg-ub-green-medium'}`}>
                                            {c.author?.name ? c.author.name.charAt(0) : '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-bold text-sm text-ub-text-primary">{c.author?.name || 'Unknown'}</span>
                                                {c.isAdminComment && <span className="bg-ub-blue-hero text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><ShieldCheck size={10} /> Support Unit</span>}
                                                {c.isInternalOnly && <span className="bg-amber-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><AlertTriangle size={10} /> Internal Trace</span>}
                                                <span className="text-xs text-ub-text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className={`text-sm ${c.isInternalOnly ? 'text-amber-900 font-medium italic' : 'text-ub-text-secondary'}`}>{c.text}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-white">
                            <form onSubmit={handleCommentSubmit} className="space-y-3">
                                <textarea
                                    placeholder="Type an official reply to the citizen or an internal note..."
                                    className="w-full border-2 border-ub-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-ub-blue-hero resize-none"
                                    rows="3"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    maxLength="1000"
                                />
                                <div className="flex justify-between items-center">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200 hover:bg-amber-100 transition-colors">
                                        <input type="checkbox" className="form-checkbox text-amber-500 rounded" checked={isInternalNode} onChange={e => setIsInternalNote(e.target.checked)} />
                                        Hide from Citizen (Internal Log)
                                    </label>
                                    <button type="submit" disabled={!newComment.trim()} className="btn-primary flex items-center gap-2 !px-6 !py-2.5">
                                        Dispatch Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>

                {/* Right Admin Tools Sidebar */}
                <div className="space-y-6">

                    {/* Action Modifier Widget */}
                    <div className="ub-card !p-5 border-2 border-amber-400 shadow-sm relative overflow-hidden mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider text-amber-700 mb-4 flex items-center gap-2">
                            <Briefcase size={16} /> Route to Department
                        </h3>
                        <form onSubmit={handleAssignDepartment}>
                            <div className="mb-4">
                                <select
                                    value={assignDept} onChange={(e) => setAssignDept(e.target.value)}
                                    className="w-full border-2 border-ub-border rounded-lg px-3 py-2 text-sm font-extrabold focus:outline-none focus:border-amber-400 transition-colors bg-gray-50 uppercase tracking-widest"
                                >
                                    {['Roads & Highways', 'Sanitation', 'Water Board', 'Electricity Board', 'Parks & Rec', 'Police', 'Admin Core', 'Other'].map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full btn-primary !bg-amber-500 hover:!bg-amber-600 flex justify-center !py-2.5 !text-sm text-white">
                                Route Internal Transfer
                            </button>
                        </form>
                    </div>

                    <div className="ub-card !p-5 border-2 border-ub-green-medium shadow-sm relative overflow-hidden">
                        <h3 className="font-black text-sm uppercase tracking-wider text-ub-green-dark mb-4 flex items-center gap-2">
                            <RefreshCw size={16} /> Override Ticket Status
                        </h3>
                        <form onSubmit={handleStatusChangeSubmit}>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-ub-text-secondary mb-1.5 uppercase tracking-wide">Advance Stage To:</label>
                                <select
                                    value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}
                                    className="w-full border-2 border-ub-border rounded-lg px-3 py-2 text-sm font-extrabold focus:outline-none focus:border-ub-green-medium transition-colors cursor-pointer bg-gray-50 uppercase tracking-widest"
                                >
                                    <option value="submitted">1. Submitted</option>
                                    <option value="under_review">2. Under Review</option>
                                    <option value="in_progress">3. Defect In Progress</option>
                                    <option value="resolved">4. Resolved Successfully</option>
                                    <option value="rejected">X. Reject Ticket</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-ub-text-secondary mb-1.5 uppercase tracking-wide">System Trace Note:</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dispatched to Zone 3 Team"
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    className="w-full border border-ub-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ub-green-medium"
                                />
                            </div>
                            <button type="submit" className="w-full btn-primary !py-2.5 !bg-ub-green-dark hover:!bg-black flex justify-center !text-sm">
                                Commit State Override
                            </button>
                        </form>
                    </div>

                    {/* Forensic Map View */}
                    <div className="ub-card !p-0 overflow-hidden h-64 border-2 border-ub-border relative">
                        <div className="absolute top-2 left-2 z-[400] bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border border-gray-300 rounded shadow-sm text-ub-blue-hero">
                            Target Coordinate
                        </div>
                        {issue.location?.coordinates && (
                            <MapContainer center={[issue.location.coordinates[1], issue.location.coordinates[0]]} zoom={16} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[issue.location.coordinates[1], issue.location.coordinates[0]]} icon={createIcon('#EF4444')} />
                            </MapContainer>
                        )}
                    </div>

                    {/* Actor Profile */}
                    <div className="ub-card !p-5 shadow-sm border border-ub-border mb-6">
                        <h3 className="font-bold text-[10px] uppercase text-ub-text-muted tracking-widest mb-4">Actor Profile</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded shadow-sm bg-gray-100 border border-gray-200 text-ub-blue-hero font-black flex items-center justify-center text-lg">
                                {issue.reportedBy?.name ? issue.reportedBy.name.charAt(0) : '?'}
                            </div>
                            <div>
                                <div className="font-black text-sm text-ub-text-primary capitalize">{issue.reportedBy?.name || 'Anonymous Citizen'}</div>
                                <div className="text-xs font-semibold text-ub-text-secondary">{issue.reportedBy?.ward || 'Chennai Node'} User</div>
                            </div>
                        </div>
                        {issue.reportedBy?.contributionScore !== undefined && (
                            <div className="mt-4 pt-4 border-t border-ub-border flex justify-between items-center text-sm">
                                <span className="font-semibold text-ub-text-muted text-xs">Citizen Score</span>
                                <span className="font-black text-ub-green-dark">{issue.reportedBy.contributionScore} pts</span>
                            </div>
                        )}
                    </div>

                    {/* Volunteer Force Management */}
                    <div className="ub-card !p-0 shadow-sm border border-ub-border overflow-hidden">
                        <div className="bg-pink-50 border-b border-pink-100 px-5 py-3 flex items-center gap-2">
                            <UserCheck size={16} className="text-pink-600" />
                            <h3 className="font-black text-[10px] uppercase text-pink-700 tracking-widest">Active Volunteering</h3>
                        </div>
                        <div className="p-5 max-h-[300px] overflow-y-auto">
                            {volunteers.length === 0 ? (
                                <p className="text-xs text-gray-400 font-bold italic text-center">No community assets deployed</p>
                            ) : (
                                <div className="space-y-4">
                                    {volunteers.map(vol => (
                                        <div key={vol._id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-sm">{vol.userId?.name || 'Asset'}</span>
                                                <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${vol.status === 'approved' ? 'bg-green-100 text-green-700' : vol.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{vol.status}</span>
                                            </div>
                                            <div className="text-xs text-gray-600 mb-2">{vol.message || "No comms provided."}</div>
                                            {vol.skills && vol.skills.length > 0 && <div className="flex flex-wrap gap-1 mb-3">{vol.skills.map(s => <span key={s} className="bg-white border border-gray-200 text-[9px] font-bold text-gray-500 px-1 rounded">{s}</span>)}</div>}
                                            {vol.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleVolunteerReview(vol._id, 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white text-[10px] uppercase font-bold py-1.5 rounded transition">Approve</button>
                                                    <button onClick={() => handleVolunteerReview(vol._id, 'rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] uppercase font-bold py-1.5 rounded transition">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
