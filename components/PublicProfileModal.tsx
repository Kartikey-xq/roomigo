"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  MapPin,
  Clock,
  Utensils,
  Cigarette,
  BookOpen,
  DollarSign,
  Heart,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Roommate } from "@/types/roommate";

interface PublicProfileModalProps {
  roommate: Roommate | null;
  onClose: () => void;
  onOpenChat?: (roommate: Roommate) => void;
}

export default function PublicProfileModal({
  roommate,
  onClose,
  onOpenChat,
}: PublicProfileModalProps) {
  if (!roommate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Cover Banner */}
        <div className="relative h-28 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 flex items-start justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{roommate.college} Verified Student</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close profile modal"
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="p-6 -mt-12 flex-1 overflow-y-auto space-y-5">
          {/* Avatar & Main Info */}
          <div className="flex items-end justify-between gap-4">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={roommate.avatar}
                alt={roommate.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-zinc-100"
              />
              {roommate.isOnline && (
                <span
                  title="Online now"
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                />
              )}
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{roommate.matchPercentage}% Compatibility</span>
            </div>
          </div>

          {/* Name & Academic Meta */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
                {roommate.name}
              </h3>
              {roommate.isVerified && (
                <span title="Verified Student ID">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-emerald-800 mt-0.5">
              {roommate.college} • {roommate.course} • {roommate.year}
            </p>
            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
              ID Badge: {roommate.studentIdPrefix}
            </p>
          </div>

          {/* Looking For & Target Budget */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] uppercase text-zinc-400 font-mono">
                  Looking Near
                </p>
                <p className="font-semibold text-zinc-800 truncate">
                  {roommate.lookingFor}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] uppercase text-zinc-400 font-mono">
                  Budget
                </p>
                <p className="font-semibold text-zinc-800 truncate font-mono">
                  {roommate.preferences.budget}
                </p>
              </div>
            </div>
          </div>

          {/* About Bio */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-1.5">
              About & Living Style
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed bg-white p-3 rounded-xl border border-zinc-100">
              {roommate.bio}
            </p>
          </div>

          {/* Habit & Compatibility Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-2">
              Verified Habits Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-500">Sleep Schedule</p>
                  <p className="font-semibold text-zinc-800">
                    {roommate.preferences.sleepCycle}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-500">Food / Diet</p>
                  <p className="font-semibold text-zinc-800">
                    {roommate.preferences.diet}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2">
                <Cigarette className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-500">Smoking Policy</p>
                  <p className="font-semibold text-zinc-800">
                    {roommate.preferences.smoking}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-500">Study Habit</p>
                  <p className="font-semibold text-zinc-800">
                    {roommate.preferences.studyHabit}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hobbies / Interests */}
          {roommate.preferences.hobbies && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-2">
                Interests & Hobbies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {roommate.preferences.hobbies.map((hobby, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80 text-xs font-medium flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3 text-rose-500" />
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            Close
          </button>

          <Link
            href="/chat"
            onClick={() => {
              if (onOpenChat) onOpenChat(roommate);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
