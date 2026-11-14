/**
 * TRADESCOUT — High-Speed In-Memory Client Request Cache & Deduplicator.
 *
 * Guarantees sub-5ms perceived latency for repeated symbol lookups and prevents
 * thundering herd / duplicated simultaneous in-flight fetch requests.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

function buildCacheKey(url: string, options?: RequestInit): string {
  const method = (options?.method || "GET").toUpperCase();
  let userId = "";

  if (options?.headers) {
    if (typeof (options.headers as Headers).get === "function") {
      userId = (options.headers as Headers).get("x-user-id") || "";
    } else if (Array.isArray(options.headers)) {
      const match = options.headers.find(([k]) => k.toLowerCase() === "x-user-id");
      userId = match ? match[1] : "";
    } else if (typeof options.headers === "object") {
      userId = (options.headers as Record<string, string>)["x-user-id"] || "";
    }
  }

  return `${method}:${url}${userId ? `:${userId}` : ""}`;
}

/**
 * Deduplicated client-side fetch. Simultaneous identical requests share the same in-flight Promise.
 * Results are cached in memory for ttlMs (default 60 seconds).
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttlMs: number = 60_000
): Promise<T> {
  const cacheKey = buildCacheKey(url, options);

  // 1. Check valid memory cache
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < cached.ttlMs) {
    return cached.data as T;
  }

  // 2. Check in-flight pending request deduplication
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<T>;
  }

  // 3. Initiate fetch and store pending promise
  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = (await res.json()) as T;
      memoryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttlMs,
      });
      return data;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Invalidates cache entries matching a given URL pattern, or clears all entries if omitted.
 */
export function invalidateClientCache(urlPattern?: string): void {
  if (!urlPattern) {
    memoryCache.clear();
    return;
  }
  for (const key of Array.from(memoryCache.keys())) {
    if (key.includes(urlPattern)) {
      memoryCache.delete(key);
    }
  }
}
