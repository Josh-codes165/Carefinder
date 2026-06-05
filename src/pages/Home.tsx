import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch() {
    if (!searchQuery.trim()) return;
    navigate(`/search?city=${encodeURIComponent(searchQuery)}`);
  }
  return (
    <div className="min-h-screen bg-[#F6F5F0] flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0F6E56] rounded-2xl mb-4">
          <span className="text-white text-3xl font-light">+</span>
        </div>
        <h1 className="text-4xl font-semibold text-[#1A1A18] tracking-tight">
          Carefinder
        </h1>
       <p className="text-[#5F5E5A] mt-2 text-lg">
          Find hospitals anywhere in Nigeria
        </p>
      </div>

      <div className="w-full max-w-xl">
        <div className="flex gap-3">
          <input
            className="flex-1 bg-white px-4 py-3 text-sm text-[#1A1A18] outline-none focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20 transition-colors "
            type="text"
            placeholder="Search by city, LGA, or hospital name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
          onClick={handleSearch}
          className="bg-[#0F6E56] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#085041] transition-colors"
          >
            Search
          </button>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          {['Maternity', 'Emergency', 'Pediatric', 'Dental'].map((specialty) => (
            <button key={specialty} onClick={() => navigate(`/search?specialty=${specialty}`)}
            className="text-sm px-4 py-2 rounded-full border border-gray-200 bg-white text-[#5F5E5A] hover:border-[#5DCAA5] hover:text-[#0F6E56] transition-colors">
              {specialty}

            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
