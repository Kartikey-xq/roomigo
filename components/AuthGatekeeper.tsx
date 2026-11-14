"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight, Loader2, MessageSquare, Users, User } from "lucide-react";
import { useAuth } from "./AuthContext";

interface AuthGatekeeperProps {
  pageName: "Roommate Finder" | "Chat" | "Profile";
  children: React.ReactNode;
}

export default function AuthGatekeeper({
  pageName,
  children,
}: AuthGatekeeperProps) {
  const { user, isLoading } = useAuth();

  // Clean inline loading state inside content area (does not hide shell navigation)
  if (isLoading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold text-zinc-500">
          Checking Graphic Era student session...
        </p>
      </div>
    );
  }

  // If authenticated, render protected page content
  if (user) {
    return <>{children}</>;
  }

  const redirectPath =
    pageName === "Roommate Finder"
      ? "/roommate-finder"
      : pageName === "Chat"
      ? "/chat"
      : "/profile";

  const getPageDetails = () => {
    switch (pageName) {
      case "Roommate Finder":
        return {
          icon: Users,
          desc: "Connect with verified Graphic Era roommates matching your campus, sleep schedule, and lifestyle habits.",
        };
      case "Chat":
        return {
          icon: MessageSquare,
          desc: "Communicate securely with prospective roommates and chat with student flatmates.",
        };
      case "Profile":
        return {
          icon: User,
          desc: "Manage your student verification, living preferences, budget, and roommate discovery settings.",
        };
    }
  };

  const details = getPageDetails();
  const IconComponent = details.icon;

  return (
    <div className="relative w-full min-h-[60vh] sm:min-h-[70vh] rounded-3xl overflow-hidden border border-zinc-200/80 bg-zinc-50/50">
      {/* Background disabled preview structure (Uninteractive & blurred) */}
      <div
        className="p-6 sm:p-8 space-y-4 pointer-events-none select-none opacity-30 filter blur-[1.5px]"
        aria-hidden="true"
      >
        <div className="h-6 w-48 bg-zinc-300 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-zinc-200 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="h-44 bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
            <div className="w-12 h-12 bg-zinc-200 rounded-full" />
            <div className="h-4 w-32 bg-zinc-200 rounded" />
            <div className="h-3 w-44 bg-zinc-100 rounded" />
          </div>
          <div className="h-44 bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
            <div className="w-12 h-12 bg-zinc-200 rounded-full" />
            <div className="h-4 w-32 bg-zinc-200 rounded" />
            <div className="h-3 w-44 bg-zinc-100 rounded" />
          </div>
        </div>
      </div>

      {/* Semi-opaque White Overlay with Centered Professional Auth Card */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/90 shadow-xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          {/* Lock Icon */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-2">
            <IconComponent className="w-3.5 h-3.5" />
            <span>Student Authentication Required</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            Sign In to Access {pageName}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed max-w-sm mx-auto">
            {details.desc}
          </p>

          {/* Action CTAs */}
          <div className="mt-6 space-y-3">
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Sign in to continue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
              className="block text-xs font-semibold text-zinc-600 hover:text-emerald-800 transition-colors pt-1"
            >
              New to Roomigo?{" "}
              <span className="text-emerald-700 font-bold underline decoration-emerald-300 underline-offset-2">
                Create an account
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
