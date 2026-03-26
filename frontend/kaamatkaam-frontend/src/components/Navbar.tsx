import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Car, Search, User, LogOut, Plus, MapPin, MessageCircle, LayoutDashboard } from "lucide-react";
import Avatar from "./ui/Avatar";
import Logo from "../Images/Logo.jpg";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={Logo} alt="KaamatKaam Logo" className="h-10 w-auto object-contain rounded-lg" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/search" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all font-medium">
              <Search className="w-4 h-4" />
              Search
            </Link>

            {user && (
              <>
                <Link to="/rides/publish" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all font-medium">
                  <Plus className="w-4 h-4" />
                  Publish a ride
                </Link>
                <Link to="/dashboard/rides" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all font-medium">
                  <LayoutDashboard className="w-4 h-4" />
                  My Rides
                </Link>
                <Link to="/inbox" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all font-medium">
                  <MessageCircle className="w-4 h-4" />
                  Inbox
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Avatar src={user.profilePhoto} name={user.name} size="sm" />
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-slide-down">
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <Link to="/dashboard/rides" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <MapPin className="w-4 h-4" /> My Rides
                      </Link>
                      <Link to="/dashboard/bookings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Car className="w-4 h-4" /> My Bookings
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-xl transition-all">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-5">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            <Link to="/search" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
              <Search className="w-5 h-5" /> Search rides
            </Link>
            {user && (
              <>
                <Link to="/rides/publish" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                  <Plus className="w-5 h-5" /> Publish a ride
                </Link>
                <Link to="/dashboard/rides" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                  <MapPin className="w-5 h-5" /> My Rides
                </Link>
                <Link to="/dashboard/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                  <Car className="w-5 h-5" /> My Bookings
                </Link>
                <Link to="/inbox" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                  <MessageCircle className="w-5 h-5" /> Inbox
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                  <User className="w-5 h-5" /> Profile
                </Link>
                <div className="border-t border-gray-100 my-2" />
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium w-full">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            )}
            {!user && (
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-3 border-2 border-primary-500 text-primary-600 rounded-xl font-semibold">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-3 bg-primary-500 text-white rounded-xl font-semibold">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
