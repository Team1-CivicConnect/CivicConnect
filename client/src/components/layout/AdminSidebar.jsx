import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, AlertCircle, Map as MapIcon, Users, LogOut, Shield, Trophy } from 'lucide-react';

export default function AdminSidebar() {
    const { logout, user } = useAuth();
    const location = useLocation();

    const links = [
        { name: 'Analytics', path: '/admin', icon: LayoutDashboard },
        { name: 'Command Center', path: '/admin/map', icon: MapIcon },
        { name: 'Issue Database', path: '/admin/issues', icon: AlertCircle },
        { name: 'Citizen Registry', path: '/admin/users', icon: Users },
        { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
    ];

    return (
        <aside className="w-64 bg-[#0A0F1C] text-gray-300 h-full flex flex-col shrink-0 border-r border-gray-800 relative z-50">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-40 bg-ub-blue-hero blur-[100px] opacity-10 pointer-events-none"></div>

            <div className="p-8 border-b border-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-ub-blue-hero flex items-center justify-center text-white shadow-[0_0_15px_rgba(27,63,160,0.5)]">
                        <Shield size={16} fill="currentColor" />
                    </div>
                    <div>
                        <div className="font-black text-lg tracking-tight text-white leading-none">
                            Civic<span className="text-green-400">Connect</span>
                        </div>
                        <div className="text-[9px] text-ub-blue-hero mt-1 uppercase tracking-widest font-black">
                            Admin Console
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 ml-2">Core Systems</div>
                <nav className="space-y-2">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path ||
                            (link.path !== '/admin' && location.pathname.startsWith(link.path));
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isActive
                                    ? 'bg-ub-blue-hero text-white shadow-[0_4px_20px_rgba(27,63,160,0.4)] scale-105'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:scale-[1.02]'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-800/50 bg-black/20">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 text-white font-black">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-sm font-black text-white truncate">{user?.name || 'Administrator'}</div>
                        <div className="text-[10px] font-bold text-gray-500 truncate">{user?.email || 'admin@ubayog.com'}</div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-400/20 hover:border-red-500 shadow-sm"
                >
                    <LogOut size={16} />
                    Disconnect
                </button>
            </div>
        </aside>
    );
}
