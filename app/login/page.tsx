"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/listings";

  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePersonaEmail, setActivePersonaEmail] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const TEST_PERSONAS = [
    {
      name: "Kartikey Joshi",
      email: "kartikey@gehu.ac.in",
      role: "GEHU • CSE 2nd Yr",
      pref: "Early Bird • Pure Veg",
    },
    {
      name: "Aarav Sharma",
      email: "aarav@gehu.ac.in",
      role: "GEHU • 98% Match Partner",
      pref: "Early Bird • Pure Veg",
    },
    {
      name: "Rohan Verma",
      email: "rohan@geu.ac.in",
      role: "GEU Main • Night Owl",
      pref: "BCA 1st Yr • Gamer",
    },
    {
      name: "Priya Nautiyal",
      email: "priya@gehu.ac.in",
      role: "GEHU • Female Resident",
      pref: "ECE 3rd Yr • High Hygiene",
    },
  ];

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      router.push(redirectUrl);
    } else {
      setErrorMsg("Invalid email or password. Please verify your student credentials.");
    }
  };

  const handleFastLogin = async (personaEmail: string) => {
    setActivePersonaEmail(personaEmail);
    setErrorMsg(null);

    const success = await login(personaEmail, "Password@123");
    setActivePersonaEmail(null);

    if (success) {
      router.push(redirectUrl);
    } else {
      setErrorMsg(`Failed to log in as ${personaEmail}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 sm:py-14 px-4 sm:px-6">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link
          href="/listings"
          className="inline-flex items-center gap-2.5 mb-3 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-zinc-900">
            Roomigo
          </span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
          Sign In to Your Student Account
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
          Exclusively for Graphic Era (GEU & GEHU) students in Dehradun.
        </p>
      </div>

      {/* Main Login Card (Facebook-inspired Clean Consumer Form) */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xl p-6 sm:p-8 space-y-5">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="text-xs font-bold text-zinc-700 block"
            >
              Graphic Era Email or Username
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="student@gehu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-4 py-3 pl-10 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password input with toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-xs font-bold text-zinc-700 block"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Password Reset: Please contact student support at admin@gehu.ac.in or test with default password: Password@123"
                  )
                }
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-4 py-3 pl-10 pr-10 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Sign In Primary CTA */}
          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-zinc-400 font-semibold font-mono">
            <span className="bg-white px-3">or</span>
          </div>
        </div>

        {/* Create Account Link Button */}
        <div className="text-center pt-1">
          <Link
            href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
            className="w-full py-3 px-4 rounded-2xl border border-zinc-300 hover:border-emerald-300 bg-zinc-50 hover:bg-emerald-50/50 text-zinc-800 hover:text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-center transition-all shadow-2xs"
          >
            Create New Student Account
          </Link>
        </div>
      </div>

      {/* 1-Click Fast Student Test Accounts (Development & Staging Only) */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-8 bg-zinc-50/90 rounded-3xl border border-zinc-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Student Test Accounts
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Demo Mode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TEST_PERSONAS.map((p) => {
              const isLoggingIn = activePersonaEmail === p.email;
              return (
                <button
                  key={p.email}
                  type="button"
                  disabled={activePersonaEmail !== null}
                  onClick={() => handleFastLogin(p.email)}
                  className="p-3 rounded-2xl bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-300 text-left transition-all group shadow-2xs active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-950 truncate">
                      {p.name}
                    </span>
                    {isLoggingIn ? (
                      <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-800 font-medium mt-0.5 truncate">
                    {p.role}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">{p.pref}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Public Listings Navigation Link */}
      <div className="mt-6 text-center">
        <Link
          href="/listings"
          className="text-xs font-semibold text-zinc-500 hover:text-emerald-800 transition-colors inline-flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Browse Public Verified Listings Without Signing In</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-zinc-500 font-semibold">Loading Roomigo Sign In...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
