import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// Animation Variants for Waterfall Effect
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // 3D Parallax Mouse Tracking setup
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();

        // Calculate mouse position relative to the center of the card
        const x = (clientX - left - width / 2) / 25; // Division reduces rotation severity
        const y = (clientY - top - height / 2) / 25;

        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    // Smooth springs for rotation
    const rotateX = useSpring(useTransform(mouseY, [-20, 20], [10, -10]), { damping: 30, stiffness: 200 });
    const rotateY = useSpring(useTransform(mouseX, [-20, 20], [-10, 10]), { damping: 30, stiffness: 200 });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);

            navigate('/map');
            toast.success('Login successful!');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-poppins section-animate"
        >
            {/* The WOW Factor: Ultra-Premium Glowing Mesh Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-400 rounded-full mix-blend-multiply opacity-20 filter blur-[150px] animate-[blob_10s_infinite]"></div>
                <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-emerald-400 rounded-full mix-blend-multiply opacity-20 filter blur-[150px] animate-[blob_10s_infinite_2s]"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-teal-300 rounded-full mix-blend-multiply opacity-20 filter blur-[150px] animate-[blob_10s_infinite_4s]"></div>
            </div>

            {/* Premium Floating Center Island */}
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="max-w-5xl w-full relative z-10 flex flex-col md:flex-row shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[40px] bg-white/70 backdrop-blur-2xl border border-white/50"
            >

                {/* Left Art / Visual Panel */}
                <div style={{ transform: "translateZ(30px)" }} className="w-full md:w-5/12 bg-gradient-to-br from-ub-blue-hero to-[#0F2460] p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden group rounded-t-[40px] md:rounded-l-[40px] md:rounded-tr-none">
                    <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    {/* Floating Abstract Element */}
                    <div className="absolute right-[-20%] top-[-10%] w-64 h-64 bg-gradient-to-tr from-emerald-400 to-transparent rounded-full blur-2xl opacity-40 group-hover:scale-150 transition-transform duration-1000"></div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-xl">
                            <ShieldAlert size={28} className="text-white" />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6">
                            Welcome to<br />CivicConnect.
                        </h2>
                        <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-[280px]">
                            Securely access your personalized dashboard to manage community infrastructure and trace civic metrics.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F2460] bg-gradient-to-r from-blue-300 to-teal-200"></div>
                                ))}
                            </div>
                            <div className="text-xs font-bold text-blue-200">
                                <span className="text-white font-black block text-sm">Join 10k+ Citizens</span>
                                active on the network.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div style={{ transform: "translateZ(20px)" }} className="w-full md:w-7/12 p-10 lg:p-16 bg-white flex flex-col justify-center relative rounded-b-[40px] md:rounded-r-[40px] md:rounded-bl-none">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="max-w-md w-full mx-auto"
                    >
                        <motion.h1 variants={itemVariants} className="text-3xl font-black text-gray-900 mb-2">Sign In</motion.h1>
                        <motion.p variants={itemVariants} className="text-gray-500 font-medium mb-10 text-sm">Welcome back! Please enter your details.</motion.p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div variants={itemVariants} className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-2xl flex items-start gap-3 border border-red-100 pb-4">
                                    <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-5">
                                {/* Floating Label Input: Email */}
                                <motion.div variants={itemVariants} className="relative group/input">
                                    <input
                                        type="email" id="email" required
                                        className="peer w-full px-5 pb-3 pt-6 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-ub-blue-hero focus:ring-4 focus:ring-blue-50 transition-all font-bold placeholder-transparent"
                                        placeholder="Email address"
                                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <label htmlFor="email" className="absolute left-5 top-4 text-gray-400 font-semibold text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-4 peer-focus:-translate-y-2 peer-focus:text-xs peer-focus:text-ub-blue-hero peer-focus:font-bold pointer-events-none">
                                        Email address
                                    </label>
                                </motion.div>

                                {/* Floating Label Input: Password */}
                                <motion.div variants={itemVariants} className="relative group/input">
                                    <input
                                        type="password" id="password" required
                                        className="peer w-full px-5 pb-3 pt-6 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-ub-blue-hero focus:ring-4 focus:ring-blue-50 transition-all font-bold tracking-wider placeholder-transparent"
                                        placeholder="Password"
                                        value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <label htmlFor="password" className="absolute left-5 top-4 text-gray-400 font-semibold text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-4 peer-focus:-translate-y-2 peer-focus:text-xs peer-focus:text-ub-blue-hero peer-focus:font-bold pointer-events-none">
                                        Password
                                    </label>
                                </motion.div>
                            </div>

                            <motion.button
                                variants={itemVariants}
                                type="submit" disabled={loading}
                                className="w-full py-4 mt-6 bg-gray-900 hover:bg-ub-blue-hero text-white font-black rounded-2xl transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(27,63,160,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:transform-none"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Sign in to Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </motion.button>
                        </form>

                        <motion.div variants={itemVariants} className="mt-10 text-center">
                            <p className="text-gray-500 font-medium text-sm">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-ub-blue-hero font-black hover:underline underline-offset-4">
                                    Create yours now
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}
