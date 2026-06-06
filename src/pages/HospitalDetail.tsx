import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchHospitalById, fetchHospitalReviews } from "../lib/hospitals";
import type { Review } from "../lib/hospitals";
import ExportModal from "../Components/ExportModal";
import StarRating from "../Components/StarRating";
import WriteReview from "../Components/WriteReview";
import ReactMarkdown from 'react-markdown'

function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const {
    data: hospital,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hospital", id],
    queryFn: () => fetchHospitalById(id!),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => fetchHospitalReviews(id!),
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
      {/* Top nav */}
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

      {/* Hero */}
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

      {/* Two column body */}
      <div className="flex flex-col lg:flex-row gap-0 max-w-6xl mx-auto">
        {/* Left column */}
        <div className="flex-1 p-6 border-r border-gray-100">
          {/* Specialties */}
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

          {/* About */}
          {hospital.description && (
            <section className="mb-6">
              <h2 className="text-sm font-medium text-[#1A1A18] mb-3">About</h2>
              <div className="prose prose-sm text-[#5F5E5A] max-w-none">
                <ReactMarkdown>{hospital.description}</ReactMarkdown>
              </div>
            </section>
          )}

          {/* Visiting hours */}
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

          {/* Ratings and reviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-[#1A1A18]">
                Ratings & reviews
              </h2>
              {!showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-sm text-[#0F6E56] font-medium border border-[#5DCAA5] px-4 py-1.5 rounded-lg hover:bg-[#E1F5EE] transition-colors"
                >
                  ✏️ Write a review
                </button>
              )}
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-4 bg-[#F1EFE8] rounded-xl p-4 mb-5">
              <div className="text-center">
                <p className="text-4xl font-semibold text-[#1A1A18]">
                  {hospital.avg_rating.toFixed(1)}
                </p>
                <StarRating
                  rating={Math.round(hospital.avg_rating)}
                  size="sm"
                />
                <p className="text-xs text-[#888780] mt-1">
                  {hospital.review_count} review
                  {hospital.review_count !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Rating bars */}
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    reviews?.filter((r) => r.rating === star).length ?? 0;
                  const total = reviews?.length ?? 1;
                  const percent = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#888780] w-2">{star}</span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#EF9F27] rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write review form */}
            {showReviewForm && (
              <div className="mb-5">
                <WriteReview
                  hospitalId={hospital.id}
                  onClose={() => setShowReviewForm(false)}
                />
              </div>
            )}

            {/* Reviews list */}
            {reviews && reviews.length > 0 ? (
              <div className="flex flex-col gap-3">
                {reviews.map((review: Review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center text-xs font-semibold text-[#0F6E56]">
                          U
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#1A1A18]">
                            Verified user
                          </p>
                          <p className="text-xs text-[#888780]">
                            {new Date(review.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-[#5F5E5A] leading-relaxed">
                        {review.review_text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#F1EFE8] rounded-xl">
                <p className="text-sm text-[#5F5E5A]">No reviews yet.</p>
                <p className="text-xs text-[#888780] mt-1">
                  Be the first to review this hospital.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar */}
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

      {/* Export modal */}
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
