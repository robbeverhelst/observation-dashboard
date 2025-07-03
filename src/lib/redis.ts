import Redis from 'ioredis';
import { recordCacheHit, recordCacheMiss, recordError } from '@/lib/metrics';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  // Skip Redis in build/test environments or if URL not provided
  if (
    process.env.NODE_ENV === 'test' ||
    typeof window !== 'undefined' ||
    !process.env.REDIS_URL
  ) {
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 5000,
      });

      redis.on('error', (error) => {
        console.warn('Redis connection error:', error.message);
        // Don't crash the app if Redis fails
      });

      redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });
    } catch (error) {
      console.warn('Failed to initialize Redis:', error);
      return null;
    }
  }

  return redis;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Cache key prefix
}

export class CacheManager {
  private redis: Redis | null;
  private defaultTTL = 300; // 5 minutes default

  constructor() {
    this.redis = getRedisClient();
  }

  private getKey(key: string, prefix?: string): string {
    const basePrefix = 'obs-explorer:';
    const fullPrefix = prefix ? `${basePrefix}${prefix}:` : basePrefix;
    return `${fullPrefix}${key}`;
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const cacheKey = this.getKey(key, options.prefix);
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Cache get error:', error);
    }

    return null;
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const cacheKey = this.getKey(key, options.prefix);
      const ttl = options.ttl || this.defaultTTL;

      await this.redis.setex(cacheKey, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Cache set error:', error);
      return false;
    }
  }

  async del(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const cacheKey = this.getKey(key, options.prefix);
      await this.redis.del(cacheKey);
      return true;
    } catch (error) {
      console.warn('Cache delete error:', error);
      return false;
    }
  }

  async flush(prefix?: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const pattern = this.getKey('*', prefix);
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      return true;
    } catch (error) {
      console.warn('Cache flush error:', error);
      return false;
    }
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const cacheKey = this.getKey(key, options.prefix);
      const exists = await this.redis.exists(cacheKey);
      return exists === 1;
    } catch (error) {
      console.warn('Cache exists error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Helper function for API routes
export async function withCache<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const startTime = Date.now();

  // Try to get from cache first
  const cached = await cache.get<T>(cacheKey, options);
  if (cached !== null) {
    const hitTime = Date.now() - startTime;
    const keyPrefix = cacheKey.split(':')[0];

    // Only log cache hits for non-check endpoints to reduce noise
    if (!cacheKey.includes('latest-check')) {
      console.log(`📦 Cache HIT: ${cacheKey} (${hitTime}ms)`);
    }

    // Record Prometheus metrics
    recordCacheHit('redis', keyPrefix, hitTime);

    // Track legacy metrics
    trackCacheMetric('hit', cacheKey, hitTime);
    return cached;
  }

  const keyPrefix = cacheKey.split(':')[0];
  console.log(`🔄 Cache MISS: ${cacheKey}`);

  // Record cache miss metrics
  const missTime = Date.now() - startTime;
  recordCacheMiss('redis', keyPrefix, missTime);
  trackCacheMetric('miss', cacheKey, 0);

  // Fetch fresh data
  const fetchStart = Date.now();
  try {
    const data = await fetchFunction();
    const fetchTime = Date.now() - fetchStart;

    console.log(`⏱️  Fetch time: ${fetchTime}ms`);
    trackCacheMetric('fetch_time', cacheKey, fetchTime);

    // Cache the result
    await cache.set(cacheKey, data, options);

    return data;
  } catch (error) {
    recordError('fetch_error', 'cache', 'medium');
    console.error(`❌ Fetch error for ${cacheKey}:`, error);
    throw error;
  }
}

// Simple metrics tracking (expand as needed)
function trackCacheMetric(
  type: 'hit' | 'miss' | 'fetch_time',
  key: string,
  value: number
) {
  // Send to your monitoring service (Datadog, New Relic, etc.)
  // For now, just log
  if (process.env.NODE_ENV === 'development') {
    console.log(`[CACHE METRIC] ${type}: ${key} = ${value}`);
  }
}
