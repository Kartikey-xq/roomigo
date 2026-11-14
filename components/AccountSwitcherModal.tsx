"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, LogIn, ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSwitcherModal({
  isOpen,
  onClose,
}: AccountSwitcherModalProps) {
  const router = useRouter();
  const { user, profile, login, logout } = useAuth();
  const [customEmail, setCustomEmail] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const TEST_ACCOUNTS = [
    {
      name: "Kartikey Joshi",
      email: "kartikey@gehu.ac.in",
      role: "Student A (GEHU • Early Bird • Pure Veg)",
      gender: "Male",
    },
    {
      name: "Aarav Sharma",
      email: "aarav@gehu.ac.in",
      role: "Student B (GEHU • Early Bird • Pure Veg)",
      gender: "Male",
    },
    {
      name: "Rohan Verma",
      email: "rohan@geu.ac.in",
      role: "Student C (GEU Main • Night Owl • Gamer)",
      gender: "Male",
    },
    {
      name: "Priya Nautiyal",
      email: "priya@gehu.ac.in",
      role: "Student D (GEHU • Female • ECE)",
      gender: "Female",
    },
  ];

  const handleSwitchAccount = async (email: string) => {
    setLoadingEmail(email);
    setErrorMsg(null);
    const success = await login(email, "Password@123");
    setLoadingEmail(null);
    if (success) {
      onClose();
      window.location.reload();
    } else {
      setErrorMsg(`Failed to log in as ${email}`);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    setLoadingEmail(customEmail);
    setErrorMsg(null);
    const success = await login(customEmail, customPassword || "Password@123");
    setLoadingEmail(null);
    if (success) {
      onClose();
      window.location.reload();
    } else {
      setErrorMsg("Invalid credentials. Please verify your email and password.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-emerald-50/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              Account Switcher &amp; Login
            </h3>
            <p className="text-xs text-zinc-500">
              Current: <span className="font-semibold text-emerald-800">{profile?.fullName || user?.email || "Guest"}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Preset Test Personas */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase font-mono block mb-2">
              1-Click Student Test Accounts
            </label>
            <div className="space-y-2">
              {TEST_ACCOUNTS.map((acc) => {
                const isCurrent = user?.email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={loadingEmail === acc.email}
                    onClick={() => handleSwitchAccount(acc.email)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isCurrent
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs"
                        : "bg-zinc-50/70 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">
                          {acc.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          ({acc.gender})
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {acc.role}
                      </p>
                    </div>

                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold bg-white px-2 py-1 rounded-full border border-emerald-200 shadow-2xs">
                        <Check className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        Switch <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Account Form */}
          <div className="pt-2 border-t border-zinc-100">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase font-mono block mb-2">
              Or Sign In With Custom Email
            </label>
            <form onSubmit={handleCustomLogin} className="space-y-2.5">
              <input
                type="email"
                placeholder="student@gehu.ac.in or gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <input
                type="password"
                placeholder="Password (default: Password@123)"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={!customEmail || loadingEmail !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In Custom Account</span>
              </button>
            </form>
          </div>

          {user && (
            <div className="pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  onClose();
                  router.push("/listings");
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out Current Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
