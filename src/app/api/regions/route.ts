import { NextResponse } from 'next/server';
import { ObservationClient } from 'observation-js';

const client = new ObservationClient();

export async function GET() {
  try {
    const response = await client.regions.list();

    // response is Region[], wrap in results format for consistency
    return NextResponse.json({ results: response });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}
