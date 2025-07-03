import { cache } from '@/lib/redis';
import { client } from '@/lib/observation-client';

export async function warmCache() {
  console.log('🔥 Warming cache...');

  try {
    // Warm static data caches
    const warmingTasks = [
      // Countries
      cache.set(
        'countries:all',
        await (await client.countries())
          .list()
          .then((response) =>
            'results' in response ? response.results : response
          ),
        { ttl: 86400, prefix: 'api' }
      ),

      // Regions
      cache.set('regions:all', await (await client.regions()).list(), {
        ttl: 86400,
        prefix: 'api',
      }),

      // Groups
      cache.set('groups:all', await (await client.groups()).list(), {
        ttl: 86400,
        prefix: 'api',
      }),

      // Challenges (if auth is available)
      ...(process.env.OAUTH_CLIENT_ID
        ? [
            cache.set(
              'challenges:all',
              await (await client.challenges())
                .list()
                .then((response) =>
                  'results' in response ? response.results : response
                ),
              { ttl: 3600, prefix: 'api' }
            ),
          ]
        : []),

      // Species groups
      cache.set(
        'species-groups:groups',
        await (await client.species())
          .listGroups()
          .then((response) =>
            'results' in response ? response.results : response
          ),
        { ttl: 43200, prefix: 'api' }
      ),

      // Regional species lists
      cache.set(
        'species-groups:lists',
        await (await client.regionSpeciesLists())
          .list()
          .then((response) => (Array.isArray(response) ? response : [])),
        { ttl: 43200, prefix: 'api' }
      ),
    ];

    await Promise.all(warmingTasks);
    console.log('✅ Cache warming complete');
  } catch (error) {
    console.error('❌ Cache warming failed:', error);
  }
}

// Optional: Add popular species warming
export async function warmPopularSpecies(speciesIds: number[] = []) {
  if (speciesIds.length === 0) {
    // Default popular species IDs (replace with actual popular species)
    speciesIds = [1, 2, 3, 4, 5, 10, 20, 30, 40, 50];
  }

  try {
    const speciesClient = await client.species();
    const warmingTasks = speciesIds.map((speciesId) =>
      cache.set(`species:${speciesId}`, speciesClient.get(speciesId), {
        ttl: 14400,
        prefix: 'api',
      })
    );

    await Promise.all(warmingTasks);
    console.log(`✅ Warmed ${speciesIds.length} popular species`);
  } catch (error) {
    console.error('❌ Popular species warming failed:', error);
  }
}
