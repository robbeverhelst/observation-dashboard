import { metrics } from '@opentelemetry/api';

// Get the meter for our service
const meter = metrics.getMeter('observation-explorer', '1.0.0');

// Cache Performance Metrics
export const cacheHitCounter = meter.createCounter('cache_hits_total', {
  description: 'Total number of cache hits',
});

export const cacheMissCounter = meter.createCounter('cache_misses_total', {
  description: 'Total number of cache misses',
});

export const cacheOperationDuration = meter.createHistogram(
  'cache_operation_duration_ms',
  {
    description: 'Duration of cache operations in milliseconds',
  }
);

// External API Metrics (waarneming.nl)
export const externalApiCounter = meter.createCounter(
  'external_api_requests_total',
  {
    description: 'Total number of external API requests',
  }
);

export const externalApiDuration = meter.createHistogram(
  'external_api_duration_ms',
  {
    description: 'Duration of external API requests in milliseconds',
  }
);

// Business Logic Metrics
export const observationsDisplayedCounter = meter.createCounter(
  'observations_displayed_total',
  {
    description: 'Total number of observations displayed to users',
  }
);

export const newDataDetectionCounter = meter.createCounter(
  'new_data_detections_total',
  {
    description: 'Total number of new data detections',
  }
);

export const userRefreshCounter = meter.createCounter(
  'user_refresh_actions_total',
  {
    description: 'Total number of user-initiated refresh actions',
  }
);

export const errorCounter = meter.createCounter('application_errors_total', {
  description: 'Total number of application errors',
});

// Request Deduplication Metrics
export const requestDeduplicationCounter = meter.createCounter(
  'request_deduplication_total',
  {
    description: 'Total number of request deduplication events',
  }
);

// Prefetching Metrics
export const prefetchCounter = meter.createCounter('prefetch_requests_total', {
  description: 'Total number of prefetch requests',
});

export const prefetchDuration = meter.createHistogram('prefetch_duration_ms', {
  description: 'Duration of prefetch operations in milliseconds',
});

// SWR Cache Metrics
export const swrCacheCounter = meter.createCounter('swr_cache_requests_total', {
  description: 'Total number of SWR cache requests',
});

export const swrCacheDuration = meter.createHistogram('swr_cache_duration_ms', {
  description: 'Duration of SWR cache operations in milliseconds',
});

export const swrRevalidationCounter = meter.createCounter(
  'swr_revalidations_total',
  {
    description: 'Total number of SWR background revalidations',
  }
);

// Cache Invalidation Metrics
export const cacheInvalidationCounter = meter.createCounter(
  'cache_invalidations_total',
  {
    description: 'Total number of cache invalidation events',
  }
);

export const cacheInvalidationDuration = meter.createHistogram(
  'cache_invalidation_duration_ms',
  {
    description: 'Duration of cache invalidation operations in milliseconds',
  }
);

// Page Performance Metrics
export const pageLoadDuration = meter.createHistogram('page_load_duration_ms', {
  description: 'Page load duration in milliseconds',
});

// Redis Connection Metrics
export const redisConnectionGauge = meter.createUpDownCounter(
  'redis_connections_active',
  {
    description: 'Number of active Redis connections',
  }
);

// Helper functions for easy metric recording
export const recordCacheHit = (
  cacheType: string,
  keyPrefix: string,
  duration: number
) => {
  cacheHitCounter.add(1, {
    cache_type: cacheType,
    key_prefix: keyPrefix,
  });
  cacheOperationDuration.record(duration, {
    operation: 'get',
    cache_type: cacheType,
    result: 'hit',
  });
};

export const recordCacheMiss = (
  cacheType: string,
  keyPrefix: string,
  duration: number
) => {
  cacheMissCounter.add(1, {
    cache_type: cacheType,
    key_prefix: keyPrefix,
  });
  cacheOperationDuration.record(duration, {
    operation: 'get',
    cache_type: cacheType,
    result: 'miss',
  });
};

export const recordExternalApiCall = (
  service: string,
  endpoint: string,
  status: string,
  duration: number
) => {
  externalApiCounter.add(1, {
    service,
    endpoint,
    status,
  });
  externalApiDuration.record(duration, {
    service,
    endpoint,
  });
};

export const recordObservationsDisplayed = (
  count: number,
  viewMode: string,
  dataSource: string
) => {
  observationsDisplayedCounter.add(count, {
    view_mode: viewMode,
    data_source: dataSource,
  });
};

export const recordNewDataDetection = (method: string) => {
  newDataDetectionCounter.add(1, {
    detection_method: method,
  });
};

export const recordUserRefresh = (refreshType: string, page: string) => {
  userRefreshCounter.add(1, {
    refresh_type: refreshType,
    page,
  });
};

export const recordError = (
  errorType: string,
  component: string,
  severity: 'low' | 'medium' | 'high' | 'critical'
) => {
  errorCounter.add(1, {
    error_type: errorType,
    component,
    severity,
  });
};

export const recordPageLoad = (
  page: string,
  cacheStatus: string,
  duration: number
) => {
  pageLoadDuration.record(duration, {
    page,
    cache_status: cacheStatus,
  });
};

export const recordRequestDeduplication = (
  result: 'hit' | 'miss',
  prefix: string
) => {
  requestDeduplicationCounter.add(1, {
    result,
    prefix,
  });
};

export const recordPrefetch = (
  type: string,
  priority: string,
  status: 'success' | 'error',
  duration: number
) => {
  prefetchCounter.add(1, {
    type,
    priority,
    status,
  });
  prefetchDuration.record(duration, {
    type,
    priority,
  });
};

export const recordSWRCache = (
  result: 'fresh' | 'stale' | 'miss',
  cacheType: string,
  duration: number,
  revalidating: boolean = false
) => {
  swrCacheCounter.add(1, {
    result,
    cache_type: cacheType,
    revalidating: revalidating.toString(),
  });
  swrCacheDuration.record(duration, {
    result,
    cache_type: cacheType,
  });
};

export const recordSWRRevalidation = (
  status: 'success' | 'error',
  cacheType: string,
  duration: number
) => {
  swrRevalidationCounter.add(1, {
    status,
    cache_type: cacheType,
  });
  swrCacheDuration.record(duration, {
    result: 'revalidation',
    cache_type: cacheType,
  });
};

export const recordCacheInvalidation = (
  method: 'tag' | 'pattern' | 'rule' | 'manual',
  target: string,
  entriesInvalidated: number,
  duration: number
) => {
  cacheInvalidationCounter.add(entriesInvalidated, {
    method,
    target,
  });
  cacheInvalidationDuration.record(duration, {
    method,
    target,
  });
};
