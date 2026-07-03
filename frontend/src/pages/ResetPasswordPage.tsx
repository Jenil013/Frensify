import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { AuthShell } from "../components/auth/AuthShell";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_REQUIREMENTS_HINT,
  passwordStrengthError,
} from "../lib/authPassword";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { passwordRecovery, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hashRecovery, setHashRecovery] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (params.get("type") === "recovery") {
      setHashRecovery(true);
    }
  }, []);

  const recoveryReady = passwordRecovery || hashRecovery;

  if (!isSupabaseConfigured) {
    return (
      <AuthShell>
        <p className="text-sm text-[#5F5E5B] text-center">
          Supabase is not configured. Add your project URL and anon key to{" "}
          <code className="text-xs bg-[#F1F1EF] px-1 rounded">frontend/.env</code>.
        </p>
      </AuthShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const strengthError = passwordStrengthError(password);
    if (strengthError) {
      setError(strengthError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      navigate("/app", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  if (!recoveryReady) {
    return (
      <AuthShell>
        <div className="text-center space-y-4">
          <h1 className="text-xl font-bold text-[#37352F]">Link expired or invalid</h1>
          <p className="text-sm text-[#5F5E5B] leading-relaxed">
            Open the reset link from your email again, or request a new one.
          </p>
          <Link
            to="/auth/forgot-password"
            className="inline-block text-sm font-medium text-[#002D62] hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#37352F] tracking-tight">
          Choose a new password
        </h1>
        <p className="text-sm text-[#7A7A78] mt-1">
          {PASSWORD_REQUIREMENTS_HINT}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-[#5F5E5B] uppercase tracking-wide">
            New password
          </span>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A78]" />
            <input
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E9E9E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#002D62]/20 focus:border-[#002D62]"
              placeholder="••••••••"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-[#5F5E5B] uppercase tracking-wide">
            Confirm password
          </span>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A78]" />
            <input
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E9E9E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#002D62]/20 focus:border-[#002D62]"
              placeholder="••••••••"
            />
          </div>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-[#002D62] hover:bg-[#001D42] text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
