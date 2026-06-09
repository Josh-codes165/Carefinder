import { useState } from "react";
import type { Hospital } from "../lib/hospitals";

type ShareModalProps = {
  hospitals: Hospital[];
  onClose: () => void;
};

function ShareModal({ hospitals, onClose }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"link" | "email">("link");
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState<string[]>(
    hospitals.map((h) => h.id),
  );
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState("");
  const shareableLink = window.location.href;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareableLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }

  function toggleHospital(id: string) {
    setSelectedHospitalId((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );
  }

  async function handleSendEmail() {
    if (!recipientEmail.trim()) return;
    if (selectedHospitalId.length === 0) return;

    setIsSending(true);
    setSendError("");
    try {
      const selectedHospitals = hospitals.filter((h) =>
        selectedHospitalId.includes(h.id),
      );

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-hospitals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
  
          },
          body: JSON.stringify({
            recipientEmail,
            hospitals: selectedHospitals.map((h) => ({
              name: h.name,
              address: h.address,
              phone: h.phone,
              specialties: h.specialties,
              ownership_type: h.ownership_type,
            })),
            shareableLink,
          }),
        },
      );
      if (!response.ok) throw new Error("Failed to send email");

      setSendSuccess(true);
    } catch {
      setSendError("Failed to send email. Please try again");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className="text-lg">🔗</span>
          <h2 className="text-base font-semibold text-[#1A1A18]">
            Share results
          </h2>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-lg bg-[#F1EFE8] flex items-center justify-center text-[#5F5E5A] hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("link")}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "link"
                ? "text-[#0F6E56] border-[#0F6E56]"
                : "text-[#888780] border-transparent"
            }`}
          >
            Copy link
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "email"
                ? "text-[#0F6E56] border-[#0F6E56]"
                : "text-[#888780] border-transparent"
            }`}
          >
            Send via email
          </button>
        </div>

        <div className="px-6 py-5">
          {activeTab === "link" && (
            <div>
              <p className="text-sm text-[#5F5E5A] mb-4">
                Anyone with this link will see the exact same search results.
              </p>

              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-[#F1EFE8] rounded-lg px-3 py-2.5 text-xs text-[#5F5E5A] font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                  {shareableLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                    copied
                      ? "bg-[#E1F5EE] text-[#0F6E56] border border-[#5DCAA5]"
                      : "bg-[#0F6E56] text-white hover:bg-[#085041]"
                  }`}
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>

              <p className="text-xs text-[#888780]">
                The link includes your current city, specialty filters, and
                radius.
              </p>
            </div>
          )}

          {activeTab === "email" && (
            <div>
              {sendSuccess ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-sm font-medium text-[#1A1A18]">
                    Email sent successfully
                  </p>
                  <p className="text-xs text-[#888780] mt-1">
                    {recipientEmail} will receive the hospital list shortly.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 text-sm text-[#0F6E56] underline"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-[#888780] uppercase tracking-wide mb-2">
                      Recipient email
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className="w-full bg-[#F1EFE8] border border-transparent rounded-lg px-3 py-2.5 text-sm text-[#1A1A18] outline-none focus:border-[#5DCAA5] transition-colors"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-[#888780] uppercase tracking-wide mb-2">
                      Select hospitals to include
                    </label>
                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                      {hospitals.map((hospital) => {
                        const isSelected = selectedHospitalId.includes(
                          hospital.id,
                        );
                        return (
                          <div
                            key={hospital.id}
                            onClick={() => toggleHospital(hospital.id)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#F6F5F0] transition-colors"
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                                isSelected
                                  ? "bg-[#0F6E56] border-[#0F6E56]"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </div>
                            <span className="text-sm text-[#1A1A18] flex-1">
                              {hospital.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {sendError && (
                    <div className="bg-[#FCEBEB] border border-red-200 rounded-lg px-3 py-2.5 text-xs text-[#A32D2D] mb-4">
                      {sendError}
                    </div>
                  )}

                  <button
                    onClick={handleSendEmail}
                    disabled={
                      isSending ||
                      !recipientEmail.trim() ||
                      selectedHospitalId.length === 0
                    }
                    className="w-full bg-[#0F6E56] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#085041] transition-colors disabled:opacity-40"
                  >
                    {isSending ? "Sending..." : "Send email"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
