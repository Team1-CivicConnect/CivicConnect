import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    const textColor = isScrolled ? 'text-gray-900' : (isDarkPage ? 'text-white' : 'text-gray-900');

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border-b border-gray-100 py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">

                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-3 group">
                            {/* Premium Gradient Logo Mark */}
                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ub-blue-hero via-[#2563EB] to-ub-green-medium flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:shadow-[0_4px_20px_rgba(27,63,160,0.4)] group-hover:scale-110 transition-all duration-300">
                                    CC
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                            </div>
                            <div className={`font-black text-xl tracking-tight transition-colors duration-300 ${textColor}`}>
                                Civic<span className={`${isScrolled ? 'text-ub-blue-hero' : (isDarkPage ? 'text-green-400' : 'text-ub-blue-hero')}`}>Connect</span>
                            </div>
                        </Link>

                        <div className={`hidden md:flex items-center gap-1 p-1 rounded-full border ${isScrolled ? 'bg-gray-50 border-gray-200' : (isDarkPage ? 'bg-white/10 backdrop-blur-lg border-white/10' : 'bg-gray-50 border-gray-200')}`}>
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${location.pathname === link.path
                                            ? (isScrolled || !isDarkPage ? 'bg-white text-ub-blue-hero shadow-sm' : 'bg-white/20 text-white shadow-sm')
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
                            <div className="hidden md:flex items-center gap-4">
                                <Link to={user.role === 'admin' ? '/admin' : '/profile'} className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-2 transition-all hover:scale-[1.02] ${isScrolled || !isDarkPage ? 'border-gray-200 hover:border-ub-blue-hero bg-white shadow-sm' : 'border-white/20 hover:border-white/40 text-white bg-white/10 backdrop-blur-lg'}`}>
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-ub-blue-hero to-ub-green-medium text-white flex items-center justify-center text-[10px] font-black shadow-inner">{user.name.charAt(0)}</div>
                                    <span className="text-sm font-black">{user.name.split(' ')[0]}</span>
                                    {user.role === 'admin' && <ShieldCheck size={14} className="text-ub-blue-hero" />}
                                </Link>
                                <button onClick={logout} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isScrolled || !isDarkPage ? 'text-gray-400 hover:text-red-500' : 'text-white/50 hover:text-red-400'}`}>Logout</button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link to="/login" className={`text-sm font-black transition-colors ${isScrolled || !isDarkPage ? 'text-gray-500 hover:text-ub-blue-hero' : 'text-white/80 hover:text-white'}`}>
                                    Sign In
                                </Link>
                                <Link to="/report" className="bg-gradient-to-r from-ub-blue-hero to-[#2563EB] text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:shadow-[0_8px_20px_rgba(27,63,160,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                    Report Issue <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}

                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled || !isDarkPage ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
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
                            <Link key={link.name} to={link.path} className={`text-3xl font-black py-2 ${location.pathname === link.path ? 'text-ub-blue-hero' : 'text-gray-800'}`}>
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
                                        <div className="text-[10px] font-black text-ub-blue-hero uppercase tracking-widest">{user.role}</div>
                                    </div>
                                </Link>
                                <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 font-black rounded-xl border border-red-100 uppercase tracking-widest text-xs">Sign Out</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/report" className="w-full bg-gradient-to-r from-ub-blue-hero to-[#2563EB] text-white py-4 rounded-xl font-black text-center text-lg shadow-lg flex items-center justify-center gap-2">
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
