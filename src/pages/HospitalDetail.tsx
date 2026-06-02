import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchHospitalById } from "../lib/hospitals";
import ExportModal from "../Components/ExportModal";

function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);

  const {
    data: hospital,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hospital", id],
    queryFn: () => fetchHospitalById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center">
        <p className="text-[#5F5E5A] text-sm">Loading hospital details...</p>
      </div>
    );
  }
  if (error || !hospital) {
    return (
      <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A32D2D] text-sm">Hospital not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-[#0F6E56] text-sm underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F6F5F0]">
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <span className="text-[#0F6E56] font-semibold text-base">
          Carefinder
        </span>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#5F5E5A] flex items-center gap-1 hover:text-[#0F6E56] transition-colors"
        >
          ← Back to results
        </button>
      </div>

      <div className="bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] px-6 py-8 relative">
        <div>
          <h1 className="text-xl font-semibold text-white">{hospital.name}</h1>
          <p className="text-white/75 text-sm mt-1">📍 {hospital.address}</p>
        </div>
        <span className="absolute top-4 right-6 text-xs px-3 py-1 rounded-full bg-white/20 text-white border border-white/30">
          {hospital.ownership_type === "public"
            ? "Public hospital"
            : "Private hospital"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 max-w-6xl mx-auto">
        <div className="flex-1 p-6 border-r border-gray-100">
          <section className="mb-6">
            <h2 className="text-sm font-medium text-[#1A1A18] mb-3">
              Specialties
            </h2>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(hospital.specialties)
                ? hospital.specialties
                : (hospital.specialties as string).split(",")
              ).map((s: any) => (
                <span
                  key={s}
                  className="text-xs px-3 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56]"
                >
                  {s.trim()}
                </span>
              ))}
            </div>
          </section>

          {hospital.description && (
            <section className="mb-6">
              <h2 className="text-sm font-medium text-[#1A1A18] mb-3">About</h2>
              <p className="text-sm text-[#5F5E5A] leading-relaxed">
                {hospital.description}
              </p>
            </section>
          )}

          {hospital.visiting_hours && (
            <section className="mb-6">
              <h2 className="text-sm font-medium text-[#1A1A18] mb-3">
                Visiting hours
              </h2>
              <div className="bg-[#F1EFE8] rounded-lg p-4">
                <p className="text-sm text-[#5F5E5A] leading-relaxed whitespace-pre-line">
                  {hospital.visiting_hours}
                </p>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-medium text-[#1A1A18] mb-3">Rating</h2>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-semibold text-[#1A1A18]">
                {hospital.avg_rating.toFixed(1)}
              </span>
              <div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= Math.round(hospital.avg_rating)
                          ? "text-[#EF9F27]"
                          : "text-gray-200"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#888780] mt-1">
                  {hospital.review_count} review
                  {hospital.review_count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="w-full lg:w-64 p-6 bg-white">
          <h2 className="text-sm font-medium text-[#1A1A18] mb-4">
            Contact & location
          </h2>

          <div className="flex flex-col gap-4">
            {hospital.phone && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F1EFE8] flex items-center justify-center flex-shrink-0 text-sm">
                  📞
                </div>
                <div>
                  <p className="text-xs text-[#888780] font-medium uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-sm text-[#1A1A18]">{hospital.phone}</p>
                </div>
              </div>
            )}

            {hospital.email && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F1EFE8] flex items-center justify-center flex-shrink-0 text-sm">
                  ✉️
                </div>
                <div>
                  <p className="text-xs text-[#888780] font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <a
                    href={`mailto:${hospital.email}`}
                    className="text-sm text-[#0F6E56]"
                  >
                    {hospital.email}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F1EFE8] flex items-center justify-center flex-shrink-0 text-sm">
                📍
              </div>
              <div>
                <p className="text-xs text-[#888780] font-medium uppercase tracking-wide">
                  Address
                </p>
                <p className="text-sm text-[#1A1A18]">{hospital.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F1EFE8] flex items-center justify-center flex-shrink-0 text-sm">
                🏛️
              </div>
              <div>
                <p className="text-xs text-[#888780] font-medium uppercase tracking-wide">
                  LGA
                </p>
                <p className="text-sm text-[#1A1A18]">{hospital.lga}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-5" />

          <button className="w-full bg-[#0F6E56] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#085041] transition-colors mb-2">
            Share this hospital
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full border border-gray-200 text-[#1A1A18] text-sm font-medium py-2.5 rounded-lg hover:border-[#5DCAA5] transition-colors"
          >
            Export to CSV
          </button>
        </div>
      </div>
      {showExportModal && (
        <ExportModal
          hospitals={[hospital]}
          searchQuery={hospital.name}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default HospitalDetail;
