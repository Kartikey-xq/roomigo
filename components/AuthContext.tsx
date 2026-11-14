"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthProfile {
  id: string;
  fullName: string;
  gender: string;
  campus: string;
  course: string;
  yearOfStudy: string;
  currentTerm: string;
  affiliation: string;
  studentIdPrefix?: string;
  avatarUrl?: string;
  bio?: string;
  verificationStatus: string;
  roommatePreference?: Record<string, unknown> | null;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthProfile | null;
  unreadCount: number;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  unreadCount: 0,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  refreshSession: async () => {},
  setUnreadCount: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      if (data.authenticated && data.data) {
        setUser(data.data.user);
        setProfile(data.data.studentProfile);
        setUnreadCount(
          typeof data.data.counts?.unreadMessages === "number"
            ? data.data.counts.unreadMessages
            : 0
        );
      } else {
        setUser(null);
        setProfile(null);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Auth fetch error:", err);
      setUser(null);
      setProfile(null);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    async function initAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (isCancelled) return;

        if (data.authenticated && data.data) {
          setUser(data.data.user);
          setProfile(data.data.studentProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Auth fetch error:", err);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = async (email: string, password = "Password@123"): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data.user);
        setProfile(data.data.studentProfile);
        setIsLoading(false);
        fetchSession(); // Refresh live counts and session state
        return true;
      }
      setIsLoading(false);
      return false;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setProfile(null);
      setUnreadCount(0);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        unreadCount,
        isLoading,
        login,
        logout,
        refreshSession: fetchSession,
        setUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
