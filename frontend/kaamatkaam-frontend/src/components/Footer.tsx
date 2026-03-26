import React from "react";
import { Link } from "react-router-dom";
import { Car, Globe, Hash, ExternalLink, Mail, Heart } from "lucide-react";
import Logo from "../Images/Logo.jpg";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={Logo} alt="KaamatKaam Logo" className="h-10 w-auto object-contain rounded-lg" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's trusted ride-sharing platform. Share rides, save money, reduce your carbon footprint.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-primary-400 transition-colors">Search Rides</Link></li>
              <li><Link to="/rides/publish" className="hover:text-primary-400 transition-colors">Offer a Ride</Link></li>
              <li><Link to="/dashboard/bookings" className="hover:text-primary-400 transition-colors">My Bookings</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Trust & Safety</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Hash className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} KaamatKaam. All rights reserved.</p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
