import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import { reviewApi } from "../../api/reviewApi";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { PageSpinner } from "../../components/ui/Spinner";
import { Star, Shield, Car, Edit2, Save, X, Calendar, MapPin, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, reviewsRes] = await Promise.all([
        authApi.getMe(),
        reviewApi.getForUser(user!._id),
      ]);
      setProfile(profileRes.data.data);
      setReviews(reviewsRes.data.data);
    } catch { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  const startEditing = () => {
    setEditData({
      name: profile.name, bio: profile.bio || "", phoneNumber: profile.phoneNumber,
      vehicleMake: profile.vehicle?.make || "", vehicleModel: profile.vehicle?.model || "",
      vehicleColor: profile.vehicle?.color || "", vehiclePlate: profile.vehicle?.plateNumber || "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("bio", editData.bio);
      formData.append("phoneNumber", editData.phoneNumber);
      formData.append("vehicle", JSON.stringify({
        make: editData.vehicleMake, model: editData.vehicleModel,
        color: editData.vehicleColor, plateNumber: editData.vehiclePlate,
      }));

      await authApi.updateProfile(formData);
      toast.success("Profile updated!");
      updateUser({ name: editData.name });
      setEditing(false);
      fetchProfile();
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  if (loading) return <PageSpinner />;
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <Avatar src={profile.profilePhoto} name={profile.name} size="xl" className="mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            {profile.bio && <p className="text-gray-500 text-sm mt-1 italic">"{profile.bio}"</p>}

            <div className="flex items-center justify-center gap-1 mt-3">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-lg">{profile.avgRating?.toFixed(1) || "N/A"}</span>
              <span className="text-gray-400 text-sm">({profile.totalReviews || 0} reviews)</span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              {profile.isEmailVerified && <div className="flex items-center gap-2 text-green-600 justify-center"><Shield className="w-4 h-4" /> Email verified</div>}
              {profile.isPhoneVerified && <div className="flex items-center gap-2 text-green-600 justify-center"><Shield className="w-4 h-4" /> Phone verified</div>}
              <div className="flex items-center gap-2 text-gray-500 justify-center">
                <Calendar className="w-4 h-4" /> Joined {format(new Date(profile.createdAt), "MMM yyyy")}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-primary-50 rounded-xl p-3">
                <div className="text-xl font-bold text-primary-600">{profile.totalTripsDriven || 0}</div>
                <div className="text-xs text-gray-500">Trips Driven</div>
              </div>
              <div className="bg-accent-50 rounded-xl p-3">
                <div className="text-xl font-bold text-accent-600">{profile.totalParcelsSent || 0}</div>
                <div className="text-xs text-gray-500">Parcels Sent</div>
              </div>
            </div>

            <div className="mt-6">
              {!editing ? (
                <Button fullWidth variant="secondary" onClick={startEditing}><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button fullWidth variant="ghost" onClick={() => setEditing(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                  <Button fullWidth loading={saving} onClick={handleSave}><Save className="w-4 h-4 mr-1" /> Save</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form or Info */}
          {editing ? (
            <div className="card space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold">Edit your profile</h3>
              <Input label="Full Name" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
              <Input label="Phone" value={editData.phoneNumber} onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} className="input-field !h-20 resize-none" placeholder="Tell others about yourself..." />
              </div>
              <h4 className="font-medium text-gray-800 flex items-center gap-2"><Car className="w-4 h-4" /> Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Make" placeholder="Maruti" value={editData.vehicleMake} onChange={(e) => setEditData({ ...editData, vehicleMake: e.target.value })} />
                <Input label="Model" placeholder="Swift" value={editData.vehicleModel} onChange={(e) => setEditData({ ...editData, vehicleModel: e.target.value })} />
                <Input label="Color" placeholder="White" value={editData.vehicleColor} onChange={(e) => setEditData({ ...editData, vehicleColor: e.target.value })} />
                <Input label="Plate" placeholder="MH 01 AB 1234" value={editData.vehiclePlate} onChange={(e) => setEditData({ ...editData, vehiclePlate: e.target.value })} />
              </div>
            </div>
          ) : (
            <>
              {/* Contact & Vehicle info */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600"><Mail className="w-4 h-4 text-gray-400" /> {profile.email}</div>
                  <div className="flex items-center gap-3 text-gray-600"><Phone className="w-4 h-4 text-gray-400" /> {profile.phoneNumber}</div>
                  {profile.vehicle?.make && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Car className="w-4 h-4 text-gray-400" /> {profile.vehicle.make} {profile.vehicle.model} {profile.vehicle.color && `(${profile.vehicle.color})`}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Reviews */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar src={review.reviewer?.profilePhoto} name={review.reviewer?.name} size="sm" />
                      <div>
                        <p className="font-medium text-sm text-gray-800">{review.reviewer?.name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                          ))}
                          <span className="text-xs text-gray-400 ml-1">{format(new Date(review.createdAt), "dd MMM yyyy")}</span>
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600 ml-11">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
