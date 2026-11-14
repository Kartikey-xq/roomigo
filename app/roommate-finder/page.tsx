"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Users,
  CheckCircle2,
  Send,
  CheckCheck,
  User,
  ArrowRight,
  Search,
  RotateCcw,
  X,
  MapPin,
} from "lucide-react";
import { Roommate } from "@/types/roommate";
import PublicProfileModal from "@/components/PublicProfileModal";
import CompatibilityFormModal, {
  CompatibilityFormData,
} from "@/components/CompatibilityFormModal";
import AuthGatekeeper from "@/components/AuthGatekeeper";

export default function RoommateFinderPage() {
  // Matches from last search state (starts empty as requested: "which should be empty and show 'no searches yet'")
  const [searchMatches, setSearchMatches] = useState<Roommate[]>([]);
  const [lastSearchTime, setLastSearchTime] = useState<string | null>(null);

  // Sent requests tracking (by candidate ID)
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  // Public Profile Modal state
  const [selectedProfile, setSelectedProfile] = useState<Roommate | null>(null);

  // Compatibility Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load already sent requests on mount
  React.useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.sent) {
          setSentRequests(
            data.data.sent.map((s: { receiverId: string }) => s.receiverId)
          );
        }
      })
      .catch((err) => console.error("Error loading requests:", err));
  }, []);

  // Run new search -> Calls PostgreSQL matching engine, deletes old results and populates new list
  const handleNewSearch = async (formData: CompatibilityFormData) => {
    setIsFormOpen(false);

    try {
      const res = await fetch("/api/roommate-finder/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setSearchMatches(data.data);
        setLastSearchTime("Matched just now");
        showToast(`Scan complete! Found ${data.data.length} compatible students.`);
      } else {
        showToast("No matching candidates found for this criteria.");
      }
    } catch (err) {
      console.error("Match scan error:", err);
      showToast("Failed to run scan. Please try again.");
    }
  };

  // Toggle/Send Request
  const handleSendRequest = async (candidate: Roommate) => {
    if (sentRequests.includes(candidate.id)) return;

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: candidate.id,
          requestMessage: `Hey ${candidate.name}! Noticed our high compatibility in roommate search. Would love to connect about flatmate options.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSentRequests((prev) => [...prev, candidate.id]);
        showToast(`Chat invite sent to ${candidate.name}! They will receive your request.`);
      } else {
        showToast(data.error?.message || "Failed to send request.");
      }
    } catch {
      showToast("Error sending request.");
    }
  };

  // Clear/Reset searches to test empty state
  const handleClearSearches = () => {
    setSearchMatches([]);
    setLastSearchTime(null);
    setSentRequests([]);
    showToast("Search results cleared. Showing 'No searches yet'.");
  };

  return (
    <AuthGatekeeper pageName="Roommate Finder">
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-zinc-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-400 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Screen Header (1:1 with Screenshot 115504) */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>GRAPHIC ERA HOUSING POOL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 font-sans">
          Roommate Finder
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Match by study habits, Clement Town PGs &amp; sleep cycle
        </p>
      </div>

      {/* Hero Card: Find Your Ideal Flatmate (1:1 with Screenshot 115504) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 border border-indigo-100/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-3">
          {/* Status Pill Badge */}
          {lastSearchTime ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{lastSearchTime}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium text-xs border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>No searches yet</span>
            </div>
          )}

          <span className="text-xs font-mono font-medium text-zinc-400">
            GEHU / GEU Pool
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          Find Your Ideal Flatmate
        </h2>

        <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed max-w-xl">
          Filter by early bird or night owl, vegetarian mess, non-smoker, and
          CSE/ECE branch mates.
        </p>

        {/* Find Roommates CTA Button */}
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Find Roommates</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* SECTION: Matches from Last Search */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900">
              Matches from Last Search
            </h3>
            {searchMatches.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold font-mono">
                {searchMatches.length}
              </span>
            )}
          </div>

          {searchMatches.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearches}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 font-medium transition-colors"
              title="Reset to empty state"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Search</span>
            </button>
          )}
        </div>

        {/* CONDITION 1: Empty state ("No searches yet") */}
        {searchMatches.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-3xl bg-white border border-dashed border-zinc-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-800">
              No searches yet
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Run your first compatibility scan using the &quot;Find Roommates&quot;
              button above. Your matched students from that search will appear here.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Compatibility Search</span>
            </button>
          </div>
        ) : (
          /* CONDITION 2: List from last search */
          <div className="space-y-3.5">
            {searchMatches.map((candidate) => {
              const isRequested = sentRequests.includes(candidate.id);

              return (
                <div
                  key={candidate.id}
                  className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-200/90 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Student Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="w-13 h-13 rounded-2xl object-cover bg-zinc-100 border border-zinc-200"
                      />
                      {candidate.isOnline && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                          title="Online now"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Name opens public profile */}
                        <button
                          type="button"
                          onClick={() => setSelectedProfile(candidate)}
                          className="font-bold text-base text-zinc-900 hover:text-indigo-600 hover:underline text-left transition-colors"
                        >
                          {candidate.name}
                        </button>
                        {candidate.isVerified && (
                          <span title="Verified Graphic Era Student">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 mt-0.5">
                        {candidate.college} {candidate.course} • {candidate.year}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-purple-900 text-[11px] font-semibold">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>{candidate.matchHighlight.text}</span>
                        </div>

                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          {candidate.lookingFor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ONLY TWO OPTIONS: Show Profile & Send Request */}
                  <div className="flex items-center gap-2 sm:self-center self-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 w-full sm:w-auto justify-end">
                    {/* Option 1: Show Profile */}
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(candidate)}
                      className="px-3.5 py-2 rounded-xl border border-zinc-200 hover:border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Show Profile</span>
                    </button>

                    {/* Option 2: Send Request */}
                    <button
                      type="button"
                      disabled={isRequested}
                      onClick={() => handleSendRequest(candidate)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                        isRequested
                          ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                          : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-indigo-600/20"
                      }`}
                    >
                      {isRequested ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Request Sent</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Public Profile Modal (When clicking name or "Show Profile") */}
      <PublicProfileModal
        roommate={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />

      {/* Compatibility Questionnaire Modal (When clicking "Find Roommates") */}
      <CompatibilityFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleNewSearch}
      />
    </div>
    </AuthGatekeeper>
  );
}
