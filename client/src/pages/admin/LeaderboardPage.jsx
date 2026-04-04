import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, MapPin, Flame, Medal, Download, ArrowLeft, Star, Crown, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Tier Config ─────────────────────────────────────────────────────────────
const TIER = (score) => {
    if (score >= 500) return { label: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-900/30 border-cyan-500/30', icon: '💎' };
    if (score >= 200) return { label: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-500/30', icon: '🥇' };
    if (score >= 100) return { label: 'Silver', color: 'text-slate-300', bg: 'bg-slate-700/30 border-slate-400/30', icon: '🥈' };
    return { label: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-500/30', icon: '🥉' };
};

const RANK_GLOW = {
    1: 'shadow-[0_0_30px_rgba(251,191,36,0.4)] border-yellow-400/50',
    2: 'shadow-[0_0_20px_rgba(148,163,184,0.3)] border-slate-400/50',
    3: 'shadow-[0_0_20px_rgba(251,146,60,0.3)] border-orange-400/50',
};

// ─── Podium Card ─────────────────────────────────────────────────────────────
function PodiumCard({ player, height, delay, isFirst }) {
    if (!player) return null;
    const configs = {
        1: { gradient: 'from-yellow-400 via-amber-400 to-yellow-600', crown: '👑', ringColor: 'ring-yellow-400', label: '1st' },
        2: { gradient: 'from-slate-300 via-gray-300 to-slate-500', crown: '🥈', ringColor: 'ring-slate-300', label: '2nd' },
        3: { gradient: 'from-orange-400 via-amber-500 to-orange-600', crown: '🥉', ringColor: 'ring-orange-400', label: '3rd' },
    };
    const c = configs[player.rank];
    const score = player.reports * 3 + player.resolved * 2 + player.streak * 5;

    return (
        <div
            className="flex flex-col items-center gap-2"
            style={{ animationDelay: `${delay}ms` }}
        >
            {isFirst && <div className="text-3xl mb-1 animate-bounce">👑</div>}
            {!isFirst && <div className="text-xl mb-1 opacity-0">👑</div>}

            {/* Avatar */}
            <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white font-black text-2xl md:text-3xl ring-4 ${c.ringColor} shadow-2xl`}>
                {player.name.charAt(0).toUpperCase()}
                {isFirst && <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs shadow-lg">✦</div>}
            </div>

            {/* Info */}
            <div className="text-center">
                <div className="font-black text-sm text-white">{player.name.split(' ')[0]}</div>
                <div className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{player.area}</div>
            </div>

            {/* Score */}
            <div className="text-center">
                <div className="font-black text-xl text-white">{score}</div>
                <div className="text-[9px] uppercase tracking-widest font-black text-white/40">pts</div>
            </div>

            {/* Bar */}
            <div
                className={`w-24 md:w-32 rounded-t-2xl bg-gradient-to-t ${c.gradient} flex items-start justify-center pt-3 ${RANK_GLOW[player.rank]} border`}
                style={{ height }}
            >
                <span className="text-white font-black text-sm">{c.label}</span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LeaderboardPage() {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await api.get('/admin/leaderboard');
                setLeaderboard(data);
            } catch (error) {
                toast.error('Failed to load live leaderboard data');
                setLeaderboard([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const handleExport = () => {
        if (leaderboard.length === 0) { toast.error('No data to export'); return; }
        const doc = new jsPDF();
        doc.setFontSize(22); doc.text('CivicConnect', 14, 20);
        doc.setFontSize(16); doc.text('Citizen Leaderboard Report', 14, 30);
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
        const tableColumn = ["Rank", "Name", "Area", "Reports", "Resolved", "Score", "Tier"];
        const tableRows = leaderboard.map(p => {
            const score = p.reports * 3 + p.resolved * 2 + p.streak * 5;
            const tier = TIER(score);
            return [p.rank, p.name, p.area, p.reports, p.resolved, score, tier.label];
        });
        autoTable(doc, {
            head: [tableColumn], body: tableRows, startY: 45, theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [27, 63, 160], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 248, 255] }
        });
        doc.save(`CivicConnect_Leaderboard_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('📄 Leaderboard PDF downloaded!', { duration: 3000, style: { background: '#0A0F1C', color: '#fff', fontWeight: 700 } });
    };

    const filtered = leaderboard.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.area.toLowerCase().includes(search.toLowerCase())
    );

    const top3 = leaderboard.filter(p => p.rank <= 3);
    const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#070B14]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">Loading Rankings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full font-sans bg-gray-50">

            {/* ── Dark Hero Header ── */}
            <div className="relative bg-[#070B14] overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-80 h-80 bg-yellow-500/8 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 px-8 md:px-10 pt-8 pb-0">
                    {/* Top bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <Link to="/admin" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-blue-400 mb-4 transition-colors">
                                <ArrowLeft size={12} /> Back to Dashboard
                            </Link>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                    <Trophy size={20} className="text-yellow-400" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-yellow-400/80 mb-0.5">Live Rankings</div>
                                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">
                                        Citizen <span className="text-yellow-400">Leaderboard</span>
                                    </h1>
                                </div>
                            </div>
                            <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">
                                Top contributors ranked by verified civic impact
                            </p>
                        </div>
                        <button
                            id="btn-leaderboard-export"
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 backdrop-blur-sm"
                        >
                            <Download size={14} /> Export PDF
                        </button>
                    </div>

                    {/* ── Podium ── */}
                    <div className="flex items-end justify-center gap-4 md:gap-8 pb-0">
                        {podiumOrder[0] && <PodiumCard player={podiumOrder[0]} height="70px" delay={100} isFirst={false} />}
                        {podiumOrder[1] && <PodiumCard player={podiumOrder[1]} height="100px" delay={0} isFirst={true} />}
                        {podiumOrder[2] && <PodiumCard player={podiumOrder[2]} height="55px" delay={200} isFirst={false} />}
                    </div>
                </div>
            </div>

            {/* ── Rankings Table ── */}
            <div className="px-8 md:px-10 py-8">

                {/* Search + Stats Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-2">
                            <Medal size={16} className="text-blue-600" />
                            <span className="font-black text-gray-900 text-sm">{filtered.length}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contributors</span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-2">
                            <Zap size={16} className="text-yellow-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Updated Live</span>
                        </div>
                    </div>
                    <input
                        id="leaderboard-search"
                        type="text"
                        placeholder="Search citizen or area..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full sm:w-72 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-4 py-4">Citizen</th>
                                <th className="px-4 py-4 hidden sm:table-cell">Area</th>
                                <th className="px-4 py-4 text-center">Reports</th>
                                <th className="px-4 py-4 text-center hidden md:table-cell">Resolved</th>
                                <th className="px-4 py-4 text-center hidden lg:table-cell">Streak</th>
                                <th className="px-4 py-4 hidden lg:table-cell">Tier</th>
                                <th className="px-6 py-4 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((player, idx) => {
                                const score = player.reports * 3 + player.resolved * 2 + player.streak * 5;
                                const resolveRate = Math.round((player.resolved / Math.max(player.reports, 1)) * 100);
                                const tier = TIER(score);
                                const isTop3 = player.rank <= 3;
                                const rankColors = {
                                    1: 'bg-yellow-400 text-white shadow-md shadow-yellow-200',
                                    2: 'bg-slate-400 text-white shadow-md shadow-slate-200',
                                    3: 'bg-orange-400 text-white shadow-md shadow-orange-200',
                                };

                                return (
                                    <tr
                                        key={player.rank}
                                        className={`group transition-all hover:bg-blue-50/40 ${isTop3 ? 'bg-gradient-to-r from-blue-50/30 to-transparent' : ''}`}
                                    >
                                        {/* Rank */}
                                        <td className="px-6 py-4">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${rankColors[player.rank] || 'bg-gray-100 text-gray-500'}`}>
                                                {player.rank <= 3 ? ['🥇', '🥈', '🥉'][player.rank - 1] : `#${player.rank}`}
                                            </div>
                                        </td>

                                        {/* Citizen */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm ${isTop3 ? 'ring-2 ring-blue-200' : ''}`}>
                                                    {player.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 text-sm">{player.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400">Verified Citizen</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Area */}
                                        <td className="px-4 py-4 hidden sm:table-cell">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                                <MapPin size={12} className="text-blue-500 shrink-0" /> {player.area}
                                            </span>
                                        </td>

                                        {/* Reports */}
                                        <td className="px-4 py-4 text-center">
                                            <span className="font-black text-gray-900 text-lg">{player.reports}</span>
                                        </td>

                                        {/* Resolved */}
                                        <td className="px-4 py-4 text-center hidden md:table-cell">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="font-black text-green-600 text-sm">{player.resolved}</span>
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${resolveRate}%` }} />
                                                </div>
                                                <span className="text-[9px] font-black text-gray-400">{resolveRate}%</span>
                                            </div>
                                        </td>

                                        {/* Streak */}
                                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                                            <span className="inline-flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                                                <Flame size={12} /> {player.streak}d
                                            </span>
                                        </td>

                                        {/* Tier */}
                                        <td className="px-4 py-4 hidden lg:table-cell">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg border ${tier.bg} ${tier.color}`}>
                                                {tier.icon} {tier.label}
                                            </span>
                                        </td>

                                        {/* Score */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-black text-lg flex items-center gap-1 ${isTop3 ? 'text-blue-600' : 'text-gray-700'}`}>
                                                    <TrendingUp size={14} /> {score}
                                                </span>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">pts</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="py-20 text-center">
                            <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
                            <div className="font-black text-gray-300 uppercase tracking-widest text-sm">No contributors found</div>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Score = Reports×3 + Resolved×2 + Streak×5 · Rankings update in real-time
                </div>
            </div>
        </div>
    );
}
