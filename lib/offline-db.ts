const DB_NAME = 'sim_ppds_offline';
const DB_VERSION = 1;

export interface CachedItem {
  url: string;
  data: any;
  timestamp: number;
}

export interface QueuedMutation {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

export function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('cache_data')) {
        db.createObjectStore('cache_data', { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains('mutation_queue')) {
        db.createObjectStore('mutation_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Get cached GET response
export async function getCache(url: string): Promise<any | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache_data', 'readonly');
      const store = tx.objectStore('cache_data');
      const request = store.get(url);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedItem | undefined;
        resolve(result ? result.data : null);
      };
    });
  } catch (error) {
    console.error('Error reading from IndexedDB cache:', error);
    return null;
  }
}

// Set cached GET response
export async function setCache(url: string, data: any): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache_data', 'readwrite');
      const store = tx.objectStore('cache_data');
      const item: CachedItem = {
        url,
        data,
        timestamp: Date.now()
      };
      const request = store.put(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error writing to IndexedDB cache:', error);
  }
}

// Enqueue offline mutating request (POST, PUT, DELETE)
export async function enqueueMutation(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: string
): Promise<number> {
  try {
    const db = await getDB();
    const mutationId = await new Promise<number>((resolve, reject) => {
      const tx = db.transaction('mutation_queue', 'readwrite');
      const store = tx.objectStore('mutation_queue');
      const item: QueuedMutation = {
        url,
        method,
        headers,
        body,
        timestamp: Date.now()
      };
      const request = store.add(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as number);
    });

    // Optimistically update the cached data locally
    await updateLocalCacheOptimistically(url, method, body);

    // Notify listeners that queue size changed
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-sync-queue-changed'));
    }

    return mutationId;
  } catch (error) {
    console.error('Error queuing mutation in IndexedDB:', error);
    throw error;
  }
}

// Get all mutations in the queue
export async function getMutationQueue(): Promise<QueuedMutation[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutation_queue', 'readonly');
      const store = tx.objectStore('mutation_queue');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (error) {
    console.error('Error reading mutation queue from IndexedDB:', error);
    return [];
  }
}

// Remove a mutation from the queue
export async function dequeueMutation(id: number): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('mutation_queue', 'readwrite');
      const store = tx.objectStore('mutation_queue');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-sync-queue-changed'));
    }
  } catch (error) {
    console.error('Error dequeuing mutation from IndexedDB:', error);
  }
}

// Clear the entire mutation queue
export async function clearMutationQueue(): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('mutation_queue', 'readwrite');
      const store = tx.objectStore('mutation_queue');
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-sync-queue-changed'));
    }
  } catch (error) {
    console.error('Error clearing mutation queue from IndexedDB:', error);
  }
}

// Helper to extract an ID from URL (e.g. /api/santri/123 or /api/arsip?id=456)
function extractIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const idParam = urlObj.searchParams.get('id');
    if (idParam) return idParam;

    const segments = urlObj.pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    // Ignore common non-ID path names
    const commonPaths = [
      'presensi', 'ubudiyyah', 'spp', 'config', 'detail', 'settings', 
      'notifications', 'search', 'arsip', 'keuangan', 'santri', 
      'pengurus', 'plp', 'takmir', 'api'
    ];
    if (lastSegment && !commonPaths.includes(lastSegment)) {
      return lastSegment;
    }
  } catch (e) {
    const match = url.match(/\/api\/[^\/]+\/([a-zA-Z0-9_-]+)(?:\?|$)/);
    if (match) return match[1];
  }
  return null;
}

// Apply mutation changes to the cached GET requests locally so that the user sees their changes instantly while offline
async function updateLocalCacheOptimistically(url: string, method: string, bodyStr: string): Promise<void> {
  try {
    const db = await getDB();
    const targetId = extractIdFromUrl(url);
    let body: any = null;
    try {
      if (bodyStr) body = JSON.parse(bodyStr);
    } catch (_) {}

    // Find resources by getting the base segment, e.g. "santri" or "keuangan"
    const pathMatch = url.match(/\/api\/([a-zA-Z0-9_-]+)/);
    if (!pathMatch) return;
    const resourceName = pathMatch[1];

    // Read all cached keys to find which ones to update
    const tx = db.transaction('cache_data', 'readwrite');
    const store = tx.objectStore('cache_data');
    
    const request = store.openCursor();
    request.onsuccess = (event) => {
      const cursor = (event.target as any).result;
      if (cursor) {
        const cachedItem = cursor.value as CachedItem;
        const cacheUrl = cachedItem.url;
        
        // Check if cacheUrl corresponds to the same resource (e.g. contains '/api/santri' or is exactly '/api/santri')
        if (cacheUrl.includes(`/api/${resourceName}`)) {
          let updatedData = JSON.parse(JSON.stringify(cachedItem.data)); // Deep clone
          let modified = false;

          // Helper to check and update items in array
          const processArray = (arr: any[]) => {
            if (method === 'DELETE' && targetId) {
              const originalLength = arr.length;
              arr = arr.filter(item => String(item.id || item._id) !== targetId);
              if (arr.length !== originalLength) modified = true;
            } else if (method === 'PUT' && targetId && body) {
              const idx = arr.findIndex(item => String(item.id || item._id) === targetId);
              if (idx !== -1) {
                arr[idx] = { ...arr[idx], ...body };
                modified = true;
              }
            } else if (method === 'POST' && body) {
              // Generate temp ID
              const tempId = body.id || body._id || `temp_${Date.now()}`;
              arr.unshift({ id: tempId, ...body });
              modified = true;
            }
            return arr;
          };

          if (Array.isArray(updatedData)) {
            updatedData = processArray(updatedData);
          } else if (updatedData && typeof updatedData === 'object') {
            // Handle { success: true, data: [...] } or { success: true, results: [...] }
            if (Array.isArray(updatedData.data)) {
              updatedData.data = processArray(updatedData.data);
            } else if (Array.isArray(updatedData.results)) {
              updatedData.results = processArray(updatedData.results);
            } else if (targetId && String(updatedData.id || updatedData._id) === targetId) {
              // It is the specific detail object cache
              if (method === 'DELETE') {
                updatedData = null; // deleted
                modified = true;
              } else if (method === 'PUT' && body) {
                updatedData = { ...updatedData, ...body };
                modified = true;
              }
            }
          }

          if (modified) {
            cursor.update({
              ...cachedItem,
              data: updatedData,
              timestamp: Date.now()
            });
          }
        }
        cursor.continue();
      }
    };
  } catch (error) {
    console.error('Failed to update local cache optimistically:', error);
  }
}
