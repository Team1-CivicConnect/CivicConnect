import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Filter, ThumbsUp, Activity, Map as MapIcon, Shield, Layers, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';

// Dynamic cinematic markers via HTML array - Enterprise styling
const createIcon = (color) => {
    return L.divIcon({
        className: 'bg-transparent border-0',
        html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 44px; height: 44px; background-color: ${color}; opacity: 0.15; border-radius: 50%; filter: blur(4px);"></div>
                <div style="position: absolute; width: 16px; height: 16px; background-color: ${color}; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3)"></div>
                <div style="position: absolute; width: 16px; height: 16px; background-color: ${color}; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%; z-index: 10;"></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

const statusColors = {
    submitted: '#EF4444',     // Red = pending
    under_review: '#F59E0B',  // Amber = in review
    in_progress: '#F59E0B',   // Amber
    resolved: '#10B981',      // Green = resolved
    rejected: '#6B7280',      // Gray
    duplicate: '#6B7280'
};

const CATEGORIES = [
    { id: 'all', label: 'All Issues' },
    { id: 'pothole', label: 'Potholes' },
    { id: 'street_light', label: 'Lighting Down' },
    { id: 'garbage', label: 'Waste Hazards' },
    { id: 'water_leak', label: 'Water Leaks' },
    { id: 'fallen_tree', label: 'Fallen Trees' },
];

export default function MapPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCat, setFilterCat] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('pins'); // 'pins' | 'heatmap'

    useEffect(() => {
        fetchPins();
    }, []);

    const fetchPins = async () => {
        try {
            const { data } = await api.get('/issues/map');
            setIssues(data.issues || []);
        } catch (err) {
            toast.error('Failed to load map pins');
        } finally {
            setLoading(false);
        }
    };

    const filtered = issues.filter(i => {
        const matchCat = filterCat === 'all' || i.category === filterCat;
        const matchStat = filterStatus === 'all' || i.status === filterStatus;
        return matchCat && matchStat;
    });

    return (
        <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-gray-100 flex flex-col md:flex-row">

            {/* Leaflet Light Map Engine - FULL SCREEN BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <MapContainer center={[13.0827, 80.2707]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    {/* CartoDB Voyager Light Tiles */}
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    {viewMode === 'heatmap' ? (
                        <HeatmapLayer
                            fitBoundsOnLoad
                            fitBoundsOnUpdate
                            points={filtered.filter(i => i.location?.coordinates?.length >= 2).map(i => [i.location.coordinates[1], i.location.coordinates[0], (i.upvoteCount || 0) * 10 + 20])}
                            longitudeExtractor={m => m[1]}
                            latitudeExtractor={m => m[0]}
                            intensityExtractor={m => parseFloat(m[2])}
                            radius={25}
                            blur={15}
                            maxZoom={15}
                        />
                    ) : (
                        filtered.map(issue => {
                            if (!issue.location?.coordinates || issue.location.coordinates.length < 2) return null;

                            return (
                                <Marker
                                    key={issue._id}
                                    position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                                    icon={createIcon(statusColors[issue.status] || '#000')}
                                >
                                    <Popup className="corporate-light-popup" minWidth={280}>
                                        <div className="bg-white text-gray-900 p-1 -m-4 rounded-xl overflow-hidden border border-gray-200 shadow-2xl">
                                            {/* Thumbnail Render */}
                                            {issue.photos?.[0] ? (
                                                <div className="h-32 w-full bg-gray-100 border-b border-gray-200 relative">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                                    <img src={issue.photos[0].url} alt="thumbnail" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-20 w-full bg-blue-50 border-b border-blue-100 flex items-center justify-center">
                                                    <MapIcon size={28} className="text-blue-300" />
                                                </div>
                                            )}

                                            <div className="p-5 relative z-20 -mt-8">
                                                <div className="inline-block bg-white shadow-md shadow-black/5 px-2.5 py-1 rounded-md border border-gray-100 text-[9px] font-black uppercase text-ub-blue-hero mb-3 tracking-widest">
                                                    {issue.category.replace('_', ' ')}
                                                </div>

                                                <div className="font-black text-lg text-gray-900 leading-tight mb-4 line-clamp-2" title={issue.title}>
                                                    {issue.title}
                                                </div>

                                                <div className="flex items-center justify-between mb-5 border-t border-gray-100 pt-4">
                                                    <span className="text-[9px] bg-gray-50 px-2.5 py-1.5 rounded-md text-gray-600 font-black uppercase tracking-widest border border-gray-200">
                                                        {issue.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="flex items-center text-[10px] font-black text-ub-green-medium gap-1.5 bg-green-50 px-2.5 py-1.5 rounded-md border border-green-100 shadow-sm shadow-green-100/50">
                                                        <ThumbsUp size={12} className="text-ub-green-medium" /> {issue.upvoteCount} Votes
                                                    </span>
                                                </div>

                                                <Link to={`/issue/${issue._id}`} className="block w-full text-center text-xs bg-ub-blue-hero hover:bg-ub-blue-dark text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-[0_5px_15px_rgba(27,63,160,0.2)] hover:shadow-[0_8px_20px_rgba(27,63,160,0.3)] hover:-translate-y-0.5">
                                                    View Report Details
                                                </Link>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })
                    )}
                </MapContainer>
            </div>

            {/* Overlapping Floating Sidebar */}
            <div className="absolute top-0 left-0 md:top-6 md:left-6 z-[400] w-full md:w-[420px] h-full md:h-[calc(100%-48px)]">
                <div className="bg-white/85 backdrop-blur-2xl border border-white/40 md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-6 md:p-8 flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

                    {/* Header */}
                    <div className="mb-6 relative">
                        <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-100/50 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase text-ub-blue-hero mb-4 backdrop-blur-sm shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-ub-blue-hero animate-pulse"></span> Network Active
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-1">Live Map</h2>
                        <p className="text-[11px] text-gray-500 font-bold tracking-widest uppercase">Track Community Issues Real-Time</p>
                    </div>

                    {/* Active Reports Banner - FIXED ALIGNMENT */}
                    <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-5 mb-8 group transition-all hover:shadow-md">
                        <div className="w-14 h-14 bg-white text-ub-blue-hero rounded-xl shadow-sm border border-blue-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Activity size={26} className="opacity-80" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="text-3xl font-black text-gray-900 leading-none tracking-tighter mb-1">{filtered.length}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-ub-blue-hero/80">Active Reports</div>
                        </div>
                        <div className="ml-auto flex flex-col gap-1">
                            <button
                                onClick={() => setViewMode('pins')}
                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded border transition-all flex items-center justify-center gap-1.5 ${viewMode === 'pins' ? 'bg-ub-blue-hero text-white border-ub-blue-hero shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                            >
                                <Layers size={12} /> Pins
                            </button>
                            <button
                                onClick={() => setViewMode('heatmap')}
                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded border transition-all flex items-center justify-center gap-1.5 ${viewMode === 'heatmap' ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'bg-white text-red-500 border-red-200 hover:bg-red-50'}`}
                            >
                                <Flame size={12} /> Heat
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8 flex-1">
                        {/* Category Filter Pills */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                <Filter size={14} /> Category Filter
                            </label>
                            <div className="flex flex-wrap gap-2.5">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFilterCat(cat.id)}
                                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-300 border ${filterCat === cat.id
                                            ? 'bg-ub-blue-hero border-ub-blue-hero text-white shadow-[0_4px_12px_rgba(27,63,160,0.25)] scale-105'
                                            : 'bg-white/60 border-gray-200 text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Filter Toggle Array */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                <Shield size={14} /> Resolution Status
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    { id: 'all', label: 'All Status' },
                                    { id: 'submitted', label: 'Pending' },
                                    { id: 'under_review', label: 'In Progress' },
                                    { id: 'resolved', label: 'Resolved' }
                                ].map(status => (
                                    <button
                                        key={status.id}
                                        onClick={() => setFilterStatus(status.id)}
                                        className={`px-4 py-3 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all border shadow-sm ${filterStatus === status.id
                                            ? 'bg-gray-900 border-gray-900 text-white transform scale-[1.02] shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                                            : 'bg-white/60 border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900 hover:bg-white'
                                            }`}
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map Legend */}
                    <div className="mt-8 pt-6 border-t border-gray-200/60 pb-2">
                        <h3 className="font-black text-[10px] uppercase text-gray-400 tracking-widest mb-4">Map Legend</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-white/60 px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                                <span className="text-[11px] font-black text-gray-700 tracking-wide uppercase">Resolved</span>
                                <span className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" style={{ backgroundColor: statusColors.resolved }}></span>
                            </div>
                            <div className="flex justify-between items-center bg-white/60 px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                                <span className="text-[11px] font-black text-gray-700 tracking-wide uppercase">In Progress</span>
                                <span className="w-3.5 h-3.5 rounded-full animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.8)]" style={{ backgroundColor: statusColors.under_review }}></span>
                            </div>
                            <div className="flex justify-between items-center bg-white/60 px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                                <span className="text-[11px] font-black text-gray-700 tracking-wide uppercase">Pending</span>
                                <span className="w-3.5 h-3.5 rounded-full animate-ping-slow shadow-[0_0_12px_rgba(239,68,68,0.8)]" style={{ backgroundColor: statusColors.submitted }}></span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Floating Live Indicator Top Right */}
            <div className="absolute top-6 right-6 z-[400] pointer-events-none hidden md:block">
                <div className="bg-white/90 backdrop-blur-md border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">Live View</span>
                </div>
            </div>

        </div>
    );
}
