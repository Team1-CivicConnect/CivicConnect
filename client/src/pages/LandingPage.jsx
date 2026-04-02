import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Activity, MapPin, Cpu, BarChart3, Shield, Fingerprint, ShieldCheck, Users, Heart, Zap, Eye } from 'lucide-react';
import CivicGlobe from '../components/ui/CivicGlobe';

export default function LandingPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const location = useLocation();

    // Smooth scroll to #about when navigating from /about
    useEffect(() => {
        if (location.pathname === '/about') {
            setTimeout(() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    }, [location.pathname]);

    const handleMouseMove = (e) => {
        const { currentTarget: target } = e;
        const rect = target.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div className="overflow-hidden bg-gray-50">

            {/* Dynamic Animated Hero Section */}
            <section className="relative bg-[#0A0F1C] text-white min-h-screen flex flex-col justify-center overflow-hidden pt-20 border-b border-white/5">
                {/* Advanced Light Leak Mesh & 3D Globe */}
                <CivicGlobe />
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-ub-blue-hero rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-blob"></div>
                    <div className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] bg-ub-green-medium rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-[20%] left-[30%] w-[600px] h-[600px] bg-purple-700 rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-blob animation-delay-4000"></div>
                    <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/stardust.png')] opacity-[0.03]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0F1C]/80 to-[#0A0F1C]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
                    <div className="animate-fadeIn">

                        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full text-xs font-black tracking-[0.2em] uppercase mb-8 shadow-2xl hover:bg-white/10 transition-colors cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ub-green-mint opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-ub-green-medium"></span>
                            </span>
                            CIVICCONNECT PLATFORM
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tighter">
                            Modernize Your <br />
                            <span className="relative inline-block mt-2">
                                <span className="absolute -inset-1 blur-xl bg-gradient-to-r from-ub-green-medium to-ub-blue-hero opacity-30"></span>
                                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-ub-green-mint to-blue-300">
                                    Civic Infrastructure.
                                </span>
                            </span>
                        </h1>

                        <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 max-w-lg leading-relaxed">
                            Report potholes, broken lights, water leaks and more. Track every issue from submission to resolution with full transparency.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <Link to="/report" className="group relative overflow-hidden bg-ub-green-medium text-white px-8 py-4 rounded-2xl font-black shadow-[0_0_40px_rgba(46,125,50,0.4)] hover:shadow-[0_0_60px_rgba(46,125,50,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg">
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                                Report an Issue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/map" className="group glass-dark hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl font-bold shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg">
                                <MapPin size={20} className="text-ub-blue-hero group-hover:scale-110 transition-transform" /> Live Map
                            </Link>
                        </div>
                    </div>

                    {/* Floating Dashboard Card - Glassmorphism Evolution */}
                    <div className="relative mt-12 lg:mt-0 lg:ml-10">
                        {/* Hardware glow behind card */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-ub-blue-hero/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

                        <div className="animate-float glass-dark bg-[#111827]/60 backdrop-blur-2xl rounded-[32px] p-8 relative z-20 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                                <div className="flex items-center gap-2">
                                    <Activity size={18} className="text-ub-green-medium" />
                                    <h3 className="font-black text-white tracking-widest text-[11px] uppercase">Live Issue Feed</h3>
                                </div>
                                <div className="flex gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></span>
                                    <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></span>
                                    <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-5 flex items-center gap-5 border border-white/5 cursor-default relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl"></div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-105 transition-transform">🕳️</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="font-black text-white text-sm">Critical Pothole Depth</div>
                                            <div className="text-[9px] font-black uppercase text-red-400 tracking-widest border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded-md">Priority 1</div>
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium">Issue #ISS-8B29 • Reported 2m ago</div>
                                    </div>
                                </div>
                                <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-5 flex items-center gap-5 border border-white/5 cursor-default relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-2xl"></div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-105 transition-transform">💧</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="font-black text-white text-sm">Main Pipeline Rupture</div>
                                            <div className="text-[9px] font-black uppercase text-amber-400 tracking-widest border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-md">Active</div>
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium">Issue #ISS-4A11 • Crew Dispatched</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Tag */}
                        <div className="absolute -bottom-6 -right-6 glass-dark bg-ub-blue-hero/80 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl animate-float-delayed z-30 shadow-2xl">
                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Platform Status</div>
                            <div className="font-black text-xl text-white flex items-center gap-2"><Activity size={18} /> 100% Online</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Municipal Pulse Ticker Segment */}
            <div className="flex overflow-hidden bg-black text-white py-3 border-b border-white/10 relative z-30 shadow-2xl">
                <div className="flex whitespace-nowrap animate-marquee items-center">
                    {[Array(6).fill(0)].map((_, __) => (
                        <div key={__} className="flex items-center gap-10 opacity-70">
                            <span className="text-xs font-black tracking-widest mx-10 text-gray-500">•</span>
                            <span className="text-xs font-black tracking-widest"><span className="text-green-400">🟢 RESOLVED</span>: Pipeline repaired at Node #412A</span>
                            <span className="text-xs font-black tracking-widest mx-10 text-gray-500">•</span>
                            <span className="text-xs font-black tracking-widest"><span className="text-blue-400">🔵 DISPATCH</span>: Fleet 3 rerouted to Sector 9</span>
                            <span className="text-xs font-black tracking-widest mx-10 text-gray-500">•</span>
                            <span className="text-xs font-black tracking-widest"><span className="text-red-400">🔴 ALERT</span>: Priority fracture registered safely</span>
                            <span className="text-xs font-black tracking-widest mx-10 text-gray-500">•</span>
                            <span className="text-xs font-black tracking-widest text-ub-green-medium">SYSTEM DIAGNOSTICS: NOMINAL</span>
                        </div>
                    ))}
                </div>
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
            </div>

            {/* Corporate KPI Strip */}
            <section className="relative z-20 px-4 md:px-8 py-16 bg-white">
                <div className="max-w-7xl mx-auto glass backdrop-blur-2xl bg-white border border-gray-100 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 md:p-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
                        {[
                            { val: '1,248+', label: 'Issues Resolved', icon: BarChart3 },
                            { val: '< 5 min', label: 'Average Response Time', icon: Activity },
                            { val: '450+', label: 'Active Citizens', icon: Users },
                            { val: '100%', label: 'Data Encrypted', icon: Shield }
                        ].map((stat, idx) => (
                            <div key={idx} className={`text-center flex flex-col items-center justify-center group ${idx !== 0 && 'pl-8'}`}>
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-ub-blue-hero flex items-center justify-center mb-4 group-hover:bg-ub-blue-hero group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-sm relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                    <stat.icon size={22} className="relative z-10" />
                                </div>
                                <div className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">{stat.val}</div>
                                <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Architecture Overview Section - Bento Box Spotlight Design */}
            <section className="py-24 relative overflow-hidden bg-gray-50" onMouseMove={handleMouseMove}>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-100/50 to-transparent blur-3xl rounded-full opacity-50 -z-10 -mr-40 -mt-40"></div>

                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-fadeIn">
                        <span className="text-ub-blue-hero font-black tracking-[0.2em] uppercase text-xs">How It Works</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-6 tracking-tight">Fix Your Neighbourhood. Faster.</h2>
                        <p className="text-gray-500 font-medium text-lg">CivicConnect replaces outdated complaint hotlines with a transparent, real-time tracking platform built for modern cities.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Bento Card 1 */}
                        <div className="group relative rounded-[32px] bg-zinc-100 border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 40%)` }}
                            />
                            <div className="absolute inset-[1px] bg-white rounded-[31px] z-10"></div>

                            <div className="relative z-20 p-10 flex flex-col h-full bg-gradient-to-b from-white to-white/90">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors -z-10"></div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-ub-blue-hero text-white mb-8 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <MapPin size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">GPS-Powered Location</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    Simply tap to detect your location automatically, or drop a pin right where the issue is. No need to type long addresses.
                                </p>
                            </div>
                        </div>

                        {/* Bento Card 2 */}
                        <div className="group relative rounded-[32px] bg-zinc-100 border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.1), transparent 40%)` }}
                            />
                            <div className="absolute inset-[1px] bg-white rounded-[31px] z-10"></div>

                            <div className="relative z-20 p-10 flex flex-col h-full bg-gradient-to-b from-white to-white/90">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-100 transition-colors -z-10"></div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white mb-8 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Activity size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Real-Time Dashboards</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    Every submitted report instantly appears on the admin dashboard, allowing municipal teams to prioritize, assign crews, and resolve issues faster.
                                </p>
                            </div>
                        </div>

                        {/* Bento Card 3 */}
                        <div className="group relative rounded-[32px] bg-zinc-100 border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.1), transparent 40%)` }}
                            />
                            <div className="absolute inset-[1px] bg-white rounded-[31px] z-10"></div>

                            <div className="relative z-20 p-10 flex flex-col h-full bg-gradient-to-b from-white to-white/90">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-green-100 transition-colors -z-10"></div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-ub-green-dark text-white mb-8 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Transparent Tracking</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    Track your reported issue at every stage — from submitted, to under review, to crew dispatched, to fully resolved. No more wondering.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-28 relative overflow-hidden bg-gray-50 border-t border-gray-200">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-ub-blue-hero blur-[200px] opacity-5 pointer-events-none"></div>

                <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-ub-blue-hero font-black tracking-[0.2em] uppercase text-xs">About CivicConnect</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-6 tracking-tight">Built for Citizens. <br />Trusted by Cities.</h2>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed">
                            CivicConnect is a modern civic engagement platform designed to bridge the gap between citizens and municipal authorities. We believe every pothole fixed, every streetlight repaired, and every water leak stopped starts with an empowered community.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center group hover:shadow-xl transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-ub-blue-hero mx-auto mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-ub-blue-hero group-hover:text-white transition-all shadow-sm">
                                <Eye size={28} />
                            </div>
                            <h3 className="font-black text-xl text-gray-900 mb-3 tracking-tight">Our Mission</h3>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">Make civic issue reporting as easy as sending a text. We aim to give every citizen a direct voice in improving their neighbourhood.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center group hover:shadow-xl transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all shadow-sm">
                                <Heart size={28} />
                            </div>
                            <h3 className="font-black text-xl text-gray-900 mb-3 tracking-tight">Community First</h3>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">Every feature is designed with real citizens in mind. Simple forms, GPS auto-detection, photo uploads, and a volunteer system that brings people together.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center group hover:shadow-xl transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                                <Zap size={28} />
                            </div>
                            <h3 className="font-black text-xl text-gray-900 mb-3 tracking-tight">Built to Scale</h3>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">From a single ward to an entire metro area. CivicConnect's architecture is designed to handle thousands of reports across multiple cities.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-10 md:p-14">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-6">How It Works</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-5">
                                        <div className="w-10 h-10 rounded-xl bg-ub-blue-hero text-white flex items-center justify-center font-black shrink-0 shadow-lg">1</div>
                                        <div>
                                            <div className="font-black text-gray-900 mb-1">Spot an Issue</div>
                                            <div className="text-sm text-gray-500 font-medium">See a pothole, broken light, or waste pile? Open CivicConnect on your phone.</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="w-10 h-10 rounded-xl bg-ub-blue-hero text-white flex items-center justify-center font-black shrink-0 shadow-lg">2</div>
                                        <div>
                                            <div className="font-black text-gray-900 mb-1">Report It</div>
                                            <div className="text-sm text-gray-500 font-medium">Take a photo, let GPS auto-detect your location. Add a brief description and submit.</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="w-10 h-10 rounded-xl bg-ub-blue-hero text-white flex items-center justify-center font-black shrink-0 shadow-lg">3</div>
                                        <div>
                                            <div className="font-black text-gray-900 mb-1">Track Resolution</div>
                                            <div className="text-sm text-gray-500 font-medium">Watch your report move through the pipeline — from review to crew dispatch to resolved.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-10 border border-gray-100 text-center">
                                <div className="text-6xl font-black text-gray-900 tracking-tighter mb-2">3</div>
                                <div className="text-[11px] font-black uppercase tracking-widest text-ub-blue-hero mb-6">Simple Steps</div>
                                <p className="text-gray-500 font-medium text-sm">From spotting an issue to resolution — CivicConnect keeps it simple, transparent, and community-driven.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden border-t border-gray-200 bg-white">
                <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-multiply pointer-events-none"></div>

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                        <Fingerprint size={32} className="text-gray-400 drop-shadow-sm" />
                    </div>

                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-8 leading-[1.1]">
                        Join Your <br />Community Today.
                    </h2>

                    <p className="text-gray-500 text-lg font-medium mb-12 max-w-2xl mx-auto">
                        Connect directly to your municipal network. Start reporting local issues and hold infrastructure teams accountable with real-time tracking.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Link to="/register" className="relative hidden md:inline-flex group overflow-hidden bg-black text-white px-10 py-5 rounded-2xl font-black hover:scale-105 transition-transform text-lg tracking-wider">
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
