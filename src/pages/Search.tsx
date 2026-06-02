import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchHospitals } from "../lib/hospitals";
import { useState } from "react";
import type { Hospital } from "../lib/hospitals";
import ExportModal from "../Components/ExportModal";
import ShareModal from "../Components/ShareModal";
import { useAuth } from "../Context/AuthContext";

function Search() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get("city");
  const specialty = searchParams.get("specialty");
  const [showExportModal, setShowExportModal] = useState(false);
  const { user, signOut } = useAuth();

  const {
    data: hospitals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hospitals", { city, specialty }],
    queryFn: () => fetchHospitals({ city, specialty }),
  });

  function handleSearch(selcected: string) {
    const current = Object.fromEntries(searchParams.entries());

    if (current.specialty === selcected) {
      delete current.specialty;
    } else {
      current.specialty = selcected;
    }
    setSearchParams(current);
  }
  return (
    <>
      <div className="min-h-screen bg-[#F6F5F0]">
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <a href="/" className="text-[#0F6E56] font-semibold text-base">
            Carefinder
          </a>
          <div className="flex-1 bg-[#F1EFE8] rounded-lg px-4 py-2 text-sm text-[#1A1A18]">
            {city || "All hospitals"}
          </div>

          {/* Auth buttons */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#5F5E5A]">
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
              className="text-sm font-medium text-[#0F6E56] border border-[#5DCAA5] px-4 py-2 rounded-lg hover:bg-[#E1F5EE] transition-colors"
            >
              Sign in
            </a>
          )}

          {/* Export and Share buttons */}
          {hospitals && hospitals.length > 0 && (
            <>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-[#0F6E56] border border-[#5DCAA5] px-4 py-2 rounded-lg hover:bg-[#E1F5EE] transition-colors"
              >
                🔗 Share
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-[#0F6E56] border border-[#5DCAA5] px-4 py-2 rounded-lg hover:bg-[#E1F5EE] transition-colors"
              >
                📥 Export CSV
              </button>
            </>
          )}
        </div>
        <div>
          <div className="p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-[#5F5E5A] text-sm">
                  Loading hospitals...
                </div>
              </div>
            )}

            {error && (
              <div className="bg-[#FCEBEB] border border-red-200 rounded-lg p-4 text-[#A32D2D] text-sm">
                Something went wrong. Please try again
              </div>
            )}

            {hospitals && (
              <>
                <p className="text-sm text-[#888780] mb-4">
                  {hospitals.length} hospital{hospitals.length !== 1 && "s"}{" "}
                  found
                  {city ? `in ${city}` : ""}
                </p>

                {hospitals.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-[#5F5E5A] text-base">
                      No hospitals found.
                    </p>
                    <p className="text-[#888780] text-sm mt-1">
                      Try a different city or remove filters.
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {hospitals.map((hospital) => (
                    <HospitalCard key={hospital.id} hospital={hospital} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
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
    </>
  );
}

function HospitalCard({ hospital }: { hospital: Hospital }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate(`/hospital/${hospital.id}`);
      }}
      className="bg-white border border-gray-100 rounded-xl p-5 hover:border-[#5DCAA5] transition-colors block"
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
        {hospital.specialties.slice(0, 3).map((s: any) => (
          <span
            key={s}
            className="text-xs px-3 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56]"
          >
            {s}
          </span>
        ))}

        {hospital.avg_rating > 0 && (
          <span className="ml-auto text-xs text-[#5F5E5A]">
            ★ {hospital.avg_rating.toFixed(1)}
            <span className="text-[#888780] ml-1">
              ({hospital.review_count})
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
export default Search;
