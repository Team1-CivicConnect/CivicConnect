import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, User, Mail, Lock, ShieldAlert, ArrowRight, Check, ChevronDown, Search } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

// Comprehensive list of Major Indian Cities and States
const INDIA_LOCATIONS = [
    // Tier 1 Cities
    "Ahmedabad, Gujarat", "Bengaluru, Karnataka", "Chennai, Tamil Nadu", 
    "Delhi, NCR", "Hyderabad, Telangana", "Kolkata, West Bengal", 
    "Mumbai, Maharashtra", "Pune, Maharashtra",
    
    // Major Tier 2 & Tier 3 Cities (Alphabetical)
    "Agra, Uttar Pradesh", "Ajmer, Rajasthan", "Aligarh, Uttar Pradesh", 
    "Allahabad, Uttar Pradesh", "Amravati, Maharashtra", "Amritsar, Punjab", 
    "Asansol, West Bengal", "Aurangabad, Maharashtra", "Bareilly, Uttar Pradesh", 
    "Belagavi, Karnataka", "Bhavnagar, Gujarat", "Bhilai, Chhattisgarh", 
    "Bhiwandi, Maharashtra", "Bhopal, Madhya Pradesh", "Bhubaneswar, Odisha", 
    "Bikaner, Rajasthan", "Chandigarh", "Coimbatore, Tamil Nadu", 
    "Cuttack, Odisha", "Dehradun, Uttarakhand", "Dhanbad, Jharkhand", 
    "Durgapur, West Bengal", "Erode, Tamil Nadu", "Faridabad, Haryana", 
    "Firozabad, Uttar Pradesh", "Ghaziabad, Uttar Pradesh", "Gorakhpur, Uttar Pradesh", 
    "Gulbarga, Karnataka", "Guntur, Andhra Pradesh", "Gurgaon, Haryana", 
    "Guwahati, Assam", "Gwalior, Madhya Pradesh", "Hubli-Dharwad, Karnataka", 
    "Indore, Madhya Pradesh", "Jabalpur, Madhya Pradesh", "Jaipur, Rajasthan", 
    "Jalandhar, Punjab", "Jalgaon, Maharashtra", "Jammu, Jammu & Kashmir", 
    "Jamnagar, Gujarat", "Jamshedpur, Jharkhand", "Jhansi, Uttar Pradesh", 
    "Jodhpur, Rajasthan", "Kakinada, Andhra Pradesh", "Kannur, Kerala", 
    "Kanpur, Uttar Pradesh", "Kochi, Kerala", "Kolhapur, Maharashtra", 
    "Kollam, Kerala", "Kota, Rajasthan", "Kozhikode, Kerala", 
    "Kurnool, Andhra Pradesh", "Lucknow, Uttar Pradesh", "Ludhiana, Punjab", 
    "Madurai, Tamil Nadu", "Malappuram, Kerala", "Mangalore, Karnataka", 
    "Mathura, Uttar Pradesh", "Meerut, Uttar Pradesh", "Moradabad, Uttar Pradesh", 
    "Mysore, Karnataka", "Nagpur, Maharashtra", "Nanded, Maharashtra", 
    "Nashik, Maharashtra", "Nellore, Andhra Pradesh", "Noida, Uttar Pradesh", 
    "Patna, Bihar", "Pondicherry, Puducherry", "Raipur, Chhattisgarh", 
    "Rajahmundry, Andhra Pradesh", "Rajkot, Gujarat", "Ranchi, Jharkhand", 
    "Rourkela, Odisha", "Salem, Tamil Nadu", "Sangli, Maharashtra", 
    "Shimla, Himachal Pradesh", "Siliguri, West Bengal", "Solapur, Maharashtra", 
    "Srinagar, Jammu & Kashmir", "Surat, Gujarat", "Thiruvananthapuram, Kerala", 
    "Thrissur, Kerala", "Tiruchirappalli, Tamil Nadu", "Tirunelveli, Tamil Nadu", 
    "Tiruppur, Tamil Nadu", "Ujjain, Madhya Pradesh", "Vadodara, Gujarat", 
    "Varanasi, Uttar Pradesh", "Vasai-Virar, Maharashtra", "Vellore, Tamil Nadu", 
    "Vijayawada, Andhra Pradesh", "Visakhapatnam, Andhra Pradesh", "Warangal, Telangana",
    
    // States and Union Territories (if user just wants to select a broader region)
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", 
    "Assam", "Bihar", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", 
    "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

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

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', ward: '', area: '' });
    const [wardSearch, setWardSearch] = useState('');
    const [showWardDropdown, setShowWardDropdown] = useState(false);
    const wardRef = useRef(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Click outside to close the ward dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wardRef.current && !wardRef.current.contains(e.target)) {
                setShowWardDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered locations for autocomplete
    const filteredLocations = useMemo(() => {
        if (!wardSearch.trim()) return INDIA_LOCATIONS;
        return INDIA_LOCATIONS.filter(loc =>
            loc.toLowerCase().includes(wardSearch.toLowerCase())
        );
    }, [wardSearch]);

    // Password Strength Math
    const calculateStrength = (pwd) => {
        let score = 0;
        if (pwd.length > 5) score += 1;
        if (pwd.length > 8) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
        return Math.min(score, 4); // Max 4 levels (0 = none, 1 = weak, 2=fair, 3=good, 4=strong)
    };

    const strengthScore = useMemo(() => calculateStrength(formData.password), [formData.password]);
    const strengthFills = ['bg-gray-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-teal-500'];
    const strengthWidths = ['0%', '25%', '50%', '75%', '100%'];
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

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

        // Validation based on your backend checks
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(formData.name)) {
            setError('Name can only contain alphabets and spaces');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await register(formData);
            toast.success('Registration successful! Please Check Your Email for OTP');
            navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`, {
                state: { email: formData.email }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-poppins section-animate"
        >
            {/* The WOW Factor: Ultra-Premium Glowing Mesh Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-400 rounded-full mix-blend-multiply opacity-20 filter blur-[150px] animate-[blob_10s_infinite]"></div>
                <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-teal-400 rounded-full mix-blend-multiply opacity-20 filter blur-[150px] animate-[blob_10s_infinite_2s]"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-cyan-300 rounded-full mix-blend-multiply opacity-20 filter blur-[150px] animate-[blob_10s_infinite_4s]"></div>
            </div>

            {/* Premium Floating Center Island */}
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="max-w-6xl w-full relative z-10 flex flex-col md:flex-row shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[40px] bg-white/70 backdrop-blur-2xl border border-white/50"
            >

                {/* Left Form Panel */}
                <div style={{ transform: "translateZ(20px)" }} className="w-full md:w-7/12 p-8 lg:p-14 bg-white flex flex-col justify-center relative order-2 md:order-1 rounded-b-[40px] md:rounded-l-[40px] md:rounded-br-none">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="max-w-lg w-full mx-auto"
                    >
                        <motion.h1 variants={itemVariants} className="text-3xl font-black text-gray-900 mb-2">Create Account</motion.h1>
                        <motion.p variants={itemVariants} className="text-gray-500 font-medium mb-8 text-sm">Join the CivicConnect community today.</motion.p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div variants={itemVariants} className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-2xl flex items-start gap-3 border border-red-100 pb-4">
                                    <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Floating Label Input: Name */}
                                <motion.div variants={itemVariants} className="relative group/input col-span-2 sm:col-span-1">
                                    <input
                                        type="text" id="name" required
                                        className="peer w-full px-5 pt-7 pb-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-bold placeholder-transparent"
                                        placeholder="Full Name"
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <label htmlFor="name" className="absolute left-5 top-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-emerald-500">
                                        Full Name
                                    </label>
                                </motion.div>

                                {/* Floating Label Input: Email */}
                                <motion.div variants={itemVariants} className="relative group/input col-span-2 sm:col-span-1">
                                    <input
                                        type="email" id="email" required
                                        className="peer w-full px-5 pt-7 pb-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-bold placeholder-transparent"
                                        placeholder="Email address"
                                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <label htmlFor="email" className="absolute left-5 top-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-emerald-500">
                                        Email address
                                    </label>
                                </motion.div>

                                {/* Searchable Ward Autocomplete */}
                                <motion.div variants={itemVariants} className="relative group/input col-span-2 sm:col-span-1" ref={wardRef}>
                                    <div className="relative">
                                        <input
                                            type="text" id="ward" autoComplete="off"
                                            className="peer w-full px-5 pt-7 pb-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-bold placeholder-transparent"
                                            placeholder="Ward Assignment"
                                            value={showWardDropdown ? wardSearch : formData.ward}
                                            onFocus={() => {
                                                setShowWardDropdown(true);
                                                setWardSearch(formData.ward);
                                            }}
                                            onChange={(e) => {
                                                setWardSearch(e.target.value);
                                                setShowWardDropdown(true);
                                                if (!e.target.value) {
                                                    setFormData({ ...formData, ward: '' });
                                                }
                                            }}
                                        />
                                        <label htmlFor="ward" className={`absolute left-5 pointer-events-none transition-all ${formData.ward || showWardDropdown ? 'top-2 text-[10px] font-black uppercase tracking-widest text-emerald-500' : 'text-sm normal-case tracking-normal top-1/2 -translate-y-1/2 text-gray-400'}`}>
                                            Ward Assignment
                                        </label>
                                        <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 ${showWardDropdown ? 'rotate-180 text-emerald-500' : ''}`} />
                                    </div>

                                    {/* Dropdown List */}
                                    <AnimatePresence>
                                        {showWardDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden"
                                            >
                                                {/* Search hint */}
                                                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-semibold bg-gray-50/50">
                                                    <Search size={12} /> Type to filter locations...
                                                </div>
                                                <ul className="max-h-48 overflow-y-auto py-1 scrollbar-thin">
                                                    {filteredLocations.length > 0 ? (
                                                        filteredLocations.map((loc) => (
                                                            <li
                                                                key={loc}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, ward: loc });
                                                                    setWardSearch(loc);
                                                                    setShowWardDropdown(false);
                                                                }}
                                                                className={`px-5 py-2.5 cursor-pointer text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${formData.ward === loc ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-600'}`}
                                                            >
                                                                <MapPin size={13} className={`shrink-0 ${formData.ward === loc ? 'text-emerald-500' : 'text-gray-300'}`} />
                                                                {loc}
                                                                {formData.ward === loc && <Check size={14} className="ml-auto text-emerald-500" />}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="px-5 py-4 text-sm text-gray-400 font-medium text-center">No locations found</li>
                                                    )}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Floating Label Input: Password */}
                                <motion.div variants={itemVariants} className="relative group/input col-span-2 sm:col-span-1">
                                    <input
                                        type="password" id="password" required minLength="6"
                                        className="peer w-full px-5 pt-7 pb-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-bold tracking-wider placeholder-transparent"
                                        placeholder="Password"
                                        value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <label htmlFor="password" className="absolute left-5 top-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-emerald-500">
                                        Password (Min 6)
                                    </label>

                                    {/* Ultra-Premium Dynamic Password Strength Meter */}
                                    {formData.password.length > 0 && (
                                        <div className="absolute -bottom-4 left-2 right-2 flex items-center gap-2 animate-fadeIn">
                                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full ${strengthFills[strengthScore]}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: strengthWidths[strengthScore] }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest text-emerald-600 transition-opacity duration-300 ${strengthScore > 0 ? 'opacity-100' : 'opacity-0'}`}>
                                                {strengthLabels[strengthScore]}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            <motion.button
                                variants={itemVariants}
                                type="submit" disabled={loading}
                                className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all duration-300 shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:transform-none"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </motion.button>
                        </form>

                        <motion.div variants={itemVariants} className="mt-8 text-center pt-6 border-t border-gray-100">
                            <p className="text-gray-500 font-medium text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-emerald-600 font-black hover:underline underline-offset-4">
                                    Sign In here
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Right Art / Visual Panel */}
                <div style={{ transform: "translateZ(30px)" }} className="w-full md:w-5/12 bg-gradient-to-br from-[#0F352E] to-emerald-900 p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden group order-1 md:order-2 rounded-t-[40px] md:rounded-r-[40px] md:rounded-tl-none">
                    <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    {/* Floating Abstract Element */}
                    <div className="absolute left-[-20%] top-[-10%] w-64 h-64 bg-gradient-to-tr from-teal-400 to-transparent rounded-full blur-2xl opacity-40 group-hover:scale-150 transition-transform duration-1000"></div>

                    <div className="relative z-10 text-right">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-xl ml-auto">
                            <MapPin size={28} className="text-emerald-300" />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6">
                            Join the<br />Network.
                        </h2>
                        <p className="text-emerald-100 text-sm font-medium leading-relaxed max-w-[280px] ml-auto">
                            Become an active participant. Register today to log civic reports and optimize city matrices.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F352E] bg-gradient-to-r from-emerald-300 to-teal-200"></div>
                                ))}
                            </div>
                            <div className="text-xs font-bold text-emerald-200">
                                <span className="text-white font-black block text-sm">50K+ Issues</span>
                                successfully resolved.
                            </div>
                        </div>
                    </div>
                </div>

            </motion.div>
        </motion.div>
    );
}
