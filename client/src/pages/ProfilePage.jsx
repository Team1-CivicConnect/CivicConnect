import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    User, Award, CheckCircle, Clock, MapPin, Settings,
    LogOut, X, Save, Lock, Eye, EyeOff, Phone,
    ChevronRight, Camera, Calendar, FileText,
    AlertCircle, CheckCheck, Loader
} from 'lucide-react';

const TIER_CONFIG = {
    bronze: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', label: 'Bronze', emoji: '🥉', next: 75 },
    silver: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-300', label: 'Silver', emoji: '🥈', next: 200 },
    gold: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300', label: 'Gold', emoji: '🥇', next: 500 },
    platinum: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300', label: 'Platinum', emoji: '💎', next: null },
};

const getActivityIcon = (status) => {
    switch (status) {
        case 'resolved': return <CheckCheck size={14} className="text-green-600" />;
        case 'in_progress': return <Loader size={14} className="text-blue-600" />;
        case 'under_review': return <AlertCircle size={14} className="text-amber-600" />;
        default: return <FileText size={14} className="text-gray-500" />;
    }
};

const getActivityLabel = (status) => {
    switch (status) {
        case 'resolved': return 'Issue resolved';
        case 'in_progress': return 'Work in progress';
        case 'under_review': return 'Under review';
        default: return 'Issue reported';
    }
};

const getActivityColor = (status) => {
    switch (status) {
        case 'resolved': return 'bg-green-50 border-green-200';
        case 'in_progress': return 'bg-blue-50 border-blue-200';
        case 'under_review': return 'bg-amber-50 border-amber-200';
        default: return 'bg-gray-50 border-gray-200';
    }
};

