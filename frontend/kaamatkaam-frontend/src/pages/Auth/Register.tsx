import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Car, User, Phone } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phoneNumber: "", gender: "prefer_not_to_say",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const setField = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name, email: formData.email,
        password: formData.password, phoneNumber: formData.phoneNumber,
        gender: formData.gender,
      });
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative text-white text-center max-w-md">
          <Car className="w-20 h-20 mx-auto mb-8" />
          <h2 className="text-4xl font-bold mb-4">Join the community</h2>
          <p className="text-lg text-white/80">
            Create your account and start sharing rides with verified travelers across India.
          </p>
          <div className="mt-10 space-y-4 text-left">
            {["Save up to 75% on travel costs", "Verified and rated community", "Travel safe with in-app chat"].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✓</div>
                <span className="text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-primary-600">Kaamat</span><span className="text-accent-500">Kaam</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-2">Start sharing rides today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name *" placeholder="John Doe" value={formData.name} onChange={(e) => setField("name", e.target.value)} icon={<User className="w-5 h-5" />} />
            <Input label="Email *" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setField("email", e.target.value)} icon={<Mail className="w-5 h-5" />} />
            <Input label="Phone Number *" type="tel" placeholder="+91 98765 43210" value={formData.phoneNumber} onChange={(e) => setField("phoneNumber", e.target.value)} icon={<Phone className="w-5 h-5" />} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select value={formData.gender} onChange={(e) => setField("gender", e.target.value)} className="input-field">
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="relative">
              <Input label="Password *" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={formData.password} onChange={(e) => setField("password", e.target.value)} icon={<Lock className="w-5 h-5" />} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Input label="Confirm Password *" type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} icon={<Lock className="w-5 h-5" />} />

            <Button type="submit" fullWidth loading={loading} size="lg">Create Account</Button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
