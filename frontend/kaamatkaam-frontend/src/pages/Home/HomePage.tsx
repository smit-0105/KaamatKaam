import HeroSection from "../../components/HeroSection";
import TripCard from "../../components/TripCard";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <section className="container mx-auto p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Available Trips</h2>
        {/* Map over fetched trips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TripCard />
          <TripCard />
        </div>
      </section>
    </>
  );
};

export default HomePage;
