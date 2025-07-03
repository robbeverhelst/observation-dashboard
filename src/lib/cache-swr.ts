/**
 * Stale-While-Revalidate (SWR) cache implementation
 * Implements Tier 3 optimization from API_OPTIMIZATION_PLAN.md
 */

import { getRedisClient } from '@/lib/redis';
import { recordCacheHit, recordCacheMiss, recordError } from '@/lib/metrics';
import type Redis from 'ioredis';

export interface SWRCacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in seconds
  staleWhileRevalidate: number; // Additional stale period in seconds
  tags?: string[]; // Cache tags for batch invalidation
  version?: string; // Version for cache invalidation
}

export interface SWROptions {
  ttl?: number; // Fresh period in seconds
  staleWhileRevalidate?: number; // Stale period in seconds
  prefix?: string; // Cache key prefix
  tags?: string[]; // Tags for batch invalidation
  version?: string; // Version for invalidation
  background?: boolean; // Whether to run revalidation in background
}

export interface SWRResult<T> {
  data: T;
  isStale: boolean;
  isFresh: boolean;
  revalidating: boolean;
}

export class SWRCache {
  private redis: Redis | null;
  private defaultTTL = 300; // 5 minutes fresh
  private defaultSWR = 3600; // 1 hour stale period
  private revalidationPromises = new Map<string, Promise<void>>();

  constructor() {
    this.redis = getRedisClient();
  }

  private getKey(key: string, prefix?: string): string {
    const basePrefix = 'obs-explorer:swr:';
    const fullPrefix = prefix ? `${basePrefix}${prefix}:` : basePrefix;
    return `${fullPrefix}${key}`;
  }

  private getTagKey(tag: string): string {
    return `obs-explorer:tags:${tag}`;
  }

