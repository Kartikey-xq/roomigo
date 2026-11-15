"use client";

import React from "react";
import { X, Share, PlusSquare, ArrowUpRight, CheckCircle2, Smartphone, Sparkles, Laptop } from "lucide-react";

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "ios" | "android" | "desktop" | "other";
}

export default function PwaInstallModal({
  isOpen,
  onClose,
  platform,
}: PwaInstallModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="install-modal-title" className="text-sm font-bold text-zinc-900">
                Install Roomigo App
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                Instant access from your home screen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {platform === "ios" ? (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Follow these 3 quick steps in <strong>Safari on iPhone/iPad</strong> to install Roomigo:
                </p>
              </div>

              <ol className="space-y-3 text-xs text-zinc-700">
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                      Tap the Share button
                      <Share className="w-4 h-4 text-emerald-600 inline" />
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Located in the bottom navigation bar of Safari.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                      Select &quot;Add to Home Screen&quot;
                      <PlusSquare className="w-4 h-4 text-emerald-600 inline" />
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Scroll down the share sheet to find this option.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900">
                      Tap &quot;Add&quot; in the top-right corner
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Roomigo will appear right on your home screen with zero app store download needed.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          ) : platform === "desktop" ? (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-start gap-3">
                <Laptop className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Install Roomigo on your desktop for a dedicated window experience:
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-700">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <p className="font-semibold text-zinc-900">Chrome or Edge:</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Click the <strong>Install</strong> icon in the address bar (right side of URL), or go to <strong>Menu (⋮) &rarr; Cast, Save, and Share &rarr; Install Roomigo</strong>.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <p className="font-semibold text-zinc-900">Other Browsers:</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Bookmark Roomigo (<kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 rounded">Ctrl+D</kbd> or <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 rounded">⌘D</kbd>) for quick access anytime.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Install Roomigo from your browser menu:
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-700">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <p className="font-semibold text-zinc-900">Chrome / Samsung Internet on Android:</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Tap the <strong>Menu (⋮)</strong> in the top right &rarr; select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feature confirmation footer */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Lightweight &bull; Fast &bull; Real-Time
            </span>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              Got it
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
