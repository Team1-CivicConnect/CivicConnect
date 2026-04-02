import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(formData.email, formData.password);
            toast.success('Identity verified');
            if (data.user?.role === 'admin') navigate('/admin');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
            toast.error('Identity rejected');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 relative overflow-hidden">
            {/* Dynamic Abstract Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-ub-blue-hero rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-ub-green-medium rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>

            <div className="max-w-md w-full space-y-8 relative z-10 glass bg-white/60 p-10 rounded-3xl shadow-2xl border border-white/40">
                <div>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ub-blue-hero to-[#2563EB] rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg mb-6">
                        CC
                    </div>
                    <h2 className="text-center text-3xl font-black tracking-tight text-gray-900">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm font-semibold text-gray-500">
                        Sign in to your CivicConnect account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 animate-fadeIn">
                            <ShieldAlert className="text-red-500 shrink-0" size={20} />
                            <p className="text-sm font-bold text-red-700">{error}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-xl block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:border-ub-blue-hero text-sm font-bold transition-colors bg-white/80 backdrop-blur-sm"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Password</label>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-xl block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-0 focus:border-ub-blue-hero text-sm font-bold transition-colors bg-white/80 backdrop-blur-sm"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-ub-blue-hero hover:bg-black focus:outline-none transition-all shadow-lg hover:shadow-xl overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span className="flex items-center gap-2">Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <Link to="/register" className="text-xs font-bold text-ub-text-muted hover:text-ub-blue-hero transition-colors">
                            Don't have an account? <span className="underline decoration-2 underline-offset-2">Create one</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
