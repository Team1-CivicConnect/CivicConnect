import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Award, CheckCircle, Clock, MapPin, Settings,
    LogOut, X, Save, Lock, Eye, EyeOff, Phone,
    ChevronRight, Camera, Calendar, FileText,
    AlertCircle, CheckCheck, Loader
} from 'lucide-react';

const TIER_CONFIG = {
    bronze: { color: 'text-amber-700', bg: 'bg-amber-500/10', border: 'border-amber-300/50', label: 'Bronze', emoji: '🥉', next: 75 },
    silver: { color: 'text-gray-600', bg: 'bg-gray-500/10', border: 'border-gray-300/50', label: 'Silver', emoji: '🥈', next: 200 },
    gold: { color: 'text-yellow-600', bg: 'bg-yellow-500/10', border: 'border-yellow-300/50', label: 'Gold', emoji: '🥇', next: 500 },
    platinum: { color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-300/50', label: 'Platinum', emoji: '💎', next: null },
};

const getActivityIcon = (status) => {
    switch (status) {
        case 'resolved': return <CheckCheck size={14} className="text-emerald-600" />;
        case 'in_progress': return <Loader size={14} className="text-ub-blue-hero" />;
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
        case 'resolved': return 'bg-emerald-50/50 border-emerald-200/50';
        case 'in_progress': return 'bg-blue-50/50 border-blue-200/50';
        case 'under_review': return 'bg-amber-50/50 border-amber-200/50';
        default: return 'bg-gray-50/50 border-gray-200/50';
    }
};

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
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
        <div className="relative inline-block group">
            <div className="w-24 h-24 mx-auto rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-4 border-white/50 shadow-xl transition-transform group-hover:scale-105 duration-300">
                {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ub-blue-hero to-teal-400 flex items-center justify-center text-white text-4xl font-black">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                )}
            </div>
            <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-ub-blue-hero hover:bg-[#1B3FA0] text-white rounded-xl flex items-center justify-center shadow-lg transition-colors disabled:opacity-70 border-2 border-white"
            >
                {uploading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Camera size={16} />
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
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white/95 backdrop-blur-2xl rounded-[30px] border border-white/50 shadow-[0_40px_100px_rgba(0,0,0,0.15)] w-full max-w-md p-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-ub-blue-hero/10 rounded-bl-full filter blur-xl"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Edit Profile</h3>
                        <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"><X size={18} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {fields.map(({ id, label, type, icon: Icon, placeholder }) => (
                            <div key={id} className="relative group/input">
                                <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-ub-blue-hero transition-colors" />
                                <input type={type} id={id} required={id === 'name'}
                                    value={form[id]} onChange={e => setForm({ ...form, [id]: e.target.value })}
                                    className="peer w-full pl-11 pr-4 pb-2.5 pt-6 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-ub-blue-hero focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder-transparent"
                                    placeholder={placeholder} />
                                <label htmlFor={id} className="absolute left-11 top-4 text-gray-400 font-semibold text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-4 peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-ub-blue-hero peer-focus:font-black peer-focus:uppercase tracking-widest pointer-events-none">
                                    {label}
                                </label>
                            </div>
                        ))}
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-black text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                            <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-2xl bg-gray-900 hover:bg-ub-blue-hero text-white font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
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
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white/95 backdrop-blur-2xl rounded-[30px] border border-white/50 shadow-[0_40px_100px_rgba(0,0,0,0.15)] w-full max-w-md p-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-bl-full filter blur-xl"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Security</h3>
                        <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"><X size={18} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {[
                            { id: 'currentPassword', label: 'Current Password', showKey: 'current' },
                            { id: 'newPassword', label: 'New Password', showKey: 'new' },
                            { id: 'confirmPassword', label: 'Confirm Password', showKey: 'confirm' },
                        ].map(({ id, label, showKey }) => (
                            <div key={id} className="relative group/input">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-ub-blue-hero transition-colors" />
                                <input type={show[showKey] ? 'text' : 'password'} id={id} required
                                    value={form[id]} onChange={e => setForm({ ...form, [id]: e.target.value })}
                                    className="peer w-full pl-11 pr-12 pb-2.5 pt-6 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-ub-blue-hero focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder-transparent"
                                    placeholder={label} />
                                <label htmlFor={id} className="absolute left-11 top-4 text-gray-400 font-semibold text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-4 peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-ub-blue-hero peer-focus:font-black peer-focus:uppercase tracking-widest pointer-events-none">
                                    {label}
                                </label>
                                <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                                    {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        ))}
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-black text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                            <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// ── Activity Timeline ─────────────────────────────────────────────────────────
function ActivityTimeline({ issues }) {
    if (issues.length === 0) return (
        <div className="text-center py-12 text-gray-400 bg-white/30 rounded-2xl border border-dashed border-gray-300">
            <Clock size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-bold">No activity yet</p>
            <p className="text-xs font-semibold mt-1 opacity-70">Start reporting issues to build your timeline.</p>
        </div>
    );

    const sorted = [...issues].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 8);

    return (
        <div className="space-y-4">
            {sorted.map((issue, idx) => (
                <Link to={`/issue/${issue._id}`} key={issue._id}>
                    <motion.div variants={itemVariants} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-lg bg-white/60 hover:bg-white backdrop-blur-sm ${getActivityColor(issue.status)} group`}>
                        <div className="flex flex-col items-center shrink-0 mt-0.5">
                            <div className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                {getActivityIcon(issue.status)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-black text-gray-900 truncate group-hover:text-ub-blue-hero transition-colors">{issue.title}</p>
                            <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">
                                {getActivityLabel(issue.status)} <span className="opacity-50">·</span> {new Date(issue.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 shrink-0 mt-2 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
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
            case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-12 h-12 border-4 border-ub-blue-hero/20 border-t-ub-blue-hero rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-poppins pt-20 pb-16 px-4 md:px-8">
            {/* Ultra-Premium Glowing Mesh Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-ub-blue-hero/20 rounded-full mix-blend-multiply filter blur-[150px] animate-[blob_10s_infinite]"></div>
                <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-[150px] animate-[blob_10s_infinite_2s]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-teal-300/20 rounded-full mix-blend-multiply filter blur-[150px] animate-[blob_10s_infinite_4s]"></div>
                <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            </div>

            {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} onSave={updateUser} />}
            {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10"
            >
                {/* Left Card - Profile Summary */}
                <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                    <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-[30px] p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-ub-blue-hero to-teal-400 opacity-90 rounded-t-[30px]"></div>

                        <div className="relative pt-12 mb-6">
                            <AvatarUpload user={user} onUpdate={updateUser} />
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">{user?.name}</h2>
                        <p className="text-sm font-semibold text-gray-500 mb-2">{user?.email}</p>

                        {(user?.ward || user?.area || user?.phone) && (
                            <div className="flex flex-col items-center gap-2 mt-4 mb-6">
                                {user?.phone && (
                                    <div className="text-xs font-bold text-gray-600 bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <Phone size={12} className="text-ub-blue-hero" /> {user?.phone}
                                    </div>
                                )}
                                {(user?.ward || user?.area) && (
                                    <div className="text-xs font-bold text-gray-600 bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <MapPin size={12} className="text-emerald-500" /> {user?.ward || 'Ward'}, {user?.area || 'Area'}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                            <Calendar size={12} />
                            <span>Member since {memberSince}</span>
                        </div>

                        <div className="flex flex-col gap-3 mt-8">
                            <button onClick={() => setShowEdit(true)} className="py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-sm font-black tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                <Settings size={16} /> Edit Profile
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setShowPassword(true)} className="py-3 bg-white border border-gray-200 hover:border-ub-blue-hero text-gray-700 hover:text-ub-blue-hero rounded-2xl text-[11px] font-black uppercase tracking-wide transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                                    <Lock size={14} /> Security
                                </button>
                                <button onClick={handleLogout} className="py-3 bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-sm">
                                    <LogOut size={14} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Score Card */}
                    <div className="bg-gradient-to-br from-[#0F2460] to-teal-800 rounded-[30px] p-8 text-white relative overflow-hidden shadow-[0_20px_40px_rgba(15,36,96,0.2)]">
                        <div className="absolute right-[-20%] top-[-10%] w-48 h-48 bg-gradient-to-tr from-emerald-400 to-transparent rounded-full blur-2xl opacity-40"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mb-4">
                                <Award size={32} className="text-yellow-300" />
                            </div>

                            <div className="text-5xl font-black mb-1 drop-shadow-md">{stats.score}</div>
                            <div className="text-xs uppercase tracking-widest font-bold text-blue-100 mb-6">Contribution Score</div>

                            <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border mb-6 text-sm font-black shadow-inner bg-white/10 border-white/20 text-white backdrop-blur-sm`}>
                                {tier.emoji} {tier.label} Tier
                            </div>

                            {tier.next && (
                                <div className="w-full bg-black/20 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-blue-100">
                                        <span>Current Phase</span>
                                        <span>{tier.next - stats.score} pts to {Object.values(TIER_CONFIG).find(t => t.next > tier.next)?.label || 'Next'}</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                                        <div className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full relative" style={{ width: `${Math.min((stats.score / tier.next) * 100, 100)}%` }}>
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Right Content */}
                <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-[30px] p-6 lg:p-8 flex items-center gap-6 relative overflow-hidden group">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50/80 text-ub-blue-hero flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform duration-300"><Clock size={32} /></div>
                            <div>
                                <div className="text-4xl font-black text-gray-900 leading-none mb-2">{stats.reported}</div>
                                <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Reports</div>
                            </div>
                            <div className="absolute right-[-10%] bottom-[-20%] opacity-5 text-gray-900 group-hover:scale-150 transition-transform duration-500"><Clock size={160} /></div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-[30px] p-6 lg:p-8 flex items-center gap-6 relative overflow-hidden group">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50/80 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform duration-300"><CheckCircle size={32} /></div>
                            <div>
                                <div className="text-4xl font-black text-gray-900 leading-none mb-2">{stats.resolved}</div>
                                <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Resolved Issues</div>
                            </div>
                            <div className="absolute right-[-10%] bottom-[-20%] opacity-5 text-emerald-900 group-hover:scale-150 transition-transform duration-500"><CheckCircle size={160} /></div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-[30px] p-6 lg:p-8 relative min-h-[500px]">

                        {/* Tabs */}
                        <div className="flex bg-gray-100/50 p-1 rounded-2xl backdrop-blur-md mb-8 inline-flex">
                            {[
                                { key: 'reports', label: 'My Reports', icon: FileText },
                                { key: 'timeline', label: 'Timeline', icon: Clock },
                            ].map(({ key, label, icon: Icon }) => (
                                <button key={key} onClick={() => setActiveTab(key)}
                                    className={`px-6 py-2.5 rounded-[12px] text-sm font-black transition-all flex items-center gap-2 tracking-wide ${activeTab === key ? 'bg-white text-ub-blue-hero shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
                                    <Icon size={16} /> {label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="relative">
                            {activeTab === 'reports' ? (
                                <motion.div variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="space-y-4">
                                    {issues.length === 0 ? (
                                        <div className="py-16 text-center bg-white/40 rounded-[20px] border border-dashed border-gray-300">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText size={28} className="text-ub-blue-hero opacity-50" />
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 mb-1">No reports found</h3>
                                            <p className="text-gray-500 font-semibold text-sm mb-6 max-w-sm mx-auto">You haven't reported any civic issues yet. Take the first step towards improving your community.</p>
                                            <Link to="/report" className="inline-flex py-3 px-8 bg-gray-900 hover:bg-ub-blue-hero text-white text-sm font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Submit an Issue</Link>
                                        </div>
                                    ) : (
                                        issues.map(issue => (
                                            <Link to={`/issue/${issue._id}`} key={issue._id} className="block group">
                                                <motion.div variants={itemVariants} className="bg-white/80 p-4 lg:p-5 hover:bg-white border border-white shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all rounded-[20px] flex flex-col md:flex-row gap-5 items-start md:items-center">
                                                    {issue.photos?.[0] ? (
                                                        <div className="w-full md:w-36 md:h-28 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-sm relative">
                                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                                            <img src={issue.photos[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={issue.title} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full md:w-36 h-24 md:h-28 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center shrink-0 text-gray-400 font-bold text-xs uppercase tracking-widest shadow-inner">
                                                            <MapPin size={24} className="mb-2 opacity-50" /> No Photo
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 flex items-center gap-1"><Calendar size={12} /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span className="text-[10px] font-mono font-black tracking-wider text-ub-blue-hero bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{issue.issueId}</span>
                                                        </div>
                                                        <h3 className="text-xl font-black text-gray-900 truncate group-hover:text-ub-blue-hero transition-colors mb-1">{issue.title}</h3>
                                                        <div className="text-sm font-semibold text-gray-500 truncate">{issue.description}</div>
                                                    </div>

                                                    <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                                                        <span className={`text-[10px] uppercase tracking-widest font-black px-4 py-1.5 rounded-xl border ${getStatusColor(issue.status)} shadow-sm`}>
                                                            {issue.status.replace('_', ' ')}
                                                        </span>
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-ub-blue-hero group-hover:text-white transition-colors">
                                                            <ChevronRight size={16} className="text-gray-400 group-hover:text-white" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        ))
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="max-w-2xl">
                                    <ActivityTimeline issues={issues} />
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
