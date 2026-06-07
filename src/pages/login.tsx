import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Incorrect email or password. Please try again.");
      setIsLoading(false);
      return;
    }

    navigate("/search");
  }

  async function handleSignUp() {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "user" },
        emailRedirectTo: `${window.location.origin}/search`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccessMessage(
      " Account created successfully! Please check your email to confirm your account.",
    );
    setEmail("");
    setPassword("");
    setFullName("");
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F6F5F0] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-md overflow-hidden shadow-sm">
        <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0F6E56] rounded-xl mb-4">
            <span className="text-white text-2xl font-light">+</span>
          </div>
          <h1 className="text-xl font-semibold text-[#1A1A18]">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-[#888780] mt-1">
            {mode === "login"
              ? "Sign in to write reviews and save searches"
              : "Join Carefinder to write reviews"}
          </p>
        </div>

        <div className="px-8 py-6">
          {successMessage && (
            <div className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-lg px-4 py-3 text-sm text-[#0F6E56] mb-4">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-[#FCEBEB] border border-red-200 rounded-lg px-4 py-3 text-sm text-[#A32D2D] mb-4">
              {error}
            </div>
          )}

          {mode === "signup" && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#5F5E5A] uppercase tracking-wide mb-2">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Joshua Okoronkwo"
                className="w-full bg-[#F1EFE8] border border-transparent rounded-lg px-4 py-3 text-sm text-[#1A1A18] outline-none focus:border-[#5DCAA5] transition-colors"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-[#5F5E5A] uppercase tracking-wide mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#F1EFE8] border border-transparent rounded-lg px-4 py-3 text-sm text-[#1A1A18] outline-none focus:border-[#5DCAA5] transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-[#5F5E5A] uppercase tracking-wide mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (mode === "login" ? handleLogin() : handleSignUp())
              }
              placeholder={mode === "login" ? "••••••••" : "Min. 8 characters"}
              className="w-full bg-[#F1EFE8] border border-transparent rounded-lg px-4 py-3 text-sm text-[#1A1A18] outline-none focus:border-[#5DCAA5] transition-colors"
            />
          </div>

          <button
            onClick={mode === "login" ? handleLogin : handleSignUp}
            disabled={isLoading}
            className="w-full bg-[#0F6E56] text-white text-sm font-medium py-3 rounded-lg hover:bg-[#085041] transition-colors disabled:opacity-40"
          >
            {isLoading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>

          <p className="text-center text-sm text-[#888780] mt-4">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setSuccessMessage("");
              }}
              className="text-[#0F6E56] font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      <a
        href="/"
        className="mt-6 text-sm text-[#888780] hover:text-[#0F6E56] transition-colors"
      >
        ← Back to Carefinder
      </a>
    </div>
  );
}

export default Login;
