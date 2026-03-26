import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { rideApi } from "../../api/rideApi";
import { bookingApi } from "../../api/bookingApi";
import { chatApi } from "../../api/chatApi";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import { PageSpinner } from "../../components/ui/Spinner";
import { format } from "date-fns";
import {
  MapPin, ArrowRight, Calendar, Package, Plus, Car, Check, X,
  Clock, MessageCircle, Eye, Trash2, ChevronDown, ChevronUp,
  Weight, IndianRupee, TrendingUp, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  upcoming: "info", ongoing: "warning", completed: "success", cancelled: "danger",
};

const MyRides: React.FC = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Record<string, any[]>>({});
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchRides(); }, []);

  const fetchRides = async () => {
    try {
      const res = await rideApi.getMyRides();
      setRides(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleBookings = async (rideId: string) => {
    if (expandedRide === rideId) {
      setExpandedRide(null);
      return;
    }
    setExpandedRide(rideId);
    if (!bookings[rideId]) {
      try {
        const res = await bookingApi.getForRide(rideId);
        setBookings((p) => ({ ...p, [rideId]: res.data.data }));
      } catch { toast.error("Failed to load bookings"); }
    }
  };

  const handleBookingAction = async (bookingId: string, action: "confirmed" | "rejected", rideId: string) => {
    try {
      await bookingApi.respond(bookingId, action);
      toast.success(`Booking ${action}`);
      setBookings((p) => ({ ...p, [rideId]: undefined as any }));
      const res = await bookingApi.getForRide(rideId);
      setBookings((p) => ({ ...p, [rideId]: res.data.data }));
      fetchRides();
    } catch (err: any) { toast.error(err.response?.data?.message || "Action failed"); }
  };

  const handleCancelRide = async (rideId: string) => {
    if (!confirm("Are you sure you want to cancel this trip? All pending bookings will be cancelled.")) return;
    try {
      await rideApi.cancel(rideId);
      toast.success("Trip cancelled successfully");
      fetchRides();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to cancel trip"); }
  };

  const handleContactSender = async (senderId: string, rideId: string) => {
    try {
      const res = await chatApi.getOrCreateConversation(senderId, rideId);
      navigate("/inbox", { state: { conversationId: res.data.data._id } });
    } catch { toast.error("Failed to start conversation"); }
  };

  const filteredRides = filter === "all" ? rides : rides.filter((r) => r.status === filter);

  // Stats
  const stats = {
    total: rides.length,
    upcoming: rides.filter(r => r.status === "upcoming").length,
    completed: rides.filter(r => r.status === "completed").length,
    totalEarnings: rides.filter(r => r.status === "completed").reduce((acc, r) => {
      const rideBookings = bookings[r._id] || [];
      return acc + rideBookings.reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);
    }, 0),
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-500 mt-1">Trips you're offering to carry parcels</p>
        </div>
        <Link to="/rides/publish">
          <Button><Plus className="w-4 h-4 mr-2" /> Publish new trip</Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Car className="w-4 h-4" /> Total Trips</div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-blue-500 text-sm mb-1"><Clock className="w-4 h-4" /> Upcoming</div>
          <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-green-500 text-sm mb-1"><Check className="w-4 h-4" /> Completed</div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-primary-500 text-sm mb-1"><TrendingUp className="w-4 h-4" /> Earnings</div>
          <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "upcoming", "ongoing", "completed", "cancelled"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === f ? "bg-primary-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && <span className="ml-1 opacity-60">({rides.filter(r => f === "all" || r.status === f).length})</span>}
          </button>
        ))}
      </div>

      {/* Rides List */}
      {filteredRides.length === 0 ? (
        <div className="text-center py-16">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No trips yet</h3>
          <p className="text-gray-500 mb-4">Start sharing your journey to deliver parcels</p>
          <Link to="/rides/publish"><Button>Publish your first trip</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRides.map((ride) => (
            <div key={ride._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-lg">{ride.origin?.city}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-lg">{ride.destination?.city}</span>
                      <Badge variant={statusColors[ride.status]}>{ride.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(ride.departureDate), "dd MMM yyyy")}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {ride.departureTime}</span>
                      <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {ride.availableWeightCapacity}/{ride.totalWeightCapacity} kg</span>
                      <span className="font-medium text-primary-600">₹{ride.pricePerKg}/kg</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/rides/${ride._id}`}>
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4 mr-1" /> View</Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => toggleBookings(ride._id)}>
                      {expandedRide === ride._id ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                      Bookings
                    </Button>
                    {ride.status === "upcoming" && (
                      <Button variant="danger" size="sm" onClick={() => handleCancelRide(ride._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Bookings Panel */}
              {expandedRide === ride._id && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Booking Requests
                    {bookings[ride._id] && <span className="text-gray-400">({bookings[ride._id].length})</span>}
                  </h4>
                  {!bookings[ride._id] ? (
                    <p className="text-sm text-gray-400">Loading...</p>
                  ) : bookings[ride._id].length === 0 ? (
                    <div className="text-center py-6">
                      <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No bookings yet for this trip</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings[ride._id].map((booking: any) => (
                        <div key={booking._id} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <Avatar src={booking.sender?.profilePhoto} name={booking.sender?.name} size="sm" />
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{booking.sender?.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-0.5"><Weight className="w-3 h-3" /> {booking.weightBooked} kg</span>
                                <span>·</span>
                                <span className="flex items-center gap-0.5"><IndianRupee className="w-3 h-3" /> {booking.totalPrice}</span>
                              </div>
                              {booking.parcelDescription && (
                                <p className="text-xs text-gray-400 mt-1 max-w-[250px] truncate">📦 {booking.parcelDescription}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusColors[booking.status] || "default"}>{booking.status}</Badge>
                            {booking.status === "pending" && (
                              <>
                                <button onClick={() => handleBookingAction(booking._id, "confirmed", ride._id)} className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors" title="Accept">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleBookingAction(booking._id, "rejected", ride._id)} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors" title="Reject">
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {booking.sender?._id && (
                              <button onClick={() => handleContactSender(booking.sender._id, ride._id)} className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors" title="Message sender">
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRides;
