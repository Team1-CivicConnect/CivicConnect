import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-[#0A0F1C] text-gray-400 py-16 px-4 md:px-8 mt-auto border-t border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-ub-blue-hero blur-[180px] opacity-5 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                <div className="md:col-span-1">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ub-blue-hero to-ub-green-medium flex items-center justify-center text-white font-black text-[10px] shadow-lg">CC</div>
                        <span className="font-black text-xl text-white tracking-tight">Civic<span className="text-green-400">Connect</span></span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        A modern civic engagement platform to report infrastructure issues, track resolutions in real-time, and empower communities.
                    </p>
                </div>
                <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest mb-5">Quick Links</h4>
                    <ul className="space-y-3 text-sm font-semibold">
                        <li><Link to="/map" className="hover:text-white transition-colors">Live Map</Link></li>
                        <li><Link to="/report" className="hover:text-white transition-colors">Report Issue</Link></li>
                        <li><Link to="/" className="hover:text-white transition-colors">About</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest mb-5">Support</h4>
                    <ul className="space-y-3 text-sm font-semibold">
                        <li>support@civicconnect.in</li>
                        <li>1800-CIVIC-00</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest mb-5">Legal</h4>
                    <ul className="space-y-3 text-sm font-semibold">
                        <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <div className="text-xs font-bold text-gray-600">© {new Date().getFullYear()} CivicConnect. All rights reserved.</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-700">Powered by CivicConnect Platform</div>
            </div>
        </footer>
    );
}
