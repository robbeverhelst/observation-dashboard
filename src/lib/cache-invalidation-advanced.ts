/**
 * Advanced cache invalidation system
 * Implements intelligent invalidation patterns for Tier 3 optimization
 */

import { swrCache } from '@/lib/cache-swr';
import { recordError } from '@/lib/metrics';

export interface InvalidationRule {
  pattern: string; // Cache key pattern to match
  tags?: string[]; // Tags to invalidate
  condition?: (data: unknown) => boolean; // Conditional invalidation
  cascade?: string[]; // Other rules to trigger
}

export interface ChangeDetectionOptions {
  checkInterval?: number; // How often to check for changes (ms)
  enabled?: boolean; // Whether detection is enabled
  endpoints?: string[]; // Which endpoints to monitor
}

export class CacheInvalidationManager {
  private rules = new Map<string, InvalidationRule>();
  private changeDetectionInterval: NodeJS.Timeout | null = null;
  private lastChecked = new Map<string, number>();
  private readonly maxLastCheckedSize = 1000; // Prevent memory leak

  constructor() {
    this.setupDefaultRules();
  }

  /**
   * Set up default invalidation rules
   */
  private setupDefaultRules(): void {
    // Observation-related invalidations
    this.addRule('new-observations', {
      pattern: 'observations:*',
      tags: ['observations', 'recent', 'location-based'],
      cascade: ['user-stats', 'dashboard-data'],
    });

    // Species-related invalidations
    this.addRule('species-updates', {
      pattern: 'species:*',
      tags: ['species', 'taxonomy'],
      condition: (data: unknown) => {
        // Only invalidate if significant changes detected
        const dataObj = data as Record<string, unknown>;
        return Boolean(
          (dataObj?.photos as unknown[])?.length > 0 || dataObj?.description
        );
      },
    });

    // User data invalidations
    this.addRule('user-activity', {
      pattern: 'user:*',
      tags: ['user-data', 'achievements', 'statistics'],
      cascade: ['dashboard-data'],
    });

    // Location-based invalidations
    this.addRule('location-changes', {
      pattern: 'locations:*',
      tags: ['location-based', 'geographic'],
    });

    // Dashboard data invalidations
    this.addRule('dashboard-data', {
      pattern: 'dashboard:*',
      tags: ['dashboard', 'statistics', 'aggregated'],
    });

    // Static data updates (rare but important)
    this.addRule('static-data', {
      pattern: 'static:*',
      tags: ['countries', 'regions', 'groups', 'challenges'],
    });
  }

  /**
   * Add a custom invalidation rule
   */
  addRule(name: string, rule: InvalidationRule): void {
    this.rules.set(name, rule);
    console.log(`📋 Added invalidation rule: ${name}`);
  }

  /**
   * Remove an invalidation rule
   */
  removeRule(name: string): boolean {
    const removed = this.rules.delete(name);
    if (removed) {
      console.log(`🗑️ Removed invalidation rule: ${name}`);
    }
    return removed;
  }

  /**
   * Trigger invalidation by rule name
   */
  async invalidateByRule(ruleName: string, data?: unknown): Promise<number> {
    const rule = this.rules.get(ruleName);
    if (!rule) {
      console.warn(`⚠️ Unknown invalidation rule: ${ruleName}`);
      return 0;
    }

    console.log(`🔄 Triggering invalidation rule: ${ruleName}`);
    let totalInvalidated = 0;

    try {
      // Check condition if specified
      if (rule.condition && data && !rule.condition(data)) {
        console.log(`⏭️ Skipping invalidation due to condition: ${ruleName}`);
        return 0;
      }

      // Invalidate by tags
      if (rule.tags) {
        for (const tag of rule.tags) {
          const count = await swrCache.invalidateByTag(tag);
          totalInvalidated += count;
          console.log(`🏷️ Invalidated ${count} entries for tag: ${tag}`);
        }
      }

      // Invalidate by pattern
      if (rule.pattern) {
        // Convert pattern to prefix for cache clearing
        const prefix = rule.pattern.replace('*', '').replace(':', '');
        if (prefix) {
          const count = await swrCache.clear(prefix);
          totalInvalidated += count;
          console.log(
            `🧹 Invalidated ${count} entries for pattern: ${rule.pattern}`
          );
        }
      }

      // Cascade to other rules
      if (rule.cascade) {
        for (const cascadeRule of rule.cascade) {
          const cascadeCount = await this.invalidateByRule(cascadeRule, data);
          totalInvalidated += cascadeCount;
        }
      }

      console.log(
        `✅ Rule '${ruleName}' invalidated ${totalInvalidated} total entries`
      );
      return totalInvalidated;
    } catch (error) {
      console.error(
        `❌ Error executing invalidation rule '${ruleName}':`,
        error
      );
      recordError('invalidation_rule_error', 'cache', 'medium');
      return 0;
    }
  }

