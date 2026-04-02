import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Award, CheckCircle, Clock, MapPin, Settings, Heart } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useContext(AuthContext);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ reported: 0, resolved: 0, score: 0 });

    useEffect(() => {
        fetchMyData();
    }, []);

    const fetchMyData = async () => {
        try {
            const { data } = await api.get('/issues/my');
            setIssues(data.issues);
            setStats({
                reported: data.issues.length,
                resolved: data.issues.filter(i => i.status === 'resolved').length,
                score: user?.contributionScore || (data.issues.length * 10)
            });
        } catch (err) {
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'bg-ub-green-mint text-ub-green-dark border-ub-green-light';
            case 'submitted': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    }

    if (loading) return <div className="p-12 text-center text-ub-text-muted">Loading profile...</div>;

    return (
        <div className="bg-ub-bg-surface min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Section: User Card & Stats */}
                <div className="lg:col-span-1 space-y-6">

                    <div className="ub-card text-center !pt-8 !pb-6 border-t-4 border-ub-blue-hero">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-ub-blue-hero to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-blue-200 mb-4">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <h2 className="text-xl font-extrabold text-ub-text-primary mb-1">{user?.name}</h2>
                        <div className="text-sm text-ub-text-secondary flex items-center justify-center gap-1.5 mb-4">
                            <MapPin size={14} /> {user?.ward || 'Chennai'}, {user?.area || 'Tamil Nadu'}
                        </div>

                        <div className="flex justify-center gap-2">
                            <button className="text-xs font-bold text-ub-text-secondary bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors">
                                <Settings size={14} /> Edit
                            </button>
                            <button className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md flex items-center transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="ub-card !p-5 bg-gradient-to-br from-ub-green-medium to-green-700 text-white border-none text-center">
                        <Award size={36} className="mx-auto text-yellow-300 mb-3" />
                        <div className="text-3xl font-black mb-1">{stats.score}</div>
                        <div className="text-xs uppercase tracking-widest font-bold opacity-90">Civic Contribution Score</div>
                        <p className="text-[10px] mt-3 opacity-80 leading-tight">You earn points by reporting local issues accurately and providing updates.</p>
                    </div>

                    <Link to="/my-volunteering" className="ub-card !p-5 flex items-center gap-4 hover:border-ub-blue-hero transition-colors group block">
                        <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center shrink-0 group-hover:bg-pink-100 transition-colors">
                            <Heart size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">My Volunteering</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">View signups</div>
                        </div>
                    </Link>

                </div>

                {/* Right Section: My Issues Feed */}
                <div className="lg:col-span-3">
                    <h2 className="text-2xl font-bold mb-6 text-ub-text-primary flex items-center gap-2">
                        <User size={24} className="text-ub-blue-hero" /> Tracker History
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="ub-card !p-4 flex items-center p-4 gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-ub-blue-hero flex items-center justify-center shrink-0">
                                <Clock size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-ub-text-primary leading-none mb-1">{stats.reported}</div>
                                <div className="text-xs font-bold text-ub-text-muted uppercase tracking-wider">Total Reports</div>
                            </div>
                        </div>
                        <div className="ub-card !p-4 flex items-center p-4 gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 text-ub-green-medium flex items-center justify-center shrink-0">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-ub-text-primary leading-none mb-1">{stats.resolved}</div>
                                <div className="text-xs font-bold text-ub-text-muted uppercase tracking-wider">Resolved Issues</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {issues.length === 0 ? (
                            <div className="ub-card !py-12 text-center text-ub-text-muted">
                                <div className="text-4xl mb-3">🌍</div>
                                <p>You haven't reported any civic issues yet.</p>
                                <Link to="/report" className="mt-4 inline-block btn-primary text-sm">Report an Issue Now</Link>
                            </div>
                        ) : (
                            issues.map(issue => (
                                <Link to={`/issue/${issue._id}`} key={issue._id} className="block group">
                                    <div className="ub-card !p-5 hover:border-ub-blue-hero transition-colors flex flex-col md:flex-row gap-5 items-start md:items-center">
                                        {issue.photos?.[0] ? (
                                            <div className="w-full md:w-32 md:h-24 aspect-video md:aspect-auto rounded-lg overflow-hidden shrink-0 border border-ub-border">
                                                <img src={issue.photos[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            </div>
                                        ) : (
                                            <div className="w-full md:w-32 h-20 md:h-24 rounded-lg bg-gray-100 border border-ub-border flex flex-col items-center justify-center shrink-0 text-ub-text-muted text-xs">
                                                <MapPin size={20} className="mb-1" /> No Photo
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold tracking-wider uppercase text-ub-text-muted">{new Date(issue.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-mono text-ub-blue-hero bg-blue-50 px-1.5 py-0.5 rounded">{issue.issueId}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-ub-text-primary truncate group-hover:text-ub-blue-hero transition-colors">{issue.title}</h3>
                                            <div className="text-sm text-ub-text-secondary mt-1 max-w-2xl truncate">{issue.description}</div>
                                        </div>

                                        <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">
                                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border ${getStatusColor(issue.status)}`}>
                                                {issue.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
