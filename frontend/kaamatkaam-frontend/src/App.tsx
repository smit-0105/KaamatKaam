import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage from "./pages/Home/HomePage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import SearchResults from "./pages/Rides/SearchResults";
import RideDetail from "./pages/Rides/RideDetail";
import PublishRide from "./pages/Rides/PublishRide";
import MyRides from "./pages/Dashboard/MyRides";
import MyBookings from "./pages/Dashboard/MyBookings";
import ProfilePage from "./pages/Profile/ProfilePage";
import ChatPage from "./pages/Chat/ChatPage";
import NotFound from "./pages/NotFound";

const App: React.FC = () => {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
          },
        }}
      />
      <Router>
        <Routes>
          {/* Auth Routes (no navbar/footer) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/rides/:id" element={<RideDetail />} />

            {/* Protected Routes */}
            <Route path="/rides/publish" element={<ProtectedRoute><PublishRide /></ProtectedRoute>} />
            <Route path="/dashboard/rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
