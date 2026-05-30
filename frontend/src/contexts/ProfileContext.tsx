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

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
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
      setError(message);
      setProfileState(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

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
    refresh();
  }, [session, authLoading, refresh]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loading: authLoading || loading,
      error,
      refresh,
      setProfile,
    }),
    [profile, authLoading, loading, error, refresh, setProfile]
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
