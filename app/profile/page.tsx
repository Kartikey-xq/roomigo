"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { useAuth, AuthProfile } from "@/components/AuthContext";
import AuthGatekeeper from "@/components/AuthGatekeeper";

export interface ExtendedStudentInfoData extends StudentInfoData {
  avatarUrl?: string;
}

interface RawProfileData {
  id?: string;
  fullName?: string;
  gender?: string;
  campus?: string;
  course?: string;
  yearOfStudy?: string;
  currentTerm?: string;
  affiliation?: string;
  avatarUrl?: string;
  verificationStatus?: string;
  user?: {
    email?: string;
  };
  roommatePreference?: {
    sleepCycle?: string;
    diet?: string;
    cleanliness?: string;
    preferredGender?: string;
    budgetMin?: number;
    budgetMax?: number;
    targetLocations?: string[];
    isLive?: boolean;
  } | null;
}

function mapProfileToStudentInfo(
  p: RawProfileData | AuthProfile | null | undefined,
  emailFallback?: string
): ExtendedStudentInfoData | null {
  if (!p) return null;
  const rawP = p as RawProfileData;
  return {
    fullName: rawP.fullName || "Student",
    gender: rawP.gender === "FEMALE" ? "Female" : rawP.gender === "MALE" ? "Male" : "Other",
    email: rawP.user?.email || emailFallback || "",
    program: rawP.course || "B.Tech Computer Science & Engg.",
    currentTerm: rawP.currentTerm || "4th Sem (2nd Yr)",
    affiliation: rawP.affiliation || (rawP.campus?.includes("GEHU") ? "GEHU Dehradun" : "GEU Dehradun"),
    avatarUrl: rawP.avatarUrl,
  };
}

function mapProfileToDiscoveryConfig(
  p: RawProfileData | AuthProfile | null | undefined
): DiscoveryConfigData | null {
  if (!p) return null;
  const rawP = p as RawProfileData;
  const r = rawP.roommatePreference;
  return {
    campus: rawP.campus || "GEHU",
    course: rawP.course || "B.Tech CSE",
    year: rawP.yearOfStudy || "2nd Year",
    sleepCycle:
      r?.sleepCycle === "EARLY_BIRD"
        ? "Early Bird (11pm - 6am)"
        : r?.sleepCycle === "NIGHT_OWL"
        ? "Night Owl (2am - 9am)"
        : "Flexible Schedule",
    diet:
      r?.diet === "PURE_VEGETARIAN"
        ? "Pure Vegetarian"
        : r?.diet === "NON_VEGETARIAN"
        ? "Non-Vegetarian"
        : "Eggetarian",
    cleanliness:
      r?.cleanliness === "DAILY_HIGH"
        ? "Cleans Daily & High Hygiene"
        : "Weekly Routine / Moderate",
    preferredGender:
      r?.preferredGender === "SAME_GENDER_ONLY"
        ? "Same gender as you"
        : "Any gender",
    budget:
      r?.budgetMin && r?.budgetMax
        ? `₹${r.budgetMin.toLocaleString("en-IN")} - ₹${r.budgetMax.toLocaleString("en-IN")} /mo`
        : "₹7,000 - ₹9,500 /mo",
    location: r?.targetLocations?.[0] || "Bell Road PGs",
    isLive: typeof r?.isLive === "boolean" ? r.isLive : true,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, logout, refreshSession } = useAuth();

  // Fresh profile loaded from API
  const [apiProfile, setApiProfile] = useState<RawProfileData | null>(null);

  // Local user overrides when saved through modals
  const [editedStudentInfo, setEditedStudentInfo] = useState<ExtendedStudentInfoData | null>(null);
  const [editedDiscoveryConfig, setEditedDiscoveryConfig] = useState<DiscoveryConfigData | null>(null);

  // Derive active display data: edited modal data > fresh API profile > AuthContext profile > null
  const activeProfileSource = apiProfile || profile;
  const studentInfo: ExtendedStudentInfoData | null =
    editedStudentInfo ?? mapProfileToStudentInfo(activeProfileSource, user?.email);
  const discoveryConfig: DiscoveryConfigData | null =
    editedDiscoveryConfig ?? mapProfileToDiscoveryConfig(activeProfileSource);

  // Modals state
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch fresh profile & preferences from API in background
  useEffect(() => {
    let isCancelled = false;

    fetch("/api/students/me")
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.data) {
          setApiProfile(data.data);
        }
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSaveDiscovery = async (data: DiscoveryConfigData) => {
    setEditedDiscoveryConfig(data);
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

      refreshSession();
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
    setEditedStudentInfo({
      ...data,
      avatarUrl: studentInfo?.avatarUrl,
    });
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
      refreshSession();
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

        {/* SKELETON LOADING STATE (Displayed only while loading and no profile data is available) */}
        {!studentInfo || !discoveryConfig ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Card 1 Skeleton */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-zinc-200 rounded-md w-36 animate-pulse" />
                <div className="h-3.5 bg-zinc-100 rounded-md w-48 animate-pulse" />
                <div className="h-3 bg-zinc-100 rounded-md w-28 animate-pulse" />
              </div>
            </div>

            {/* Card 2 Skeleton */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="h-5 bg-zinc-200 rounded-md w-40 animate-pulse" />
                <div className="h-8 bg-zinc-100 rounded-xl w-20 animate-pulse" />
              </div>
              <div className="space-y-2.5">
                <div className="h-14 bg-zinc-50 rounded-2xl border border-zinc-100 animate-pulse" />
                <div className="h-14 bg-zinc-50 rounded-2xl border border-zinc-100 animate-pulse" />
                <div className="h-14 bg-zinc-50 rounded-2xl border border-zinc-100 animate-pulse" />
                <div className="h-14 bg-zinc-50 rounded-2xl border border-zinc-100 animate-pulse" />
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="h-14 bg-zinc-50 rounded-2xl border border-zinc-100 animate-pulse" />
                  <div className="h-14 bg-zinc-50 rounded-2xl border border-zinc-100 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Card 3 Skeleton */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3">
              <div className="h-5 bg-zinc-200 rounded-md w-48 animate-pulse" />
              <div className="h-20 bg-zinc-50 rounded-2xl border border-zinc-100 animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* CARD 1: Top User Profile Summary Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs flex items-center gap-4">
              {/* Avatar with Green Verified Badge */}
              <div className="relative shrink-0">
                {studentInfo.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={studentInfo.avatarUrl}
                    alt={studentInfo.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm bg-zinc-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-600 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-white">
                    {studentInfo.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Green Verified Circle with White Checkmark */}
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#00875a] border-2 border-white flex items-center justify-center text-white shadow-xs"
                  title="Graphic Era Verified Student"
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
                    {studentInfo.affiliation?.includes("GEHU") ? "GEHU VERIFIED" : "GEU VERIFIED"}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  {studentInfo.program} • {studentInfo.currentTerm || "Student"} • {studentInfo.gender}
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

            {/* CARD 2: Student Information Card */}
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
                      {studentInfo.email || "No email registered"}
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

            {/* CARD 3: Roommate Discovery Settings */}
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

            {/* CARD 4: Account Actions */}
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
          </>
        )}
      </div>
    </AuthGatekeeper>
  );
}
