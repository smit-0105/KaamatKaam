import React from "react";
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import Button from "../components/ui/Button";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like this page took a wrong turn. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/"><Button><Home className="w-4 h-4 mr-2" /> Go Home</Button></Link>
          <Link to="/search"><Button variant="secondary"><Search className="w-4 h-4 mr-2" /> Search Rides</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
