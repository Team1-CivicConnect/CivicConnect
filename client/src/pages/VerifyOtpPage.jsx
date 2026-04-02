import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyOtpPage() {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { state } = useLocation();
    const email = state?.email || searchParams.get('email') || '';

    // Countdown timer for resend
    useEffect(() => {
        if (countdown === 0) { setCanResend(true); return; }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newDigits = [...digits];
        pasted.split('').forEach((char, i) => { newDigits[i] = char; });
        setDigits(newDigits);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otp = digits.join('');
        if (otp.length < 6) return toast.error('Enter the full 6-digit code');
        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, otp });
            toast.success('Email verified! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid code');
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setResendLoading(true);
        try {
            await api.post('/auth/resend-otp', { email });
            toast.success('New code sent to your email!');
            setCountdown(60);
            setCanResend(false);
            setDigits(['', '', '', '', '', '']);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-poppins section-animate"
        >
            {/* The WOW Factor: Ultra-Premium Glowing Mesh Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-400 rounded-full mix-blend-multiply opacity-20 filter blur-[150px] animate-[blob_10s_infinite]"></div>
                <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-indigo-400 rounded-full mix-blend-multiply opacity-20 filter blur-[150px] animate-[blob_10s_infinite_2s]"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-purple-300 rounded-full mix-blend-multiply opacity-20 filter blur-[150px] animate-[blob_10s_infinite_4s]"></div>
            </div>

            {/* Premium Floating Center Island */}
            <div className="max-w-4xl w-full relative z-10 flex flex-col md:flex-row shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-2xl border border-white/50">

                {/* Left Art / Visual Panel */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-600 to-indigo-900 p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    {/* Floating Abstract Element */}
                    <div className="absolute left-[-20%] bottom-[-10%] w-64 h-64 bg-gradient-to-tr from-purple-400 to-transparent rounded-full blur-2xl opacity-40 group-hover:scale-150 transition-transform duration-1000"></div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-xl">
                            <ShieldCheck size={28} className="text-white" />
                        </div>
                        <h2 className="text-4xl lg:text-4xl font-black tracking-tight leading-[1.1] mb-6">
                            Secure your<br />Connection.
                        </h2>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-[280px]">
                            We require one final step. Verify the access code sent to your network address.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-400/50 bg-gradient-to-r from-blue-300 to-purple-200 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck size={20} className="text-indigo-900" />
                        </div>
                        <div className="text-xs font-bold text-indigo-200">
                            <span className="text-white font-black block text-sm">AES-256</span>
                            End-to-End Encrypted
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="w-full md:w-7/12 p-10 lg:p-14 bg-white flex flex-col justify-center relative">
                    <div className="w-full mx-auto max-w-sm">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Verify Identity</h1>
                        <p className="text-gray-500 font-medium mb-10 text-sm">
                            OTP dispatched to <span className="text-indigo-600 font-bold">{email || 'your email'}</span>
                        </p>

                        <form onSubmit={handleVerify} className="space-y-8">
                            {/* 6-digit boxes */}
                            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                                {digits.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={el => inputRefs.current[i] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={d}
                                        onChange={e => handleChange(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-2xl font-black border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 bg-gray-50 hover:bg-white focus:bg-white text-gray-900 transition-all shadow-sm focus:shadow-md"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full py-4 bg-gray-900 hover:bg-indigo-600 text-white font-black rounded-2xl transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:transform-none"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Verify Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center pt-6 border-t border-gray-100 flex flex-col gap-4">
                            <button
                                type="button" onClick={handleResend} disabled={!canResend || resendLoading}
                                className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50 group/btn"
                            >
                                <RefreshCw size={16} className={`${resendLoading ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} />
                                {canResend ? 'Resend Access Code' : `Resend available in ${countdown}s`}
                            </button>
                            <Link to="/register" className="flex items-center gap-1.5 justify-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                <ArrowLeft size={14} /> Abort Verification
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