// ── Avatar Upload ─────────────────────────────────────────────────────────────
function AvatarUpload({ user, onUpdate }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error('Image must be less than 2MB'); return; }
        setUploading(true);
        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const { data } = await api.put('/auth/profile', { avatar: base64 });
            onUpdate(data.user);
            toast.success('Profile picture updated!');
        } catch (err) {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative inline-block">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg shadow-blue-200">
                {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ub-blue-hero to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                )}
            </div>
            <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-7 h-7 bg-ub-blue-hero hover:bg-black text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-70"
            >
                {uploading
                    ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    : <Camera size={12} />
                }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
    );
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }) {
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', ward: user?.ward || '', area: user?.area || '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/auth/profile', form);
            toast.success('Profile updated!');
            onSave(data.user);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { id: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Your name' },
        { id: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: '9876543210' },
        { id: 'ward', label: 'Ward', type: 'text', icon: MapPin, placeholder: 'Ward 12' },
        { id: 'area', label: 'Area / Locality', type: 'text', icon: MapPin, placeholder: 'Kondapur' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-gray-900">Edit Profile</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map(({ id, label, type, icon: Icon, placeholder }) => (
                        <div key={id} className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</label>
                            <div className="relative">
                                <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={type} value={form[id]} onChange={e => setForm({ ...form, [id]: e.target.value })} placeholder={placeholder}
                                    className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-ub-blue-hero transition-colors" />
                            </div>
                        </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-ub-blue-hero text-white text-sm font-bold hover:bg-black transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={14} /> Save</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
        if (form.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
            toast.success('Password changed!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-gray-900">Change Password</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { id: 'currentPassword', label: 'Current Password', showKey: 'current' },
                        { id: 'newPassword', label: 'New Password', showKey: 'new' },
                        { id: 'confirmPassword', label: 'Confirm Password', showKey: 'confirm' },
                    ].map(({ id, label, showKey }) => (
                        <div key={id} className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={show[showKey] ? 'text' : 'password'} value={form[id]} onChange={e => setForm({ ...form, [id]: e.target.value })} placeholder="••••••••" required
                                    className="w-full pl-9 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-ub-blue-hero transition-colors" />
                                <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-ub-blue-hero text-white text-sm font-bold hover:bg-black disabled:opacity-70 flex items-center justify-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Activity Timeline ─────────────────────────────────────────────────────────
function ActivityTimeline({ issues }) {
    if (issues.length === 0) return (
        <div className="text-center py-8 text-ub-text-muted">
            <Clock size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No activity yet</p>
        </div>
    );

    const sorted = [...issues].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 8);

    return (
        <div className="space-y-3">
            {sorted.map((issue, idx) => (
                <Link to={`/issue/${issue._id}`} key={issue._id}>
                    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${getActivityColor(issue.status)}`}>
                        <div className="flex flex-col items-center shrink-0 mt-0.5">
                            <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                                {getActivityIcon(issue.status)}
                            </div>
                            {idx < sorted.length - 1 && <div className="w-px h-4 bg-gray-200 mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-700 truncate">{issue.title}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                                {getActivityLabel(issue.status)} · {new Date(issue.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 shrink-0 mt-1" />
                    </div>
                </Link>
            ))}
        </div>
    );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { user, logout, updateUser } = useContext(AuthContext);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reports');
    const [stats, setStats] = useState({ reported: 0, resolved: 0, score: 0, tier: 'bronze' });
    const [showEdit, setShowEdit] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchMyData(); }, []);

    const fetchMyData = async () => {
        try {
            const { data } = await api.get('/issues/my');
            setIssues(data.issues || []);
            setStats({
                reported: data.issues?.length || 0,
                resolved: data.issues?.filter(i => i.status === 'resolved').length || 0,
                score: user?.contributionScore || 0,
                tier: user?.reputationTier || 'bronze',
            });
        } catch (err) {
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out!');
        navigate('/login');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
            case 'submitted': return 'bg-red-50 text-red-700 border-red-200';
            case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : 'Recently';

    const tier = TIER_CONFIG[stats.tier] || TIER_CONFIG.bronze;

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-ub-blue-hero/20 border-t-ub-blue-hero rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="bg-ub-bg-surface min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
            {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} onSave={updateUser} />}
            {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Card */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="ub-card text-center !pt-8 !pb-6 border-t-4 border-ub-blue-hero">

                        {/* Feature 1: Avatar Upload */}
                        <div className="mb-4 flex justify-center">
                            <AvatarUpload user={user} onUpdate={updateUser} />
                        </div>

                        <h2 className="text-xl font-extrabold text-ub-text-primary mb-1">{user?.name}</h2>
                        <p className="text-sm text-ub-text-secondary mb-1">{user?.email}</p>
                        {user?.phone && <p className="text-sm text-ub-text-secondary mb-2">{user?.phone}</p>}
                        <div className="text-sm text-ub-text-secondary flex items-center justify-center gap-1.5 mb-2">
                            <MapPin size={14} /> {user?.ward || 'Ward'}, {user?.area || 'Area'}
                        </div>

                        {/* Feature 3: Member Since */}
                        <div className="flex items-center justify-center gap-1.5 text-xs text-ub-text-muted mb-4">
                            <Calendar size={12} />
                            <span>Member since <strong>{memberSince}</strong></span>
                        </div>

                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mb-4 ${tier.bg} ${tier.border} ${tier.color}`}>
                            {tier.emoji} {tier.label} Member
                        </div>

                        <div className="flex flex-col gap-2 px-2">
                            <button onClick={() => setShowEdit(true)} className="text-xs font-bold text-ub-text-secondary bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                                <Settings size={14} /> Edit Profile
                            </button>
                            <button onClick={() => setShowPassword(true)} className="text-xs font-bold text-ub-blue-hero bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                                <Lock size={14} /> Change Password
                            </button>
                            <button onClick={handleLogout} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>

                    {/* Score Card */}
                    <div className="ub-card !p-5 bg-gradient-to-br from-ub-green-medium to-green-700 text-white border-none text-center">
                        <Award size={36} className="mx-auto text-yellow-300 mb-3" />
                        <div className="text-3xl font-black mb-1">{stats.score}</div>
                        <div className="text-xs uppercase tracking-widest font-bold opacity-90">Contribution Score</div>
                        {tier.next && (
                            <div className="mt-3">
                                <div className="text-[10px] opacity-70 mb-1">{tier.next - stats.score} pts to next tier</div>
                                <div className="w-full bg-white/20 rounded-full h-1.5">
                                    <div className="bg-yellow-300 h-1.5 rounded-full" style={{ width: `${Math.min((stats.score / tier.next) * 100, 100)}%` }} />
                                </div>
                            </div>
                        )}
                        <p className="text-[10px] mt-3 opacity-80 leading-tight">Earn points by reporting and resolving civic issues.</p>
                    </div>
                </div>

                {/* Right Content */}
                <div className="lg:col-span-3">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="ub-card !p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-ub-blue-hero flex items-center justify-center shrink-0"><Clock size={24} /></div>
                            <div>
                                <div className="text-2xl font-black text-ub-text-primary leading-none mb-1">{stats.reported}</div>
                                <div className="text-xs font-bold text-ub-text-muted uppercase tracking-wider">Total Reports</div>
                            </div>
                        </div>
                        <div className="ub-card !p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 text-ub-green-medium flex items-center justify-center shrink-0"><CheckCircle size={24} /></div>
                            <div>
                                <div className="text-2xl font-black text-ub-text-primary leading-none mb-1">{stats.resolved}</div>
                                <div className="text-xs font-bold text-ub-text-muted uppercase tracking-wider">Resolved Issues</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4">
                        {[
                            { key: 'reports', label: 'My Reports', icon: User },
                            { key: 'timeline', label: 'Activity Timeline', icon: Clock },
                        ].map(({ key, label, icon: Icon }) => (
                            <button key={key} onClick={() => setActiveTab(key)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === key ? 'bg-ub-blue-hero text-white shadow-md' : 'bg-white text-ub-text-muted hover:bg-gray-50 border border-ub-border'}`}>
                                <Icon size={14} /> {label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'reports' ? (
                        <div className="space-y-4">
                            {issues.length === 0 ? (
                                <div className="ub-card !py-12 text-center text-ub-text-muted">
                                    <div className="text-4xl mb-3">🌍</div>
                                    <p>You haven't reported any civic issues yet.</p>
                                    <Link to="/report" className="mt-4 inline-block btn-primary text-sm">Report an Issue Now</Link>
                                </div>
                            ) : (
                                issues.map(issue => (
                                    <Link to={`/issue/${issue._id}`} key={issue._id} className="block group">
                                        <div className="ub-card !p-5 hover:border-ub-blue-hero transition-colors flex flex-col md:flex-row gap-5 items-start md:items-center">
                                            {issue.photos?.[0] ? (
                                                <div className="w-full md:w-32 md:h-24 rounded-lg overflow-hidden shrink-0 border border-ub-border">
                                                    <img src={issue.photos[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={issue.title} />
                                                </div>
                                            ) : (
                                                <div className="w-full md:w-32 h-20 md:h-24 rounded-lg bg-gray-100 border border-ub-border flex flex-col items-center justify-center shrink-0 text-ub-text-muted text-xs">
                                                    <MapPin size={20} className="mb-1" /> No Photo
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold tracking-wider uppercase text-ub-text-muted">{new Date(issue.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-mono text-ub-blue-hero bg-blue-50 px-1.5 py-0.5 rounded">{issue.issueId}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-ub-text-primary truncate group-hover:text-ub-blue-hero transition-colors">{issue.title}</h3>
                                                <div className="text-sm text-ub-text-secondary mt-1 truncate">{issue.description}</div>
                                            </div>
                                            <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                                                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border ${getStatusColor(issue.status)}`}>
                                                    {issue.status.replace('_', ' ')}
                                                </span>
                                                <ChevronRight size={16} className="text-gray-400 hidden md:block" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="ub-card !p-5">
                            <h3 className="text-sm font-black text-ub-text-primary mb-4 flex items-center gap-2">
                                <Clock size={16} className="text-ub-blue-hero" /> Recent Activity
                            </h3>
                            <ActivityTimeline issues={issues} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
