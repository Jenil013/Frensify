import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { ApiProfile, fetchProfile } from "../lib/apiClient";

type ProfileContextValue = {
  profile: ApiProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<ApiProfile | null>;
  /** Update cached profile after PATCH (avoids stale gate on /app). */
  setProfile: (profile: ApiProfile) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

/** Messages thrown by apiClient when the session/token is no longer valid. */
const AUTH_ERROR_MESSAGES = new Set([
  "Not authenticated.",
  "Token expired.",
  "Invalid token.",
]);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading, passwordRecovery, signOut } = useAuth();
  const [profile, setProfileState] = useState<ApiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) {
      setProfileState(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile();
      setProfileState(data);
      return data;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load profile.";
      // A dead/invalid session can't be recovered by a route change — clear it
      // so the user re-authenticates instead of getting bounced to /onboarding.
      if (AUTH_ERROR_MESSAGES.has(message) && !passwordRecovery) {
        await signOut();
      }
      setError(message);
      setProfileState(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session, signOut, passwordRecovery]);

  const setProfile = useCallback((next: ApiProfile) => {
    setProfileState(next);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setProfileState(null);
      setLoading(false);
      return;
    }
    if (passwordRecovery) {
      setLoading(false);
      return;
    }
    refresh();
  }, [session, authLoading, passwordRecovery, refresh]);

  // Treat the context as loading whenever a session exists but its profile
  // has not been fetched yet. The refresh effect runs after commit, so without
  // this guard route guards would briefly see `profile === null` for a
  // signed-in user and wrongly redirect to /onboarding.
  const profilePending = Boolean(session) && !profile && !error;

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loading: authLoading || loading || profilePending,
      error,
      refresh,
      setProfile,
    }),
    [profile, authLoading, loading, profilePending, error, refresh, setProfile]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useApiProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useApiProfile must be used within ProfileProvider");
  }
  return ctx;
}
