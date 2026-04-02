import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, CheckCircle, Clock, AlertTriangle,
    ArrowUpRight, Shield, Layers, Download,
    TrendingUp, MapPin, Trophy, FileText
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import {
    DUMMY_STATS,
    DUMMY_CATEGORY_DATA,
    DUMMY_AREA_DATA,
    DUMMY_MONTHLY_TREND,
    DUMMY_STATUS_BREAKDOWN,
    DUMMY_ISSUES,
} from '../../data/dashboardData';

ChartJS.register(
    CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement,
    Title, Tooltip, Legend, Filler
);

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconBg, iconColor, value, label, sub }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] transition-all flex flex-col relative overflow-hidden group">
            <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-700 pointer-events-none ${iconBg}`} />
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-5 shadow-inner ${iconBg} ${iconColor}`}>
                <Icon size={22} strokeWidth={2.5} />
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-1">{value}</div>
            {sub && <div className="text-xs font-bold text-green-500 mb-1">{sub}</div>}
            <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">{label}</div>
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
    backgroundColor: '#0A0F1C',
    titleFont: { size: 10, weight: 800 },
    bodyFont: { size: 12, weight: 800 },
    padding: 12,
    cornerRadius: 8,
    displayColors: false,
};

const baseTicks = { font: { size: 10, weight: 700 } };

function getCategoryBarData() {
    return {
        labels: DUMMY_CATEGORY_DATA.labels,
        datasets: [{
            data: DUMMY_CATEGORY_DATA.values,
            backgroundColor: [
                '#1B3FA0', '#3B82F6', '#10B981',
                '#F59E0B', '#EF4444', '#8B5CF6'
            ],
            borderRadius: 7,
            barThickness: 36,
        }]
    };
}

function getAreaBarData() {
    return {
        labels: DUMMY_AREA_DATA.labels,
        datasets: [{
            label: 'Issues Reported',
            data: DUMMY_AREA_DATA.values,
            backgroundColor: '#1B3FA0',
            hoverBackgroundColor: '#102562',
            borderRadius: 7,
            barThickness: 30,
        }]
    };
}

function getTrendLineData() {
    return {
        labels: DUMMY_MONTHLY_TREND.labels,
        datasets: [
            {
                label: 'Reported',
                data: DUMMY_MONTHLY_TREND.reported,
                borderColor: '#1B3FA0',
                backgroundColor: 'rgba(27,63,160,0.08)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#1B3FA0',
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Resolved',
                data: DUMMY_MONTHLY_TREND.resolved,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16,185,129,0.08)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#10B981',
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };
}

function getStatusDoughnutData() {
    return {
        labels: DUMMY_STATUS_BREAKDOWN.labels,
        datasets: [{
            data: DUMMY_STATUS_BREAKDOWN.values,
            backgroundColor: DUMMY_STATUS_BREAKDOWN.colors,
            borderWidth: 0,
            hoverOffset: 10,
        }]
    };
}

const barOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: baseTooltip },
    scales: {
        y: { grid: { borderDash: [4, 4], color: '#f3f4f6' }, border: { display: false }, ticks: baseTicks },
        x: { grid: { display: false }, border: { display: false }, ticks: baseTicks }
    }
};

const lineOptions = {
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 10, weight: 700 } } },
        tooltip: baseTooltip
    },
    scales: {
        y: { grid: { borderDash: [4, 4], color: '#f3f4f6' }, border: { display: false }, ticks: baseTicks },
        x: { grid: { display: false }, border: { display: false }, ticks: baseTicks }
    }
};

const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 10, weight: 700 } } },
        tooltip: baseTooltip,
    }
};

// ─── Status badge helper ──────────────────────────────────────────────────────
const STATUS_STYLES = {
    resolved:     'bg-green-50 text-green-700 border border-green-200',
    in_progress:  'bg-blue-50 text-blue-700 border border-blue-200',
    under_review: 'bg-amber-50 text-amber-700 border border-amber-200',
    submitted:    'bg-red-50 text-red-700 border border-red-200',
};
const STATUS_LABELS = {
    resolved: 'Resolved', in_progress: 'In Progress',
    under_review: 'Under Review', submitted: 'Submitted',
};
const CAT_EMOJI = {
    pothole: '🕳️', street_light: '💡', garbage: '🗑️',
    water_leak: '💧', fallen_tree: '🌳', other: '🌀',
};