  /**
   * Get data with SWR behavior
   */
  async get<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: SWROptions = {}
  ): Promise<SWRResult<T>> {
    const startTime = Date.now();
    const {
      ttl = this.defaultTTL,
      staleWhileRevalidate = this.defaultSWR,
      prefix,
      tags,
      version,
      background = true,
    } = options;

    if (!this.redis) {
      // Fallback to direct fetch if Redis unavailable
      const data = await fetchFunction();
      return {
        data,
        isStale: false,
        isFresh: true,
        revalidating: false,
      };
    }

    const cacheKey = this.getKey(key, prefix);
    const keyPrefix = key.split(':')[0];

    try {
      // Try to get cached entry
      const cached = await this.redis.get(cacheKey);
      const now = Date.now();

      if (cached) {
        const entry: SWRCacheEntry<T> = JSON.parse(cached);
        const age = (now - entry.timestamp) / 1000; // Age in seconds

        // Check if data is fresh
        if (age <= entry.ttl) {
          // Data is fresh
          recordCacheHit('redis_swr_fresh', keyPrefix, Date.now() - startTime);
          console.log(`🟢 SWR FRESH: ${cacheKey} (age: ${Math.round(age)}s)`);

          return {
            data: entry.data,
            isStale: false,
            isFresh: true,
            revalidating: false,
          };
        }

        // Check if data is stale but within SWR period
        if (age <= entry.ttl + entry.staleWhileRevalidate) {
          // Data is stale but usable
          recordCacheHit('redis_swr_stale', keyPrefix, Date.now() - startTime);
          console.log(`🟡 SWR STALE: ${cacheKey} (age: ${Math.round(age)}s)`);

          // Start background revalidation if not already running
          const revalidationKey = `${cacheKey}:revalidating`;
          let revalidating = false;

          if (background && !this.revalidationPromises.has(revalidationKey)) {
            revalidating = true;
            const revalidationPromise = this.revalidateInBackground(
              cacheKey,
              fetchFunction,
              { ttl, staleWhileRevalidate, prefix, tags, version }
            );

            this.revalidationPromises.set(revalidationKey, revalidationPromise);

            // Clean up promise when done
            revalidationPromise.finally(() => {
              this.revalidationPromises.delete(revalidationKey);
            });
          }

          return {
            data: entry.data,
            isStale: true,
            isFresh: false,
            revalidating,
          };
        }
      }

      // Cache miss or expired - fetch fresh data
      recordCacheMiss('redis_swr', keyPrefix, Date.now() - startTime);
      console.log(`🔴 SWR MISS: ${cacheKey}`);

      const data = await fetchFunction();
      await this.set(key, data, options);

      return {
        data,
        isStale: false,
        isFresh: true,
        revalidating: false,
      };
    } catch (error) {
      recordError('swr_cache_error', 'cache', 'medium');
      console.error('SWR cache error:', error);

      // Fallback to direct fetch
      const data = await fetchFunction();
      return {
        data,
        isStale: false,
        isFresh: true,
        revalidating: false,
      };
    }
  }

  /**
   * Set data in cache with SWR metadata
   */
  async set<T>(
    key: string,
    value: T,
    options: SWROptions = {}
  ): Promise<boolean> {
    if (!this.redis) return false;

    const {
      ttl = this.defaultTTL,
      staleWhileRevalidate = this.defaultSWR,
      prefix,
      tags,
      version,
    } = options;

    try {
      const cacheKey = this.getKey(key, prefix);
      const entry: SWRCacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        staleWhileRevalidate,
        tags,
        version,
      };

      // Set cache entry with total TTL (fresh + stale period)
      const totalTTL = ttl + staleWhileRevalidate;
      await this.redis.setex(cacheKey, totalTTL, JSON.stringify(entry));

      // Set up cache tags for invalidation
      if (tags && tags.length > 0) {
        await this.setTags(cacheKey, tags);
      }

      console.log(
        `💾 SWR SET: ${cacheKey} (ttl: ${ttl}s, swr: ${staleWhileRevalidate}s)`
      );
      return true;
    } catch (error) {
      console.warn('SWR cache set error:', error);
      return false;
    }
  }

  /**
   * Background revalidation
   */
  private async revalidateInBackground<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    options: SWROptions
  ): Promise<void> {
    try {
      console.log(`🔄 SWR REVALIDATING: ${cacheKey}`);
      const freshData = await fetchFunction();

      // Extract original key from cache key
      const key = cacheKey.replace(/^obs-explorer:swr:(?:[^:]+:)?/, '');
      await this.set(key, freshData, options);

      console.log(`✅ SWR REVALIDATED: ${cacheKey}`);
    } catch (error) {
      console.warn(`❌ SWR REVALIDATION FAILED: ${cacheKey}`, error);
      recordError('swr_revalidation_error', 'cache', 'low');
    }
  }

  /**
   * Set up cache tags for batch invalidation
   */
  private async setTags(cacheKey: string, tags: string[]): Promise<void> {
    if (!this.redis) return;

    try {
      // Add cache key to each tag set
      for (const tag of tags) {
        const tagKey = this.getTagKey(tag);
        await this.redis.sadd(tagKey, cacheKey);
        // Set expiration on tag key (longer than cache entries)
        await this.redis.expire(tagKey, 86400); // 24 hours
      }
    } catch (error) {
      console.warn('Error setting cache tags:', error);
    }
  }

  /**
   * Invalidate cache entries by tag
   */
  async invalidateByTag(tag: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const tagKey = this.getTagKey(tag);
      const cacheKeys = await this.redis.smembers(tagKey);

      if (cacheKeys.length === 0) {
        console.log(`🏷️ No cache entries found for tag: ${tag}`);
        return 0;
      }

      // Delete all cache entries with this tag
      await this.redis.del(...cacheKeys);

      // Remove the tag key itself
      await this.redis.del(tagKey);

      console.log(
        `🗑️ Invalidated ${cacheKeys.length} cache entries with tag: ${tag}`
      );
      return cacheKeys.length;
    } catch (error) {
      console.warn('Error invalidating by tag:', error);
      recordError('tag_invalidation_error', 'cache', 'medium');
      return 0;
    }
  }

  /**
   * Invalidate cache entries by version
   */
  async invalidateByVersion(version: string, prefix?: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const pattern = this.getKey('*', prefix);
      const keys = await this.redis.keys(pattern);
      let invalidatedCount = 0;

      for (const key of keys) {
        try {
          const cached = await this.redis.get(key);
          if (cached) {
            const entry: SWRCacheEntry<unknown> = JSON.parse(cached);
            if (entry.version === version) {
              await this.redis.del(key);
              invalidatedCount++;
            }
          }
        } catch {
          // Skip invalid cache entries
          continue;
        }
      }

      console.log(
        `🔄 Invalidated ${invalidatedCount} cache entries with version: ${version}`
      );
      return invalidatedCount;
    } catch (error) {
      console.warn('Error invalidating by version:', error);
      recordError('version_invalidation_error', 'cache', 'medium');
      return 0;
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(
    key: string,
    options: { prefix?: string } = {}
  ): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const cacheKey = this.getKey(key, options.prefix);
      await this.redis.del(cacheKey);
      console.log(`🗑️ SWR DELETE: ${cacheKey}`);
      return true;
    } catch (error) {
      console.warn('SWR cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries with optional prefix
   */
  async clear(prefix?: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const pattern = this.getKey('*', prefix);
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      console.log(
        `🧹 SWR CLEAR: ${keys.length} entries (prefix: ${prefix || 'all'})`
      );
      return keys.length;
    } catch (error) {
      console.warn('SWR cache clear error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(prefix?: string): Promise<{
    totalEntries: number;
    freshEntries: number;
    staleEntries: number;
    expiredEntries: number;
  }> {
    if (!this.redis) {
      return {
        totalEntries: 0,
        freshEntries: 0,
        staleEntries: 0,
        expiredEntries: 0,
      };
    }

    try {
      const pattern = this.getKey('*', prefix);
      const keys = await this.redis.keys(pattern);
      const now = Date.now();

      let freshEntries = 0;
      let staleEntries = 0;
      let expiredEntries = 0;

      for (const key of keys) {
        try {
          const cached = await this.redis.get(key);
          if (cached) {
            const entry: SWRCacheEntry<unknown> = JSON.parse(cached);
            const age = (now - entry.timestamp) / 1000;

            if (age <= entry.ttl) {
              freshEntries++;
            } else if (age <= entry.ttl + entry.staleWhileRevalidate) {
              staleEntries++;
            } else {
              expiredEntries++;
            }
          }
        } catch {
          expiredEntries++;
        }
      }

      return {
        totalEntries: keys.length,
        freshEntries,
        staleEntries,
        expiredEntries,
      };
    } catch (error) {
      console.warn('Error getting cache stats:', error);
      return {
        totalEntries: 0,
        freshEntries: 0,
        staleEntries: 0,
        expiredEntries: 0,
      };
    }
  }
}

// Export singleton instance
export const swrCache = new SWRCache();

/**
 * Helper function for API routes with SWR behavior
 */
export async function withSWR<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  options: SWROptions = {}
): Promise<SWRResult<T>> {
  return swrCache.get(cacheKey, fetchFunction, options);
}
