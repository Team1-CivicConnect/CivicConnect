import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, User, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', ward: '', area: '' });
    const { register } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (formData.password.length < 6) throw new Error("Key must exceed 6 bytes");
            await register(formData);
            toast.success('Identity node constructed! Please authenticate.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Construction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 relative overflow-hidden">
            {/* Dynamic Abstract Background */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-ub-green-medium rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob animation-delay-4000"></div>

            <div className="max-w-xl w-full space-y-8 relative z-10 glass bg-white/60 p-10 rounded-3xl shadow-2xl border border-white/40">
                <div>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ub-green-medium to-green-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg mb-6">
                        +
                    </div>
                    <h2 className="text-center text-3xl font-black tracking-tight text-gray-900">
                        Construct Identity
                    </h2>
                    <p className="mt-2 text-center text-sm font-semibold text-gray-500">
                        Register a new citizen node on the Ubayog grid
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 animate-fadeIn">
                            <ShieldAlert className="text-red-500 shrink-0" size={20} />
                            <p className="text-sm font-bold text-red-700">{error}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text" required
                                    className="appearance-none rounded-xl block w-full pl-10 pr-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:border-ub-green-medium font-bold transition-colors bg-white/80 text-sm"
                                    placeholder="Jane Doe"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email" required
                                    className="appearance-none rounded-xl block w-full pl-10 pr-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:border-ub-green-medium font-bold transition-colors bg-white/80 text-sm"
                                    placeholder="jane@domain.com"
                                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Ward Assignment</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="appearance-none rounded-xl block w-full pl-10 pr-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:border-ub-green-medium font-bold transition-colors bg-white/80 text-sm"
                                    placeholder="Area 51"
                                    value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Access Key (Password)</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password" required minLength="6"
                                    className="appearance-none rounded-xl block w-full pl-10 pr-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:border-ub-green-medium font-bold transition-colors bg-white/80 text-sm"
                                    placeholder="••••••••"
                                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl text-xs font-semibold text-ub-green-dark">
                        <ShieldAlert size={16} className="inline mr-1 text-ub-green-medium mb-0.5" />
                        By constructing an identity on the Ubayog Civic platform, you agree to submit transparent, verifiable infrastructure reports tied to your biometric or email footprint.
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-ub-green-medium hover:bg-ub-green-dark focus:outline-none transition-all shadow-lg hover:shadow-xl overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span className="flex items-center gap-2">Initialize Node <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <Link to="/login" className="text-xs font-bold text-ub-text-muted hover:text-ub-green-medium transition-colors">
                            Already have an identity? <span className="underline decoration-2 underline-offset-2">Initiate Handshake</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
