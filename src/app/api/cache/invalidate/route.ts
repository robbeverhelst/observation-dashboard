import { NextRequest, NextResponse } from 'next/server';
import { invalidationManager } from '@/lib/cache-invalidation-advanced';
import { swrCache } from '@/lib/cache-swr';
import { recordCacheInvalidation } from '@/lib/metrics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method = 'rule', target, reason = 'manual', data } = body;

    if (!target) {
      return NextResponse.json(
        { error: 'Target is required' },
        { status: 400 }
      );
    }

    console.log(
      `🔄 Cache invalidation API called: ${method}:${target} (${reason})`
    );
    const startTime = Date.now();
    let invalidatedCount = 0;

    switch (method) {
      case 'tag':
        invalidatedCount = await swrCache.invalidateByTag(target);
        break;

      case 'pattern':
        const prefix = target.replace('*', '').replace(':', '');
        invalidatedCount = await swrCache.clear(prefix);
        break;

      case 'rule':
        invalidatedCount = await invalidationManager.invalidateByRule(
          target,
          data
        );
        break;

      case 'smart':
        if (!data || !data.type) {
          return NextResponse.json(
            { error: 'Smart invalidation requires data.type' },
            { status: 400 }
          );
        }
        invalidatedCount = await invalidationManager.smartInvalidate(
          target,
          data
        );
        break;

      case 'manual':
        invalidatedCount = await invalidationManager.manualInvalidate(
          target,
          reason
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown invalidation method: ${method}` },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;

    // Record metrics
    recordCacheInvalidation(method, target, invalidatedCount, duration);

    return NextResponse.json({
      success: true,
      method,
      target,
      reason,
      invalidatedCount,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache invalidation API error:', error);
    return NextResponse.json(
      {
        error: 'Cache invalidation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        // Get invalidation manager stats
        const managerStats = invalidationManager.getStats();

        // Get SWR cache stats
        const cacheStats = await swrCache.getStats();

        return NextResponse.json({
          invalidationManager: managerStats,
          swrCache: cacheStats,
          timestamp: new Date().toISOString(),
        });

      case 'rules':
        // List available invalidation rules
        const rules = invalidationManager.getStats().rules;
        return NextResponse.json({
          rules,
          count: rules.length,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action. Use ?action=stats or ?action=rules' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cache invalidation API GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get cache information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
