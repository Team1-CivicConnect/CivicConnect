import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, AlertCircle, Map, Users, LogOut, Settings } from 'lucide-react';

export default function AdminSidebar() {
    const { logout } = useAuth();
    const location = useLocation();

    const links = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'All Issues', path: '/admin/issues', icon: AlertCircle },
        { name: 'Map View', path: '/admin/map', icon: Map },
        { name: 'Users', path: '/admin/users', icon: Users },
    ];

    return (
        <aside className="w-64 bg-ub-blue-dark text-white h-full flex flex-col shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-white/10">
                <div className="font-bold text-2xl tracking-tight text-white flex items-center gap-2">
                    UBAYOG
                </div>
                <div className="text-xs text-blue-200 mt-1 uppercase tracking-wider font-semibold">
                    Admin Panel
                </div>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path ||
                        (link.path !== '/admin' && location.pathname.startsWith(link.path));
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-ub-blue-hero text-white'
                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon size={18} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
