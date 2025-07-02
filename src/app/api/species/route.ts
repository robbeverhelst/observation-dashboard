import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';
    const search = searchParams.get('search');
    const speciesId = searchParams.get('id');

    if (speciesId) {
      // Get specific species by ID
      const species = await client.species.get(parseInt(speciesId));
      return NextResponse.json({ results: [species] });
    }

    if (search) {
      // Search for species (try with auth)
      try {
        const response = await client.species.search({
          q: search,
        });

        const results = 'results' in response ? response.results : response;
        // Limit results on the client side
        const limitedResults = Array.isArray(results)
          ? results.slice(0, parseInt(limit))
          : results;
        return NextResponse.json({ results: limitedResults });
      } catch (searchError) {
        console.log('Species search not available:', searchError);
        return NextResponse.json({ results: [] });
      }
    }

    // Get species from region species lists (fallback)
    const listsResponse = await client.regionSpeciesLists.list();

    if (listsResponse && listsResponse.length > 0) {
      // Get species from the first available list
      const firstListId = listsResponse[0].id;
      const species = await client.regionSpeciesLists.getSpecies(firstListId);

      // Return limited species
      const results = species.slice(0, parseInt(limit));
      return NextResponse.json({ results });
    } else {
      return NextResponse.json({ results: [] });
    }
  } catch (error) {
    console.error('Error fetching species:', error);

    // Fallback: return empty results instead of error to avoid breaking the UI
    return NextResponse.json({ results: [] });
  }
}
