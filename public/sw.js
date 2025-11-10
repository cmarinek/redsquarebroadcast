/**
 * Service Worker for Red Square
 * Handles offline functionality and caching strategies
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Supabase API calls (always fetch fresh)
  if (url.hostname.includes("supabase.co")) {
    return;
  }

  // Handle different types of requests
  if (request.destination === "image") {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  }
});

// Cache-first strategy (good for images, fonts, static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error("Fetch failed:", error);
    
    // Return offline fallback if available
    return new Response("Offline", { status: 503 });
  }
}

// Network-first strategy (good for dynamic content, API calls)
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await caches.match("/");
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response("Offline", { status: 503 });
  }
}

// Background sync for failed requests
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-bookings") {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  // Implement background sync logic for bookings
  console.log("Background sync: bookings");
}

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: data.url || "/",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Red Square", options)
  );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || "/")
  );
});
