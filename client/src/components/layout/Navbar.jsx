import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
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

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const links = [
        { name: 'Home', path: '/' },
        { name: 'Live Map', path: '/map' },
        { name: 'About', path: '/about' },
    ];

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-ub-border py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">

                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ub-blue-hero to-ub-green-medium flex items-center justify-center text-white font-black shadow-lg group-hover:scale-105 transition-transform">
                                C
                            </div>
                            <div className={`font-black text-xl tracking-tight transition-colors ${isScrolled ? 'text-gray-900' : (location.pathname === '/' ? 'text-white' : 'text-gray-900')}`}>
                                Ubayog<span className="text-ub-green-medium">CivicConnect</span>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center gap-1 bg-gray-100/50 backdrop-blur-sm p-1 rounded-full border border-gray-200/50">
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all ${location.pathname === link.path ? 'bg-white text-ub-green-dark shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="hidden md:flex items-center gap-4">
                                <Link to={user.role === 'admin' ? '/admin' : '/profile'} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-colors ${isScrolled ? 'border-gray-200 hover:border-ub-blue-hero bg-white' : (location.pathname === '/' ? 'border-white/20 hover:border-white text-white bg-white/10' : 'border-gray-200 hover:border-ub-blue-hero bg-white')}`}>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-ub-green-medium to-ub-blue-hero text-white flex items-center justify-center text-[10px] font-black">{user.name.charAt(0)}</div>
                                    <span className="text-sm font-bold">{user.name.split(' ')[0]}</span>
                                    {user.role === 'admin' && <ShieldCheck size={14} className="text-ub-blue-hero" />}
                                </Link>
                                <button onClick={logout} className={`text-xs font-bold transition-colors ${isScrolled || location.pathname !== '/' ? 'text-gray-500 hover:text-red-500' : 'text-white/70 hover:text-red-400'}`}>Logout</button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link to="/login" className={`text-sm font-bold transition-colors ${isScrolled || location.pathname !== '/' ? 'text-gray-600 hover:text-ub-blue-hero' : 'text-white/90 hover:text-white'}`}>
                                    Sign In
                                </Link>
                                <Link to="/report" className="bg-ub-green-medium text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                    Report Issue <ArrowRight size={16} />
                                </Link>
                            </div>
                        )}

                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled || location.pathname !== '/' ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                </div>
            </nav>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="pt-24 px-6 flex flex-col gap-6 h-full relative">
                    <div className="flex flex-col gap-2">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Navigation</div>
                        {links.map((link) => (
                            <Link key={link.name} to={link.path} className={`text-3xl font-black py-2 ${location.pathname === link.path ? 'text-ub-blue-hero' : 'text-gray-800'}`}>
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pb-12">
                        {user ? (
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                                <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Account</div>
                                <Link to={user.role === 'admin' ? '/admin' : '/profile'} className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-ub-green-medium to-ub-blue-hero text-white flex items-center justify-center text-lg font-black">{user.name.charAt(0)}</div>
                                    <div>
                                        <div className="font-black text-xl text-gray-900 leading-tight">{user.name}</div>
                                        <div className="text-sm font-bold text-ub-green-medium uppercase tracking-wider">{user.role}</div>
                                    </div>
                                </Link>
                                <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100">Sign Out</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/report" className="w-full bg-ub-green-medium text-white py-4 rounded-xl font-black text-center text-lg shadow-lg flex items-center justify-center gap-2">
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

            {/* Spacer to push content down so fixed navbar doesn't overlap non-hero screens */}
            {location.pathname !== '/' && <div className="h-[80px]"></div>}
        </>
    );
}