  /**
   * Smart invalidation based on data changes
   */
  async smartInvalidate(
    changeType: string,
    affectedData: {
      type: 'observation' | 'species' | 'user' | 'location';
      id?: string | number;
      metadata?: Record<string, unknown>;
    }
  ): Promise<number> {
    console.log(`🧠 Smart invalidation triggered: ${changeType}`, affectedData);

    let totalInvalidated = 0;

    try {
      switch (affectedData.type) {
        case 'observation':
          // New observation affects multiple caches
          totalInvalidated += await this.invalidateByRule(
            'new-observations',
            affectedData
          );

          // If observation has location, invalidate location-based caches
          if (affectedData.metadata?.location) {
            totalInvalidated += await this.invalidateByRule(
              'location-changes',
              affectedData
            );
          }

          // If observation belongs to user, invalidate user data
          if (affectedData.metadata?.userId) {
            totalInvalidated += await this.invalidateByRule(
              'user-activity',
              affectedData
            );
          }
          break;

        case 'species':
          totalInvalidated += await this.invalidateByRule(
            'species-updates',
            affectedData
          );

          // If species has new photos or description, invalidate related observations
          if (
            affectedData.metadata?.hasPhotos ||
            affectedData.metadata?.hasDescription
          ) {
            totalInvalidated += await this.invalidateByRule(
              'new-observations',
              affectedData
            );
          }
          break;

        case 'user':
          totalInvalidated += await this.invalidateByRule(
            'user-activity',
            affectedData
          );
          break;

        case 'location':
          totalInvalidated += await this.invalidateByRule(
            'location-changes',
            affectedData
          );
          break;

        default:
          console.warn(
            `Unknown data type for smart invalidation: ${affectedData.type}`
          );
      }

      console.log(
        `🧠 Smart invalidation completed: ${totalInvalidated} entries invalidated`
      );
      return totalInvalidated;
    } catch (error) {
      console.error('Smart invalidation error:', error);
      recordError('smart_invalidation_error', 'cache', 'medium');
      return 0;
    }
  }

  /**
   * Time-based invalidation for stale data
   */
  async invalidateStaleData(maxAge: number = 86400): Promise<number> {
    console.log(`⏰ Starting stale data invalidation (max age: ${maxAge}s)`);

    try {
      const stats = await swrCache.getStats();
      console.log(`📊 Cache stats before cleanup:`, stats);

      // For now, we rely on Redis TTL for expiration
      // In the future, we could implement more sophisticated cleanup
      const expiredCount = stats.expiredEntries;

      if (expiredCount > 0) {
        console.log(
          `🧹 Found ${expiredCount} expired entries (will be cleaned by Redis TTL)`
        );
      }

      return expiredCount;
    } catch (error) {
      console.error('Error checking stale data:', error);
      recordError('stale_data_check_error', 'cache', 'low');
      return 0;
    }
  }

  /**
   * Start automatic change detection
   */
  startChangeDetection(options: ChangeDetectionOptions = {}): void {
    const {
      checkInterval = 300000, // 5 minutes default
      enabled = true,
      endpoints = ['/api/observations/check-new'],
    } = options;

    if (!enabled || this.changeDetectionInterval) {
      return;
    }

    console.log(`🔍 Starting change detection (interval: ${checkInterval}ms)`);

    this.changeDetectionInterval = setInterval(async () => {
      try {
        await this.checkForChanges(endpoints);
      } catch (error) {
        console.error('Change detection error:', error);
        recordError('change_detection_error', 'cache', 'low');
      }
    }, checkInterval);
  }

