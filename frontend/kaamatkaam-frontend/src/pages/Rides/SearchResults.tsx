import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { rideApi } from "../../api/rideApi";
import SearchBar from "../../components/SearchBar";
import RideCard from "../../components/RideCard";
import { PageSpinner } from "../../components/ui/Spinner";
import { SearchX, Filter, ArrowUpDown } from "lucide-react";

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [sortBy, setSortBy] = useState("departure");

  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const weight = searchParams.get("weight") || "";

  useEffect(() => {
    fetchRides();
  }, [origin, destination, date, weight, sortBy]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (origin) params.origin = origin;
      if (destination) params.destination = destination;
      if (date) params.date = date;
      if (weight) params.weight = weight;
      if (sortBy === "price_asc") params.sortBy = "price_asc";
      if (sortBy === "price_desc") params.sortBy = "price_desc";

      const res = await rideApi.search(params);
      setRides(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar variant="compact" initialValues={{ origin, destination, date, weight: weight ? parseInt(weight) : undefined }} />
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {origin && destination ? `${origin} → ${destination}` : "All available trips"}
          </h1>
          {!loading && <p className="text-gray-500 mt-1">{pagination?.total || 0} trip{(pagination?.total || 0) !== 1 ? "s" : ""} found</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="departure">Earliest departure</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <PageSpinner />
      ) : rides.length > 0 ? (
        <div className="space-y-4">
          {rides.map((ride) => (
            <RideCard key={ride._id} ride={ride} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No trips found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {origin || destination
              ? "Try adjusting your search criteria or check back later for new trips."
              : "No trips are available right now. Check back soon!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
