/**
 * Intelligent prefetching system for predictable user flows
 * Implements Tier 2 optimization from API_OPTIMIZATION_PLAN.md
 */

// Note: withCache import removed to avoid client-side Redis imports
import { getClient } from '@/lib/observation-client';
import { recordExternalApiCall, recordPrefetch } from '@/lib/metrics';

interface PrefetchOptions {
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
  silent?: boolean; // Don't log errors for background prefetching
}

/**
 * Prefetch manager to handle intelligent data prefetching
 */
export class PrefetchManager {
  private prefetchQueue: Array<{
    key: string;
    fetchFn: () => Promise<unknown>;
    priority: 'high' | 'medium' | 'low';
    timestamp: number;
  }> = [];

  private isProcessing = false;
  private readonly maxConcurrent = 3;
  private activePrefetches = new Set<string>();

  /**
   * Add a prefetch task to the queue
   */
  async prefetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: PrefetchOptions = {}
  ): Promise<void> {
    const { priority = 'medium', silent = true } = options;

    // Skip if already prefetching or recently prefetched
    if (this.activePrefetches.has(key)) {
      return;
    }

    // Skip cache check for client-side prefetching
    // Server-side prefetching will handle cache checks

    // Add to queue
    this.prefetchQueue.push({
      key,
      fetchFn,
      priority,
      timestamp: Date.now(),
    });

    // Sort by priority (high first, then by timestamp)
    this.prefetchQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue(silent);
    }
  }

  /**
   * Process the prefetch queue with concurrency control
   */
  private async processQueue(silent: boolean): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (
        this.prefetchQueue.length > 0 &&
        this.activePrefetches.size < this.maxConcurrent
      ) {
        const task = this.prefetchQueue.shift();
        if (!task) continue;

        // Skip if already being prefetched
        if (this.activePrefetches.has(task.key)) continue;

        this.activePrefetches.add(task.key);

        // Execute prefetch in background
        this.executePrefetch(task, silent).finally(() => {
          this.activePrefetches.delete(task.key);
        });
      }
    } finally {
      this.isProcessing = false;

      // Continue processing if there are more items
      if (this.prefetchQueue.length > 0) {
        setTimeout(() => this.processQueue(silent), 100);
      }
    }
  }

  /**
   * Execute a single prefetch task
   */
  private async executePrefetch(
    task: { key: string; fetchFn: () => Promise<unknown>; priority: string },
    silent: boolean
  ): Promise<void> {
    const startTime = Date.now();

    try {
      if (!silent)
        console.log(`🔮 Prefetching [${task.priority}]: ${task.key}`);

      await task.fetchFn();

      const duration = Date.now() - startTime;
      if (!silent)
        console.log(`✅ Prefetch completed: ${task.key} (${duration}ms)`);

      // Record successful prefetch
      recordPrefetch(
        task.key.split(':')[0],
        task.priority,
        'success',
        duration
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      if (!silent) {
        console.warn(`⚠️ Prefetch failed: ${task.key} (${duration}ms)`, error);
      }

      // Record failed prefetch
      recordPrefetch(task.key.split(':')[0], task.priority, 'error', duration);
    }
  }

  /**
   * Get current queue status for monitoring
   */
  getQueueStatus() {
    return {
      queueLength: this.prefetchQueue.length,
      activePrefetches: this.activePrefetches.size,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Clear the prefetch queue
   */
  clearQueue(): void {
    this.prefetchQueue = [];
    this.activePrefetches.clear();
    this.isProcessing = false;
  }
}

// Global prefetch manager instance
export const prefetchManager = new PrefetchManager();

/**
 * Prefetch observation details for a list of observations
 */
export async function prefetchObservationDetails(
  observationIds: (number | string)[],
  options: PrefetchOptions = {}
): Promise<void> {
  const client = await getClient();

  for (const id of observationIds.slice(0, 5)) {
    // Limit to first 5
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    if (isNaN(numericId)) continue;

    await prefetchManager.prefetch(
      `observation:${numericId}`,
      async () => {
        const startTime = Date.now();
        try {
          const observation = await client.observations.get(numericId);
          recordExternalApiCall(
            'waarneming_nl',
            'get_observation',
            'success',
            Date.now() - startTime
          );
          return observation;
        } catch (error) {
          recordExternalApiCall(
            'waarneming_nl',
            'get_observation',
            'error',
            Date.now() - startTime
          );
          throw error;
        }
      },
      { ...options, priority: 'medium' }
    );
  }
}

/**
 * Prefetch species details for a list of species
 */
export async function prefetchSpeciesDetails(
  speciesIds: (number | string)[],
  options: PrefetchOptions = {}
): Promise<void> {
  const client = await getClient();

  for (const id of speciesIds.slice(0, 10)) {
    // Limit to first 10
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    if (isNaN(numericId)) continue;

    await prefetchManager.prefetch(
      `species:${numericId}`,
      async () => {
        const startTime = Date.now();
        try {
          const species = await client.species.get(numericId);
          recordExternalApiCall(
            'waarneming_nl',
            'get_species',
            'success',
            Date.now() - startTime
          );
          return species;
        } catch (error) {
          recordExternalApiCall(
            'waarneming_nl',
            'get_species',
            'error',
            Date.now() - startTime
          );
          throw error;
        }
      },
      { ...options, priority: 'low' }
    );
  }
}

/**
 * Prefetch user's recent observations on dashboard load
 */
export async function prefetchUserRecentData(
  userId?: number,
  options: PrefetchOptions = {}
): Promise<void> {
  if (!userId) return;

  const client = await getClient();

  await prefetchManager.prefetch(
    `user:${userId}:recent`,
    async () => {
      const startTime = Date.now();
      try {
        const observations = await client.observations.getByUser(userId, {
          limit: 10,
          offset: 0,
        });
        recordExternalApiCall(
          'waarneming_nl',
          'get_user_observations',
          'success',
          Date.now() - startTime
        );

        // Also prefetch species details for these observations
        const speciesIds =
          observations.results
            ?.map((obs) => obs.species)
            .filter((id) => typeof id === 'number')
            .slice(0, 5) || [];

        if (speciesIds.length > 0) {
          prefetchSpeciesDetails(speciesIds, { ...options, priority: 'low' });
        }

        return observations;
      } catch (error) {
        recordExternalApiCall(
          'waarneming_nl',
          'get_user_observations',
          'error',
          Date.now() - startTime
        );
        throw error;
      }
    },
    { ...options, priority: 'high' }
  );
}

/**
 * Smart prefetching based on current page context
 */
export async function smartPrefetch(context: {
  page: string;
  data?: { results?: { id: number | string }[] } | { id?: number | string };
  userId?: number;
}): Promise<void> {
  const { page, data, userId } = context;

  // Type guard to check if data has results property
  const hasResults = (
    obj: unknown
  ): obj is { results: { id: number | string }[] } => {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'results' in obj &&
      Array.isArray((obj as Record<string, unknown>).results)
    );
  };

  // Type guard to check if data has id property
  const hasId = (obj: unknown): obj is { id: number | string } => {
    return obj !== null && typeof obj === 'object' && 'id' in obj;
  };

  switch (page) {
    case 'observations':
      // Prefetch first 5 observation details
      if (hasResults(data) && data.results.length > 0) {
        const observationIds = data.results
          .slice(0, 5)
          .map((obs: { id: number | string }) => obs.id);
        await prefetchObservationDetails(observationIds, {
          priority: 'medium',
        });
      }
      break;

    case 'species':
      // Prefetch common species details
      if (hasResults(data) && data.results.length > 0) {
        const speciesIds = data.results
          .slice(0, 10)
          .map((species: { id: number | string }) => species.id);
        await prefetchSpeciesDetails(speciesIds, { priority: 'low' });
      }
      break;

    case 'dashboard':
    case 'home':
      // Prefetch user's recent data
      if (userId) {
        await prefetchUserRecentData(userId, { priority: 'high' });
      }
      break;

    case 'observation-detail':
      // Prefetch related species if viewing an observation
      if (
        data &&
        typeof data === 'object' &&
        'species' in data &&
        data.species
      ) {
        await prefetchSpeciesDetails([data.species as number | string], {
          priority: 'medium',
        });
      }
      break;

    case 'species-detail':
      // Prefetch recent observations for this species
      if (hasId(data) && data.id) {
        const speciesId =
          typeof data.id === 'string' ? parseInt(data.id, 10) : data.id;
        if (!isNaN(speciesId)) {
          await prefetchManager.prefetch(
            `species:${data.id}:observations`,
            async () => {
              const client = await getClient();
              const startTime = Date.now();
              try {
                const observations = await client.species.getObservations(
                  speciesId,
                  {
                    limit: 5,
                    offset: 0,
                  }
                );
                recordExternalApiCall(
                  'waarneming_nl',
                  'get_species_observations',
                  'success',
                  Date.now() - startTime
                );
                return observations;
              } catch (error) {
                recordExternalApiCall(
                  'waarneming_nl',
                  'get_species_observations',
                  'error',
                  Date.now() - startTime
                );
                throw error;
              }
            },
            { priority: 'medium' }
          );
        }
      }
      break;
  }
}
