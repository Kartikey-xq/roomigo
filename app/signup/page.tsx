"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/listings";

  const { login, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState<"GEHU" | "GEU">("GEHU");
  const [course, setCourse] = useState("B.Tech Computer Science & Engg.");
  const [yearOfStudy, setYearOfStudy] = useState("2nd Year");
  const [gender, setGender] = useState("MALE");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          campus,
          course,
          yearOfStudy,
          gender,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Automatically sign in upon registration
        const loginSuccess = await login(email, password);
        if (loginSuccess) {
          router.push(redirectUrl);
        } else {
          router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
      } else {
        setErrorMsg(
          data.error?.message || "Registration failed. Try a different email."
        );
      }
    } catch {
      setErrorMsg("Unable to register account. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8 sm:py-12 px-4 sm:px-6">
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
          Create Your Student Account
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-md mx-auto">
          Join verified Graphic Era students to discover rooms, PGs, and compatible flatmates.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-xl p-6 sm:p-8 space-y-5">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-name"
              className="text-xs font-bold text-zinc-700 block"
            >
              Full Student Name
            </label>
            <div className="relative">
              <input
                id="reg-name"
                type="text"
                required
                placeholder="e.g. Kartikey Joshi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-4 py-3 pl-10 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-email"
              className="text-xs font-bold text-zinc-700 block"
            >
              Graphic Era Email ID
            </label>
            <div className="relative">
              <input
                id="reg-email"
                type="email"
                required
                placeholder="e.g. yourname@gehu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-4 py-3 pl-10 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Campus & Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Campus */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-campus"
                className="text-xs font-bold text-zinc-700 block"
              >
                Campus Location
              </label>
              <select
                id="reg-campus"
                value={campus}
                onChange={(e) => setCampus(e.target.value as "GEHU" | "GEU")}
                className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-3 py-3 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option value="GEHU">GEHU Dehradun (Bell Road)</option>
                <option value="GEU">GEU Main Campus (Subhash Nagar)</option>
              </select>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-gender"
                className="text-xs font-bold text-zinc-700 block"
              >
                Gender
              </label>
              <select
                id="reg-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-3 py-3 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Course & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="reg-course"
                className="text-xs font-bold text-zinc-700 block"
              >
                Course &amp; Branch
              </label>
              <input
                id="reg-course"
                type="text"
                required
                placeholder="e.g. B.Tech CSE"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-3 py-3 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reg-year"
                className="text-xs font-bold text-zinc-700 block"
              >
                Year of Study
              </label>
              <select
                id="reg-year"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-3 py-3 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="reg-password"
                className="text-xs font-bold text-zinc-700 block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-3 py-3 pr-9 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
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

            <div className="space-y-1.5">
              <label
                htmlFor="reg-confirm-password"
                className="text-xs font-bold text-zinc-700 block"
              >
                Confirm Password
              </label>
              <input
                id="reg-confirm-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-600 rounded-2xl px-3 py-3 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing account prompt */}
        <div className="text-center pt-2 border-t border-zinc-100">
          <p className="text-xs text-zinc-600">
            Already have a Graphic Era student account?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline decoration-emerald-300 underline-offset-2"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Back to listings */}
      <div className="mt-6 text-center">
        <Link
          href="/listings"
          className="text-xs font-semibold text-zinc-500 hover:text-emerald-800 transition-colors inline-flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Browse Public Verified Listings Instead</span>
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-zinc-500 font-semibold">Loading Roomigo Registration...</p>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
