import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useApiProfile } from "../../hooks/useApiProfile";
import { isOnboardingComplete } from "../../lib/apiClient";
import AuthLoadingScreen from "./AuthLoadingScreen";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /** When true, user must have completed onboarding (target_exam set). */
  requireComplete?: boolean;
  /** When true, redirect to /app if onboarding is already done (for /onboarding). */
  redirectIfComplete?: boolean;
};

export function ProtectedRoute({
  children,
  requireComplete = false,
  redirectIfComplete = false,
}: ProtectedRouteProps) {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useApiProfile();
  const location = useLocation();

  if (authLoading || profileLoading) {
    return <AuthLoadingScreen />;
  }

  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirect}`} replace />;
  }

  const complete = isOnboardingComplete(profile);

  if (redirectIfComplete && complete) {
    return <Navigate to="/app" replace />;
  }

  if (requireComplete && !complete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useApiProfile();

  if (authLoading || (session && profileLoading)) {
    return <AuthLoadingScreen />;
  }

  if (session) {
    if (!isOnboardingComplete(profile)) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
