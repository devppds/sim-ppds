import { getCache, setCache, enqueueMutation, getMutationQueue, dequeueMutation, QueuedMutation } from './offline-db';
import { API_BASE_URL } from './config';

let isInitialized = false;
let isSyncing = false;

// Check if a URL should be intercepted for offline support
function shouldIntercept(url: string): boolean {
  // Only intercept API calls, exclude auth, downloads, and upload routes
  const isApi = url.includes('/api/') || url.startsWith('/api/');
  const isAuth = url.includes('/api/auth');
  const isDownload = url.includes('/api/download');
  const isUpload = url.includes('/api/upload');
  
  return isApi && !isAuth && !isDownload && !isUpload;
}

// Convert HeadersInit to standard key-value map
function serializeHeaders(headersInit: HeadersInit | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!headersInit) return result;

  if (typeof Headers !== 'undefined' && headersInit instanceof Headers) {
    headersInit.forEach((value, key) => {
      result[key] = value;
    });
  } else if (Array.isArray(headersInit)) {
    headersInit.forEach(([key, value]) => {
      result[key] = value;
    });
  } else if (typeof headersInit === 'object') {
    Object.entries(headersInit).forEach(([key, value]) => {
      result[key] = String(value);
    });
  }
  return result;
}

// Global fetch interceptor
export function initOfflineSync() {
  if (typeof window === 'undefined' || isInitialized) return;
  
  isInitialized = true;
  const originalFetch = window.fetch;
  
  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    let urlString = '';
    let method = 'GET';
    let headers: Record<string, string> = {};
    let body: any = null;

    // Standardize URL and request details
    if (typeof input === 'string') {
      urlString = input;
      method = init?.method || 'GET';
      body = init?.body;
      headers = serializeHeaders(init?.headers);
    } else if (input instanceof URL) {
      urlString = input.toString();
      method = init?.method || 'GET';
      body = init?.body;
      headers = serializeHeaders(init?.headers);
    } else if (input && typeof input === 'object' && 'url' in input) {
      urlString = (input as Request).url;
      method = init?.method || (input as Request).method || 'GET';
      body = init?.body || (input as any).body;
      headers = serializeHeaders(init?.headers || (input as Request).headers);
    }

    method = method.toUpperCase();

    // Check if the URL should be processed by our offline system
    if (!shouldIntercept(urlString)) {
      return originalFetch.apply(this, [input, init]);
    }

    const online = navigator.onLine;

    // --- GET Request Interception ---
    if (method === 'GET') {
      if (online) {
        try {
          const response = await originalFetch.apply(this, [input, init]);
          if (response.ok) {
            // Clone response so we can read its json for the cache
            const clone = response.clone();
            clone.json().then(data => {
              setCache(urlString, data);
            }).catch(() => {});
          }
          return response;
        } catch (err) {
          console.warn('Network GET failed, falling back to cache:', err);
          const cachedData = await getCache(urlString);
          if (cachedData !== null) {
            return new Response(JSON.stringify(cachedData), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'x-offline-cache': 'true' }
            });
          }
          throw err; // No cache and network failed
        }
      } else {
        // Offline: Return cache
        const cachedData = await getCache(urlString);
        if (cachedData !== null) {
          return new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'x-offline-cache': 'true' }
          });
        }
        // Return 503 Service Unavailable if not cached
        return new Response(JSON.stringify({
          success: false,
          error: 'Koneksi offline dan data tidak ditemukan di cache.'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // --- MUTATING Request Interception (POST, PUT, DELETE, PATCH) ---
    if (!online) {
      console.log('App is offline. Queuing mutating request:', method, urlString);
      
      // Convert body to string if it's not already
      let bodyStr = '';
      if (body) {
        if (typeof body === 'string') {
          bodyStr = body;
        } else {
          try {
            bodyStr = JSON.stringify(body);
          } catch (_) {
            bodyStr = String(body);
          }
        }
      }

      // Add to IndexedDB mutation queue
      await enqueueMutation(urlString, method, headers, bodyStr);

      // Return a mock successful response to prevent frontend page errors
      return new Response(JSON.stringify({
        success: true,
        offline: true,
        message: 'Perubahan disimpan secara lokal. Akan disinkronkan saat online.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Online mutating request: pass through
    return originalFetch.apply(this, [input, init]);
  };

  // Listen for online events
  window.addEventListener('online', () => {
    console.log('Device back online. Triggering sync...');
    window.dispatchEvent(new CustomEvent('offline-status-changed', { detail: { online: true } }));
    syncToServer();
  });

  window.addEventListener('offline', () => {
    console.log('Device offline.');
    window.dispatchEvent(new CustomEvent('offline-status-changed', { detail: { online: false } }));
  });

  // Perform initial sync check
  if (navigator.onLine) {
    syncToServer();
  }
}

// Sync queued mutations to server
export async function syncToServer(): Promise<void> {
  if (isSyncing || typeof window === 'undefined' || !navigator.onLine) return;

  const queue = await getMutationQueue();
  if (queue.length === 0) return;

  isSyncing = true;
  console.log(`Starting background sync of ${queue.length} mutations...`);
  
  window.dispatchEvent(new CustomEvent('offline-sync-status', { 
    detail: { syncing: true, total: queue.length, current: 0 } 
  }));

  let index = 0;
  for (const mutation of queue) {
    if (!navigator.onLine) {
      console.log('Sync interrupted: connection lost.');
      break;
    }

    try {
      window.dispatchEvent(new CustomEvent('offline-sync-status', { 
        detail: { syncing: true, total: queue.length, current: index } 
      }));

      console.log(`Replaying mutation ${index + 1}/${queue.length}:`, mutation.method, mutation.url);
      
      const res = await window.fetch(mutation.url, {
        method: mutation.method,
        headers: {
          ...mutation.headers,
          'Content-Type': 'application/json'
        },
        body: mutation.body
      });

      // Dequeue if request completed (regardless of status - to prevent blocking queue with bad payloads)
      if (res.status >= 200) {
        await dequeueMutation(mutation.id!);
        console.log(`Mutation ${mutation.id} synced successfully (Status: ${res.status}).`);
      }
    } catch (err) {
      console.error(`Failed to replay mutation ${mutation.id}:`, err);
      // Wait a moment and stop execution to retry later (transient failure)
      break;
    }
    index++;
  }

  isSyncing = false;
  
  // Dispatch final status
  const remainingQueue = await getMutationQueue();
  window.dispatchEvent(new CustomEvent('offline-sync-status', { 
    detail: { syncing: false, total: remainingQueue.length, current: remainingQueue.length } 
  }));

  // Trigger cache refresh for the active view
  window.dispatchEvent(new CustomEvent('offline-sync-complete'));
}
