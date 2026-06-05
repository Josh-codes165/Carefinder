import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchHospitals } from "../lib/hospitals";
import { useState } from "react";
import type { Hospital } from "../lib/hospitals";
import ExportModal from "../Components/ExportModal";
import ShareModal from "../Components/ShareModal";
import { useAuth } from "../Context/AuthContext";
import MapView from "../Components/MapView";

function Search() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get("city");
  const specialty = searchParams.get("specialty");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const {
    data: hospitals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hospitals", { city, specialty }],
    queryFn: () => fetchHospitals({ city, specialty }),
  });

  function handleSpecialtyFilter(selected: string) {
    const current = Object.fromEntries(searchParams.entries());
    if (current.specialty === selected) {
      delete current.specialty;
    } else {
      current.specialty = selected;
    }
    setSearchParams(current);
  }

  return (
    <div className="h-screen flex flex-col bg-[#F6F5F0]">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center gap-2 lg:gap-4 flex-shrink-0">
        <a href="/" className="text-[#0F6E56] font-semibold text-base flex-shrink-0">
          Carefinder
        </a>
        <div className="flex-1 bg-[#F1EFE8] rounded-lg px-3 lg:px-4 py-2 text-sm text-[#1A1A18] truncate">
          {city || "All hospitals"}
        </div>
        {user ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden lg:block text-sm text-[#5F5E5A]">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={signOut}
              className="text-sm text-[#888780] hover:text-[#A32D2D] transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="flex-shrink-0 text-sm font-medium text-[#0F6E56] border border-[#5DCAA5] px-3 lg:px-4 py-2 rounded-lg hover:bg-[#E1F5EE] transition-colors"
          >
            Sign in
          </a>
        )}
        {hospitals && hospitals.length > 0 && (
          <>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-shrink-0 flex items-center gap-1 text-sm font-medium text-[#0F6E56] border border-[#5DCAA5] px-3 py-2 rounded-lg hover:bg-[#E1F5EE] transition-colors"
            >
              🔗<span className="hidden lg:block ml-1">Share</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex-shrink-0 flex items-center gap-1 text-sm font-medium text-[#0F6E56] border border-[#5DCAA5] px-3 py-2 rounded-lg hover:bg-[#E1F5EE] transition-colors"
            >
              📥<span className="hidden lg:block ml-1">Export CSV</span>
            </button>
          </>
        )}
      </div>

      {/* Filter chips */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-2 flex gap-2 flex-wrap flex-shrink-0">
        {["Maternity", "Emergency", "Pediatric", "Dental"].map((s) => (
          <button
            key={s}
            onClick={() => handleSpecialtyFilter(s)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${
              specialty === s
                ? "bg-[#E1F5EE] border-[#5DCAA5] text-[#0F6E56] font-medium"
                : "bg-[#F1EFE8] border-transparent text-[#5F5E5A]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* List panel */}
        <div className={`${showMap ? "hidden" : "flex"} lg:flex w-full lg:w-96 flex-shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-[#F6F5F0]`}>
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-[#5F5E5A] text-sm">Loading hospitals...</p>
            </div>
          )}
          {error && (
            <div className="m-4 bg-[#FCEBEB] border border-red-200 rounded-lg p-4 text-[#A32D2D] text-sm">
              Something went wrong. Please try again.
            </div>
          )}
          {hospitals && (
            <>
              <div className="px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                <p className="text-xs text-[#888780] font-medium uppercase tracking-wide">
                  {hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""} found
                  {city ? ` in ${city}` : ""}
                </p>
              </div>
              {hospitals.length === 0 && (
                <div className="text-center py-20 px-4">
                  <p className="text-[#5F5E5A] text-base">No hospitals found.</p>
                  <p className="text-[#888780] text-sm mt-1">
                    Try a different city or remove filters.
                  </p>
                </div>
              )}
              <div className="flex flex-col pb-24 lg:pb-0">
                {hospitals.map((hospital) => (
                  <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    isSelected={hospital.id === selectedId}
                    onSelect={() => setSelectedId(hospital.id)}
                    onNavigate={() => navigate(`/hospital/${hospital.id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Map panel */}
        <div className={`${showMap ? "flex" : "hidden"} lg:flex flex-1 relative`}>
          {hospitals && hospitals.length > 0 ? (
            <MapView
              hospitals={hospitals}
              selectedId={selectedId}
              onSelectHospital={(id) => {
                setSelectedId(id);
                if (window.innerWidth < 1024) {
                  setShowMap(false);
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-[#E8F0EC] flex items-center justify-center">
              <p className="text-sm text-[#5F5E5A] text-center px-4">
                Search for hospitals to see them on the map
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Mobile toggle button */}
      {hospitals && hospitals.length > 0 && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 bg-[#0F6E56] text-white text-sm font-medium px-6 py-3 rounded-full shadow-lg hover:bg-[#085041] transition-all active:scale-95"
          >
            {showMap ? "📋 Show list" : "🗺️ Show map"}
          </button>
        </div>
      )}

      {/* Modals */}
      {showExportModal && hospitals && (
        <ExportModal
          hospitals={hospitals}
          searchQuery={city || ""}
          onClose={() => setShowExportModal(false)}
        />
      )}
      {showShareModal && hospitals && (
        <ShareModal
          hospitals={hospitals}
          onClose={() => setShowShareModal(false)}
        />
      )}

    </div>
  );
}

function HospitalCard({
  hospital,
  isSelected,
  onSelect,
  onNavigate,
}: {
  hospital: Hospital;
  isSelected: boolean;
  onSelect: () => void;
  onNavigate: () => void;
}) {
  return (
    <div
      id={`hospital-card-${hospital.id}`}
      onClick={onNavigate}
      onMouseEnter={onSelect}
      className={`border-b border-gray-100 p-4 cursor-pointer transition-all ${
        isSelected
          ? "bg-[#E1F5EE] border-l-4 border-l-[#0F6E56]"
          : "bg-white hover:bg-[#F6F5F0]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-medium text-[#1A1A18]">{hospital.name}</h3>
        <span
          className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${
            hospital.ownership_type === "public"
              ? "bg-[#E6F1FB] text-[#185FA5]"
              : "bg-[#EEEDFE] text-[#534AB7]"
          }`}
        >
          {hospital.ownership_type}
        </span>
      </div>
      <p className="text-xs text-[#888780] mb-3">{hospital.address}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {(Array.isArray(hospital.specialties)
          ? hospital.specialties
          : (hospital.specialties as string).split(",")
        )
          .slice(0, 3)
          .map((s) => (
            <span
              key={s}
              className="text-xs px-3 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56]"
            >
              {s.trim()}
            </span>
          ))}
        {hospital.avg_rating > 0 && (
          <span className="ml-auto text-xs text-[#5F5E5A]">
            ★ {hospital.avg_rating.toFixed(1)}
            <span className="text-[#888780] ml-1">({hospital.review_count})</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default Search;