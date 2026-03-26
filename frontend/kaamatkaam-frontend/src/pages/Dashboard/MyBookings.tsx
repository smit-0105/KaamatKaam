import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookingApi } from "../../api/bookingApi";
import { chatApi } from "../../api/chatApi";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import { PageSpinner } from "../../components/ui/Spinner";
import { format } from "date-fns";
import {
  ArrowRight, Calendar, Clock, Ticket, Package, MessageCircle,
  Eye, XCircle, CheckCircle, AlertCircle, Truck, Weight, IndianRupee
} from "lucide-react";
import toast from "react-hot-toast";

const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "info" | "default"; icon: any; label: string }> = {
  pending: { variant: "warning", icon: Clock, label: "Pending Approval" },
  confirmed: { variant: "success", icon: CheckCircle, label: "Confirmed" },
  rejected: { variant: "danger", icon: XCircle, label: "Rejected" },
  cancelled: { variant: "danger", icon: XCircle, label: "Cancelled" },
  completed: { variant: "info", icon: CheckCircle, label: "Delivered" },
};

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingApi.cancel(id, "Cancelled by sender");
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (err: any) { toast.error(err.response?.data?.message || "Cancel failed"); }
  };

  const handleContactDriver = async (driverId: string, rideId: string) => {
    try {
      const res = await chatApi.getOrCreateConversation(driverId, rideId);
      navigate("/inbox", { state: { conversationId: res.data.data._id } });
    } catch { toast.error("Failed to start conversation"); }
  };

  const filteredBookings = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    totalSpent: bookings.filter(b => ["confirmed", "completed"].includes(b.status)).reduce((acc, b) => acc + (b.totalPrice || 0), 0),
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1">Parcels you've booked to send</p>
        </div>
        <Link to="/search">
          <Button><Package className="w-4 h-4 mr-2" /> Find a trip</Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Ticket className="w-4 h-4" /> Total</div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-amber-500 text-sm mb-1"><Clock className="w-4 h-4" /> Pending</div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-green-500 text-sm mb-1"><CheckCircle className="w-4 h-4" /> Confirmed</div>
          <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-primary-500 text-sm mb-1"><IndianRupee className="w-4 h-4" /> Spent</div>
          <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === f ? "bg-primary-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && <span className="ml-1 opacity-60">({bookings.filter(b => b.status === f).length})</span>}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-4">Find a trip and start sending your parcels</p>
          <Link to="/search"><Button>Search for trips</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const sc = statusConfig[booking.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Route & Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="font-semibold text-lg">{booking.ride?.origin?.city}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-lg">{booking.ride?.destination?.city}</span>
                        <Badge variant={sc.variant}>
                          <StatusIcon className="w-3 h-3 mr-1" /> {sc.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {booking.ride?.departureDate && format(new Date(booking.ride.departureDate), "dd MMM yyyy")}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {booking.ride?.departureTime}</span>
                        <span className="flex items-center gap-1"><Weight className="w-4 h-4" /> {booking.weightBooked} kg</span>
                        <span className="flex items-center gap-1 font-semibold text-primary-600"><IndianRupee className="w-4 h-4" /> {booking.totalPrice}</span>
                      </div>

                      {booking.parcelDescription && (
                        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                          📦 {booking.parcelDescription}
                        </p>
                      )}

                      {/* Driver info */}
                      {booking.ride?.driver && (
                        <div className="flex items-center gap-2">
                          <Avatar src={booking.ride.driver.profilePhoto} name={booking.ride.driver.name} size="sm" />
                          <div>
                            <span className="text-sm text-gray-600">Traveler: <span className="font-medium">{booking.ride.driver.name}</span></span>
                            {booking.ride.driver.avgRating > 0 && (
                              <span className="text-xs text-amber-500 ml-2">★ {booking.ride.driver.avgRating.toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:items-end justify-start">
                      <Link to={`/rides/${booking.ride?._id}`}>
                        <Button variant="secondary" size="sm"><Eye className="w-4 h-4 mr-1" /> View Trip</Button>
                      </Link>
                      {booking.ride?.driver?._id && (
                        <Button variant="ghost" size="sm" onClick={() => handleContactDriver(booking.ride.driver._id, booking.ride._id)}>
                          <MessageCircle className="w-4 h-4 mr-1" /> Message
                        </Button>
                      )}
                      {["pending", "confirmed"].includes(booking.status) && (
                        <Button variant="danger" size="sm" onClick={() => handleCancel(booking._id)}>
                          <XCircle className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
                  <div className="flex items-center gap-1 text-xs overflow-x-auto">
                    {["Requested", "Confirmed", "In Transit", "Delivered"].map((step, i) => {
                      const stepIndex = ["pending", "confirmed", "ongoing", "completed"].indexOf(booking.status);
                      const isActive = i <= stepIndex;
                      const isCurrent = i === stepIndex;
                      return (
                        <React.Fragment key={step}>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full whitespace-nowrap ${
                            isCurrent ? "bg-primary-500 text-white font-medium" :
                            isActive ? "text-primary-600 font-medium" : "text-gray-400"
                          }`}>
                            {isActive ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                            {step}
                          </div>
                          {i < 3 && <div className={`flex-1 h-0.5 min-w-[20px] ${isActive ? "bg-primary-400" : "bg-gray-200"}`} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
