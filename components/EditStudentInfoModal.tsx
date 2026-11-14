"use client";

import React, { useState } from "react";
import { X, Check, User, Mail, GraduationCap } from "lucide-react";

export interface StudentInfoData {
  fullName: string;
  email: string;
  gender: string;
  program: string;
  currentTerm: string;
  affiliation: string;
}

interface EditStudentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: StudentInfoData;
  onSubmit: (data: StudentInfoData) => void;
}

export default function EditStudentInfoModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: EditStudentInfoModalProps) {
  const [fullName, setFullName] = useState(initialData.fullName);
  const [email, setEmail] = useState(initialData.email);
  const [gender, setGender] = useState(initialData.gender || "Male");
  const [program, setProgram] = useState(initialData.program);
  const [currentTerm, setCurrentTerm] = useState(initialData.currentTerm);
  const [affiliation, setAffiliation] = useState(initialData.affiliation);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName,
      email,
      gender,
      program,
      currentTerm,
      affiliation,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              Edit Student Information
            </h3>
            <p className="text-xs text-zinc-500">
              Update your registered academic identity.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
              <User className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
                Current Term
              </label>
              <input
                type="text"
                value={currentTerm}
                onChange={(e) => setCurrentTerm(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
              Program
            </label>
            <div className="relative">
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
              <GraduationCap className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-500 uppercase font-mono block mb-1">
              Affiliation
            </label>
            <input
              type="text"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
