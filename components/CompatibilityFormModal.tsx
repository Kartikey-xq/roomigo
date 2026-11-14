"use client";

import React, { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";

export interface CompatibilityFormData {
  campus: string;
  course: string;
  year: string;
  sleepCycle: string;
  diet: string;
  cleanliness: string;
  preferredGender: string;
  budget: string;
  location: string;
}

interface CompatibilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CompatibilityFormData) => void;
}

export default function CompatibilityFormModal({
  isOpen,
  onClose,
  onSubmit,
}: CompatibilityFormModalProps) {
  const [campus, setCampus] = useState("GEHU");
  const [course, setCourse] = useState("B.Tech CSE");
  const [year, setYear] = useState("2nd Year");
  const [sleepCycle, setSleepCycle] = useState("Early Bird (11pm - 6am)");
  const [diet, setDiet] = useState("Pure Vegetarian");
  const [cleanliness, setCleanliness] = useState("Cleans Daily & High Hygiene");
  const [preferredGender, setPreferredGender] = useState("Same gender as you");
  const [budget, setBudget] = useState("₹7,000 - ₹9,500 /mo");
  const [location, setLocation] = useState("Bell Road PGs");

  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
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
      });
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Match Algorithm</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mt-1">
              Compatibility Questionnaire
            </h3>
            <p className="text-xs text-zinc-500">
              Fine-tune your preferences for Graphic Era housing pool.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close form"
            className="w-9 h-9 rounded-full bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 border border-zinc-200 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {isScanning ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900">
              Running Compatibility Scan...
            </h4>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              Analyzing gender preference, sleep schedules, food habits &amp; academic branches across
              Graphic Era student directory.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 overflow-y-auto space-y-5 flex-1"
          >
            {/* Campus & Course */}
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-2">
                1. Campus &amp; University
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "GEHU", label: "GEHU (Hill Campus)" },
                  { id: "GEU", label: "GEU (Main Campus)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCampus(item.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      campus === item.id
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Course & Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-1.5">
                  Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            </div>

            {/* Sleep Cycle */}
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
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Habits */}
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-2">
                3. Food / Diet Preference
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
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Cleanliness */}
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
                    className={`py-2 px-3 rounded-xl border text-xs transition-all text-left ${
                      cleanliness === item
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs"
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
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Budget & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500 font-mono block mb-1.5">
                  Budget (Per Head)
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                >
                  <option>Bell Road PGs</option>
                  <option>Subhash Nagar Flats</option>
                  <option>Turner Road</option>
                  <option>Clement Town Gate 1</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Compatibility Scan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