  /**
   * Stop automatic change detection
   */
  stopChangeDetection(): void {
    if (this.changeDetectionInterval) {
      clearInterval(this.changeDetectionInterval);
      this.changeDetectionInterval = null;
      console.log('🛑 Stopped change detection');
    }
  }

  /**
   * Check for changes in external data
   */
  private async checkForChanges(endpoints: string[]): Promise<void> {
    for (const endpoint of endpoints) {
      try {
        const now = Date.now();

        // Simple change detection - in production, you'd use webhooks or ETags
        // Validate and construct URL safely
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const url = new URL(endpoint, baseUrl);

        const response = await fetch(url.toString());

        if (response.ok) {
          const data = await response.json();

          // Check if new data detected
          if (data.hasNewData) {
            console.log(`🔔 Change detected for ${endpoint}`);

            // Trigger appropriate invalidation based on endpoint
            if (endpoint.includes('observations')) {
              await this.invalidateByRule('new-observations', data);
            }
            // Add more endpoint-specific logic as needed
          }
        }

        this.lastChecked.set(endpoint, now);

        // Prevent memory leak by limiting map size
        if (this.lastChecked.size > this.maxLastCheckedSize) {
          const oldestKey = Array.from(this.lastChecked.entries()).sort(
            ([, a], [, b]) => a - b
          )[0][0];
          this.lastChecked.delete(oldestKey);
        }
      } catch (error) {
        console.warn(`Error checking for changes in ${endpoint}:`, error);
      }
    }
  }

  /**
   * Manual cache invalidation with reason logging
   */
  async manualInvalidate(
    target: string,
    reason: string,
    scope: 'tag' | 'pattern' | 'rule' = 'rule'
  ): Promise<number> {
    console.log(`👤 Manual invalidation: ${target} (reason: ${reason})`);

    let invalidatedCount = 0;

    try {
      switch (scope) {
        case 'tag':
          invalidatedCount = await swrCache.invalidateByTag(target);
          break;
        case 'pattern':
          const prefix = target.replace('*', '').replace(':', '');
          invalidatedCount = await swrCache.clear(prefix);
          break;
        case 'rule':
          invalidatedCount = await this.invalidateByRule(target);
          break;
      }

      console.log(
        `✅ Manual invalidation completed: ${invalidatedCount} entries`
      );
      return invalidatedCount;
    } catch (error) {
      console.error('Manual invalidation error:', error);
      recordError('manual_invalidation_error', 'cache', 'medium');
      return 0;
    }
  }

  /**
   * Get invalidation statistics
   */
  getStats(): {
    rulesCount: number;
    changeDetectionActive: boolean;
    rules: string[];
  } {
    return {
      rulesCount: this.rules.size,
      changeDetectionActive: this.changeDetectionInterval !== null,
      rules: Array.from(this.rules.keys()),
    };
  }
}

// Export singleton instance
export const invalidationManager = new CacheInvalidationManager();

// Helper functions for common invalidation patterns
export async function invalidateObservationCaches(
  observationId?: string | number
): Promise<number> {
  return invalidationManager.smartInvalidate('observation_update', {
    type: 'observation',
    id: observationId,
  });
}

export async function invalidateSpeciesCaches(
  speciesId?: string | number
): Promise<number> {
  return invalidationManager.smartInvalidate('species_update', {
    type: 'species',
    id: speciesId,
  });
}

export async function invalidateUserCaches(
  userId?: string | number
): Promise<number> {
  return invalidationManager.smartInvalidate('user_update', {
    type: 'user',
    id: userId,
  });
}

export async function invalidateLocationCaches(
  locationId?: string | number
): Promise<number> {
  return invalidationManager.smartInvalidate('location_update', {
    type: 'location',
    id: locationId,
  });
}
