export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('📊 Server instrumentation loaded');

    // Warm cache on server start in production
    if (process.env.NODE_ENV === 'production' && process.env.OAUTH_CLIENT_ID) {
      const { warmCache } = await import('@/lib/cache-warmer');
      warmCache().catch(console.error);
    }
  }
}
