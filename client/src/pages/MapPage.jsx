import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Filter, ThumbsUp, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

// Dynamic custom markers via purely colored divs using standard CSS instead of remote images
const createIcon = (color) => {
    return L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9]
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

export default function MapPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCat, setFilterCat] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

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
        <div className="relative h-[calc(100vh-64px)] w-full flex flex-col md:flex-row">

            {/* Dynamic Sidebar Control Panel */}
            <div className="md:w-80 w-full bg-white border-b md:border-r border-ub-border p-5 z-40 flex flex-col gap-5 shadow-sm md:h-full md:overflow-y-auto shrink-0 relative">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2"><Filter size={20} className="text-ub-green-medium" /> Public Issue Map</h2>
                    <p className="text-sm text-ub-text-secondary mt-1">Explore and filter reported civic issues across your region.</p>
                </div>

                <div className="bg-ub-bg-surface p-4 rounded-xl border border-ub-border flex items-center gap-3">
                    <Activity size={32} className="text-ub-blue-hero" />
                    <div>
                        <div className="text-2xl font-extrabold text-ub-text-primary leading-none">{filtered.length}</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-ub-text-muted mt-0.5">Pins Found</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ub-text-muted mb-2">Issue Category</label>
                        <select
                            value={filterCat} onChange={e => setFilterCat(e.target.value)}
                            className="w-full border-2 border-ub-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-ub-green-medium transition-colors"
                        >
                            <option value="all">All Categories</option>
                            <option value="pothole">Potholes</option>
                            <option value="street_light">Street Lights</option>
                            <option value="garbage">Garbage / Waste</option>
                            <option value="water_leak">Water Leaks</option>
                            <option value="fallen_tree">Fallen Trees</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ub-text-muted mb-2">Resolution Status</label>
                        <select
                            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="w-full border-2 border-ub-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-ub-blue-hero transition-colors"
                        >
                            <option value="all">All Statuses</option>
                            <option value="submitted">Pending / Submitted</option>
                            <option value="under_review">Under Review / In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-ub-border">
                    <h3 className="font-bold text-xs uppercase text-ub-text-muted tracking-wider mb-3">Map Legend</h3>
                    <div className="space-y-2">
                        <div className="flex gap-2.5 items-center text-sm font-semibold">
                            <span className="w-4 h-4 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: statusColors.resolved }}></span> Resolved
                        </div>
                        <div className="flex gap-2.5 items-center text-sm font-semibold">
                            <span className="w-4 h-4 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: statusColors.under_review }}></span> In Review / Progress
                        </div>
                        <div className="flex gap-2.5 items-center text-sm font-semibold">
                            <span className="w-4 h-4 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: statusColors.submitted }}></span> Pending / Critical
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaflet Rendering Engine */}
            <div className="flex-1 h-full min-h-[400px] z-0">
                <MapContainer center={[13.0827, 80.2707]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filtered.map(issue => {
                        // Validate geometry constraints
                        if (!issue.location?.coordinates || issue.location.coordinates.length < 2) return null;

                        return (
                            <Marker
                                key={issue._id}
                                position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                                icon={createIcon(statusColors[issue.status] || '#000')}
                            >
                                <Popup className="custom-popup" minWidth={240}>
                                    <div className="p-0.5">
                                        {/* Render thumbnail safely if Cloudinary array injected */}
                                        {issue.photos?.[0] && (
                                            <div className="h-28 w-full rounded-md overflow-hidden bg-gray-100 mb-3 border border-gray-200">
                                                <img src={issue.photos[0].url} alt="thumbnail" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="text-[10px] font-extrabold uppercase text-ub-blue-hero mb-1 tracking-wider">{issue.category.replace('_', ' ')}</div>
                                        <div className="font-bold text-base text-ub-text-primary leading-tight mb-2 pr-2" title={issue.title}>{issue.title}</div>

                                        <div className="flex items-center justify-between mt-4 mb-2">
                                            <span className="text-[10px] bg-ub-bg-surface px-2.5 py-1 rounded-full border border-ub-border font-bold uppercase tracking-wide">
                                                {issue.status.replace('_', ' ')}
                                            </span>
                                            <span className="flex items-center text-xs font-bold text-ub-green-medium gap-1.5 bg-ub-green-mint px-2 py-0.5 rounded-full">
                                                <ThumbsUp size={12} strokeWidth={3} /> {issue.upvoteCount}
                                            </span>
                                        </div>

                                        <Link to={`/issue/${issue._id}`} className="block text-center mt-3 text-sm bg-ub-green-medium text-white font-bold py-2 rounded-lg hover:bg-ub-green-dark transition-colors border border-transparent">
                                            View Complete Details
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
