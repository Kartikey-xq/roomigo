/**
 * Roomigo PWA Service Worker
 *
 * Ultra-conservative caching strategy:
 * - Pre-caches only safe, static branding assets and offline fallback page.
 * - NEVER caches API requests (/api/*).
 * - NEVER intercepts or interferes with WebSocket traffic (ws:, wss:, /ws).
 * - NEVER caches authenticated pages, user data, profiles, conversations, or messages.
 * - Safe cache invalidation on version update.
 */

const CACHE_NAME = "roomigo-static-v1";

const PRECACHE_ASSETS = [
  "/offline.html",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-192x192.png",
  "/icons/icon-maskable-512x512.png",
  "/manifest.webmanifest",
];

// 1. Installation: Pre-cache static shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2. Activation: Clean up stale caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch: Conservative routing
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Never intercept non-GET requests (mutations, login, uploads, etc.)
  if (request.method !== "GET") {
    return;
  }

  // B. Never intercept or touch WebSocket connections or tickets
  if (
    url.protocol === "ws:" ||
    url.protocol === "wss:" ||
    url.pathname.startsWith("/ws") ||
    url.pathname === "/api/auth/ws-ticket"
  ) {
    return;
  }

  // C. Never cache API endpoints (user profiles, sessions, listings, chat, requests)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // D. Static branding assets: Cache-First with network fallback
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/favicon-32x32.png" ||
    url.pathname === "/apple-touch-icon.png" ||
    url.pathname === "/offline.html" ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // E. Navigation requests (HTML pages): Network-First with safe offline fallback
  // Authenticated pages are fetched directly from network and NEVER stored in cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/offline.html").then((fallback) => {
          return fallback || new Response("Offline", { status: 503, statusText: "Service Unavailable" });
        });
      })
    );
    return;
  }
});
