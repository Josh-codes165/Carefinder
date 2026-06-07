import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../Context/AuthContext";
import {
  fetchAllHospitalsAdmin,
  deleteHospital,
  fetchAllReviewsAdmin,
  updateReviewStatus,
} from "../lib/hospitals";
import type { Hospital } from "../lib/hospitals";
import { HospitalForm } from "../Components/HospitalForm";
import { supabase } from "../lib/supabase";
import InviteAdmin from "../Components/InviteAdmin";

type ActiveSection = "overview" | "hospitals" | "reviews" | "create" | "invite";

export function AdminDashboard() {
  const { user, signOut, session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  const { data: hospitals, isLoading: hospitalsLoading } = useQuery({
    queryKey: ["admin-hospitals"],
    queryFn: fetchAllHospitalsAdmin,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["admin-reviews", session?.access_token],
    queryFn: async () => {
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }
      const result = await fetchAllReviewsAdmin();
      return result;
    },
    enabled: !!session && !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "hidden";
    }) => updateReviewStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  function handleDeleteHospital(id: string, name: string) {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This cannot be undone.`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  }

  const pendingReviews =
    reviews?.filter((r: any) => r.status === "pending").length ?? 0;

  return (
    <div className="min-h-screen bg-[#F6F5F0] flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <span className="text-[#0F6E56] font-semibold text-base">
          Carefinder
        </span>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#FAEEDA] text-[#BA7517] border border-[#FAC775]">
          ADMIN
        </span>
        <div className="ml-auto flex-wrap items-center gap-3">
          <span className="text-xs sm:text-sm text-[#5F5E5A] break-all">
            {user?.user_metadata?.full_name || user?.email}
          </span>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-[#5F5E5A] hover:text-[#0F6E56] transition-colors"
          >
            Public site
          </button>
          <button
            onClick={signOut}
            className="text-sm text-[#888780] hover:text-[#A32D2D] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        <div className="w-full lg:w-52 bg-[#FAEEDA] border-b lg:border-b-0 lg:border-r border-gray-100 flex-shrink-0 py-4 overflow-x-auto">
          <div className="px-4 mb-2">
            <p className="text-xs font-medium text-[#888780] uppercase tracking-wider">
              Overview
            </p>
          </div>
          <NavItem
            label="Dashboard"
            icon="📊"
            active={activeSection === "overview"}
            onClick={() => setActiveSection("overview")}
          />

          <div className="px-4 mt-4 mb-2">
            <p className="text-xs font-medium text-[#888780] uppercase tracking-wider">
              Hospitals
            </p>
          </div>
          <NavItem
            label="All hospitals"
            icon="🏥"
            active={activeSection === "hospitals"}
            onClick={() => setActiveSection("hospitals")}
          />
          <NavItem
            label="Add hospital"
            icon="➕"
            active={activeSection === "create"}
            onClick={() => {
              setEditingHospital(null);
              setActiveSection("create");
            }}
          />

          <div className="px-4 mt-4 mb-2">
            <p className="text-xs font-medium text-[#888780] uppercase tracking-wider">
              Community
            </p>
          </div>
          <NavItem
            label="Reviews"
            icon="💬"
            active={activeSection === "reviews"}
            onClick={() => setActiveSection("reviews")}
            badge={pendingReviews > 0 ? pendingReviews : undefined}
          />

          <div className="px-4 mt-4 mb-2">
            <p className="text-xs font-medium text-[#888780] uppercase tracking-wider">
              Admin
            </p>
          </div>
          <NavItem
            label="Invite admin"
            icon="✉️"
            active={activeSection === "invite"}
            onClick={() => setActiveSection("invite")}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeSection === "overview" && (
            <div>
              <h1 className="text-xl font-semibold text-[#1A1A18] mb-1">
                Dashboard
              </h1>
              <p className="text-sm text-[#888780] mb-6">
                Welcome back, {user?.user_metadata?.full_name?.split(" ")[0]}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Total hospitals"
                  value={hospitals?.length ?? 0}
                  delta="in database"
                />
                <StatCard
                  label="Published"
                  value={hospitals?.filter((h) => h.is_published).length ?? 0}
                  delta="visible to public"
                />
                <StatCard
                  label="Pending reviews"
                  value={pendingReviews}
                  delta="need moderation"
                  highlight={pendingReviews > 0}
                />
                <StatCard
                  label="Total reviews"
                  value={reviews?.length ?? 0}
                  delta="all time"
                />
              </div>

              <h2 className="text-sm font-medium text-[#1A1A18] mb-3">
                Quick actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3">
                <button
                  onClick={() => setActiveSection("create")}
                  className="bg-[#0F6E56] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#085041] transition-colors"
                >
                  ➕ Add hospital
                </button>
                <button
                  onClick={() => setActiveSection("reviews")}
                  className="border border-gray-200 text-[#1A1A18] text-sm font-medium px-5 py-2.5 rounded-lg hover:border-[#5DCAA5] transition-colors"
                >
                  💬 Moderate reviews
                </button>
                <button
                  onClick={() => setActiveSection("hospitals")}
                  className="border border-gray-200 text-[#1A1A18] text-sm font-medium px-5 py-2.5 rounded-lg hover:border-[#5DCAA5] transition-colors"
                >
                  🏥 Manage hospitals
                </button>
                <button
                  onClick={() => setActiveSection("invite")}
                  className="border border-gray-200 text-[#1A1A18] text-sm font-medium px-5 py-2.5 rounded-lg hover:border-[#5DCAA5] transition-colors"
                >
                  ✉️ Invite admin
                </button>
              </div>
            </div>
          )}

          {activeSection === "hospitals" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-xl font-semibold text-[#1A1A18]">
                  All hospitals
                </h1>
                <button
                  onClick={() => {
                    setEditingHospital(null);
                    setActiveSection("create");
                  }}
                  className="w-full sm:w-auto bg-[#0F6E56] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#085041] transition-colors"
                >
                  ➕ Add hospital
                </button>
              </div>

              {hospitalsLoading && (
                <p className="text-sm text-[#888780]">Loading...</p>
              )}

              {hospitals && (
                <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
                  <table className="min-w-[700px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888780] uppercase tracking-wide">
                          Name
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888780] uppercase tracking-wide">
                          City / LGA
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888780] uppercase tracking-wide">
                          Type
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888780] uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888780] uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hospitals.map((hospital) => (
                        <tr
                          key={hospital.id}
                          className="border-b border-gray-50 hover:bg-[#F6F5F0] transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-[#1A1A18]">
                            {hospital.name}
                          </td>
                          <td className="px-4 py-3 text-[#5F5E5A]">
                            {hospital.city} · {hospital.lga}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full ${
                                hospital.ownership_type === "public"
                                  ? "bg-[#E6F1FB] text-[#185FA5]"
                                  : "bg-[#EEEDFE] text-[#534AB7]"
                              }`}
                            >
                              {hospital.ownership_type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full ${
                                hospital.is_published
                                  ? "bg-[#E1F5EE] text-[#0F6E56]"
                                  : "bg-[#FAEEDA] text-[#BA7517]"
                              }`}
                            >
                              {hospital.is_published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingHospital(hospital);
                                  setActiveSection("create");
                                }}
                                className="w-8 h-8 rounded-lg bg-[#E1F5EE] text-[#0F6E56] flex items-center justify-center hover:bg-[#5DCAA5]/20 transition-colors"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteHospital(
                                    hospital.id,
                                    hospital.name,
                                  )
                                }
                                className="w-8 h-8 rounded-lg bg-[#FCEBEB] text-[#A32D2D] flex items-center justify-center hover:bg-red-100 transition-colors"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "create" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setActiveSection("hospitals")}
                  className="text-sm text-[#5F5E5A] hover:text-[#0F6E56] transition-colors"
                >
                  ← Back
                </button>
                <h1 className="text-xl font-semibold text-[#1A1A18]">
                  {editingHospital ? "Edit hospital" : "Add new hospital"}
                </h1>
              </div>
              <HospitalForm
                hospital={editingHospital}
                onSuccess={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["admin-hospitals"],
                  });
                  setActiveSection("hospitals");
                }}
              />
            </div>
          )}

          {activeSection === "reviews" && (
            <div>
              <h1 className="text-xl font-semibold text-[#1A1A18] mb-6">
                Review moderation
              </h1>

              {reviewsLoading && (
                <p className="text-sm text-[#888780]">Loading reviews...</p>
              )}

              {reviews && reviews.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-[#5F5E5A]">No reviews yet.</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {reviews?.map((review: any) => (
                  <div
                    key={review.id}
                    className="bg-white border border-gray-100 rounded-xl p-5"
                  >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-medium text-[#1A1A18]">
                          {review.hospitals?.name}
                        </p>
                        <p className="text-xs text-[#888780] mt-0.5">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= review.rating
                                ? "text-[#EF9F27]"
                                : "text-gray-200"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          review.status === "approved"
                            ? "bg-[#E1F5EE] text-[#0F6E56]"
                            : review.status === "hidden"
                              ? "bg-[#FCEBEB] text-[#A32D2D]"
                              : "bg-[#FAEEDA] text-[#BA7517]"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>

                    {review.review_text && (
                      <p className="text-sm text-[#5F5E5A] mb-4 leading-relaxed">
                        {review.review_text}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-50">
                      <button
                        onClick={() =>
                          moderateMutation.mutate({
                            id: review.id,
                            status: "approved",
                          })
                        }
                        disabled={review.status === "approved"}
                        className="flex-1 bg-[#E1F5EE] text-[#0F6E56] text-sm font-medium py-2 rounded-lg hover:bg-[#5DCAA5]/20 transition-colors disabled:opacity-40"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() =>
                          moderateMutation.mutate({
                            id: review.id,
                            status: "hidden",
                          })
                        }
                        disabled={review.status === "hidden"}
                        className="flex-1 bg-[#FCEBEB] text-[#A32D2D] text-sm font-medium py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-40"
                      >
                        ✕ Hide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "invite" && (
            <div>
              <h1 className="text-xl font-semibold text-[#1A1A18] mb-1">
                Invite admin
              </h1>
              <p className="text-sm text-[#888780] mb-6">
                Invite a new admin by email. They'll receive a link to set their
                password.
              </p>
              <InviteAdmin />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({
  label,
  icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        active
          ? "bg-[#BA7517]/10 border-l-4 border-l-[#BA7517] text-[#1A1A18] font-medium"
          : "text-[#5F5E5A] hover:bg-[#BA7517]/5"
      }`}
    >
      <span>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className="text-xs bg-[#BA7517] text-white px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({
  label,
  value,
  delta,
  highlight = false,
}: {
  label: string;
  value: number;
  delta: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-xs font-medium text-[#888780] uppercase tracking-wide mb-2">
        {label}
      </p>
      <p
        className={`text-3xl font-semibold ${
          highlight ? "text-[#BA7517]" : "text-[#1A1A18]"
        }`}
      >
        {value}
      </p>
      <p
        className={`text-xs mt-1 ${highlight ? "text-[#BA7517]" : "text-[#888780]"}`}
      >
        {delta}
      </p>
    </div>
  );
}

export default AdminDashboard;
