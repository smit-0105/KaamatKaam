import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Package, Search } from "lucide-react";

interface SearchBarProps {
  variant?: "hero" | "compact";
  initialValues?: { origin?: string; destination?: string; date?: string; weight?: number };
}

const SearchBar: React.FC<SearchBarProps> = ({ variant = "hero", initialValues }) => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState(initialValues?.origin || "");
  const [destination, setDestination] = useState(initialValues?.destination || "");
  const [date, setDate] = useState(initialValues?.date || "");
  const [weight, setWeight] = useState<number | string>(initialValues?.weight || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    if (weight) params.set("weight", weight.toString());
    navigate(`/search?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="From" value={origin} onChange={(e) => setOrigin(e.target.value)} className="input-field !pl-9 !py-2.5 text-sm" />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input type="text" placeholder="To" value={destination} onChange={(e) => setDestination(e.target.value)} className="input-field !pl-9 !py-2.5 text-sm" />
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field !py-2.5 text-sm sm:w-40" />
        <button type="submit" className="btn-primary !py-2.5 !px-5 text-sm">
          <Search className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-2 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-0">
        {/* Origin */}
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <div className="w-3 h-3 rounded-full bg-primary-500 ring-2 ring-primary-200" />
          </div>
          <input
            type="text" placeholder="Leaving from..." value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full pl-12 pr-4 py-5 text-lg border-0 focus:ring-0 outline-none bg-transparent rounded-xl focus:bg-gray-50 transition-colors placeholder:text-gray-400"
          />
        </div>

        <div className="hidden lg:block w-px bg-gray-200 my-3" />
        <div className="lg:hidden h-px bg-gray-200 mx-4" />

        {/* Destination */}
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <div className="w-3 h-3 rounded-full bg-accent-500 ring-2 ring-accent-200" />
          </div>
          <input
            type="text" placeholder="Going to..." value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full pl-12 pr-4 py-5 text-lg border-0 focus:ring-0 outline-none bg-transparent rounded-xl focus:bg-gray-50 transition-colors placeholder:text-gray-400"
          />
        </div>

        <div className="hidden lg:block w-px bg-gray-200 my-3" />
        <div className="lg:hidden h-px bg-gray-200 mx-4" />

        {/* Date */}
        <div className="relative lg:w-48">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="date" value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full pl-12 pr-4 py-5 text-lg border-0 focus:ring-0 outline-none bg-transparent rounded-xl focus:bg-gray-50 transition-colors"
          />
        </div>

        <div className="hidden lg:block w-px bg-gray-200 my-3" />
        <div className="lg:hidden h-px bg-gray-200 mx-4" />

        {/* Weight */}
        <div className="relative lg:w-36">
          <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="number"
            min="1"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full pl-12 pr-4 py-5 text-lg border-0 focus:ring-0 outline-none bg-transparent rounded-xl focus:bg-gray-50 transition-colors placeholder:text-gray-400"
          />
        </div>

        {/* Search Button */}
        <div className="p-2">
          <button
            type="submit"
            className="w-full lg:w-auto gradient-bg text-white px-8 py-4 rounded-xl font-semibold text-lg
                       hover:opacity-90 active:opacity-80 transition-all duration-200
                       flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
