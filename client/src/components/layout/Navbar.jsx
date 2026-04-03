import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Menu, X, ArrowRight, ShieldCheck, Bell, CheckCheck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

// ── Notification Dropdown ─────────────────────────────────────────────────────
function NotificationDropdown({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { markAllAsRead } = useNotification();
    const dropdownRef = useRef();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get('/notifications');
                setNotifications(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleMarkRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'status_update': return '🔄';
            case 'comment': return '💬';
            case 'upvote': return '👍';
            default: return '🔔';
        }
    };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date);
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div ref={dropdownRef} className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-black text-sm text-gray-900">Notifications</h3>
                <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-ub-blue-hero hover:text-black flex items-center gap-1 transition-colors"
                >
                    <CheckCheck size={12} /> Mark all read
                </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-ub-blue-hero/20 border-t-ub-blue-hero rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Bell size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-semibold">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif._id}
                            onClick={() => handleMarkRead(notif._id)}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                        >
                            {/* Icon */}
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-sm shadow-sm shrink-0 mt-0.5">
                                {getNotifIcon(notif.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs leading-snug ${!notif.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                                    {notif.title}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5 truncate">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                            </div>

                            {/* Unread dot */}
                            {!notif.isRead && (
                                <div className="w-2 h-2 rounded-full bg-ub-blue-hero shrink-0 mt-1.5" />
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                    <p className="text-[10px] font-bold text-gray-400">Showing last 20 notifications</p>
                </div>
            )}
        </div>
    );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotification();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const links = [
        { name: 'Home', path: '/' },
        { name: 'Live Map', path: '/map' },
        { name: 'About', path: '/about' },
    ];

    const isDarkPage = location.pathname === '/';
    const isRegister = location.pathname === '/register';
    const textColor = isScrolled ? 'text-gray-900' : (isDarkPage ? 'text-white' : 'text-gray-900');

    // Dynamic Theme Variables dependent on current page
    const themeText = isRegister ? 'text-emerald-600' : 'text-ub-blue-hero';
    const themeHoverText = isRegister ? 'hover:text-emerald-600' : 'hover:text-ub-blue-hero';
    const themeGradient = isRegister ? 'from-emerald-500 to-teal-500' : 'from-ub-blue-hero to-[#2563EB]';
    const themeHoverBorder = isRegister ? 'hover:border-emerald-500' : 'hover:border-[#1B3FA0]';
    const shadowColor = isRegister ? 'shadow-[0_8px_20px_rgba(16,185,129,0.3)]' : 'shadow-[0_8px_20px_rgba(27,63,160,0.3)]';

    return (
        <>
            <nav className={`fixed top-0 w-full z-[1000] transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border-b border-gray-100 py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">

                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                {/* Only animate scale, keep the original logo colors to maintain brand memory or we can swap as well */}
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${isRegister ? 'from-emerald-500 to-teal-500' : 'from-ub-blue-hero via-[#2563EB] to-ub-green-medium'} flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:shadow-[0_4px_20px_rgba(27,63,160,0.4)] group-hover:scale-110 transition-all duration-300`}>
                                    CC
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                            </div>
                            <div className={`font-black text-xl tracking-tight transition-colors duration-300 ${textColor}`}>
                                Civic<span className={`${isScrolled ? themeText : (isDarkPage ? 'text-green-400' : themeText)}`}>Connect</span>
                            </div>
                        </Link>

                        <div className={`hidden md:flex items-center gap-1 p-1 rounded-full border ${isScrolled ? 'bg-gray-50 border-gray-200' : (isDarkPage ? 'bg-white/10 backdrop-blur-lg border-white/10' : 'bg-gray-50 border-gray-200')}`}>
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${location.pathname === link.path
                                        ? (isScrolled || !isDarkPage ? `bg-white ${themeText} shadow-sm` : 'bg-white/20 text-white shadow-sm')
                                        : (isScrolled || !isDarkPage ? 'text-gray-400 hover:text-gray-900 hover:bg-white/70' : 'text-white/60 hover:text-white hover:bg-white/10')
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="hidden md:flex items-center gap-3">

                                {/* ── Notification Bell ── */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className={`relative p-2 rounded-xl transition-all hover:scale-105 ${isScrolled || !isDarkPage ? `text-gray-500 hover:bg-gray-100 ${themeHoverText}` : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <NotificationDropdown onClose={() => setShowNotifications(false)} />
                                    )}
                                </div>

                                {/* Profile */}
                                <Link
                                    to={user.role === 'admin' ? '/admin' : '/profile'}
                                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-2 transition-all hover:scale-[1.02] ${isScrolled || !isDarkPage ? `border-gray-200 ${themeHoverBorder} bg-white shadow-sm` : 'border-white/20 hover:border-white/40 text-white bg-white/10 backdrop-blur-lg'}`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-ub-blue-hero to-ub-green-medium text-white flex items-center justify-center text-[10px] font-black shadow-inner">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-black">{user.name.split(' ')[0]}</span>
                                    {user.role === 'admin' && <ShieldCheck size={14} className={themeText} />}
                                </Link>

                                <button
                                    onClick={logout}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isScrolled || !isDarkPage ? 'text-gray-400 hover:text-red-500' : 'text-white/50 hover:text-red-400'}`}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link to="/login" className={`text-sm font-black transition-colors ${isScrolled || !isDarkPage ? `text-gray-500 ${themeHoverText}` : 'text-white/80 hover:text-white'}`}>
                                    Sign In
                                </Link>
                                <Link to="/report" className={`bg-gradient-to-r ${themeGradient} text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:${shadowColor} hover:-translate-y-0.5 transition-all flex items-center gap-2`}>
                                    Report Issue <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled || !isDarkPage ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="pt-24 px-6 flex flex-col gap-6 h-full relative">
                    <div className="flex flex-col gap-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Navigation</div>
                        {links.map((link) => (
                            <Link key={link.name} to={link.path} className={`text-3xl font-black py-2 ${location.pathname === link.path ? themeText : 'text-gray-800'}`}>
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pb-12">
                        {user ? (
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Account</div>
                                <Link to={user.role === 'admin' ? '/admin' : '/profile'} className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-ub-blue-hero to-ub-green-medium text-white flex items-center justify-center text-lg font-black shadow-lg">{user.name.charAt(0)}</div>
                                    <div>
                                        <div className="font-black text-xl text-gray-900 leading-tight">{user.name}</div>
                                        <div className={`text-[10px] font-black ${themeText} uppercase tracking-widest`}>{user.role}</div>
                                    </div>
                                </Link>

                                {/* Mobile Notifications */}
                                <Link to="/profile" className="flex items-center justify-between w-full py-3 px-4 bg-white rounded-xl border border-gray-200 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Bell size={16} className={themeText} />
                                        <span className="text-sm font-bold text-gray-700">Notifications</span>
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 font-black rounded-xl border border-red-100 uppercase tracking-widest text-xs">Sign Out</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/report" className={`w-full bg-gradient-to-r ${themeGradient} text-white py-4 rounded-xl font-black text-center text-lg shadow-lg flex items-center justify-center gap-2`}>
                                    Report Issue <ArrowRight size={20} />
                                </Link>
                                <Link to="/login" className="w-full bg-gray-100 text-gray-900 py-4 rounded-xl font-black text-center text-lg">
                                    Sign In / Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {location.pathname !== '/' && <div className="h-[80px]"></div>}
        </>
    );
}
