"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  ArrowRight,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "./AuthContext";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle?: string;
  onSuccess?: () => void;
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  listingTitle,
  onSuccess,
}: AuthRequiredModalProps) {
  const { login } = useAuth();
  const [tab, setTab] = useState<"quick" | "login" | "register">("quick");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("MALE");
  const [campus, setCampus] = useState("GEHU");
  const [course, setCourse] = useState("B.Tech CSE");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const TEST_ACCOUNTS = [
    {
      name: "Kartikey Joshi",
      email: "kartikey@gehu.ac.in",
      role: "Student A (GEHU • Early Bird • Pure Veg)",
    },
    {
      name: "Aarav Sharma",
      email: "aarav@gehu.ac.in",
      role: "Student B (GEHU • 98% Match with Kartikey)",
    },
    {
      name: "Rohan Verma",
      email: "rohan@geu.ac.in",
      role: "Student C (GEU Main • BCA 1st Yr)",
    },
  ];

  const handleQuickLogin = async (accEmail: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const success = await login(accEmail, "Password@123");
    setIsSubmitting(false);
    if (success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg("Failed to sign in. Please try again.");
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg("Invalid email or password. Please verify credentials.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          gender,
          campus,
          course,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await login(email, password);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(data.error?.message || "Registration failed.");
      }
    } catch {
      setErrorMsg("Error registering account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SOLID WHITE BACKGROUND OVERLAY (Nothing underneath visible, no transparent blur)
  return (
    <div className="fixed inset-0 z-50 bg-[#fbfdfc] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/90 shadow-2xl overflow-hidden my-auto relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-emerald-50/80 to-white border-b border-zinc-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 mb-3">
            <Lock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
            Login or Sign Up First
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed max-w-xs">
            To book a bed {listingTitle ? `at ${listingTitle} ` : ""}and inquire directly with property managers on WhatsApp, please sign in or register with your student account.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl mt-4 w-full text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab("quick");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === "quick"
                  ? "bg-white text-emerald-950 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              1-Click Login
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === "login"
                  ? "bg-white text-emerald-950 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === "register"
                  ? "bg-white text-emerald-950 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: 1-Click Fast Student Logins */}
          {tab === "quick" && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">
                Select student account to book bed:
              </p>
              {TEST_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickLogin(acc.email)}
                  className="w-full p-3 rounded-2xl border border-zinc-200/90 hover:border-emerald-300 bg-zinc-50/60 hover:bg-emerald-50/50 text-left flex items-center justify-between transition-all group cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-50"
                >
                  <div>
                    <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-950">
                      {acc.name}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {acc.role}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* TAB 2: Sign In Form */}
          {tab === "login" && (
            <form onSubmit={handleManualLogin} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gehu.ac.in or gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Sign In &amp; Continue Booking</span>
              </button>
            </form>
          )}

          {/* TAB 3: Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kartikey Joshi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                    Campus
                  </label>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="GEHU">GEHU Bell Road</option>
                    <option value="GEU_MAIN">GEU Main Campus</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                  Course
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech CSE"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gehu.ac.in or gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>Register &amp; Book Bed</span>
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              Continue Browsing Listings Without Signing In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
