"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Download, Check, Sparkles, Smartphone } from "lucide-react";
import PwaInstallModal from "./PwaInstallModal";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaInstallButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  label?: string;
  installedLabel?: string;
}

function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isNavigatorStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(isDisplayStandalone || isNavigatorStandalone);
}

function checkIsIos(standalone: boolean): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return (
    (/iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1)) &&
    !standalone
  );
}

export default function PwaInstallButton({
  className = "",
  variant = "primary",
  size = "md",
  label = "Install Roomigo",
  installedLabel = "Roomigo Installed",
}: PwaInstallButtonProps) {
  const router = useRouter();

  const [isStandalone, setIsStandalone] = useState<boolean>(() => checkIsStandalone());
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsStandalone());
  const [isIos] = useState<boolean>(() => checkIsIos(checkIsStandalone()));

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalPlatform, setModalPlatform] = useState<"ios" | "android" | "desktop" | "other">("other");

  // Subscribe to external browser events (install prompt & mode change)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Listen for native beforeinstallprompt (Chromium / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    // Listen for display mode changes (e.g. user opens in standalone window)
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsStandalone(true);
        setIsInstalled(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    // A. If already running as standalone PWA
    if (isStandalone || isInstalled) {
      router.push("/");
      return;
    }

    // B. Native browser prompt available (Android Chrome, Edge, Chromium)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn("Error triggering install prompt:", err);
      }
      return;
    }

    // C. iOS Safari (Manual Add to Home Screen required)
    if (isIos) {
      setModalPlatform("ios");
      setIsModalOpen(true);
      return;
    }

    // D. Android browser without fired prompt yet
    const isAndroid = typeof window !== "undefined" && /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      setModalPlatform("android");
      setIsModalOpen(true);
      return;
    }

    // E. Desktop Chrome/Edge or other browsers
    const isDesktop = typeof window !== "undefined" && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setModalPlatform(isDesktop ? "desktop" : "other");
    setIsModalOpen(true);
  }, [deferredPrompt, isIos, isInstalled, isStandalone, router]);

  // Size styling
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl gap-1.5",
    md: "px-5 py-2.5 text-xs sm:text-sm rounded-2xl gap-2",
    lg: "px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base rounded-2xl gap-2.5 font-bold",
  }[size];

  // Variant styling
  const variantStyles = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 active:scale-95 border border-emerald-500",
    secondary:
      "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 active:scale-95 shadow-xs",
    outline:
      "bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 hover:border-zinc-300 shadow-xs active:scale-95",
  }[variant];

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        aria-label={isInstalled ? installedLabel : label}
        className={`inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 cursor-pointer ${sizeStyles} ${variantStyles} ${className}`}
      >
        {isInstalled ? (
          <>
            <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
            <span>{installedLabel}</span>
          </>
        ) : (
          <>
            {isIos ? (
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
            ) : deferredPrompt ? (
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-bounce" />
            ) : (
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Guide Modal for iOS Safari / Manual Installation */}
      <PwaInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={modalPlatform}
      />
    </>
  );
}
