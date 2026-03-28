import React from "react";
import SearchBar from "../../components/SearchBar";
import { Car, Shield, Leaf, Users, Star, ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const popularRoutes = [
  { from: "Mumbai", to: "Pune", price: 350 },
  { from: "Delhi", to: "Jaipur", price: 500 },
  { from: "Bangalore", to: "Chennai", price: 600 },
  { from: "Hyderabad", to: "Bangalore", price: 700 },
  { from: "Ahmedabad", to: "Mumbai", price: 450 },
  { from: "Kolkata", to: "Siliguri", price: 800 },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-bg overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Share the journey,<br />
              <span className="text-accent-300">send your parcels</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Send parcels between cities with verified travelers. Save up to 75% on courier costs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <SearchBar variant="hero" />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Verified profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>Rated community</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>50K+ members</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How to send a parcel</h2>
            <p className="text-gray-500 text-lg">Three simple steps to send your package</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "Find a traveler",
                desc: "Enter your departure and arrival cities, choose a date, and find a traveler heading there.",
                color: "bg-primary-100 text-primary-600",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Book capacity",
                desc: "Select a trip, book the weight in seconds, and message the traveler to coordinate pickup.",
                color: "bg-accent-100 text-accent-600",
              },
              {
                icon: <Car className="w-8 h-8" />,
                title: "Hand over & relax",
                desc: "Meet at the pickup point, hand over your parcel, and it gets delivered! Leave a review after.",
                color: "bg-amber-100 text-amber-600",
              },
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm mb-4">{i + 1}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Popular routes</h2>
            <p className="text-gray-500 text-lg">Most searched logistics routes this week</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularRoutes.map((route, i) => (
              <Link
                key={i}
                to={`/search?origin=${route.from}&destination=${route.to}`}
                className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-card transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-gray-800">
                    <span className="font-semibold">{route.from}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    <span className="font-semibold">{route.to}</span>
                  </div>
                </div>
                <span className="text-primary-600 font-bold">from ₹{route.price}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Travel with <span className="gradient-text">confidence</span>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <Shield className="w-6 h-6" />, title: "Verified profiles", desc: "Every member goes through profile verification with email and phone." },
                  { icon: <Star className="w-6 h-6" />, title: "Ratings & reviews", desc: "Read reviews from fellow travelers before booking your ride." },
                  { icon: <Users className="w-6 h-6" />, title: "In-app messaging", desc: "Chat directly with your traveler before the trip to coordinate details." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-10 text-center">
              <div className="mb-6">
                <Leaf className="w-16 h-16 text-accent-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Go green together</h3>
                <p className="text-gray-600">Every shared trip means fewer dedicated courier vehicles. Reduce your carbon footprint while saving money.</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4">
                  <div className="text-2xl font-bold text-primary-600">75%</div>
                  <div className="text-xs text-gray-500">Cost savings</div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="text-2xl font-bold text-accent-600">2.5T</div>
                  <div className="text-xs text-gray-500">CO₂ saved/yr</div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="text-2xl font-bold text-amber-600">50K+</div>
                  <div className="text-xs text-gray-500">Happy senders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to start sending parcels?</h2>
          <p className="text-white/80 text-lg mb-8">Join thousands of people sending packages across India every day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search" className="btn-secondary !bg-white !text-primary-600 !border-white hover:!bg-white/90 !text-lg !px-8">
              Send a parcel
            </Link>
            <Link to="/rides/publish" className="bg-white/20 backdrop-blur text-white px-8 py-3 rounded-xl font-semibold text-lg border-2 border-white/40 hover:bg-white/30 transition-all">
              Carry a parcel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
