import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, ShieldCheck, Users, Activity, MapPin } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="overflow-hidden">

            {/* Dynamic Animated Hero Section */}
            <section className="relative bg-ub-blue-hero text-white min-h-[90vh] flex flex-col justify-center overflow-hidden pt-24 pb-12">
                {/* Animated Background Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-ub-green-medium rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-[400px] h-[400px] bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ub-blue-hero/90"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-fadeIn">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-black tracking-widest mb-8 shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-ub-green-medium animate-pulse"></span>
                            CIVICCONNECT INTELLIGENCE PLATFORM
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
                            Crowdsource <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ub-green-mint to-blue-200">
                                Urban Solutions.
                            </span>
                        </h1>

                        <p className="text-blue-50 text-lg md:text-xl font-medium mb-10 max-w-lg leading-relaxed shadow-sm">
                            Snap a photo, drop a geographic pin, and structurally escalate local infrastructural defects directly to Ubayog municipal teams.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/report" className="bg-ub-green-medium text-white px-8 py-4 rounded-xl font-black shadow-[0_0_40px_rgba(46,125,50,0.4)] hover:shadow-[0_0_60px_rgba(46,125,50,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg">
                                Initiate Report <ArrowRight size={20} />
                            </Link>
                            <Link to="/map" className="glass hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg">
                                <MapPin size={20} /> View Global Fleet
                            </Link>
                        </div>
                    </div>

                    {/* Floating Dashboard Preview Card */}
                    <div className="relative animate-float mt-10 lg:mt-0">
                        <div className="glass-dark rounded-3xl p-6 lg:p-8 relative z-20 overflow-hidden group border-t border-l border-white/20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-ub-green-medium/30 blur-2xl rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>

                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white tracking-widest text-xs uppercase">Live Pipeline Stream</h3>
                                <div className="flex gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 flex items-center gap-4 border border-white/5 cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg">🕳️</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <div className="font-bold text-white">Critical Depth Pothole</div>
                                            <div className="text-[10px] font-black uppercase text-red-300 tracking-wider">High Priority</div>
                                        </div>
                                        <div className="text-xs text-blue-200">#ISS-8B29 • Logged 2m ago</div>
                                    </div>
                                </div>
                                <div className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 flex items-center gap-4 border border-white/5 cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">💧</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <div className="font-bold text-white">Main Pipeline Rupture</div>
                                            <div className="text-[10px] font-black uppercase text-amber-300 tracking-wider">In Progress</div>
                                        </div>
                                        <div className="text-xs text-blue-200">#ISS-4A11 • Escorted Team 3</div>
                                    </div>
                                </div>
                                <div className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 flex items-center gap-4 border border-white/5 cursor-pointer opacity-70">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shrink-0 shadow-lg">✅</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <div className="font-bold text-white line-through decoration-white/30">Fallen Oak Blockage</div>
                                            <div className="text-[10px] font-black uppercase text-green-300 tracking-wider">Resolved</div>
                                        </div>
                                        <div className="text-xs text-blue-200">#ISS-9F02 • Cleared at 08:30 AM</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Background Elements behind the card */}
                        <div className="absolute -bottom-8 -left-8 glass-dark p-4 rounded-xl w-40 animate-float-delayed z-30">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity size={16} className="text-ub-green-mint" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">System Status</span>
                            </div>
                            <div className="font-black text-2xl text-ub-green-medium">99.9%</div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Analytics KPI Ribbon */}
            <section className="bg-gray-50 border-b border-ub-border relative z-20 -mt-10 lg:mt-0 pb-12 pt-16 lg:pt-12">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { val: '1,248+', label: 'Registered Anomalies' },
                            { val: '93%', label: 'Resolution Rate' },
                            { val: '450+', label: 'Active Citizen Nodes' },
                            { val: '< 3.2', label: 'Days Avg Repair' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center group hover:shadow-xl hover:-translate-y-1 transition-all">
                                <div className="text-3xl lg:text-4xl font-black text-ub-blue-hero mb-2 group-hover:scale-110 transition-transform inline-block mix-blend-multiply">{stat.val}</div>
                                <div className="text-xs uppercase tracking-widest font-bold text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Intelligence Workflow Engine */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-ub-green-medium font-black tracking-widest uppercase text-xs">Proprietary Architecture</span>
                        <h2 className="text-4xl font-black text-ub-text-primary mt-2 mb-4">A Next-Gen Reporting Pipeline.</h2>
                        <p className="text-gray-500 font-medium">Ubayog’s CivicConnect leverages Anthropic Claude AI routing and real-time Geographic mapping to eliminate municipal bureaucracy.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="group rounded-3xl p-8 bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 hover:border-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 text-9xl font-black opacity-[0.03] -mr-8 -mt-8 text-black group-hover:text-ub-blue-hero transition-colors">1</div>
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform text-ub-blue-hero border border-gray-100">
                                <AlertTriangle size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black mb-3">Capture & Pin</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                Notice a defect? Take a photo. Our system automatically rips the GPS coordinate data and structurally formats the anomaly into a ticket.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="group rounded-3xl p-8 bg-gray-50 hover:bg-purple-50 transition-colors border border-gray-100 hover:border-purple-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 text-9xl font-black opacity-[0.03] -mr-8 -mt-8 text-black group-hover:text-purple-600 transition-colors">2</div>
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform text-purple-600 border border-gray-100">
                                <ShieldCheck size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black mb-3">DeepVerify AI Routing</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                Tickets run through Claude 3 LLMs instantly. Duplicate logic blocks spam, and the system intelligently categorizes priority before human intervention.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="group rounded-3xl p-8 bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 text-9xl font-black opacity-[0.03] -mr-8 -mt-8 text-black group-hover:text-ub-green-dark transition-colors">3</div>
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform text-ub-green-medium border border-gray-100">
                                <Users size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black mb-3">Resolution & Upvoting</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                Fellow citizens upvote the ticket. Watch the status transition down the 4-stage deployment pipeline dynamically as field crews act.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-ub-blue-dark to-ub-blue-hero text-white text-center px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-black/10 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-ub-green-medium rounded-full blur-[100px] opacity-20"></div>
                </div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Drive Impact Today.</h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Access the CivicConnect platform, register your identity node, and start optimizing the physical infrastructure of your city.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-white text-ub-blue-hero px-10 py-4 rounded-xl font-black shadow-2xl hover:scale-105 transition-transform">
                            Create Identity Account
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
