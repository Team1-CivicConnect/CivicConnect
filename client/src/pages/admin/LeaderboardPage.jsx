import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, MapPin, Flame, Medal, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DUMMY_LEADERBOARD } from '../../data/dashboardData';
import toast from 'react-hot-toast';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RANK_STYLES = {
    1: { row: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400', rank: 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' },
    2: { row: 'bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-gray-400', rank: 'bg-gray-400 text-white shadow-lg shadow-gray-200' },
    3: { row: 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400', rank: 'bg-orange-400 text-white shadow-lg shadow-orange-200' },
};

// ─── Top 3 Podium Cards ───────────────────────────────────────────────────────

// ─── Top 3 Podium Cards ───────────────────────────────────────────────────────
function PodiumCard({ player, height, delay }) {
    const colors = {
        1: { bg: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-300', label: '#1', labelBg: 'bg-yellow-500' },
        2: { bg: 'from-slate-400 to-gray-500', ring: 'ring-gray-300', label: '#2', labelBg: 'bg-gray-500' },
        3: { bg: 'from-orange-400 to-amber-600', ring: 'ring-orange-300', label: '#3', labelBg: 'bg-orange-500' },
    };
    const c = colors[player.rank];
    return (
        <div
            className="flex flex-col items-center gap-3 animate-fadeIn"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${c.bg} flex items-center justify-center text-white font-black text-2xl ring-4 ${c.ring} shadow-xl`}>
                {player.name.charAt(0)}
            </div>
            <div className="text-center">
                <div className="font-black text-sm text-gray-900">{player.name}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{player.area}</div>
            </div>
            <div className="font-black text-2xl text-gray-900">{player.reports}</div>
            <div className="text-[9px] uppercase tracking-widest font-black text-gray-400">Reports</div>

            {/* Podium bar */}
            <div
                className={`w-28 rounded-t-2xl bg-gradient-to-t ${c.bg} flex items-start justify-center pt-3 shadow-lg`}
                style={{ height }}
            >
                <span className={`text-white font-black text-sm px-2.5 py-0.5 rounded-full ${c.labelBg}`}>{c.label}</span>
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
        if (leaderboard.length === 0) {
            toast.error('No data to export');
            return;
        }

        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(22);
        doc.text('CivicConnect', 14, 20);
        doc.setFontSize(16);
        doc.text('Citizen Leaderboard Report', 14, 30);

        // Add Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

        // Prepare data for table
        const tableColumn = ["Rank", "Name", "Total Resolved", "Contribution Score", "Tier"];
        const tableRows = [];

        leaderboard.forEach(player => {
            const rowData = [
                player.rank,
                player.name,
                player.resolved,
                player.score,
                player.badge || 'New'
            ];
            tableRows.push(rowData);
        });

        // Add autoTable
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [27, 63, 160], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 248, 255] }
        });

        // Save PDF
        doc.save(`CivicConnect_Leaderboard_${new Date().toISOString().split('T')[0]}.pdf`);

        toast.success('📄 Leaderboard PDF successfully downloaded!', {
            duration: 3000,
            style: { background: '#0A0F1C', color: '#fff', fontWeight: 700, fontSize: '13px' }
        });
    };

    const filtered = leaderboard.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.area.toLowerCase().includes(search.toLowerCase())
    );

    const top3 = leaderboard.filter(p => p.rank <= 3);
    const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : (top3.length === 2 ? [top3[1], top3[0]] : top3); // silver, gold, bronze visual order

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-ub-blue-hero/20 border-t-ub-blue-hero rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 md:p-10 bg-gray-50 min-h-full font-sans">

            {/* ── Header ── */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-ub-blue-hero mb-3 transition-colors"
                    >
                        <ArrowLeft size={13} /> Back to Dashboard
                    </Link>
                    <div className="inline-flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-md text-[9px] font-black tracking-widest uppercase text-yellow-700 mb-3 border border-yellow-200 ml-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        Live Rankings
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">
                        Citizen Leaderboard
                    </h1>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                        Top contributors ranked by verified issue reports
                    </p>
                </div>
                <button
                    id="btn-leaderboard-export"
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 bg-ub-blue-hero hover:bg-ub-blue-dark text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(27,63,160,0.35)] hover:shadow-[0_6px_28px_rgba(27,63,160,0.5)] transition-all active:scale-95"
                >
                    <Download size={15} />
                    Export PDF
                </button>
            </div>

            {/* ── Podium (Top 3) ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-10 mb-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-ub-blue-hero">
                            <Trophy size={18} /> Hall of Champions
                        </div>
                    </div>
                    <div className="flex items-end justify-center gap-6 md:gap-10">
                        <PodiumCard player={podiumOrder[0]} height="80px" delay={100} />
                        <PodiumCard player={podiumOrder[1]} height="110px" delay={0} />
                        <PodiumCard player={podiumOrder[2]} height="60px" delay={200} />
                    </div>
                </div>
            </div>

            {/* ── Search ── */}
            <div className="mb-6">
                <input
                    id="leaderboard-search"
                    type="text"
                    placeholder="Search by name or area..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full sm:w-80 bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm font-bold text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-ub-blue-hero/30 focus:border-ub-blue-hero transition-all shadow-sm"
                />
            </div>

            {/* ── Full Rankings Table ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                            <Medal size={18} className="text-ub-blue-hero" /> Full Rankings
                        </h3>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {filtered.length} contributors
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                                <th className="px-8 py-4 w-16">Rank</th>
                                <th className="px-4 py-4">Citizen</th>
                                <th className="px-4 py-4 hidden sm:table-cell">Area</th>
                                <th className="px-4 py-4 text-center">Reports</th>
                                <th className="px-4 py-4 text-center hidden md:table-cell">Resolved</th>
                                <th className="px-4 py-4 text-center hidden lg:table-cell">Streak</th>
                                <th className="px-8 py-4 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((player, idx) => {
                                const rankStyle = RANK_STYLES[player.rank];
                                const resolveRate = Math.round((player.resolved / player.reports) * 100);
                                const score = player.reports * 3 + player.resolved * 2 + player.streak * 5;
                                return (
                                    <tr
                                        key={player.rank}
                                        className={`transition-colors hover:bg-blue-50/20 group ${rankStyle ? rankStyle.row : 'border-b border-gray-50'}`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {/* Rank */}
                                        <td className="px-8 py-4">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${rankStyle ? rankStyle.rank : 'bg-gray-100 text-gray-600'}`}>
                                                {player.rank <= 3 ? player.badge : `#${player.rank}`}
                                            </div>
                                        </td>

                                        {/* Name & Avatar */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ub-blue-hero to-blue-400 flex items-center justify-center text-white font-black text-sm shrink-0">
                                                    {player.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 text-sm">{player.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400">Citizen Reporter</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Area */}
                                        <td className="px-4 py-4 hidden sm:table-cell">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                                <MapPin size={12} className="text-ub-blue-hero" /> {player.area}
                                            </span>
                                        </td>

                                        {/* Reports */}
                                        <td className="px-4 py-4 text-center">
                                            <span className="font-black text-gray-900 text-lg">{player.reports}</span>
                                        </td>

                                        {/* Resolved + Rate */}
                                        <td className="px-4 py-4 text-center hidden md:table-cell">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="font-black text-green-600">{player.resolved}</span>
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-400 rounded-full transition-all"
                                                        style={{ width: `${resolveRate}%` }}
                                                    />
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

                                        {/* Score */}
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-ub-blue-hero text-lg flex items-center gap-1">
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
                        <div className="py-16 text-center">
                            <Trophy size={40} className="mx-auto text-gray-200 mb-4" />
                            <div className="font-black text-gray-400 uppercase tracking-widest text-sm">No results found</div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Footer note ── */}
            <div className="mt-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Rankings update every 24 hours · Score = Reports×3 + Resolved×2 + Streak×5
            </div>
        </div>
    );
}
