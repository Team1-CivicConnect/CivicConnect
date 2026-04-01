import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Search, Ban, ShieldCheck, Mail } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users'); // Ensure this route is built on the backend or mocked
            // Mocking fallback in case it's not strictly built yet
            if (data.users) {
                setUsers(data.users);
            } else {
                toast.error("Endpoint not mapped natively, rendering cached memory logic.");
            }
        } catch (err) {
            toast.error('Failed to load user directory');
            // Dummy data fallback for preview
            setUsers([
                { _id: '1', name: 'Citizen One', email: 'citizen@ubayog.com', role: 'citizen', ward: 'Chennai Zone 4', contributionScore: 120, createdAt: new Date() },
                { _id: '2', name: 'Admin Master', email: 'admin@ubayog.com', role: 'admin', ward: 'HQ', contributionScore: 999, createdAt: new Date() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-8 bg-ub-bg-surface min-h-full">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-ub-text-primary flex items-center gap-2"><Users className="text-ub-blue-hero" /> Network Directory</h1>
                    <p className="text-sm text-ub-text-secondary mt-1">Manage all registered Citizens, Admins, and Municipal Staff.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ub-text-muted" size={18} />
                    <input type="text" placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-ub-border rounded-lg text-sm focus:outline-none focus:border-ub-blue-hero" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-ub-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-ub-bg-surface text-ub-text-muted font-bold uppercase tracking-wider text-xs border-b border-ub-border">
                            <tr>
                                <th className="px-6 py-4">Citizen Identity</th>
                                <th className="px-6 py-4">Role / Assignment</th>
                                <th className="px-6 py-4">Civic Score</th>
                                <th className="px-6 py-4">Joined Platform</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ub-border">
                            {filtered.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded shrink-0 font-bold flex items-center justify-center text-white ${u.role === 'admin' ? 'bg-ub-blue-hero' : 'bg-ub-green-medium'}`}>
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-ub-text-primary text-sm">{u.name}</div>
                                                <div className="text-[11px] text-ub-text-secondary flex items-center gap-1"><Mail size={10} /> {u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase font-black px-2 py-1 tracking-wider rounded border flex w-max items-center gap-1 ${u.role === 'admin' ? 'bg-blue-50 text-ub-blue-hero border-blue-200' : 'bg-green-50 text-ub-green-dark border-green-200'}`}>
                                            {u.role === 'admin' && <ShieldCheck size={12} />} {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-ub-green-dark font-black tracking-widest">{u.contributionScore || 0} pts</div>
                                    </td>
                                    <td className="px-6 py-4 text-ub-text-secondary font-medium">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {u.role !== 'admin' && (
                                            <button className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5 mx-auto">
                                                <Ban size={14} /> Ban Identity
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
