/**
 * Request deduplication utility to prevent concurrent duplicate API calls
 * Implements Tier 2 optimization from API_OPTIMIZATION_PLAN.md
 */

import { recordRequestDeduplication } from '@/lib/metrics';

// Map to track in-flight requests by key
const inFlightRequests = new Map<string, Promise<unknown>>();

// Map to track request timing for metrics
const requestTimings = new Map<string, number>();

/**
 * Deduplicates requests by key to prevent multiple concurrent calls for the same data
 * @param key Unique identifier for the request
 * @param fetchFn Function that performs the actual fetch
 * @param options Configuration options
 * @returns Promise resolving to the fetched data
 */
export async function deduplicatedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    prefix?: string;
    timeout?: number; // milliseconds
  } = {}
): Promise<T> {
  const { prefix = 'dedup', timeout = 30000 } = options;
  const fullKey = `${prefix}:${key}`;
  const startTime = Date.now();

  // If request is already in-flight, return the existing promise
  if (inFlightRequests.has(fullKey)) {
    console.log(`🔄 Request deduplication HIT: ${fullKey}`);

    // Record deduplication hit
    recordRequestDeduplication('hit', prefix);

    return inFlightRequests.get(fullKey)! as Promise<T>;
  }

  console.log(`⚡ Request deduplication MISS: ${fullKey}`);

  // Record timing for metrics
  requestTimings.set(fullKey, startTime);

  // Create timeout promise for long-running requests
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms: ${fullKey}`));
    }, timeout);
  });

  // Execute the fetch function with timeout
  const fetchPromise = Promise.race([fetchFn(), timeoutPromise]);

  // Store the promise in the in-flight map
  inFlightRequests.set(fullKey, fetchPromise as Promise<unknown>);

  try {
    const result = await fetchPromise;

    // Record deduplication miss
    recordRequestDeduplication('miss', prefix);

    return result;
  } catch (error) {
    console.error(`❌ Request deduplication error for ${fullKey}:`, error);
    throw error;
  } finally {
    // Clean up the in-flight request and timing
    inFlightRequests.delete(fullKey);
    requestTimings.delete(fullKey);
  }
}

/**
 * Get current in-flight request count for monitoring
 */
export function getInFlightRequestCount(): number {
  return inFlightRequests.size;
}

/**
 * Clear all in-flight requests (useful for testing or emergency cleanup)
 */
export function clearInFlightRequests(): void {
  inFlightRequests.clear();
  requestTimings.clear();
  console.log('🧹 Cleared all in-flight requests');
}

/**
 * Get in-flight request keys for debugging
 */
export function getInFlightRequestKeys(): string[] {
  return Array.from(inFlightRequests.keys());
}

/**
 * Higher-order function to wrap existing fetch functions with deduplication
 * @param fetchFn Original fetch function
 * @param keyGenerator Function to generate cache key from arguments
 * @param prefix Optional prefix for the cache key
 */
export function withDeduplication<TArgs extends unknown[], TResult>(
  fetchFn: (...args: TArgs) => Promise<TResult>,
  keyGenerator: (...args: TArgs) => string,
  prefix?: string
) {
  return async (...args: TArgs): Promise<TResult> => {
    const key = keyGenerator(...args);
    return deduplicatedFetch(key, () => fetchFn(...args), { prefix });
  };
}
