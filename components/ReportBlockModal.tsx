"use client";

import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  FileText,
  CheckSquare,
  Square,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Roommate } from "@/types/roommate";

export interface ReportData {
  reason: string;
  details: string;
  saveProof: boolean;
}

interface ReportBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommate: Roommate | null;
  messageCount: number;
  onSubmit: (data: ReportData) => void;
}

export default function ReportBlockModal({
  isOpen,
  onClose,
  roommate,
  messageCount,
  onSubmit,
}: ReportBlockModalProps) {
  const [selectedReason, setSelectedReason] = useState(
    "Harassment / Abusive Messages"
  );
  const [details, setDetails] = useState("");
  const [saveProof, setSaveProof] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !roommate) return null;

  const REASONS = [
    "Harassment / Abusive Messages",
    "Fake Student ID / Impersonation",
    "Scam / Financial Fraud Concern",
    "Inappropriate Co-Living Behavior",
    "Spam / Commercial Promotion",
    "Other Violation",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit({
        reason: selectedReason,
        details,
        saveProof,
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                Report &amp; Block User
              </h3>
              <p className="text-xs text-zinc-500">
                Graphic Era Proctorial Board &amp; Housing Directory
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close report modal"
            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 border border-zinc-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card Snapshot */}
        <div className="p-4 mx-6 mt-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={roommate.avatar}
              alt={roommate.name}
              className="w-10 h-10 rounded-xl object-cover border border-zinc-200"
            />
            <div>
              <h4 className="text-sm font-bold text-zinc-900">{roommate.name}</h4>
              <p className="text-xs text-zinc-500">
                {roommate.college} • {roommate.course} ({roommate.studentIdPrefix})
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
            Will Be Blocked
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Reason Selection */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-2">
              Reason for Reporting
            </label>
            <div className="space-y-1.5">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                    selectedReason === reason
                      ? "bg-rose-50/80 border-rose-300 text-rose-950 font-bold shadow-2xs"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <span>{reason}</span>
                  {selectedReason === reason && (
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-1.5">
              Incident Details (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what occurred, dates, or specific messages..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 leading-relaxed"
            />
          </div>

          {/* SAVE CHAT AS PROOF CONTAINER (Specific user requirement) */}
          <div
            onClick={() => setSaveProof((prev) => !prev)}
            className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex items-start gap-3 cursor-pointer select-none transition-colors hover:bg-indigo-50"
          >
            <div className="text-indigo-600 mt-0.5 shrink-0">
              {saveProof ? (
                <CheckSquare className="w-5 h-5 fill-indigo-600 text-white" />
              ) : (
                <Square className="w-5 h-5 text-indigo-400" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-bold text-indigo-950">
                  Save chat history as evidence &amp; proof
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Archives the conversation transcript ({messageCount} messages recorded),
                timestamps, and verified student ID ({roommate.studentIdPrefix}) for administrative verification.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-700 font-mono pt-0.5">
                <Lock className="w-3 h-3" />
                <span>Encrypted &amp; securely forwarded to proctor review</span>
              </div>
            </div>
          </div>

          {/* Warning disclaimer */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Blocking will permanently disconnect both parties and delete this chat thread from your inbox.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Submit Report & Block"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
