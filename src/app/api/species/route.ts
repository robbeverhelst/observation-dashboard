import { NextResponse } from 'next/server';
import { ObservationClient } from 'observation-js';

const client = new ObservationClient();

export async function GET() {
  try {
    // First get the region species lists
    const listsResponse = await client.regionSpeciesLists.list();

    if (listsResponse && listsResponse.length > 0) {
      // Get species from the first available list
      const firstListId = listsResponse[0].id;
      const species = await client.regionSpeciesLists.getSpecies(firstListId);

      // Return all species (no limit)
      const results = species;

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
