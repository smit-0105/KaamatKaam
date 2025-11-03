import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import HomePage from "./pages/Home/HomePage";
import ChatPage from "./pages/Chat/ChatPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import CreateRequest from "./pages/Requests/CreateRequest";
import MyRequests from "./pages/Requests/MyRequests";
import AddTrip from "./pages/Trips/AddTrip";
import TripList from "./pages/Trips/TripList";
import TripDetails from "./pages/Trips/TripDetails";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import NotFound from "./pages/NotFound";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Main Application Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/requests/create" element={<CreateRequest />} />
          <Route path="/requests/my" element={<MyRequests />} />
          <Route path="/trips/add" element={<AddTrip />} />
          <Route path="/trips" element={<TripList />} />
          <Route path="/trips/:id" element={<TripDetails />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
