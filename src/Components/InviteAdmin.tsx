import { useState } from "react";
import { supabase } from "../lib/supabase";

function InviteAdmin() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleInvite() {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("Session exists:", !!session);
      console.log("Access token:", session?.access_token?.substring(0, 20));

      if (!session) {
        setError("You must be logged in");
        setIsLoading(false);
        return;
      }

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-admin`;
      console.log("Calling:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, fullName }),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response body:", result);

      if (!response.ok) {
        setError(result.error || "Failed to send invite");
        return;
      }

      setSuccess(`Invite sent to ${email} successfully`);
      setEmail("");
      setFullName("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-md">
      <h3 className="text-sm font-medium text-[#1A1A18] mb-1">
        Invite new admin
      </h3>
      <p className="text-xs text-[#888780] mb-5">
        They'll receive an email to set their password and will have full admin
        access.
      </p>

      {success && (
        <div className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-lg px-4 py-3 text-sm text-[#0F6E56] mb-4">
          ✅ {success}
        </div>
      )}

      {error && (
        <div className="bg-[#FCEBEB] border border-red-200 rounded-lg px-4 py-3 text-sm text-[#A32D2D] mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-medium text-[#5F5E5A] uppercase tracking-wide mb-2">
          Full name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Amaka Okonkwo"
          className="w-full bg-[#F1EFE8] border border-transparent rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:border-[#5DCAA5] transition-colors"
        />
      </div>

      <div className="mb-5">
        <label className="block text-xs font-medium text-[#5F5E5A] uppercase tracking-wide mb-2">
          Email address <span className="text-[#A32D2D]">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          placeholder="newadmin@example.com"
          className="w-full bg-[#F1EFE8] border border-transparent rounded-lg px-4 py-2.5 text-sm text-[#1A1A18] outline-none focus:border-[#5DCAA5] transition-colors"
        />
      </div>

      <button
        onClick={handleInvite}
        disabled={isLoading || !email.trim()}
        className="w-full bg-[#0F6E56] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#085041] transition-colors disabled:opacity-40"
      >
        {isLoading ? "Sending invite..." : "Send invite"}
      </button>
    </div>
  );
}

export default InviteAdmin;
