import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { AuthShell } from "../components/auth/AuthShell";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

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
    setSubmitting(true);

    try {
      const { error: resetError } = await resetPasswordForEmail(email.trim());
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-[#E9F3FC] rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-[#1D74B4]" />
          </div>
          <h1 className="text-xl font-bold text-[#37352F]">Check your email</h1>
          <p className="text-sm text-[#5F5E5B] leading-relaxed">
            If an account exists for{" "}
            <strong className="text-[#37352F]">{email}</strong>, we sent a link
            to reset your password. The link expires in about an hour.
          </p>
          <Link
            to="/auth"
            className="inline-block text-sm font-medium text-[#002D62] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#37352F] tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-[#7A7A78] mt-1">
          Enter your email and we&apos;ll send you a secure reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-[#5F5E5B] uppercase tracking-wide">
            Email
          </span>
          <div className="mt-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A78]" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E9E9E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#002D62]/20 focus:border-[#002D62]"
              placeholder="you@example.com"
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
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5F5E5B]">
        Remember your password?{" "}
        <Link to="/auth" className="font-semibold text-[#002D62] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
