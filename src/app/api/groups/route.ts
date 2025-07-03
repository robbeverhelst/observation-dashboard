import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';
import { withCache } from '@/lib/redis';
import { withCacheHeaders } from '@/middleware/cache-headers';

export async function GET() {
  try {
    const groupsData = await withCache(
      'groups:all',
      async () => {
        const groups = await client.groups();
        return await groups.list();
      },
      { ttl: 86400, prefix: 'api' } // Cache for 24 hours
    );

    return withCacheHeaders(
      NextResponse.json(groupsData),
      { maxAge: 3600, sMaxAge: 86400 } // 1 hour browser, 24 hour CDN
    );
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}
