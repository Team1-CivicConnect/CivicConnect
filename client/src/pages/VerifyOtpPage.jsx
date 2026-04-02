import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-ub-blue-hero rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-ub-green-medium rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>

            <div className="max-w-md w-full space-y-8 relative z-10 glass bg-white/60 p-10 rounded-3xl shadow-2xl border border-white/40">
                <div>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ub-blue-hero to-ub-green-medium rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
                        <ShieldCheck size={30} />
                    </div>
                    <h2 className="text-center text-3xl font-black tracking-tight text-gray-900">Verify Identity</h2>
                    <p className="mt-2 text-center text-sm font-semibold text-gray-500">
                        OTP dispatched to <span className="text-ub-blue-hero font-black">{email || 'your email'}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    {/* 6-digit boxes */}
                    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
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
                                className="w-12 h-14 text-center text-2xl font-black border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ub-blue-hero bg-white/80 transition-colors"
                            />
                        ))}
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="group w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-ub-blue-hero hover:bg-black transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Authenticate Node'}
                    </button>

                    <div className="text-center space-y-2">
                        <button
                            type="button" onClick={handleResend} disabled={!canResend || resendLoading}
                            className="flex items-center gap-2 mx-auto text-xs font-bold text-ub-text-muted hover:text-ub-blue-hero transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                            {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
                        </button>
                        <Link to="/register" className="flex items-center gap-1 justify-center text-xs font-bold text-ub-text-muted hover:text-ub-blue-hero transition-colors">
                            <ArrowLeft size={13} /> Back to Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