// ─── PDF Export handler (UI only) ─────────────────────────────────────────────
function handlePDFExport() {
    toast.success('📄 Report queued for PDF export — Ready for download!', {
        duration: 3000,
        style: { background: '#0A0F1C', color: '#fff', fontWeight: 700, fontSize: '13px' }
    });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const stats = DUMMY_STATS;
    const issues = DUMMY_ISSUES;
    const [activeTab, setActiveTab] = useState('category'); // 'category' | 'area'

    return (
        <div className="p-8 md:p-10 bg-gray-50 min-h-full font-sans">

            {/* ── Header ── */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-md text-[9px] font-black tracking-widest uppercase text-ub-blue-hero mb-3 shadow-sm border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-ub-blue-hero animate-pulse" />
                        Production Root
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">Matrix Overview</h1>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                        Real-time macro-analysis of the CivicConnect grid
                    </p>
                </div>

                {/* PDF Export Button */}
                <button
                    id="btn-pdf-export"
                    onClick={handlePDFExport}
                    className="inline-flex items-center gap-2 bg-ub-blue-hero hover:bg-ub-blue-dark text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(27,63,160,0.35)] hover:shadow-[0_6px_28px_rgba(27,63,160,0.5)] transition-all active:scale-95"
                >
                    <Download size={15} />
                    Download Report
                </button>
            </div>

            {/* ── KPI Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                <StatCard
                    icon={Activity}
                    iconBg="bg-blue-50"
                    iconColor="text-ub-blue-hero"
                    value={stats.total}
                    label="Total Infrastructure Logs"
                    sub={`+${stats.newThisMonth} this month`}
                />
                <StatCard
                    icon={CheckCircle}
                    iconBg="bg-green-50"
                    iconColor="text-green-500"
                    value={stats.resolved}
                    label="Nodes Resolved"
                    sub={`+${stats.resolvedThisWeek} this week`}
                />
                <StatCard
                    icon={AlertTriangle}
                    iconBg="bg-red-50"
                    iconColor="text-red-500"
                    value={stats.pending}
                    label="Pending Critical Actions"
                />
                <StatCard
                    icon={Clock}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-500"
                    value={`${stats.avgResolutionDays}`}
                    label="Avg Resolution (Days)"
                />
            </div>

            {/* ── Analytics: Trend Line + Doughnut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Trend Line Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                    <SectionHeader icon={TrendingUp} title="6-Month Issue Trend" subtitle="Reported vs Resolved volume" />
                    <div className="h-64">
                        <Line data={getTrendLineData()} options={lineOptions} />
                    </div>
                </div>

                {/* Status Doughnut */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
                    <SectionHeader icon={Shield} title="Pipeline Status" subtitle="Resolution engine breakdown" />
                    <div className="h-52 relative">
                        <Doughnut data={getStatusDoughnutData()} options={doughnutOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <div className="text-3xl font-black text-gray-900 tracking-tighter">{stats.total}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Analytics: Category & Area Bar Charts (tabbed) ── */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <SectionHeader icon={Layers} title="Distribution Analysis" subtitle="Volume by category & location" />
                    <div className="flex gap-2 shrink-0">
                        <button
                            id="tab-category"
                            onClick={() => setActiveTab('category')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'category' ? 'bg-ub-blue-hero text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            By Category
                        </button>
                        <button
                            id="tab-area"
                            onClick={() => setActiveTab('area')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'area' ? 'bg-ub-blue-hero text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            By Area
                        </button>
                    </div>
                </div>
                <div className="h-72">
                    {activeTab === 'category'
                        ? <Bar data={getCategoryBarData()} options={barOptions} />
                        : <Bar data={getAreaBarData()} options={barOptions} />
                    }
                </div>
            </div>

            {/* ── Recent Issues Table ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden mb-8">
                <div className="px-8 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50">
                    <div>
                        <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                            <FileText size={18} className="text-ub-blue-hero" /> Live Ticketing Node
                        </h3>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Most recent network alerts</div>
                    </div>
                    <Link
                        to="/admin/issues"
                        className="text-[10px] font-black bg-white border border-gray-200 px-4 py-2 rounded-lg hover:shadow-md transition-all uppercase tracking-widest flex items-center gap-1"
                    >
                        View All <ArrowUpRight size={13} />
                    </Link>
                </div>
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-5 py-2">Issue / Title</th>
                                <th className="px-5 py-2">Reporter</th>
                                <th className="px-5 py-2 hidden md:table-cell">Area</th>
                                <th className="px-5 py-2 hidden sm:table-cell">Date</th>
                                <th className="px-5 py-2 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {issues.map(issue => (
                                <tr key={issue.id} className="bg-white hover:bg-blue-50/30 transition-colors shadow-sm ring-1 ring-gray-100 rounded-2xl group">
                                    <td className="px-5 py-4 rounded-l-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-50 w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 text-lg">
                                                {CAT_EMOJI[issue.category] || '🌀'}
                                            </div>
                                            <div>
                                                <div className="font-black text-[10px] text-ub-blue-hero uppercase tracking-widest">{issue.id}</div>
                                                <div className="font-bold text-gray-900 text-sm max-w-[200px] truncate">{issue.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 text-xs">{issue.reporter}</span>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                            <MapPin size={12} /> {issue.area}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 hidden sm:table-cell">
                                        <span className="text-xs font-bold text-gray-400">{issue.date}</span>
                                    </td>
                                    <td className="px-5 py-4 rounded-r-2xl text-right">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${STATUS_STYLES[issue.status]}`}>
                                            {STATUS_LABELS[issue.status]}
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
                <Link
                    to="/admin/leaderboard"
                    className="flex items-center gap-4 bg-gradient-to-r from-ub-blue-hero to-blue-500 text-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(27,63,160,0.3)] hover:shadow-[0_8px_30px_rgba(27,63,160,0.45)] transition-all hover:scale-[1.02] active:scale-100"
                >
                    <Trophy size={28} />
                    <div>
                        <div className="font-black text-lg">Citizen Leaderboard</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-75 mt-0.5">Top contributor rankings</div>
                    </div>
                    <ArrowUpRight size={18} className="ml-auto" />
                </Link>
                <button
                    onClick={handlePDFExport}
                    className="flex items-center gap-4 bg-white border border-gray-200 text-gray-800 p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all hover:scale-[1.02] active:scale-100"
                >
                    <Download size={28} className="text-ub-blue-hero" />
                    <div className="text-left">
                        <div className="font-black text-lg">Export Analytics PDF</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Full dashboard report</div>
                    </div>
                    <ArrowUpRight size={18} className="ml-auto text-gray-400" />
                </button>
            </div>
        </div>
    );
}
