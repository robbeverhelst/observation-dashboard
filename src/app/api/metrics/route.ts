import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import the metrics module to trigger metric registration
    await import('@/lib/metrics');

    // Get the OpenTelemetry metrics registry
    const metricsPromise = import('prom-client').then((promClient) => {
      // Get all registered metrics from the default registry
      return promClient.register.metrics();
    });

    const metricsOutput = await metricsPromise;

    return new NextResponse(metricsOutput, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}
