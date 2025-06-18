import { NextResponse } from 'next/server';
import { ObservationClient } from 'observation-js';

const client = new ObservationClient();

export async function GET() {
  try {
    const response = await client.countries.list();

    // Handle response format - could be paginated or direct array
    const results = 'results' in response ? response.results : response;
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
