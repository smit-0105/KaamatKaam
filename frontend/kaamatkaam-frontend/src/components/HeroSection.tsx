import SearchBar from "./SearchBar";

const HeroSection = () => {
  return (
    <div className="bg-green-50 py-20 mt-16">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">
          Your travel, your delivery — simplified.
        </h1>
        <p className="text-gray-600 mt-2">
          Share trips, send packages, and help others on the way.
        </p>
      </div>
      <div className="flex justify-center">
        <SearchBar />
      </div>
    </div>
  );
};

export default HeroSection;
