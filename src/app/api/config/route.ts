import { NextResponse } from 'next/server';

export async function GET() {
  // Only return non-sensitive configuration
  return NextResponse.json({
    mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
  });
}
