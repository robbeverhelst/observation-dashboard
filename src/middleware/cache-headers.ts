import { NextResponse } from 'next/server';

export function withCacheHeaders(
  response: NextResponse,
  options: {
    maxAge?: number; // Browser cache in seconds
    sMaxAge?: number; // CDN cache in seconds
    staleWhileRevalidate?: number;
  } = {}
) {
  const { maxAge = 300, sMaxAge = 600, staleWhileRevalidate = 86400 } = options;

  response.headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );

  return response;
}
