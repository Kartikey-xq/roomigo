"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Check for worker updates
          reg.addEventListener("updatefound", () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.addEventListener("statechange", () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.info("Roomigo PWA updated to latest version.");
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("Roomigo Service Worker registration failed:", err);
        });
    }
  }, []);

  return null;
}
