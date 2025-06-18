import { NextResponse } from 'next/server';
import { ObservationClient } from 'observation-js';

const client = new ObservationClient();

export async function GET() {
  try {
    // Get real species lists from the observation database
    const response = await client.regionSpeciesLists.list();

    // The API returns an array directly, so wrap it in results format
    const results = Array.isArray(response) ? response : [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching species data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch species data' },
      { status: 500 }
    );
  }
}
