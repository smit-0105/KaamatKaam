import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../Images/Logo.jpg"; // ✅ Adjust path if needed (e.g. "../Logo.jpg")

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center bg-white px-6 md:px-10 py-4 shadow-md fixed top-0 w-full z-50">
      {/* Logo Section */}
      <Link to="/" className="flex items-center space-x-2">
        <img src={Logo} alt="KaamatKaam Logo" className="h-10 w-10 object-contain" />
        <span className="text-2xl font-bold text-blue-600">
          Kaamat<span className="text-green-500">Kaam</span>
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 text-gray-700 font-medium">
        <Link to="/trips" className="hover:text-blue-600 transition">Find Trips</Link>
        <Link to="/add-trip" className="hover:text-blue-600 transition">Post Trip</Link>
        <Link to="/requests" className="hover:text-blue-600 transition">Requests</Link>
        <Link to="/chat" className="hover:text-blue-600 transition">Chat</Link>
      </div>

      {/* Auth Buttons */}
      <div className="hidden md:flex items-center">
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="text-blue-600 border border-blue-600 px-4 py-2 rounded-md mr-2 hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Register
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden text-gray-700 focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center py-4 space-y-4 md:hidden">
          <Link to="/trips" onClick={() => setMenuOpen(false)}>Find Trips</Link>
          <Link to="/add-trip" onClick={() => setMenuOpen(false)}>Post Trip</Link>
          <Link to="/requests" onClick={() => setMenuOpen(false)}>Requests</Link>
          <Link to="/chat" onClick={() => setMenuOpen(false)}>Chat</Link>

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
