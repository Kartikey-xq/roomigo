"use client";

import React from "react";
import { History, X, SlidersHorizontal, Users } from "lucide-react";

interface ScanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRerunSearch: () => void;
  onViewLastResults: () => void;
  matchCount?: number;
}

export default function ScanHistoryModal({
  isOpen,
  onClose,
  onRerunSearch,
  onViewLastResults,
  matchCount = 12,
}: ScanHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Row with History Icon & Close X Button */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <History className="w-5 h-5" />
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Headings Matching Screenshot 2 Exactly */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
            You ran compatibility match recently!
          </h2>
          <p className="text-sm text-zinc-600 mt-1.5 leading-relaxed">
            Your profile was matched with Graphic Era students 3 days ago. Would you like to:
          </p>
        </div>

        {/* Action Choice Cards */}
        <div className="space-y-3.5">
          {/* Option 1: Re-run Search */}
          <button
            type="button"
            onClick={onRerunSearch}
            className="w-full p-4 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/90 hover:border-indigo-200 transition-all text-left flex items-start gap-3.5 group shadow-xs active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-indigo-950 transition-colors">
                Re-run Search (Re-fill Compatibility Form)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Updates your sleep hours, branch, food habits & budget preference.
              </p>
            </div>
          </button>

          {/* Option 2: View Last Results */}
          <button
            type="button"
            onClick={onViewLastResults}
            className="w-full p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100/90 hover:border-purple-200 transition-all text-left flex items-start gap-3.5 group shadow-xs active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-purple-950 transition-colors">
                View Last Search Results ({matchCount} Matches)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                See your previous 94%+ compatibility matches.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
