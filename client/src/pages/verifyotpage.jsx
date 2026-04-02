import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowRight, MailOpen, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    // Email passed via navigate state from RegisterPage or LoginPage
    const email = location.state?.email || '';

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // If no email in state, redirect to register
    useEffect(() => {
        if (!email) navigate('/register');
    }, [email, navigate]);

    const handleChange = (index, value) => {
        // Only allow single digit
        const digit = value.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // On backspace, clear current and move back
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
        }
        // Allow paste
        if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
        setOtp(newOtp);
        // Focus last filled or next empty
        const focusIndex = Math.min(pasted.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-otp', { email, otp: otpString });
            toast.success('Email verified! You can now sign in.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
            await api.post('/auth/resend-otp', { email });
            toast.success('A new verification code has been sent!');
            setOtp(['', '', '', '', '', '']);
            setCountdown(60);
            setCanResend(false);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setResending(false);
        }
    };

    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
        : '';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-ub-blue-hero rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-ub-green-medium rounded-full mix-blend-multiply filter blur-[120px] opacity-15 animate-blob animation-delay-2000"></div>

            <div className="max-w-md w-full space-y-8 relative z-10 glass bg-white/60 p-10 rounded-3xl shadow-2xl border border-white/40">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ub-blue-hero to-ub-green-medium rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
                        <MailOpen size={28} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-900">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-gray-500">
                        We sent a 6-digit code to
                    </p>
                    <p className="mt-1 text-sm font-black text-ub-blue-hero">
                        {maskedEmail}
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 animate-fadeIn">
                            <ShieldCheck className="text-red-500 shrink-0" size={20} />
                            <p className="text-sm font-bold text-red-700">{error}</p>
                        </div>
                    )}

                    {/* OTP Input Boxes */}
                    <div className="flex justify-center gap-3" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 transition-all focus:outline-none bg-white/80
                                    ${digit
                                        ? 'border-ub-blue-hero text-ub-blue-hero shadow-md'
                                        : 'border-gray-200 text-gray-900'
                                    }
                                    focus:border-ub-blue-hero focus:shadow-lg`}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.join('').length !== 6}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-ub-blue-hero hover:bg-black focus:outline-none transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span className="flex items-center gap-2">
                                Verify & Continue
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>

                    {/* Resend Section */}
                    <div className="text-center">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                                className="inline-flex items-center gap-2 text-xs font-bold text-ub-blue-hero hover:text-black transition-colors underline decoration-2 underline-offset-2 disabled:opacity-50"
                            >
                                <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                                {resending ? 'Sending...' : 'Resend Code'}
                            </button>
                        ) : (
                            <p className="text-xs font-semibold text-gray-400">
                                Resend code in{' '}
                                <span className="font-black text-gray-600">{countdown}s</span>
                            </p>
                        )}
                    </div>

                    <div className="text-center">
                        <Link to="/register" className="text-xs font-bold text-ub-text-muted hover:text-ub-blue-hero transition-colors">
                            Wrong email?{' '}
                            <span className="underline decoration-2 underline-offset-2">Go back to Register</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
