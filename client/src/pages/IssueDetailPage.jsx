import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { MapPin, Calendar, ThumbsUp, MessageSquare, AlertTriangle, ShieldCheck, Flag, CheckCircle, Download, Users } from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';

const createIcon = (color) => L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

const STATUS_STAGES = ['submitted', 'under_review', 'in_progress', 'resolved'];
const STATUS_LABELS = ['Incident Filed', 'Under Manual Review', 'Field Team Dispatched', 'Anomaly Resolved'];

export default function IssueDetailPage() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [pdfLoading, setPdfLoading] = useState(false);

    // Volunteer state
    const [volunteerStatus, setVolunteerStatus] = useState(null); // null = not signed up
    const [volunteerId, setVolunteerId] = useState(null);
    const [showVolunteerForm, setShowVolunteerForm] = useState(false);
    const [volMessage, setVolMessage] = useState('');
    const [volSkills, setVolSkills] = useState([]);
    const [volSubmitting, setVolSubmitting] = useState(false);
    const [approvedVolunteerCount, setApprovedVolunteerCount] = useState(0);

    // Feedback state
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

    const handleDownloadPdf = async () => {
        setPdfLoading(true);
        try {
            const response = await api.get(`/export/issue/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `issue-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to download PDF');
        } finally {
            setPdfLoading(false);
        }
    };

    useEffect(() => {
        api.get(`/issues/${id}`).then(res => {
            setIssue(res.data.issue);
            setApprovedVolunteerCount((res.data.issue.volunteers || []).length);
        }).catch(() => toast.error('Ticket corrupted')).finally(() => setLoading(false));
        api.get(`/issues/${id}/comments`).then(res => setComments(res.data.comments)).catch(console.error);
    }, [id]);

    // Check if current user already volunteered
    useEffect(() => {
        if (user && issue) {
            api.get('/volunteers/my').then(res => {
                const myVol = res.data.volunteers.find(v => v.issueId?._id === id || v.issueId === id);
                if (myVol) {
                    setVolunteerStatus(myVol.status);
                    setVolunteerId(myVol._id);
                }
            }).catch(() => { });
        }
    }, [user, issue, id]);

    const handleUpvote = async () => {
        if (!user) return toast.error('Node offline. Authenticate to interact.');
        if (user.id === issue.reportedBy._id) return toast.error('Self-voting denied.');
        try {
            const { data } = await api.post(`/issues/${id}/upvote`);
            setIssue(prev => ({ ...prev, upvotes: data.message === 'Upvote added' ? [...prev.upvotes, user.id] : prev.upvotes.filter(u => u !== user.id), upvoteCount: data.upvoteCount }));
        } catch (err) { toast.error(err.response?.data?.message || 'Vote interaction failed'); }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        try {
            const { data } = await api.post(`/issues/${id}/comments`, { text: newComment });
            setComments([...comments, { ...data.comment, author: { _id: user.id, name: user.name, avatar: user.avatar } }]);
            setNewComment('');
        } catch (err) { toast.error('Communication line dropped'); }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (rating < 1) return toast.error('Please select a star rating');
        setFeedbackSubmitting(true);
        try {
            const { data } = await api.post(`/issues/${id}/feedback`, { rating, feedback });
            setIssue(data.issue);
            toast.success('Thank you for your feedback!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-black text-gray-400 tracking-widest uppercase">Fetching Logic...</div>;
    if (!issue) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-black text-red-500 tracking-widest uppercase">Ticket Not Found</div>;

    const currentStageIndex = STATUS_STAGES.indexOf(issue.status);

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content Pane */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Primary Dashboard Card */}
                    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">

                        <div className="bg-gradient-to-r from-gray-900 to-ub-blue-hero px-8 py-5 flex justify-between items-center text-white relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <span className="font-mono bg-white/10 border border-white/20 px-3 py-1 rounded-md text-sm font-bold shadow-inner tracking-widest text-blue-100">{issue.issueId}</span>
                                <span className="font-black uppercase text-[10px] tracking-widest border border-blue-400/30 bg-blue-500/20 px-3 py-1 rounded-full text-blue-100 backdrop-blur-sm">
                                    {issue.category.replace('_', ' ')}
                                </span>
                                {issue.department && issue.department !== 'Other' && (
                                    <span className="font-black uppercase text-[10px] tracking-widest border border-amber-400/30 bg-amber-500/20 px-3 py-1 rounded-full text-amber-100 backdrop-blur-sm">
                                        Routed to: {issue.department}
                                    </span>
                                )}
                                <PriorityBadge priority={issue.priority} />
                            </div>
                        </div>

                        <div className="p-8">
                            <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
                                {issue.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 mb-8 bg-gray-50 border border-gray-100 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm"><Calendar size={14} className="text-gray-400" /> {new Date(issue.createdAt).toLocaleDateString()}</div>
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm"><MapPin size={14} className="text-ub-blue-hero" /> {issue.address?.split(',')[0] || 'Geo-Constraint'}</div>
                                <button
                                    onClick={handleUpvote}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-sm border ${issue.upvotes?.includes(user?.id) ? 'bg-ub-blue-hero border-ub-blue-hero text-white' : 'bg-white border-gray-200 text-ub-blue-hero'}`}
                                >
                                    <ThumbsUp size={14} /> {issue.upvoteCount} Community Endorsements
                                </button>
                                {approvedVolunteerCount > 0 && (
                                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">
                                        <Users size={14} /> 👷 {approvedVolunteerCount} volunteers helping
                                    </div>
                                )}
                            </div>

                            <div className="prose max-w-none text-gray-700 font-medium leading-relaxed mb-8 bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
                                {issue.description}
                            </div>

                            {issue.photos && issue.photos.length > 0 && (
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1 block">Attached Cryptographic Evidence</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {issue.photos.map((p, idx) => (
                                            <a key={idx} href={p.url} target="_blank" rel="noreferrer" className="block aspect-square rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all group relative bg-black">
                                                <img src={p.url} alt="Evidence" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Download PDF Button */}
                            {user && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={pdfLoading}
                                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-md"
                                    >
                                        <Download size={14} />
                                        {pdfLoading ? 'Generating...' : 'Download Report PDF'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Engine */}
                    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                            <div className="w-10 h-10 bg-blue-50 text-ub-blue-hero rounded-xl flex items-center justify-center border border-blue-100"><MessageSquare size={20} /></div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Active Liaison ({comments.length})</h2>
                        </div>

                        <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {comments.length === 0 ? (
                                <div className="text-center font-bold text-gray-300 text-sm py-8 uppercase tracking-widest bg-gray-50 rounded-2xl border border-dashed border-gray-200">No active network traces.</div>
                            ) : (
                                comments.map(c => (
                                    <div key={c._id} className={`flex gap-4 p-5 rounded-2xl transition-all ${c.isAdminComment ? 'bg-blue-50 shadow-sm border border-blue-100' : 'bg-white border border-gray-100 hover:shadow-sm'}`}>
                                        <div className={`w-10 h-10 rounded-full font-black flex items-center justify-center shrink-0 text-white shadow-inner ${c.isAdminComment ? 'bg-gradient-to-br from-gray-900 to-ub-blue-hero' : 'bg-gradient-to-br from-green-400 to-ub-green-dark'}`}>
                                            {c.author?.name ? c.author.name.charAt(0) : '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-1.5">
                                                <span className="font-black text-sm text-gray-900 tracking-tight">{c.author?.name || 'Local Node'}</span>
                                                {c.isAdminComment && <span className="bg-ub-blue-hero text-white text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><ShieldCheck size={10} /> Official Command</span>}
                                                <span className="text-xs text-gray-400 font-bold ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className={`text-sm font-medium leading-relaxed ${c.isAdminComment ? 'text-blue-900' : 'text-gray-600'}`}>{c.text}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {user ? (
                            <form onSubmit={handleCommentSubmit} className="flex gap-3 relative">
                                <input
                                    type="text" placeholder="Transmit message to sector..."
                                    className="flex-1 border-2 border-gray-200 bg-gray-50 rounded-xl pl-5 pr-32 py-4 text-sm font-medium focus:outline-none focus:border-ub-blue-hero focus:bg-white transition-colors shadow-inner"
                                    value={newComment} onChange={e => setNewComment(e.target.value)} maxLength="500"
                                />
                                <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-2 bottom-2 bg-gray-900 hover:bg-black text-white px-6 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-md transition-transform active:scale-95 disabled:opacity-50">Transmit</button>
                            </form>
                        ) : (
                            <div className="text-xs font-black uppercase tracking-widest text-center p-4 bg-gray-100 rounded-xl text-gray-500 border border-gray-200">
                                <Link to="/login" className="text-ub-blue-hero underline decoration-2 underline-offset-2 hover:text-black transition-colors">Authenticate</Link> to broadcast signals.
                            </div>
                        )}
                    </div>

                    {/* Volunteer Section */}
                    {user && user.role !== 'admin' && issue.reportedBy?._id !== user.id && issue.status !== 'resolved' && (
                        <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center border border-pink-100"><Users size={20} /></div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Volunteer to Help</h2>
                            </div>

                            {volunteerStatus ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-gray-600">Your status:</span>
                                        {volunteerStatus === 'pending' && <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full">Pending</span>}
                                        {volunteerStatus === 'approved' && <span className="text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">Approved</span>}
                                        {volunteerStatus === 'rejected' && <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full">Rejected</span>}
                                    </div>
                                    {volunteerStatus === 'pending' && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.delete(`/volunteers/${volunteerId}`);
                                                    setVolunteerStatus(null);
                                                    setVolunteerId(null);
                                                    toast.success('Signup withdrawn');
                                                } catch (err) { toast.error('Failed to withdraw'); }
                                            }}
                                            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Withdraw Signup
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {!showVolunteerForm ? (
                                        <button
                                            onClick={() => setShowVolunteerForm(true)}
                                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md"
                                        >
                                            Sign Up as Volunteer
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <textarea
                                                placeholder="Optional message (why you want to help)..."
                                                className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                                                value={volMessage}
                                                onChange={e => setVolMessage(e.target.value)}
                                                maxLength={300}
                                                rows={3}
                                            />
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Skills (select all that apply)</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Plumbing', 'Electrical', 'Carpentry', 'General Labour', 'Cleaning', 'Other'].map(skill => (
                                                        <label key={skill} className={`cursor-pointer text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${volSkills.includes(skill)
                                                                ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                            }`}>
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only"
                                                                checked={volSkills.includes(skill)}
                                                                onChange={() => setVolSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}
                                                            />
                                                            {skill}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    disabled={volSubmitting}
                                                    onClick={async () => {
                                                        setVolSubmitting(true);
                                                        try {
                                                            const { data } = await api.post(`/issues/${id}/volunteer`, { message: volMessage, skills: volSkills });
                                                            setVolunteerStatus('pending');
                                                            setVolunteerId(data.volunteer._id);
                                                            setShowVolunteerForm(false);
                                                            toast.success('Volunteer signup successful!');
                                                        } catch (err) {
                                                            toast.error(err.response?.data?.message || 'Failed to sign up');
                                                        } finally {
                                                            setVolSubmitting(false);
                                                        }
                                                    }}
                                                    className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-md"
                                                >
                                                    {volSubmitting ? 'Submitting...' : 'Submit'}
                                                </button>
                                                <button
                                                    onClick={() => setShowVolunteerForm(false)}
                                                    className="text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resolution Feedback Section */}
                    {issue.status === 'resolved' && (
                        <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center border border-green-100"><ShieldCheck size={20} /></div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Resolution Quality</h2>
                            </div>

                            {issue.resolutionRating ? (
                                <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span key={star} className={`text-xl ${star <= issue.resolutionRating ? 'grayscale-0' : 'grayscale'}`}>⭐</span>
                                            ))}
                                        </div>
                                        <span className="text-xs font-black text-green-700 uppercase tracking-widest ml-2">Score: {issue.resolutionRating}/5</span>
                                    </div>
                                    {issue.resolutionFeedback && (
                                        <p className="text-sm font-medium text-green-800 italic leading-relaxed">
                                            "{issue.resolutionFeedback}"
                                        </p>
                                    )}
                                    <div className="mt-4 text-[9px] font-black uppercase tracking-widest text-green-600/60">Verified Community Feedback</div>
                                </div>
                            ) : (
                                user && user.id === issue.reportedBy?._id ? (
                                    <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                            <p className="text-sm font-bold text-gray-700 mb-4">How satisfied are you with the resolution of this issue?</p>
                                            <div className="flex gap-4">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        className={`text-3xl transition-transform hover:scale-120 active:scale-95 ${rating >= star ? 'grayscale-0' : 'grayscale opacity-30 hover:opacity-100'}`}
                                                    >
                                                        ⭐
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Additional Feedback (Optional)</label>
                                            <textarea
                                                className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-green-400 focus:bg-white transition-colors shadow-inner"
                                                placeholder="e.g. The cleanup was thorough, thank you!"
                                                rows="3"
                                                value={feedback}
                                                onChange={e => setFeedback(e.target.value)}
                                                maxLength="500"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={feedbackSubmitting || rating === 0}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {feedbackSubmitting ? 'Analyzing...' : 'Submit Resolution Feedback'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Awaiting feedback from the original reporter.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Tracking Logistics Sidebar */}
                <div className="space-y-8">

                    {/* Pipeline Engine visual */}
                    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
                        <h3 className="font-black text-gray-900 text-lg mb-8 tracking-tight flex items-center gap-2">
                            <Flag size={20} className="text-ub-blue-hero" /> Operation Pipeline
                        </h3>
                        <div className="relative pl-3 space-y-8">

                            {/* Track line under the nodes */}
                            <div className="absolute left-[19.5px] top-4 bottom-8 w-0.5 bg-gray-100"></div>

                            {STATUS_STAGES.map((stage, idx) => {
                                const isPassed = currentStageIndex >= idx;
                                const isCurrent = currentStageIndex === idx;
                                const historyNote = issue.statusHistory?.slice().reverse().find(h => h.status === stage);

                                return (
                                    <div key={stage} className={`relative pl-8 transition-opacity duration-500 ${isPassed ? 'opacity-100' : 'opacity-40 grayscale'}`}>

                                        {/* Dynamic Node */}
                                        <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 bg-white z-10 
                                            ${isPassed ? 'border-ub-blue-hero' : 'border-gray-300'} 
                                            ${isCurrent ? 'ring-4 ring-blue-100 shadow-[0_0_15px_rgba(27,63,160,0.4)] animate-pulse border-4 bg-ub-blue-hero' : ''}
                                            ${stage === 'resolved' && isPassed ? 'border-none bg-green-500 text-white flex items-center justify-center scale-125 top-0.5' : ''}
                                        `}>
                                            {stage === 'resolved' && isPassed && <CheckCircle size={16} />}
                                        </div>

                                        <div className={`font-black uppercase tracking-wider text-[10px] mb-1 ${isCurrent ? 'text-ub-blue-hero' : (isPassed ? 'text-gray-900' : 'text-gray-400')}`}>
                                            Step {idx + 1}
                                        </div>
                                        <div className={`font-black text-base leading-none mb-1 text-gray-900`}>
                                            {STATUS_LABELS[idx]}
                                        </div>

                                        {historyNote && (
                                            <div className="text-xs mt-2 bg-gray-50 border border-gray-100 rounded-lg p-3 relative">
                                                <div className="absolute -left-3 top-3 w-3 h-px bg-gray-200"></div>
                                                <div className="font-black text-gray-400 uppercase tracking-widest text-[9px] mb-1">{new Date(historyNote.changedAt).toLocaleString()}</div>
                                                <div className="font-semibold text-gray-700 italic">"{historyNote.note}"</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Node Locator */}
                    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                        <div className="h-48 relative z-0">
                            {issue.location?.coordinates && (
                                <MapContainer center={[issue.location.coordinates[1], issue.location.coordinates[0]]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                    <Marker position={[issue.location.coordinates[1], issue.location.coordinates[0]]} icon={createIcon('#1B3FA0')} />
                                </MapContainer>
                            )}
                            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] pointer-events-none z-10"></div>
                        </div>
                        <div className="bg-white p-5">
                            <h3 className="font-black text-[10px] uppercase text-gray-400 tracking-widest mb-3">Origin Node</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-ub-green-dark text-white font-black flex items-center justify-center text-xl shadow-inner border border-green-500">
                                    {issue.reportedBy?.name ? issue.reportedBy.name.charAt(0) : '?'}
                                </div>
                                <div className="block">
                                    <div className="font-black text-gray-900 border-b border-gray-100 pb-0.5">{issue.reportedBy?.name || 'Anonymous Protocol'}</div>
                                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{issue.reportedBy?.ward || 'Chennai Hub'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
