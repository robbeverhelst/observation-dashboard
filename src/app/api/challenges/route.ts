import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';

export async function GET() {
  try {
    // During build time, return empty results
    if (process.env.NODE_ENV === 'production' && !process.env.OAUTH_CLIENT_ID) {
      return NextResponse.json({ results: [] });
    }

    const challenges = await client.challenges();
    const response = await challenges.list();

    // Handle response format - could be paginated or direct array
    const results = 'results' in response ? response.results : response;
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges', results: [] },
      { status: 500 }
    );
  }
}
