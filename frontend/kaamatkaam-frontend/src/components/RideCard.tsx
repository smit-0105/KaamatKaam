import React from "react";
import { Star, MapPin, Clock, Package, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "./ui/Avatar";
import { format } from "date-fns";

interface RideCardProps {
  ride: any;
}

const RideCard: React.FC<RideCardProps> = ({ ride }) => {
  const departureDate = new Date(ride.departureDate);

  return (
    <Link to={`/rides/${ride._id}`} className="block">
      <div className="card group cursor-pointer hover:border-primary-200 border border-transparent">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Route Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 text-gray-800">
                <div className="w-3 h-3 rounded-full bg-primary-500 ring-2 ring-primary-200" />
                <span className="font-semibold text-lg">{ride.origin?.city}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex items-center gap-2 text-gray-800">
                <div className="w-3 h-3 rounded-full bg-accent-500 ring-2 ring-accent-200" />
                <span className="font-semibold text-lg">{ride.destination?.city}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(departureDate, "EEE, dd MMM")} · {ride.departureTime}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {ride.availableWeightCapacity} kg capacity left
              </span>
              {ride.stops?.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {ride.stops.length} stop{ride.stops.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Driver & Price */}
          <div className="flex items-center gap-4 md:flex-col md:items-end">
            <div className="text-right">
              <span className="text-2xl font-bold text-primary-600">₹{ride.pricePerKg}</span>
              <p className="text-xs text-gray-400">per kg</p>
            </div>

            {ride.driver && (
              <div className="flex items-center gap-2">
                <Avatar src={ride.driver.profilePhoto} name={ride.driver.name} size="sm" />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{ride.driver.name}</p>
                  {ride.driver.avgRating > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{ride.driver.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Accepted Items pills */}
        {ride.acceptedItemTypes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            {ride.acceptedItemTypes.map((type: string) => (
              <span key={type} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">📦 {type}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default RideCard;
