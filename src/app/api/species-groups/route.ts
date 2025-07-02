import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'groups';

    if (type === 'groups') {
      // Get species groups/categories
      const species = await client.species();
      const response = await species.listGroups();
      const results = 'results' in response ? response.results : response;
      return NextResponse.json({ results });
    } else {
      // Get regional species lists (existing functionality)
      const regionSpeciesLists = await client.regionSpeciesLists();
      const response = await regionSpeciesLists.list();
      const results = Array.isArray(response) ? response : [];
      return NextResponse.json({ results });
    }
  } catch (error) {
    console.error('Error fetching species data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch species data' },
      { status: 500 }
    );
  }
}
