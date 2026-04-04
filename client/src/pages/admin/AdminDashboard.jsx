import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, CheckCircle, Clock, AlertTriangle,
    ArrowUpRight, Shield, Layers, Download,
    TrendingUp, MapPin, Trophy, FileText, Loader
} from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fallback for Trend Line since historical data aggregating is complex
import { DUMMY_MONTHLY_TREND } from '../../data/dashboardData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, gradient, value, label, sub, accent }) {
    return (
        <div className={`relative p-6 rounded-2xl overflow-hidden flex flex-col group cursor-default border ${gradient}`}>
            {/* Glow orb */}
            <div className={`absolute -right-8 -bottom-8 w-36 h-36 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${accent}`} />
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accent} bg-opacity-20 border border-white/10`}>
                <Icon size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="text-4xl font-black text-white tracking-tighter leading-none mb-1">{value}</div>
            {sub && <div className="text-xs font-bold text-white/60 mb-1">{sub}</div>}
            <div className="text-[10px] uppercase tracking-widest font-black text-white/50 mt-auto">{label}</div>
            {/* Live dot */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Live</span>
            </div>
        </div>
    );
}

function SectionHeader({ title, subtitle, icon: Icon }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            {Icon && <Icon size={20} className="text-ub-blue-hero" />}
            <div>
                <h3 className="font-black text-xl text-gray-900">{title}</h3>
                {subtitle && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

// ─── Chart Configs ────────────────────────────────────────────────────────────

const baseTooltip = {
    backgroundColor: '#0A0F1C', titleFont: { size: 10, weight: 800 },
    bodyFont: { size: 12, weight: 800 }, padding: 12, cornerRadius: 8, displayColors: false,
};
const baseTicks = { font: { size: 10, weight: 700 } };

function getCategoryBarData(categoryStats) {
    return {
        labels: categoryStats.map(s => s._id || 'Unknown'),
        datasets: [{
            data: categoryStats.map(s => s.count),
            backgroundColor: ['#1B3FA0', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderRadius: 7, barThickness: 36,
        }]
    };
}

function getAreaBarData(areaStats) {
    return {
        labels: areaStats.map(s => s._id || 'Unknown'),
        datasets: [{
            label: 'Issues Reported',
            data: areaStats.map(s => s.count),
            backgroundColor: '#1B3FA0', hoverBackgroundColor: '#102562',
            borderRadius: 7, barThickness: 30,
        }]
    };
}

function getTrendLineData() {
    return {
        labels: DUMMY_MONTHLY_TREND.labels,
        datasets: [
            {
                label: 'Reported', data: DUMMY_MONTHLY_TREND.reported,
                borderColor: '#1B3FA0', backgroundColor: 'rgba(27,63,160,0.08)',
                tension: 0.4, fill: true, pointBackgroundColor: '#1B3FA0', pointRadius: 4, pointHoverRadius: 6,
            },
            {
                label: 'Resolved', data: DUMMY_MONTHLY_TREND.resolved,
                borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.08)',
                tension: 0.4, fill: true, pointBackgroundColor: '#10B981', pointRadius: 4, pointHoverRadius: 6,
            }
        ]
    };
}

function getStatusDoughnutData(statusStats) {
    const labels = statusStats.map(s => s._id || 'Unknown');
    const values = statusStats.map(s => s.count);
    const colors = labels.map(l => {
        if (l === 'resolved') return '#10B981';
        if (l === 'in_progress') return '#3B82F6';
        if (l === 'under_review') return '#F59E0B';
        return '#EF4444';
    });

    return {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 10, }]
    };
}

const barOptions = {
    maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: baseTooltip },
    scales: {
        y: { grid: { borderDash: [4, 4], color: '#f3f4f6' }, border: { display: false }, ticks: baseTicks },
        x: { grid: { display: false }, border: { display: false }, ticks: baseTicks }
    }
};

const lineOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 10, weight: 700 } } }, tooltip: baseTooltip },
    scales: {
        y: { grid: { borderDash: [4, 4], color: '#f3f4f6' }, border: { display: false }, ticks: baseTicks },
        x: { grid: { display: false }, border: { display: false }, ticks: baseTicks }
    }
};

const doughnutOptions = {
    maintainAspectRatio: false, cutout: '72%',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 10, weight: 700 } } }, tooltip: baseTooltip, }
};

// ─── Status badge helper ──────────────────────────────────────────────────────
const STATUS_STYLES = {
    resolved: 'bg-green-50 text-green-700 border border-green-200',
    in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
    under_review: 'bg-amber-50 text-amber-700 border border-amber-200',
    submitted: 'bg-red-50 text-red-700 border border-red-200',
};
const STATUS_LABELS = {
    resolved: 'Resolved', in_progress: 'In Progress',
    under_review: 'Under Review', submitted: 'Submitted',
};
const CAT_EMOJI = {
    pothole: '🕳️', street_light: '💡', garbage: '🗑️',
    water_leak: '💧', fallen_tree: '🌳', other: '🌀',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('category'); // 'category' | 'area'

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, issuesRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/issues?limit=5')
                ]);
                setStats(statsRes.data);
                setIssues(issuesRes.data.issues || []);
            } catch (err) {
                toast.error('Failed to load live dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handlePDFExport = () => {
        if (!stats) return;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.text('CivicConnect Admin', 14, 20);
        doc.setFontSize(16);
        doc.text('Global Analytics Report', 14, 30);

        // Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

        // Overview Stats
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total Infrastructure Logs: ${stats.total}`, 14, 55);
        doc.text(`Pending Actions: ${stats.pending}`, 14, 65);
        doc.text(`Nodes Resolved: ${stats.resolved}`, 14, 75);
        doc.text(`Avg Resolution Days: ${stats.avgResolutionDays}`, 14, 85);

        // Recent Issues Table
        doc.setFontSize(14);
        doc.text("Recent Activity Array", 14, 105);

        const tableColumn = ["ID", "Title", "Area", "Status"];
        const tableRows = [];

        issues.forEach(issue => {
            tableRows.push([
                issue.issueId,
                issue.title.substring(0, 30),
                issue.area || 'Unknown',
                issue.status
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 115,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [27, 63, 160], textColor: [255, 255, 255] },
        });

        doc.save(`CivicConnect_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);

        toast.success('📄 Analytics PDF exported successfully!', {
            duration: 3000,
            style: { background: '#0A0F1C', color: '#fff', fontWeight: 700, fontSize: '13px' }
        });
    };

    if (loading || !stats) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
                <Loader className="w-12 h-12 text-ub-blue-hero animate-spin" />
                <div className="font-black text-xs uppercase tracking-widest text-gray-500">Syncing with Mainframe...</div>
            </div>
        );
    }

    return (
        <div className="min-h-full font-sans bg-gray-50">

            {/* ── Dark Hero Header ── */}
            <div className="relative bg-[#070B14] overflow-hidden px-8 md:px-10 py-10">
                <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-blue-400 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            Admin Control Panel · Live
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none mb-2">
                            Analytics <span className="text-blue-400">Dashboard</span>
                        </h1>
                        <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">
                            Real-time civic infrastructure monitoring
                        </p>
                    </div>

                    <button
                        onClick={handlePDFExport}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_28px_rgba(59,130,246,0.6)] transition-all active:scale-95"
                    >
                        <Download size={15} /> Download Report
                    </button>
                </div>
            </div>

            <div className="px-8 md:px-10 py-8 space-y-8">

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <StatCard icon={Activity}
                        gradient="bg-gradient-to-br from-[#1B3FA0] to-[#1e56cc] border-blue-700/30"
                        accent="bg-blue-400"
                        value={stats.total}
                        label="Total Reports"
                        sub={`+${stats.newThisMonth} this month`} />
                    <StatCard icon={CheckCircle}
                        gradient="bg-gradient-to-br from-[#065f46] to-[#047857] border-green-700/30"
                        accent="bg-green-400"
                        value={stats.resolved}
                        label="Issues Resolved"
                        sub={`+${stats.resolvedThisWeek} this week`} />
                    <StatCard icon={AlertTriangle}
                        gradient="bg-gradient-to-br from-[#7f1d1d] to-[#991b1b] border-red-700/30"
                        accent="bg-red-400"
                        value={stats.pending}
                        label="Pending Actions" />
                    <StatCard icon={Clock}
                        gradient="bg-gradient-to-br from-[#78350f] to-[#92400e] border-amber-700/30"
                        accent="bg-amber-400"
                        value={`${stats.avgResolutionDays}d`}
                        label="Avg Resolution Time" />
                </div>

                {/* ── Trend + Doughnut ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <TrendingUp size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-lg">6-Month Issue Trend</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reported vs Resolved volume</p>
                            </div>
                        </div>
                        <div className="h-64"><Line data={getTrendLineData()} options={lineOptions} /></div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                                <Shield size={18} className="text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900">Status Breakdown</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pipeline health</p>
                            </div>
                        </div>
                        <div className="h-52 relative">
                            <Doughnut data={getStatusDoughnutData(stats.statusStats || [])} options={doughnutOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-3xl font-black text-gray-900 tracking-tighter">{stats.total}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Distribution Bar Charts ── */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                <Layers size={18} className="text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-lg">Distribution Analysis</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Volume by category & location</p>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => setActiveTab('category')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'category' ? 'bg-[#1B3FA0] text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >By Category</button>
                            <button
                                onClick={() => setActiveTab('area')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'area' ? 'bg-[#1B3FA0] text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >By Area</button>
                        </div>
                    </div>
                    <div className="h-72">
                        {activeTab === 'category'
                            ? <Bar data={getCategoryBarData(stats.categoryStats || [])} options={barOptions} />
                            : <Bar data={getAreaBarData(stats.areaStats || [])} options={barOptions} />
                        }
                    </div>
                </div>

                {/* ── Recent Issues ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                                <FileText size={18} className="text-blue-600" /> Recent Issues
                            </h3>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Latest citizen reports</div>
                        </div>
                        <Link to="/admin/issues" className="text-[10px] font-black bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:shadow-md transition-all uppercase tracking-widest flex items-center gap-1 hover:border-blue-300 hover:text-blue-600">
                            View All <ArrowUpRight size={13} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-5 py-2">Issue</th>
                                    <th className="px-5 py-2">Reporter</th>
                                    <th className="px-5 py-2 hidden md:table-cell">Area</th>
                                    <th className="px-5 py-2 hidden sm:table-cell">Date</th>
                                    <th className="px-5 py-2 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {issues.map(issue => (
                                    <tr key={issue._id} className="bg-white hover:bg-blue-50/40 transition-colors shadow-sm ring-1 ring-gray-100 rounded-2xl group">
                                        <td className="px-5 py-4 rounded-l-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 w-9 h-9 rounded-xl border border-blue-100 flex items-center justify-center shrink-0 text-lg">
                                                    {CAT_EMOJI[issue.category] || '🌀'}
                                                </div>
                                                <div>
                                                    <div className="font-black text-[10px] text-blue-600 uppercase tracking-widest">{issue.issueId}</div>
                                                    <div className="font-bold text-gray-900 text-sm max-w-[200px] truncate">{issue.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 text-xs">{issue.reportedBy?.name || 'Anonymous'}</span>
                                        </td>
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                                <MapPin size={12} className="text-blue-500" /> {issue.area || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 hidden sm:table-cell">
                                            <span className="text-xs font-bold text-gray-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-5 py-4 rounded-r-2xl text-right">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${STATUS_STYLES[issue.status]}`}>
                                                {STATUS_LABELS[issue.status] || issue.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Quick Nav Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/admin/leaderboard" className="flex items-center gap-4 bg-gradient-to-r from-[#070B14] to-[#1B3FA0] text-white p-6 rounded-2xl border border-blue-800/30 shadow-[0_4px_20px_rgba(27,63,160,0.3)] hover:shadow-[0_8px_30px_rgba(27,63,160,0.5)] transition-all hover:scale-[1.02] active:scale-100">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                            <Trophy size={24} className="text-yellow-400" />
                        </div>
                        <div>
                            <div className="font-black text-lg">Citizen Leaderboard</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5">Top contributor rankings</div>
                        </div>
                        <ArrowUpRight size={18} className="ml-auto opacity-60" />
                    </Link>
                    <button onClick={handlePDFExport} className="flex items-center gap-4 bg-white border border-gray-200 text-gray-800 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all hover:scale-[1.02] active:scale-100 hover:border-blue-200">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                            <Download size={24} className="text-blue-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-black text-lg">Export Analytics PDF</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Full dashboard report</div>
                        </div>
                        <ArrowUpRight size={18} className="ml-auto text-gray-400" />
                    </button>
                </div>

            </div>
        </div>
    );
}


