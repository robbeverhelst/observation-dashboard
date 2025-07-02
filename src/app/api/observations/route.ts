import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const speciesId = searchParams.get('species_id');
    const limit = searchParams.get('limit') || '50';

    if (speciesId) {
      // Get observations for a specific species
      const response = await client.species.getObservations(
        parseInt(speciesId),
        {
          limit: parseInt(limit),
        }
      );

      const results = 'results' in response ? response.results : response;
      return NextResponse.json({ results });
    } else {
      // Return empty array for now (observation search may not be available)
      return NextResponse.json({ results: [] });
    }
  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch observations' },
      { status: 500 }
    );
  }
}
