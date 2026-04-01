import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Eye, Map as MapIcon, ShieldCheck } from 'lucide-react';

const createIcon = (color, priority = 'normal') => {
    const size = priority === 'high' ? 24 : 16;
    const pulse = priority === 'high' ? `<div style="position:absolute; width:100%; height:100%; border-radius:50%; background-color:${color}; opacity:0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : '';

    return L.divIcon({
        className: 'custom-pin',
        html: `
        <div style="position:relative; width:${size}px; height:${size}px;">
            ${pulse}
            <div style="position:relative; background-color: ${color}; width: 100%; height: 100%; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index:2;"></div>
        </div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
};

const statusColors = {
    submitted: '#EF4444',     // Red
    under_review: '#F59E0B',  // Amber
    in_progress: '#F59E0B',   // Amber
    resolved: '#10B981',      // Green
};

export default function AdminMap() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPins();
    }, []);

    const fetchPins = async () => {
        try {
            const { data } = await api.get('/admin/issues?limit=500'); // Fetch max map load
            setIssues(data.issues);
        } catch (err) {
            toast.error('Failed to load fleet map');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-ub-bg-surface">
            <div className="p-6 border-b border-ub-border flex items-center justify-between z-10 bg-white shadow-sm shrink-0">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-3 text-ub-text-primary">
                        <MapIcon className="text-ub-blue-hero" size={28} /> Global Fleet Map
                    </h1>
                    <p className="text-sm font-semibold text-ub-text-secondary mt-1">Live geographic distribution of all platform civic anomalies.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 border border-red-200 rounded shrink-0">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm border border-white block animate-pulse"></span> High Priority
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold bg-gray-50 text-gray-700 px-3 py-1.5 border border-gray-200 rounded shrink-0">
                        <span className="w-3 h-3 rounded-full bg-ub-green-medium shadow-sm border border-white block"></span> Resolved
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full relative z-0">
                <MapContainer center={[13.0827, 80.2707]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {issues.map(issue => {
                        if (!issue.location?.coordinates || issue.location.coordinates.length < 2) return null;
                        return (
                            <Marker
                                key={issue._id}
                                position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                                icon={createIcon(statusColors[issue.status] || '#6B7280', issue.aiPriorityLevel)}
                            >
                                <Popup minWidth={250} className="admin-popup font-sans">
                                    <div className="p-0.5">
                                        <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                                            <span className="font-mono text-[10px] text-ub-blue-hero font-bold tracking-widest bg-blue-50 px-1 py-0.5">{issue.issueId}</span>
                                            {issue.aiPriorityLevel === 'high' && <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">CRITICAL</span>}
                                        </div>

                                        <div className="font-bold text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">{issue.category.replace('_', ' ')}</div>
                                        <div className="font-black text-sm text-gray-900 leading-tight mb-3 truncate" title={issue.title}>{issue.title}</div>

                                        <div className="bg-gray-50 border border-gray-200 p-2 rounded text-xs mb-3 text-gray-600 font-medium">
                                            <span className="block font-bold mb-1 uppercase tracking-wider text-[9px] text-gray-400">AI Reasoning Synopsis</span>
                                            <span className="italic">"{issue.aiReasoning?.substring(0, 60) || 'Standard request logged...'}..."</span>
                                        </div>

                                        <Link to={`/admin/issue/${issue._id}`} className="flex items-center justify-center gap-2 text-xs w-full bg-ub-blue-hero text-white font-bold py-2 rounded shadow hover:bg-black transition-colors">
                                            <ShieldCheck size={14} /> Dispatch & Review
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
