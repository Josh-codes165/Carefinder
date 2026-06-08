import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchHospitals, fetchHospitalsByRadius } from "../lib/hospitals";
import { useState } from "react";
import type { Hospital } from "../lib/hospitals";
import ExportModal from "../Components/ExportModal";
import ShareModal from "../Components/ShareModal";
import { useAuth } from "../Context/AuthContext";
import MapView from "../Components/MapView";
import {
  Link2,
  Download,
  MapPin,
  List,
  Map,
  X,
  LogOut,
} from "lucide-react";

function Search() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radius, setRadius] = useState<number>(10);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get("city");
  const specialty = searchParams.get("specialty");
  const ownership = searchParams.get("ownership");
  const sortBy = searchParams.get("sortBy");

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const {
    data: hospitals,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "hospitals",
      { city, specialty, ownership, sortBy, userLocation, radius },
    ],
    queryFn: () => {
      if (userLocation) {
        return fetchHospitalsByRadius({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radiusKm: radius,
        });
      }
      return fetchHospitals({ city, specialty, ownership, sortBy });
    },
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

  function handleOwnershipFilter(selected: string) {
    const current = Object.fromEntries(searchParams.entries());
    if (current.ownership === selected) {
      delete current.ownership;
    } else {
      current.ownership = selected;
    }
    setSearchParams(current);
  }

  function handleSortChange(selected: string) {
    const current = Object.fromEntries(searchParams.entries());
    current.sortBy = selected;
    setSearchParams(current);
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        setLocationError(
          "Could not get your location. Please allow location access."
        );
        setIsLocating(false);
        console.error("Geolocation error:", err);
      }
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F6F5F0]">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center gap-2 lg:gap-4 flex-shrink-0">
        <a href="/" className="text-[#0F6E56] font-semibold text-base flex-shrink-0">
          Carefinder
        </a>
        <div className="flex-1 bg-[#F1EFE8] rounded-lg px-3 lg:px-4 py-2 text-sm text-[#1A1A18] truncate">
          {userLocation
            ? `Within ${radius} km of your location`
            : city || "All hospitals"}
        </div>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden lg:block text-sm text-[#5F5E5A]">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-[#888780] hover:text-[#A32D2D] transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
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

        {/* Share and Export */}
        {hospitals && hospitals.length > 0 && (
          <>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-medium text-[#0F6E56] border border-[#5DCAA5] px-3 py-2 rounded-lg hover:bg-[#E1F5EE] transition-colors"
            >
              <Link2 size={14} />
              <span className="hidden lg:block">Share</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex-shrink-0 flex items-center gap-1.5 text-sm font-medium text-[#0F6E56] border border-[#5DCAA5] px-3 py-2 rounded-lg hover:bg-[#E1F5EE] transition-colors"
            >
              <Download size={14} />
              <span className="hidden lg:block">Export CSV</span>
            </button>
          </>
        )}
      </div>

      {/* Filter chips */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-2 flex gap-2 flex-wrap flex-shrink-0 items-center">
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

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {["public", "private"].map((type) => (
          <button
            key={type}
            onClick={() => handleOwnershipFilter(type)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors capitalize ${
              ownership === type
                ? type === "public"
                  ? "bg-[#E6F1FB] border-[#90BEF0] text-[#185FA5] font-medium"
                  : "bg-[#EEEDFE] border-[#A9A5EF] text-[#534AB7] font-medium"
                : "bg-[#F1EFE8] border-transparent text-[#5F5E5A]"
            }`}
          >
            {type}
          </button>
        ))}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <select
          value={sortBy ?? "name"}
          onChange={(e) => handleSortChange(e.target.value)}
          className="text-xs px-3 py-2 rounded-full border border-transparent bg-[#F1EFE8] text-[#5F5E5A] outline-none cursor-pointer"
        >
          <option value="name">Sort: A–Z</option>
          <option value="rating">Sort: Top rated</option>
        </select>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {userLocation ? (
          <div className="flex items-center gap-2">
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="text-xs px-3 py-2 rounded-full border border-[#5DCAA5] bg-[#E1F5EE] text-[#0F6E56] outline-none cursor-pointer font-medium"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={20}>Within 20 km</option>
              <option value={50}>Within 50 km</option>
            </select>
            <button
              onClick={() => {
                setUserLocation(null);
                setLocationError("");
              }}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-full bg-[#FCEBEB] text-[#A32D2D] border border-red-200"
            >
              <X size={11} />
              Clear location
            </button>
          </div>
        ) : (
          <button
            onClick={handleGetLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border border-transparent bg-[#F1EFE8] text-[#5F5E5A] hover:bg-[#E1F5EE] hover:text-[#0F6E56] transition-colors disabled:opacity-50"
          >
            <MapPin size={12} />
            {isLocating ? "Locating..." : "Near me"}
          </button>
        )}

        {locationError && (
          <p className="text-xs text-[#A32D2D]">{locationError}</p>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* List panel */}
        <div
          className={`${
            showMap ? "hidden" : "flex"
          } lg:flex w-full lg:w-96 flex-shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-[#F6F5F0]`}
        >
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
                  {userLocation ? ` within ${radius} km` : city ? ` in ${city}` : ""}
                </p>
              </div>
              {hospitals.length === 0 && (
                <div className="text-center py-20 px-4">
                  <p className="text-[#5F5E5A] text-base">No hospitals found.</p>
                  <p className="text-[#888780] text-sm mt-1">
                    Try a different city, increase the radius, or remove filters.
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
                if (window.innerWidth < 1024) setShowMap(false);
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

      {/* Mobile toggle */}
      {hospitals && hospitals.length > 0 && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 bg-[#0F6E56] text-white text-sm font-medium px-6 py-3 rounded-full shadow-lg hover:bg-[#085041] transition-all active:scale-95"
          >
            {showMap ? (
              <>
                <List size={15} /> Show list
              </>
            ) : (
              <>
                <Map size={15} /> Show map
              </>
            )}
          </button>
        </div>
      )}

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
        ).slice(0, 3).map((s) => (
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