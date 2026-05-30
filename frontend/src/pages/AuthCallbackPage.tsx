import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApiProfile } from "../hooks/useApiProfile";
import { isOnboardingComplete } from "../lib/apiClient";
import AuthLoadingScreen from "../components/auth/AuthLoadingScreen";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useApiProfile();

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!session) {
      navigate("/auth", { replace: true });
      return;
    }

    if (!isOnboardingComplete(profile)) {
      navigate("/onboarding", { replace: true });
      return;
    }

    navigate("/app", { replace: true });
  }, [session, profile, authLoading, profileLoading, navigate]);

  return <AuthLoadingScreen message="Signing you in…" />;
}
