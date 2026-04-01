import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-ub-bg-surface border-t border-ub-border py-12 px-4 md:px-8 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div className="text-ub-green-logo font-bold text-xl mb-4">UBAYOG</div>
                    <p className="text-sm text-ub-text-secondary">
                        CivicConnect is a modern platform integrated with Ubayog to report local civic problems, track resolutions, and empower communities.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-ub-text-primary mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-ub-text-secondary">
                        <li><Link to="/map" className="hover:text-ub-green-medium">Live Map</Link></li>
                        <li><Link to="/report" className="hover:text-ub-green-medium">Report Issue</Link></li>
                        <li><Link to="/" className="hover:text-ub-green-medium">About</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-ub-text-primary mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-ub-text-secondary">
                        <li>Phone: 1800-UBAYOG</li>
                        <li>Email: support@ubayog.com</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-ub-text-primary mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-ub-text-secondary">
                        <li>Terms of Service</li>
                        <li>Privacy Policy</li>
                        <li>© {new Date().getFullYear()} Ubayog</li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
