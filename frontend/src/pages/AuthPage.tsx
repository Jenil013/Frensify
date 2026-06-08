import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { AuthShell } from "../components/auth/AuthShell";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode: AuthMode =
    searchParams.get("mode") === "signup" ? "signup" : "signin";
  const redirectTo = searchParams.get("redirect") ?? "/app";

  const { signInWithPassword, signUp, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifyEmailSent, setVerifyEmailSent] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E9E9E7] p-8 shadow-sm text-center">
          <p className="text-sm text-[#5F5E5B]">
            Supabase is not configured. Add{" "}
            <code className="text-xs bg-[#F1F1EF] px-1 rounded">VITE_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="text-xs bg-[#F1F1EF] px-1 rounded">VITE_SUPABASE_ANON_KEY</code>{" "}
            to <code className="text-xs">frontend/.env</code> (see{" "}
            <code className="text-xs">.env.example</code>).
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setVerifyEmailSent(false);

    try {
      if (mode === "signup") {
        const { error: signUpError, needsEmailConfirmation } = await signUp(
          email.trim(),
          password
        );
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (needsEmailConfirmation) {
          setVerifyEmailSent(true);
          return;
        }
        navigate(redirectTo.startsWith("/") ? redirectTo : "/onboarding", {
          replace: true,
        });
        return;
      }

      const { error: signInError } = await signInWithPassword(
        email.trim(),
        password
      );
      if (signInError) {
        setError(signInError.message);
        return;
      }
      navigate(redirectTo.startsWith("/") ? redirectTo : "/app", {
        replace: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    const { error: oauthError } = await signInWithGoogle();
    if (oauthError) {
      setError(oauthError.message);
      setSubmitting(false);
    }
  };

  if (verifyEmailSent) {
    return (
      <AuthShell>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-[#E9F3FC] rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-[#1D74B4]" />
          </div>
          <h1 className="text-xl font-bold text-[#37352F]">Check your email</h1>
          <p className="text-sm text-[#5F5E5B] leading-relaxed">
            We sent a confirmation link to{" "}
            <strong className="text-[#37352F]">{email}</strong>. Open it to
            activate your account, then sign in to continue.
          </p>
          <button
            type="button"
            onClick={() => {
              setVerifyEmailSent(false);
              setMode("signin");
            }}
            className="text-sm font-medium text-[#002D62] hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#37352F] tracking-tight">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-[#7A7A78] mt-1">
          {mode === "signup"
            ? "Start your TEF / TCF preparation journey"
            : "Sign in to continue your exam prep"}
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-[#E9E9E7] rounded-xl text-sm font-medium text-[#37352F] hover:bg-[#FAFAF9] transition-all shadow-sm disabled:opacity-60"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E9E9E7]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[#7A7A78]">or</span>
        </div>
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

        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F5E5B] uppercase tracking-wide">
              Password
            </span>
            {mode === "signin" && (
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-[#002D62] hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="mt-1 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A78]" />
            <input
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {submitting
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5F5E5B]">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className="font-semibold text-[#002D62] hover:underline"
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            New to Frensify?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className="font-semibold text-[#002D62] hover:underline"
            >
              Create account
            </button>
          </>
        )}
      </p>
    </AuthShell>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
