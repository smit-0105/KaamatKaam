// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rideApi } from "../../api/rideApi";
import { bookingApi } from "../../api/bookingApi";
import { chatApi } from "../../api/chatApi";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";
import { format } from "date-fns";
import { MapPin, Clock, Package, Star, Shield, Calendar, Car, MessageCircle, ArrowRight, Zap, Box } from "lucide-react";
import toast from "react-hot-toast";
// Mapbox map will be enabled when VITE_MAPBOX_TOKEN is configured
// import Map, { Marker, NavigationControl } from 'react-map-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

const RideDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingWeight, setBookingWeight] = useState(1);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => { fetchRide(); }, [id]);

  const fetchRide = async () => {
    try {
      const res = await rideApi.getById(id!);
      setRide(res.data.data);
    } catch { toast.error("Ride not found"); navigate("/search"); }
    finally { setLoading(false); }
  };

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    setBookingLoading(true);
    try {
      await bookingApi.request({ rideId: id!, weightBooked: bookingWeight, parcelDescription: bookingMessage });
      toast.success(ride.isInstantBooking ? "Booking confirmed!" : "Booking request sent!");
      setBookingModal(false);
      fetchRide();
    } catch (err: any) { toast.error(err.response?.data?.message || "Booking failed"); }
    finally { setBookingLoading(false); }
  };

  const handleContact = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      const res = await chatApi.getOrCreateConversation(ride.driver._id, id);
      navigate("/inbox", { state: { conversationId: res.data.data._id } });
    } catch { toast.error("Failed to start conversation"); }
  };

  if (loading) return <PageSpinner />;
  if (!ride) return null;

  const isDriver = user?._id === ride.driver?._id;
  const depDate = new Date(ride.departureDate);

  // Removed old prefIcons mapping

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {ride.origin?.city} → {ride.destination?.city}
              </h1>
              {ride.isInstantBooking && (
                <Badge variant="success" size="md"><Zap className="w-3 h-3 mr-1" /> Instant</Badge>
              )}
            </div>

            {/* Route visualization — Mapbox map will render here when configured */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-primary-500 ring-4 ring-primary-100" />
                  <div className="w-0.5 h-8 bg-gray-200" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{ride.origin?.city}</p>
                  {ride.origin?.address && <p className="text-sm text-gray-500">{ride.origin.address}</p>}
                </div>
                <div className="ml-auto text-right">
                  <p className="font-semibold text-gray-900">{ride.departureTime}</p>
                  <p className="text-sm text-gray-500">{format(depDate, "EEE, dd MMM yyyy")}</p>
                </div>
              </div>

              {ride.stops?.map((stop: any, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300 ring-2 ring-gray-100" />
                    <div className="w-0.5 h-8 bg-gray-200" />
                  </div>
                  <div>
                    <p className="text-gray-700">{stop.city}</p>
                    {stop.priceFromOrigin > 0 && <p className="text-sm text-primary-600">₹{stop.priceFromOrigin}/kg</p>}
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-4">
                <div className="w-4 h-4 rounded-full bg-accent-500 ring-4 ring-accent-100" />
                <div>
                  <p className="font-semibold text-gray-900">{ride.destination?.city}</p>
                  {ride.destination?.address && <p className="text-sm text-gray-500">{ride.destination.address}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5 text-primary-500" />
                <span className="text-sm">{format(depDate, "dd MMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5 text-primary-500" />
                <span className="text-sm">{ride.departureTime}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="w-5 h-5 text-primary-500" />
                <span className="text-sm">{ride.availableWeightCapacity}/{ride.totalWeightCapacity} kg left</span>
              </div>
              {ride.vehicle?.make && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Car className="w-5 h-5 text-primary-500" />
                  <span className="text-sm">{ride.vehicle.make} {ride.vehicle.model}</span>
                </div>
              )}
            </div>

            {ride.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-600">{ride.description}</p>
              </div>
            )}

            {/* Accepted Items */}
            {ride.acceptedItemTypes?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Accepted Items</h3>
                <div className="flex flex-wrap gap-3">
                  {ride.acceptedItemTypes.map((type: string) => (
                    <div key={type} className="flex items-center gap-1.5 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                      <Box className="w-4 h-4" /> <span>{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price & Book */}
          <div className="card text-center">
            <div className="mb-4">
              <span className="text-4xl font-bold text-primary-600">₹{ride.pricePerKg}</span>
              <p className="text-gray-500">per kg</p>
            </div>

            {!isDriver && ride.status === "upcoming" && ride.availableWeightCapacity > 0 && (
              <div className="space-y-3">
                <Button fullWidth size="lg" onClick={() => user ? setBookingModal(true) : navigate("/login")}>
                  {ride.isInstantBooking ? "Book instantly" : "Request to book"}
                </Button>
                <Button variant="secondary" fullWidth onClick={handleContact}>
                  <MessageCircle className="w-4 h-4 mr-2" /> Contact driver
                </Button>
              </div>
            )}

            {ride.availableWeightCapacity === 0 && (
              <Badge variant="danger" size="md">Fully booked</Badge>
            )}
          </div>

          {/* Driver card */}
          {ride.driver && (
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Your driver</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar src={ride.driver.profilePhoto} name={ride.driver.name} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{ride.driver.name}</p>
                  {ride.driver.avgRating > 0 && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{ride.driver.avgRating.toFixed(1)}</span>
                      <span className="text-gray-400 text-sm">({ride.driver.totalReviews})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {ride.driver.totalTripsDriven > 0 && (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span>{ride.driver.totalTripsDriven} trips driven</span>
                  </div>
                )}
                {ride.driver.isPhoneVerified && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="w-4 h-4" /> Phone verified
                  </div>
                )}
                {ride.driver.isEmailVerified && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="w-4 h-4" /> Email verified
                  </div>
                )}
              </div>

              {ride.driver.bio && (
                <p className="mt-3 text-gray-500 text-sm italic">"{ride.driver.bio}"</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Book this ride" size="sm">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <span className="text-gray-600">{ride.origin?.city}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{ride.destination?.city}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight to send (kg)</label>
            <Input type="number" min="1" max={ride.availableWeightCapacity} placeholder="e.g. 5" value={bookingWeight || ""} onChange={(e) => setBookingWeight(Number(e.target.value))} />
          </div>

          <Input label="Parcel description (optional)" placeholder="e.g. A small box of documents" value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} />

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-gray-600">Total price</span>
            <span className="text-2xl font-bold text-primary-600">₹{ride.pricePerKg * bookingWeight}</span>
          </div>

          <Button fullWidth loading={bookingLoading} onClick={handleBook} size="lg">
            {ride.isInstantBooking ? "Confirm booking" : "Send booking request"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RideDetail;
