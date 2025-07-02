import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';

export async function GET() {
  try {
    const challenges = await client.challenges();
    const response = await challenges.list();

    // Handle response format - could be paginated or direct array
    const results = 'results' in response ? response.results : response;
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}
