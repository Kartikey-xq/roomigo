"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Building2,
  Users,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Smartphone,
  Play,
  CheckCircle2,
  Share,
  PlusSquare,
  Info,
} from "lucide-react";
import PwaInstallButton from "@/components/PwaInstallButton";

export default function LaunchPage() {
  // Configurable YouTube Video ID from environment or user-supplied prop
  const youtubeVideoId = process.env.NEXT_PUBLIC_LAUNCH_YOUTUBE_ID || "";
  const hasValidVideoId = Boolean(youtubeVideoId && youtubeVideoId !== "PLACEHOLDER_VIDEO_ID");

  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");

  return (
    <div className="w-full min-h-screen bg-[#fbfdfc] text-zinc-900 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 sm:pt-12 pb-14 sm:pb-20 border-b border-zinc-200/60 bg-radial from-emerald-50/70 via-transparent to-transparent">
        {/* Subtle decorative background blur glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-400/15 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Launch Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/90 text-emerald-800 text-xs font-semibold shadow-2xs animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official PWA Launch for Graphic Era Students</span>
          </div>

          {/* Headline & Brand */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.12]">
              Find a room. <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                Find your people.
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Roomigo connects Graphic Era students in Dehradun with verified PGs, hostels, and lifestyle-compatible roommates. Zero brokers. Zero guesswork.
            </p>
          </div>

          {/* Dual CTAs: Primary Install + Secondary Open App */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <PwaInstallButton
              size="lg"
              variant="primary"
              label="Install Roomigo App"
              installedLabel="Roomigo Installed"
              className="w-full sm:w-auto"
            />

            <Link
              href="/listings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold rounded-2xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 shadow-xs active:scale-95 transition-all"
            >
              <span>Open Web App</span>
              <ArrowRight className="w-4 h-4 text-zinc-500" />
            </Link>
          </div>

          {/* Social Proof / Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified GEU &amp; GEHU Residences
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Instant Home Screen Access
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Real-Time WebSocket Chat
            </span>
          </div>
        </div>
      </section>

      {/* 2. VIDEO DEMONSTRATION SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-3 sm:p-5 border border-zinc-200/90 shadow-xl shadow-zinc-900/5">
          <div className="flex items-center justify-between px-2 pb-3 border-b border-zinc-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-zinc-700 ml-2">
                Roomigo Product Walkthrough
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">16:9 HD</span>
          </div>

          {/* 16:9 Aspect Ratio Responsive Container */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            {hasValidVideoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(
                  youtubeVideoId
                )}?rel=0&modestbranding=1`}
                title="Roomigo Demonstration Walkthrough"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              /* Clearly marked placeholder when final YouTube link has not been pasted */
              <div className="p-6 sm:p-10 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                  <Play className="w-8 h-8 fill-emerald-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    YouTube Walkthrough Demonstration
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    A video demonstration of roommate matching, accommodation discovery, and real-time messaging will be embedded here.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-[11px] text-zinc-300 font-mono">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Configurable via NEXT_PUBLIC_LAUNCH_YOUTUBE_ID</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE PRODUCT PILLARS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Built Specifically for Graphic Era Students
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Every feature is tailored to living around GEU (Subhash Nagar) and GEHU (Bell Road).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:border-emerald-200 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              Verified Student Residences
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Explore curated PGs, hostels, and flats near Graphic Era campuses. Transparent monthly pricing, genuine photo galleries, and walk-to-campus proximity details.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:border-emerald-200 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              Lifestyle Roommate Matching
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Match with peers using a weighted compatibility algorithm evaluating sleep cycle (early bird vs. night owl), diet, cleanliness hygiene, and study habits.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:border-emerald-200 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              Direct Peer Requests
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Send and receive roommate requests with personalized greeting notes. Mutual consent is required before private messaging and contact sharing unlock.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:border-emerald-200 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              Real-Time Encrypted Chat
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Instant, persistent messaging powered by our standalone Railway WebSocket server. Messages display in accurate Indian Standard Time (IST) with live delivery tags.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INSTALLATION GUIDE TABS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            How to Install Roomigo
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Roomigo is an installable Progressive Web App (PWA). No App Store or Play Store account required.
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-zinc-100 border border-zinc-200 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === "android"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Android / Chrome
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === "ios"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            iPhone (iOS Safari)
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-zinc-200/90 shadow-xs space-y-4">
          {activeTab === "android" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>1-Click Native Install on Android</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                On Chrome, Edge, or Samsung Internet, simply tap the button below. Your browser will prompt to add Roomigo as a native app on your home screen and app drawer.
              </p>
              <div className="pt-1">
                <PwaInstallButton
                  size="md"
                  variant="primary"
                  label="Install on Android"
                  installedLabel="App Installed"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Quick Setup on Safari (iPhone)</span>
              </div>
              <ol className="space-y-2.5 text-xs sm:text-sm text-zinc-700">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Open this page in <strong>Safari</strong> on your iPhone.
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 text-emerald-600 inline" /> at the bottom of the screen.
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Select <strong>&quot;Add to Home Screen&quot;</strong> <PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline" /> &amp; confirm <strong>Add</strong>.
                  </span>
                </li>
              </ol>
              <div className="pt-1">
                <PwaInstallButton
                  size="md"
                  variant="secondary"
                  label="Show iOS Instructions"
                  installedLabel="App Installed"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm font-bold text-zinc-900">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span>Roomigo</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Dehradun
          </span>
        </div>
        <p className="text-xs text-zinc-500">
          Graphic Era Student Accommodation &amp; Roommate Discovery &bull; 2026
        </p>
      </footer>
    </div>
  );
}
