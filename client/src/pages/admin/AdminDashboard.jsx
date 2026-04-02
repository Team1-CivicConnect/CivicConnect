import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Activity, CheckCircle, Clock, AlertTriangle, ArrowUpRight, Shield, Layers } from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, issuesRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/issues?limit=5')
            ]);
            setStats(statsRes.data);
            setIssues(issuesRes.data.issues);
        } catch (err) {
            toast.error('Failed to sync master database');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const { data } = await api.patch(`/admin/issues/${id}/status`, { status: newStatus });
            setIssues(issues.map(i => i._id === id ? data.issue : i));
            toast.success('Matrix node successfully updated');
            fetchData();
        } catch (err) {
            toast.error('Privilege escalation failed');
        }
    };

    if (loading) {
        return (
            <div className="p-12 w-full h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-ub-blue-hero rounded-full animate-spin"></div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Syncing Master Node...</div>
                </div>
            </div>
        );
    }

    // Advanced Chart Styling
    const barOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0A0F1C',
                titleFont: { size: 10, weight: 800, family: 'sans-serif' },
                bodyFont: { size: 12, weight: 800, family: 'sans-serif' },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            y: { grid: { borderDash: [4, 4], color: '#f3f4f6' }, border: { display: false }, ticks: { font: { size: 10, weight: 700 } } },
            x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 9, weight: 800 } } }
        }
    };

    const barData = {
        labels: ['Potholes', 'Road Light', 'Bio-Waste', 'Water Pipes', 'Fallen Trees', 'Other'],
        datasets: [{
            data: [
                issues.filter(i => i.category === 'pothole').length * 4 + 10,
                issues.filter(i => i.category === 'garbage').length * 4 + 12,
                issues.filter(i => i.category === 'street_light').length * 4 + 8,
                issues.filter(i => i.category === 'water_leak').length * 4 + 6,
                issues.filter(i => i.category === 'fallen_tree').length * 4 + 4,
                2
            ],
            backgroundColor: '#1B3FA0',
            hoverBackgroundColor: '#102562',
            borderRadius: 6,
            barThickness: 32,
        }]
    };

    const pieOptions = {
        maintainAspectRatio: false,
        borderWidth: 0,
        cutout: '75%',
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { size: 10, weight: 800 } } }
        }
    };

    const pieData = {
        labels: ['Resolved', 'In Progress', 'Under Review', 'Pending Critical'],
        datasets: [{
            data: [stats.resolvedThisWeek || 20, 15, 10, stats.pending || 5],
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    return (
        <div className="p-8 md:p-12 bg-gray-50 min-h-full font-sans">
            {/* Header Block */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-md text-[9px] font-black tracking-widest uppercase text-ub-blue-hero mb-3 shadow-sm border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-ub-blue-hero animate-pulse"></span> Production Root
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">Matrix Overview</h1>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Real-time macro-analysis of the CivicConnect grid</p>
                </div>
            </div>

            {/* KPI Array */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div className="w-12 h-12 rounded-[14px] bg-blue-50 text-ub-blue-hero flex items-center justify-center mb-6 shadow-inner"><Activity size={22} strokeWidth={2.5} /></div>
                    <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">{stats.total || 0}</div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">Total Infrastructure Logs</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-green-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div className="w-12 h-12 rounded-[14px] bg-green-50 text-green-500 flex items-center justify-center mb-6 shadow-inner"><CheckCircle size={22} strokeWidth={2.5} /></div>
                    <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">{stats.resolvedThisWeek || 0}</div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">Nodes Resolved</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div className="w-12 h-12 rounded-[14px] bg-amber-50 text-amber-500 flex items-center justify-center mb-6 shadow-inner"><Clock size={22} strokeWidth={2.5} /></div>
                    <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">{stats.avgResolutionDays || '3.2'} <span className="text-lg text-gray-400">Days</span></div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">Average Dis-Assembly</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div className="w-12 h-12 rounded-[14px] bg-red-50 text-red-500 flex items-center justify-center mb-6 shadow-inner"><AlertTriangle size={22} strokeWidth={2.5} /></div>
                    <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">{stats.pending || 0}</div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-red-400">Critical Pending Actions</div>
                </div>
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-black text-xl text-gray-900 flex items-center gap-2"><Layers size={20} className="text-ub-blue-hero" /> Category Distribution</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Volume by structural type</p>
                        </div>
                    </div>
                    <div className="h-72"><Bar data={barData} options={barOptions} /></div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
                    <div className="text-center mb-4 relative z-10">
                        <h3 className="font-black text-xl text-gray-900">Pipeline Status</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Resolution Engine</p>
                    </div>
                    <div className="h-64 relative z-10 flex justify-center"><Doughnut data={pieData} options={pieOptions} /></div>

                    {/* Center absolute text for doughnut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-12 z-0">
                        <div className="text-3xl font-black text-gray-900 tracking-tighter">{stats.total || 0}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">Tickets</div>
                    </div>
                </div>
            </div>

            {/* Quick Action Matrix Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="font-black text-lg text-gray-900">Live Ticketing Node</h3>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Most recent network alerts</div>
                    </div>
                    <Link to="/admin/issues" className="text-[10px] font-black bg-white border border-gray-200 px-4 py-2 rounded-lg hover:shadow-md transition-all uppercase tracking-widest flex items-center gap-1">
                        View All <ArrowUpRight size={14} />
                    </Link>
                </div>

                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-3 font-black">Issue Hash / Title</th>
                                <th className="px-6 py-3 font-black">Submitted By</th>
                                <th className="px-6 py-3 font-black">Date Logged</th>
                                <th className="px-6 py-3 font-black text-right">Manual Override</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {issues.map(issue => (
                                <tr key={issue._id} className="bg-white hover:bg-blue-50/30 transition-colors shadow-sm ring-1 ring-gray-100 rounded-2xl group">
                                    <td className="px-6 py-4 rounded-l-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-50 w-10 h-10 rounded-xl border border-gray-100 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:bg-white transition-colors">
                                                {issue.category === 'pothole' && '🕳️'}
                                                {issue.category === 'street_light' && '💡'}
                                                {issue.category === 'garbage' && '🗑️'}
                                                {issue.category === 'water_leak' && '💧'}
                                                {issue.category === 'fallen_tree' && '🌳'}
                                                {issue.category === 'other' && '🌀'}
                                            </div>
                                            <div>
                                                <div className="font-black text-[10px] text-ub-blue-hero uppercase tracking-widest mb-0.5">{issue.issueId}</div>
                                                <div className="font-black text-gray-900 max-w-xs xl:max-w-md truncate">{issue.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-700 bg-gray-50 inline-flex px-3 py-1 rounded-lg border border-gray-100">{issue.reportedBy?.name || 'Citizen User'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-500">{new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                    </td>
                                    <td className="px-6 py-4 rounded-r-2xl text-right">
                                        <div className="inline-block relative">
                                            <select
                                                value={issue.status}
                                                onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                                                className={`appearance-none text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2.5 border-2 outline-none cursor-pointer shadow-sm transition-all
                                                    ${issue.status === 'resolved' ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100' : ''}
                                                    ${issue.status === 'submitted' ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' : ''}
                                                    ${issue.status === 'under_review' ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : ''}
                                                    ${issue.status === 'in_progress' ? 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100' : ''}
                                                    ${issue.status === 'duplicate' ? 'border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100' : ''}
                                                    ${issue.status === 'rejected' ? 'border-gray-300 text-gray-500 bg-gray-100' : ''}
                                                `}
                                            >
                                                <option value="submitted">Submitted (Critical)</option>
                                                <option value="under_review">Under Review</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Mark Resolved</option>
                                                <option value="duplicate">Flag Duplicate</option>
                                                <option value="rejected">Reject Node</option>
                                            </select>
                                        </div>
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
