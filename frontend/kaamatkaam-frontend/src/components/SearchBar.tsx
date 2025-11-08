import { useState } from "react";

const SearchBar = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    console.log({ from, to, date });
    // Navigate to trips page with query params
  };

  return (
    <div className="flex bg-white shadow-lg p-4 rounded-xl gap-4">
      <input
        type="text"
        placeholder="From"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="border p-2 rounded w-40"
      />
      <input
        type="text"
        placeholder="To"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="border p-2 rounded w-40"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded w-40"
      />
      <button
        onClick={handleSearch}
        className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
