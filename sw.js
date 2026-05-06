/**
 * Pathfinding Visualizer - Service Worker
 * Enables offline functionality with cache-first strategy
 * @version 1.0.0
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// App Shell - core files needed for the app to work
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/themes.css',
  '/css/main.css',
  '/js/main.js',
  '/js/config.js',
  '/js/state.js',
  '/js/grid/model.js',
  '/js/grid/renderer.js',
  '/js/grid/interaction.js',
  '/js/algorithms/utils/heap.js',
  '/js/algorithms/base.js',
  '/js/algorithms/bfs.js',
  '/js/algorithms/dfs.js',
  '/js/algorithms/dijkstra.js',
  '/js/algorithms/astar.js',
  '/js/animation/controller.js',
  '/js/ui/controls.js',
  '/js/ui/stats.js',
  '/js/ui/theme.js',
  '/js/ui/legend.js',
  '/js/ui/toast.js',
  '/js/utils/dom.js',
  '/js/utils/math.js',
  '/js/utils/throttle.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// Install - Pre-cache the App Shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('[SW] App shell cached successfully');
        // Activate immediately without waiting for old SW to die
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Pre-caching failed:', err);
      })
  );
});

// Activate - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old versioned caches
              return name.startsWith('static-') && name !== STATIC_CACHE ||
                     name.startsWith('dynamic-') && name !== DYNAMIC_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activated successfully');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch - Serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external origins (except for same-origin redirects)
  if (url.origin !== location.origin) return;
  
  // Determine the appropriate caching strategy
  const strategy = getStrategy(request, url);
  
  event.respondWith(strategy(request));
});

/**
 * Determine the caching strategy based on request type
 */
function getStrategy(request, url) {
  const pathname = url.pathname;
  
  // HTML pages - Network first (fresh content), cache fallback
  if (request.headers.get('Accept')?.includes('text/html')) {
    return networkFirst;
  }
  
  // CSS/JS files - Cache first (performance), network fallback
  if (pathname.match(/\.(css|js)$/)) {
    return cacheFirst;
  }
  
  // Images and icons - Cache first
  if (pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    return cacheFirst;
  }
  
  // Fonts - Cache first with long-lived cache
  if (pathname.match(/\.(woff2?|ttf|otf)$/)) {
    return cacheFirst;
  }
  
  // JSON data or API calls - Stale while revalidate
  if (pathname.match(/\.json$/) || pathname.startsWith('/api/')) {
    return staleWhileRevalidate;
  }
  
  // Default: Stale while revalidate
  return staleWhileRevalidate;
}

/**
 * Cache First Strategy
 * Serve from cache if available, otherwise fetch and cache
 * Best for: Static assets (CSS, JS, images, fonts)
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache first fetch failed:', error);
    // No fallback available for assets
    return new Response('Asset unavailable offline', { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Network First Strategy
 * Fetch from network, fall back to cache
 * Best for: HTML pages (fresh content is important)
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, falling back to cache');
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Serve from cache immediately, then update cache in background
 * Best for: Data that can be slightly stale but should be fresh eventually
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.log('[SW] Background fetch failed:', error);
      // Don't throw - we might have cached content
    });
  
  // Return cached response immediately if available
  if (cached) {
    fetchPromise; // Trigger background update
    return cached;
  }
  
  // No cache, wait for network
  return fetchPromise;
}

/**
 * Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

/**
 * Background sync for future enhancements (e.g., saving maze configs)
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mazes') {
    event.waitUntil(syncSavedMazes());
  }
});

async function syncSavedMazes() {
  // Placeholder for future sync functionality
  console.log('[SW] Background sync triggered');
}
