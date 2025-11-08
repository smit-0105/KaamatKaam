const TripCard = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 border">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">Pune → Ahmednagar</h3>
          <p className="text-gray-600">2 Nov 2025, 10:00 AM</p>
          <p className="text-gray-500 text-sm">Weight available: 5kg</p>
        </div>
        <div className="text-right">
          <p className="text-green-600 font-bold text-lg">₹100</p>
          <button className="text-sm text-white bg-green-600 px-3 py-1 rounded mt-2">
            Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
