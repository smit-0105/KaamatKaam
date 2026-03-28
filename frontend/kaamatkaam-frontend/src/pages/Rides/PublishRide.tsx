import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { rideApi } from "../../api/rideApi";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { MapPin, Calendar, Clock, Package, IndianRupee, Car, Zap, Check } from "lucide-react";
import toast from "react-hot-toast";

const steps = ["Route", "Schedule", "Details", "Review"];

const PublishRide: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    originCity: "", originAddress: "", destinationCity: "", destinationAddress: "",
    departureDate: "", departureTime: "", totalWeightCapacity: 5, pricePerKg: 0,
    transportMode: "Car",
    vehicleMake: user?.vehicle?.make || "", vehicleModel: user?.vehicle?.model || "", vehicleColor: user?.vehicle?.color || "",
    description: "", isInstantBooking: false,
    acceptedItemTypes: ["General"] as string[],
  });

  const setField = (field: string, value: any) => setFormData((p) => ({ ...p, [field]: value }));

  const handlePublish = async () => {
    setLoading(true);
    try {
      await rideApi.publish({
        transportMode: formData.transportMode,
        origin: { city: formData.originCity, address: formData.originAddress },
        destination: { city: formData.destinationCity, address: formData.destinationAddress },
        departureDate: formData.departureDate,
        departureTime: formData.departureTime,
        totalWeightCapacity: formData.totalWeightCapacity,
        pricePerKg: formData.pricePerKg,
        vehicle: ["Car", "Two-Wheeler"].includes(formData.transportMode) 
          ? { make: formData.vehicleMake, model: formData.vehicleModel, color: formData.vehicleColor }
          : undefined,
        acceptedItemTypes: formData.acceptedItemTypes,
        description: formData.description,
        isInstantBooking: formData.isInstantBooking,
      });
      toast.success("Trip published successfully!");
      navigate("/dashboard/rides");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish trip");
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return formData.originCity && formData.destinationCity;
    if (step === 1) return formData.departureDate && formData.departureTime;
    if (step === 2) return formData.totalWeightCapacity > 0 && formData.pricePerKg >= 0;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Publish a trip</h1>
      <p className="text-gray-500 mb-8">Traveling soon? Turn your empty luggage space into extra cash.</p>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                i < step ? "bg-accent-500 text-white" : i === step ? "bg-primary-500 text-white shadow-lg" : "bg-gray-100 text-gray-400"
              }`}>
                {i < step ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`text-xs mt-2 ${i <= step ? "text-gray-700 font-medium" : "text-gray-400"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-accent-500" : "bg-gray-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Route */}
      {step === 0 && (
        <div className="card space-y-5 animate-fade-in">
          <h2 className="text-xl font-semibold flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-500" /> Where are you going?</h2>
          <Input label="Departure city *" placeholder="e.g. Mumbai" value={formData.originCity} onChange={(e) => setField("originCity", e.target.value)} />
          <Input label="Pickup address (optional)" placeholder="e.g. Andheri Station" value={formData.originAddress} onChange={(e) => setField("originAddress", e.target.value)} />
          <Input label="Destination city *" placeholder="e.g. Pune" value={formData.destinationCity} onChange={(e) => setField("destinationCity", e.target.value)} />
          <Input label="Drop-off address (optional)" placeholder="e.g. Pune Station" value={formData.destinationAddress} onChange={(e) => setField("destinationAddress", e.target.value)} />
        </div>
      )}

      {/* Step 1: Schedule */}
      {step === 1 && (
        <div className="card space-y-5 animate-fade-in">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Calendar className="w-5 h-5 text-primary-500" /> When are you leaving?</h2>
          <Input label="Departure date *" type="date" value={formData.departureDate} onChange={(e) => setField("departureDate", e.target.value)} min={new Date().toISOString().split("T")[0]} icon={<Calendar className="w-5 h-5" />} />
          <Input label="Departure time *" type="time" value={formData.departureTime} onChange={(e) => setField("departureTime", e.target.value)} icon={<Clock className="w-5 h-5" />} />
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="card space-y-5 animate-fade-in">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Package className="w-5 h-5 text-primary-500" /> Capacity details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight capacity (kg) *</label>
              <Input type="number" min="1" placeholder="10" value={formData.totalWeightCapacity || ""} onChange={(e) => setField("totalWeightCapacity", Number(e.target.value))} />
            </div>
            <Input label="Price per kg (₹) *" type="number" min="0" placeholder="50" value={formData.pricePerKg || ""} onChange={(e) => setField("pricePerKg", Number(e.target.value))} icon={<IndianRupee className="w-5 h-5" />} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mode of Transport *</label>
            <select 
              value={formData.transportMode} 
              onChange={(e) => setField("transportMode", e.target.value)} 
              className="input-field"
            >
              <option value="Car">Personal Car</option>
              <option value="Bus">Bus</option>
              <option value="Train">Train</option>
              <option value="Flight">Flight</option>
              <option value="Two-Wheeler">Two-Wheeler (Bike/Scooter)</option>
            </select>
          </div>

          {["Car", "Two-Wheeler"].includes(formData.transportMode) && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <Input label="Vehicle make (optional)" placeholder="Maruti" value={formData.vehicleMake} onChange={(e) => setField("vehicleMake", e.target.value)} />
              <Input label="Vehicle model (optional)" placeholder="Swift" value={formData.vehicleModel} onChange={(e) => setField("vehicleModel", e.target.value)} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
            <textarea value={formData.description} onChange={(e) => setField("description", e.target.value)} placeholder="Any details about the ride..." className="input-field !h-24 resize-none" />
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
            <input type="checkbox" checked={formData.isInstantBooking} onChange={(e) => setField("isInstantBooking", e.target.checked)} className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500" />
            <div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary-500" /><span className="font-medium text-gray-900">Instant booking</span></div>
              <p className="text-sm text-gray-500">Senders can book capacity without waiting for your approval</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-4">Accepted Items</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['General', 'Documents', 'Electronics', 'Clothing', 'Fragile', 'Heavy'].map((type) => (
              <label key={type} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.acceptedItemTypes.includes(type)}
                  onChange={(e) => {
                    const current = new Set(formData.acceptedItemTypes);
                    if (e.target.checked) current.add(type);
                    else current.delete(type);
                    setField("acceptedItemTypes", Array.from(current));
                  }}
                  className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="card space-y-4 animate-fade-in">
          <h2 className="text-xl font-semibold">Review your trip</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="font-medium">{formData.originCity} → {formData.destinationCity}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{formData.departureDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{formData.departureTime}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Capacity</span><span className="font-medium">{formData.totalWeightCapacity} kg</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Price/kg</span><span className="font-bold text-primary-600">₹{formData.pricePerKg}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Transport</span><span className="font-medium">{formData.transportMode}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Accepts</span><span className="font-medium max-w-[50%] text-right">{formData.acceptedItemTypes.join(', ')}</span></div>
            {["Car", "Two-Wheeler"].includes(formData.transportMode) && formData.vehicleMake && (
              <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-medium">{formData.vehicleMake} {formData.vehicleModel}</span></div>
            )}
            {formData.isInstantBooking && <div className="flex justify-between"><span className="text-gray-500">Booking</span><Badge variant="success">⚡ Instant</Badge></div>}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>Back</Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>Continue</Button>
        ) : (
          <Button variant="accent" loading={loading} onClick={handlePublish} size="lg">🚀 Publish trip</Button>
        )}
      </div>
    </div>
  );
};

export default PublishRide;
