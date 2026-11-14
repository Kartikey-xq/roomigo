"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import {
  Building2,
  Users,
  MessageSquare,
  User,
  Menu,
  X,
  ChevronRight,
  Compass,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import AccountSwitcherModal from "./AccountSwitcherModal";

export const NAV_ITEMS = [
  {
    name: "Listings",
    href: "/listings",
    icon: Building2,
    description: "Browse verified apartments & spaces",
  },
  {
    name: "Roommate Finder",
    href: "/roommate-finder",
    icon: Users,
    description: "Match with compatible co-living partners",
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
    description: "Direct messaging & conversation threads",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    description: "Your preferences, lifestyle & settings",
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const { profile, user, unreadCount } = useAuth();
  const pathname = usePathname();

  const overlayRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const bottomBarRef = useRef<HTMLElement>(null);
  const isInitialMount = useRef(true);

  // Helper to determine if a route is active
  const isActive = (href: string) => {
    if (href === "/listings") {
      return pathname === "/listings" || pathname === "/";
    }
    if (href === "/roommate-finder") {
      return pathname === "/roommate-finder" || pathname === "/roomate-finder";
    }
    return pathname.startsWith(href);
  };

  // Keyboard shortcut listener (Escape to close, Cmd/Ctrl + B or M to toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "m" || e.key === "b")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // GSAP initial setup and state synchronization
  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current || !bottomBarRef.current) return;

    if (isInitialMount.current) {
      // Set initial positions without animation
      gsap.set(sidebarRef.current, { xPercent: -100 });
      gsap.set(overlayRef.current, { opacity: 0, display: "none" });
      gsap.set(bottomBarRef.current, { y: 0, opacity: 1 });
      isInitialMount.current = false;
      return;
    }

    if (isOpen) {
      // 1. Overlay Fade In
      gsap.set(overlayRef.current, { display: "block" });
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      });

      // 2. Sidebar Slide In with Smooth Elastic Power Curve
      gsap.to(sidebarRef.current, {
        xPercent: 0,
        duration: 0.48,
        ease: "power4.out",
      });

      // 3. Staggered reveal of sidebar navigation items
      const menuItems = sidebarRef.current.querySelectorAll(".gsap-nav-item");
      if (menuItems.length > 0) {
        gsap.fromTo(
          menuItems,
          { opacity: 0, x: -24, scale: 0.96 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.38,
            stagger: 0.05,
            ease: "power3.out",
            delay: 0.08,
          }
        );
      }

      // 4. Hide Bottom Bar smoothly when Side Menu opens
      gsap.to(bottomBarRef.current, {
        y: 80,
        opacity: 0,
        duration: 0.32,
        ease: "power2.in",
        onComplete: () => {
          if (bottomBarRef.current) {
            bottomBarRef.current.style.pointerEvents = "none";
          }
        },
      });
    } else {
      // 1. Sidebar Slide Out
      gsap.to(sidebarRef.current, {
        xPercent: -100,
        duration: 0.38,
        ease: "power3.inOut",
      });

      // 2. Overlay Fade Out
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.display = "none";
          }
        },
      });

      // 3. Reveal Bottom Bar smoothly when Side Menu closes
      if (bottomBarRef.current) {
        bottomBarRef.current.style.pointerEvents = "auto";
      }
      gsap.to(bottomBarRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.42,
        delay: 0.12,
        ease: "power3.out",
      });
    }
  }, [isOpen]);

  // Current active page metadata
  const currentItem = NAV_ITEMS.find((item) => isActive(item.href)) || NAV_ITEMS[0];

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fbfdfc] text-zinc-900 overflow-x-hidden">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/85 border-b border-zinc-200/80 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Hamburger & Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? "Close sidebar menu" : "Open sidebar menu"}
              className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-white hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700 border border-zinc-200 hover:border-emerald-300 transition-all duration-200 active:scale-95 shadow-xs"
            >
              <span className="sr-only">Toggle Sidebar Menu</span>
              <Menu className="w-5 h-5 transition-transform group-hover:scale-110 text-zinc-700 group-hover:text-emerald-700" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
            </button>

            {/* Brand Logo */}
            <Link
              href="/listings"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 p-[1px] shadow-md shadow-emerald-600/20 group-hover:shadow-emerald-600/35 transition-all">
                <div className="w-full h-full bg-emerald-600 rounded-[11px] flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-zinc-900 flex items-center gap-1.5 font-sans">
                  Roomigo
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 tracking-wider">
                    Graphic Era
                  </span>
                </span>
                <span className="text-[11px] text-zinc-500 hidden sm:inline-block">
                  Dehradun Student Co-Living
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Current Screen Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/70 text-xs text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Screen:</span>
            <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
              <currentItem.icon className="w-3.5 h-3.5 text-emerald-600" />
              {currentItem.name}
            </span>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 border border-zinc-200 shadow-xs transition-colors"
            >
              <span>Side Menu</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 rounded border border-zinc-200 text-zinc-500">
                ⌘M
              </kbd>
            </button>

            <button
              onClick={() => setIsAccountSwitcherOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Switch between Graphic Era test accounts"
            >
              <UserCircle2 className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Switch</span>
            </button>

            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-zinc-200 shadow-xs transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-zinc-700 hidden sm:inline-block">
                  {profile?.fullName ? profile.fullName.split(" ")[0] : "Profile"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* GSAP-Controlled Overlay Backdrop */}
      <div
        ref={overlayRef}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-40 bg-zinc-900/30 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* GSAP-Controlled Sidebar Drawer */}
      <aside
        ref={sidebarRef}
        className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-sm sm:max-w-md bg-white border-r border-zinc-200 flex flex-col shadow-2xl overflow-y-auto"
        aria-label="Sidebar Navigation"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-b from-emerald-50/60 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Roomigo Menu
              </h2>
              <p className="text-xs text-zinc-500">Graphic Era Student Co-Living</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar menu"
            className="w-9 h-9 rounded-xl bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 border border-zinc-200 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Screen Links (Animated Stagger via GSAP) */}
        <div className="flex-1 p-5 space-y-2.5">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 px-3 py-1 font-mono">
            Navigation
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`gsap-nav-item group relative flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-200 ${
                  active
                    ? "bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-xs"
                    : "bg-white hover:bg-zinc-50 border-zinc-200/70 hover:border-emerald-200 text-zinc-700 hover:text-zinc-900"
                }`}
              >
                {/* Active Indicator Bar */}
                {active && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full shadow-xs" />
                )}

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors relative ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "bg-zinc-100 text-zinc-500 group-hover:text-emerald-700 group-hover:bg-emerald-50"
                  }`}
                >
                  <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight">
                      {item.name}
                    </span>
                    {item.href === "/chat" && user && unreadCount > 0 && (
                      <span
                        aria-label={`${unreadCount} unread messages`}
                        className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs border border-white leading-none"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>

                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                    active ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-600"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-32">
        {children}
      </main>

      {/* Centered Fixed Wrapper for Bottom Navigation Bar */}
      <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
        <nav
          ref={bottomBarRef}
          aria-label="Bottom Navigation"
          className="pointer-events-auto w-full max-w-lg"
        >
          <div className="relative p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-emerald-100/90 shadow-[0_12px_36px_rgba(16,185,129,0.12),0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between gap-1">
            {/* Quick Nav Items */}
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1.5 rounded-xl sm:rounded-full transition-all duration-200 group ${
                    active
                      ? "text-emerald-900 bg-emerald-50 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/80"
                  }`}
                >
                  {/* Active Pill Indicator */}
                  {active && (
                    <span className="absolute -top-1 w-5 h-1 bg-emerald-600 rounded-full shadow-[0_0_8px_rgba(5,150,105,0.4)]" />
                  )}

                  <div className="relative">
                    <IconComponent
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 ${
                        active ? "text-emerald-600" : "text-zinc-400 group-hover:text-emerald-600"
                      }`}
                    />
                    {item.href === "/chat" && user && unreadCount > 0 && (
                      <span
                        aria-label={`${unreadCount} unread messages`}
                        className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs border-2 border-white leading-none animate-in zoom-in-75 duration-200"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] tracking-tight mt-1 truncate max-w-[64px] sm:max-w-none ${
                      active ? "font-semibold text-emerald-800" : "font-medium text-zinc-500 group-hover:text-zinc-800"
                    }`}
                  >
                    {item.name === "Roommate Finder" ? "Roommate" : item.name}
                  </span>
                </Link>
              );
            })}

            {/* Dedicated Side Menu Trigger Button in Bottom Bar */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open sidebar menu"
              className="flex flex-col items-center justify-center py-2 px-2.5 rounded-xl sm:rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all group border-l border-zinc-200/80 pl-2 ml-1"
            >
              <div className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Menu className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-tight mt-1 text-zinc-500 group-hover:text-emerald-700">
                Menu
              </span>
            </button>
          </div>
        </nav>
      </div>
      {/* Account Switcher & Login Modal */}
      <AccountSwitcherModal
        isOpen={isAccountSwitcherOpen}
        onClose={() => setIsAccountSwitcherOpen(false)}
      />
    </div>
  );
}
