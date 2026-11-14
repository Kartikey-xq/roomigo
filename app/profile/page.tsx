"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Users,
  Mail,
  GraduationCap,
  Pencil,
  ChevronRight,
  LogOut,
  ArrowRight,
  Check,
  CheckCircle2,
  X,
  CreditCard,
  UserCheck,
} from "lucide-react";
import DiscoveryConfigModal, {
  DiscoveryConfigData,
} from "@/components/DiscoveryConfigModal";
import EditStudentInfoModal, {
  StudentInfoData,
} from "@/components/EditStudentInfoModal";
import { useAuth } from "@/components/AuthContext";
import AuthGatekeeper from "@/components/AuthGatekeeper";

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  // Student Information State (1:1 with Screenshot 122410)
  const [studentInfo, setStudentInfo] = useState<StudentInfoData>({
    fullName: "Kartikey Joshi",
    gender: "Male",
    email: "kartikeydfasd@sadf.com",
    program: "B.Tech Computer Science & Engg.",
    currentTerm: "4th Sem (2nd Yr)",
    affiliation: "GEHU Dehradun",
  });

  // Roommate Discovery Compatibility State (same info as roommate finder)
  const [discoveryConfig, setDiscoveryConfig] = useState<DiscoveryConfigData>({
    campus: "GEHU",
    course: "B.Tech CSE",
    year: "2nd Year (4th Sem)",
    sleepCycle: "Early Bird (11pm - 6am)",
    diet: "Pure Vegetarian",
    cleanliness: "Cleans Daily & High Hygiene",
    preferredGender: "Same gender as you",
    budget: "₹7,000 - ₹9,500 /mo",
    location: "Bell Road PGs",
    isLive: true,
  });

  // Modals state
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load live student profile & preferences from PostgreSQL
  React.useEffect(() => {
    fetch("/api/students/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const p = data.data;
          setStudentInfo({
            fullName: p.fullName || "Student",
            gender: p.gender === "FEMALE" ? "Female" : p.gender === "MALE" ? "Male" : "Other",
            email: p.user?.email || "student@gehu.ac.in",
            program: p.course || "B.Tech Computer Science & Engg.",
            currentTerm: p.currentTerm || "4th Sem (2nd Yr)",
            affiliation: p.affiliation || "GEHU Dehradun",
          });

          if (p.roommatePreference) {
            const r = p.roommatePreference;
            setDiscoveryConfig({
              campus: p.campus || "GEHU",
              course: p.course || "B.Tech CSE",
              year: p.yearOfStudy || "2nd Year",
              sleepCycle:
                r.sleepCycle === "EARLY_BIRD"
                  ? "Early Bird (11pm - 6am)"
                  : r.sleepCycle === "NIGHT_OWL"
                  ? "Night Owl (2am - 9am)"
                  : "Flexible Schedule",
              diet:
                r.diet === "PURE_VEGETARIAN"
                  ? "Pure Vegetarian"
                  : r.diet === "NON_VEGETARIAN"
                  ? "Non-Vegetarian"
                  : "Eggetarian",
              cleanliness:
                r.cleanliness === "DAILY_HIGH"
                  ? "Cleans Daily & High Hygiene"
                  : "Weekly Routine / Moderate",
              preferredGender:
                r.preferredGender === "SAME_GENDER_ONLY"
                  ? "Same gender as you"
                  : "Any gender",
              budget: `₹${r.budgetMin?.toLocaleString()} - ₹${r.budgetMax?.toLocaleString()} /mo`,
              location: r.targetLocations?.[0] || "Bell Road PGs",
              isLive: r.isLive,
            });
          }
        }
      })
      .catch((err) => console.error("Error loading profile:", err));
  }, []);

  const handleSaveDiscovery = async (data: DiscoveryConfigData) => {
    setDiscoveryConfig(data);
    setIsConfigureOpen(false);

    let sleepCycle = "EARLY_BIRD";
    if (data.sleepCycle.includes("Night Owl")) sleepCycle = "NIGHT_OWL";
    else if (data.sleepCycle.includes("Flexible")) sleepCycle = "FLEXIBLE";

    let diet = "PURE_VEGETARIAN";
    if (data.diet.includes("Non-Veg")) diet = "NON_VEGETARIAN";
    else if (data.diet.includes("Eggetarian")) diet = "EGGETARIAN";

    const cleanliness = data.cleanliness.includes("Daily") ? "DAILY_HIGH" : "MODERATE_WEEKLY";
    const preferredGender = data.preferredGender.includes("Same gender")
      ? "SAME_GENDER_ONLY"
      : "ANY_GENDER";

    try {
      await fetch("/api/preferences/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isLive: data.isLive,
          sleepCycle,
          diet,
          cleanliness,
          preferredGender,
          targetLocations: [data.location],
        }),
      });

      showToast(
        data.isLive
          ? "Roommate discovery settings updated & live in student searches!"
          : "Discovery paused. You are temporarily hidden from searches."
      );
    } catch {
      showToast("Error updating discovery settings.");
    }
  };

  const handleSaveStudentInfo = async (data: StudentInfoData) => {
    setStudentInfo(data);
    setIsEditInfoOpen(false);

    try {
      await fetch("/api/students/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          gender: data.gender.toUpperCase(),
          course: data.program,
          currentTerm: data.currentTerm,
          affiliation: data.affiliation,
        }),
      });
      showToast("Student profile information updated successfully in database!");
    } catch {
      showToast("Error updating student info.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out of session. Redirecting to listings...");
      router.push("/listings");
    } catch {
      showToast("Logged out.");
      router.push("/listings");
    }
  };

  return (
    <AuthGatekeeper pageName="Profile">
      <div className="max-w-md mx-auto space-y-4 pb-28 pt-2 animate-in fade-in duration-300">
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

      {/* CARD 1: Top User Profile Summary Card (1:1 with Screenshot) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs flex items-center gap-4">
        {/* Avatar with Green Verified Badge */}
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
            alt={studentInfo.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm bg-zinc-100"
          />
          {/* Green Verified Circle with White Checkmark */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#00875a] border-2 border-white flex items-center justify-center text-white shadow-xs"
            title="GEHU Verified Student"
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        </div>

        {/* Name & Academic Status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight truncate">
              {studentInfo.fullName}
            </h1>
            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              GEHU VERIFIED
            </span>
          </div>

          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            B.Tech CSE • Class of 2026 • {studentInfo.gender}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                discoveryConfig.isLive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
              }`}
            />
            <span>
              {discoveryConfig.isLive
                ? "Public Discovery Active"
                : "Discovery Paused"}
            </span>
          </div>
        </div>
      </div>

      {/* CARD 2: Student Information Card (1:1 with Screenshot) */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">
              Student Information
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsEditInfoOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-100/80 transition-colors cursor-pointer active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Info</span>
          </button>
        </div>

        {/* Fields Stack */}
        <div className="space-y-2.5">
          {/* Full Name */}
          <div className="p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-500">Full Name</p>
              <p className="text-sm font-bold text-zinc-900 mt-0.5">
                {studentInfo.fullName}
              </p>
            </div>
            <User className="w-4 h-4 text-zinc-400" />
          </div>

          {/* Gender */}
          <div className="p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-500">Gender</p>
              <p className="text-sm font-bold text-zinc-900 mt-0.5">
                {studentInfo.gender}
              </p>
            </div>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>

          {/* Email Address */}
          <div className="p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-500">
                Email Address
              </p>
              <p className="text-sm font-bold text-zinc-900 mt-0.5">
                {studentInfo.email}
              </p>
            </div>
            <Mail className="w-4 h-4 text-zinc-400" />
          </div>

          {/* Program */}
          <div className="p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-500">Program</p>
              <p className="text-sm font-bold text-zinc-900 mt-0.5">
                {studentInfo.program}
              </p>
            </div>
            <GraduationCap className="w-4 h-4 text-zinc-400" />
          </div>

          {/* Current Term & Affiliation (2 Column Grid) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100/60">
              <p className="text-[11px] font-medium text-zinc-500">
                Current Term
              </p>
              <p className="text-xs sm:text-sm font-bold text-zinc-900 mt-0.5">
                {studentInfo.currentTerm}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100/60">
              <p className="text-[11px] font-medium text-zinc-500">
                Affiliation
              </p>
              <p className="text-xs sm:text-sm font-bold text-zinc-900 mt-0.5">
                {studentInfo.affiliation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Roommate Discovery Settings (1:1 with Screenshot) */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">
            Roommate Discovery Settings
          </h2>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Note: This information will be public and visible to other students in searches.
        </p>

        {/* Configuration Banner Box with "Configure >" Button */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
              Set your info to appear in other people&apos;s searches
            </h3>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Discovery status: {discoveryConfig.isLive ? "Live" : "Paused"}
            </p>
          </div>

          {/* User Request: Click button "Configure" opens popup form with roommate finder info */}
          <button
            type="button"
            onClick={() => setIsConfigureOpen(true)}
            className="bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center gap-1 shadow-md shadow-indigo-700/20 transition-all shrink-0 cursor-pointer"
          >
            <span>Configure</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CARD 4: Account Actions (1:1 with Screenshot) */}
      <div className="space-y-2 pt-1">
        <h2 className="text-base font-bold text-zinc-900 px-1">
          Account Actions
        </h2>

        <div
          onClick={handleLogout}
          className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/70 hover:bg-rose-100/60 border border-rose-100/90 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-600">Log Out</h3>
              <p className="text-xs text-zinc-500">Exit Session</p>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* POPUP FORM: Roommate Discovery Configuration Modal */}
      <DiscoveryConfigModal
        isOpen={isConfigureOpen}
        onClose={() => setIsConfigureOpen(false)}
        initialData={discoveryConfig}
        onSubmit={handleSaveDiscovery}
      />

      {/* POPUP FORM: Edit Student Information Modal */}
      <EditStudentInfoModal
        isOpen={isEditInfoOpen}
        onClose={() => setIsEditInfoOpen(false)}
        initialData={studentInfo}
        onSubmit={handleSaveStudentInfo}
      />
    </div>
    </AuthGatekeeper>
  );
}
