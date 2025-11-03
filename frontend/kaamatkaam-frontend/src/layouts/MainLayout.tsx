import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout: React.FC = () => {
  console.log("✅ MainLayout Rendered");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-16 px-4 sm:px-8">
        <h1 className="text-center text-xl font-bold text-red-500">
          MAIN LAYOUT LOADED
        </h1>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
