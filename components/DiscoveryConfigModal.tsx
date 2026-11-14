"use client";

import React, { useState } from "react";
import { X, Check, Users } from "lucide-react";

export interface DiscoveryConfigData {
  campus: string;
  course: string;
  year: string;
  sleepCycle: string;
  diet: string;
  cleanliness: string;
  preferredGender: string;
  budget: string;
  location: string;
  isLive: boolean;
}

interface DiscoveryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: DiscoveryConfigData;
  onSubmit: (data: DiscoveryConfigData) => void;
}

export default function DiscoveryConfigModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: DiscoveryConfigModalProps) {
  const [campus, setCampus] = useState(initialData.campus);
  const [course, setCourse] = useState(initialData.course);
  const [year, setYear] = useState(initialData.year);
  const [sleepCycle, setSleepCycle] = useState(initialData.sleepCycle);
  const [diet, setDiet] = useState(initialData.diet);
  const [cleanliness, setCleanliness] = useState(initialData.cleanliness);
  const [preferredGender, setPreferredGender] = useState(
    initialData.preferredGender || "Same gender as you"
  );
  const [budget, setBudget] = useState(initialData.budget);
  const [location, setLocation] = useState(initialData.location);
  const [isLive, setIsLive] = useState(initialData.isLive);

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      onSubmit({
        campus,
        course,
        year,
        sleepCycle,
        diet,
        cleanliness,
        preferredGender,
        budget,
        location,
        isLive,
      });
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-white">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Roommate Discovery Profile</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mt-1">
              Configure Search Compatibility
            </h3>
            <p className="text-xs text-zinc-500">
              This info determines how you appear in other students&apos; roommate searches.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 border border-zinc-200 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Discovery Status Toggle */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-900">
                Public Discovery Status
              </p>
              <p className="text-[11px] text-zinc-500">
                {isLive ? "Live: Visible to students in searches" : "Paused: Hidden from searches"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLive((prev) => !prev)}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                isLive ? "bg-emerald-600" : "bg-zinc-300"
              }`}
            >
              <span
                className={`block w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                  isLive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Campus & University */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-2">
              1. University Affiliation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "GEHU", label: "GEHU (Graphic Era Hill)" },
                { id: "GEU", label: "GEU (Main Campus)" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCampus(item.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    campus === item.id
                      ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Program & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-1.5">
                Academic Program
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              >
                <option>B.Tech CSE</option>
                <option>B.Tech ECE</option>
                <option>BCA</option>
                <option>BBA</option>
                <option>B.Tech IT</option>
                <option>MCA</option>
                <option>MBA</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-1.5">
                Year / Term
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              >
                <option>1st Year (1st/2nd Sem)</option>
                <option>2nd Year (4th Sem)</option>
                <option>3rd Year (6th Sem)</option>
                <option>4th Year (8th Sem)</option>
              </select>
            </div>
          </div>

          {/* Sleep & Study Schedule */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-2">
              2. Sleep &amp; Study Schedule
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Early Bird (11pm - 6am)",
                "Night Owl (2am - 9am)",
                "Flexible Schedule",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSleepCycle(item)}
                  className={`py-2 px-3 rounded-xl border text-xs text-left transition-all ${
                    sleepCycle === item
                      ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Food / Diet */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-2">
              3. Food / Diet Habit
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Pure Vegetarian", "Non-Vegetarian", "Eggetarian"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDiet(item)}
                    className={`py-2 px-3 rounded-xl border text-xs transition-all ${
                      diet === item
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Hygiene & Cleanliness */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-2">
              4. Hygiene &amp; Cleanliness
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Cleans Daily & High Hygiene",
                "Weekly Routine / Moderate",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCleanliness(item)}
                  className={`py-2 px-3 rounded-xl border text-xs text-left transition-all ${
                    cleanliness === item
                      ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 5. GENDER OF ROOMMATE YOU ARE LOOKING FOR (User requested) */}
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-2">
              5. Gender of roommate you are looking for
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Same gender as you",
                "Any gender",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPreferredGender(item)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-center ${
                    preferredGender === item
                      ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Budget & Target Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-1.5">
                Target Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              >
                <option>₹6,000 - ₹8,000 /mo</option>
                <option>₹7,000 - ₹9,500 /mo</option>
                <option>₹10,000 - ₹14,000 /mo</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-1.5">
                Target Area
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              >
                <option>Bell Road PGs</option>
                <option>Subhash Nagar Flats</option>
                <option>Turner Road</option>
                <option>Clement Town Gate 1</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-700 hover:bg-indigo-800 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-indigo-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? "Saving Configuration..." : "Save Discovery Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
