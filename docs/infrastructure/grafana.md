# Grafana Dashboard for Observation Explorer

This directory contains Grafana dashboard configurations for monitoring the Observation Explorer application in production.

## Dashboard Overview

The `observation-explorer-dashboard.json` provides comprehensive monitoring across six key areas:

### 📊 **System Overview**

- **API Response Time (P95)**: 95th percentile response times with thresholds
- **Request Rate**: Requests per second to gauge traffic load
- **Error Rate**: Application errors per second with alerting thresholds
- **Active Users**: User activity based on refresh actions

### 🚀 **Cache Performance**

- **Cache Hit Rate**: Percentage with color-coded thresholds (Red <70%, Yellow 70-85%, Green >85%)
- **Cache Operations by Type**: Hits vs misses broken down by cache key prefix (observations, species, etc.)

### 🌐 **External API Monitoring**

- **API Request Rate**: Calls to waarneming.nl by endpoint and status
- **Success vs Error Rate**: Visual comparison of successful vs failed external API calls

### 👥 **User Engagement**

- **Observations Displayed**: Track data consumption by view mode (map vs table)
- **User Refresh Actions**: Monitor user interactions (normal vs force refresh)
- **New Data Detections**: Real-time data discovery events

### 🔧 **Application Health**

- **Memory Usage**: RSS memory, Node.js heap usage and limits
- **HTTP Status Codes**: Distribution of response codes over time

### ⚠️ **Error Analysis**

- **Application Errors by Type**: Breakdown by error type and severity level
- **Error Rate by Component**: Which parts of the application are failing

### 📈 **Performance Insights**

- **Top Slow Endpoints**: Table showing the 10 slowest API endpoints
- **Cache Efficiency by Endpoint**: Hit rate percentage for each cached resource

## Features

### Auto-Refresh

- **30-second refresh**: Keeps data current for real-time monitoring
- **1-hour time window**: Shows recent performance trends

### Dynamic Templating

- **Namespace selector**: Switch between different deployments
- **Auto-detection**: Automatically discovers observation-explorer services

### Annotations

- **Deployment markers**: Automatically marks when new deployments occur
- **Visual indicators**: Blue markers show when the application restarts

### Color-Coded Thresholds

- **Green**: Good performance (cache hit >85%, response time <1s)
- **Yellow**: Warning levels (cache hit 70-85%, response time 1-3s)
- **Red**: Critical levels (cache hit <70%, response time >3s, errors >5/sec)

## Installation

### Import Dashboard

1. Open Grafana UI
2. Go to **Dashboards** → **Import**
3. Upload `observation-explorer-dashboard.json`
4. Select your Prometheus data source
5. Configure any template variables if needed

### Prerequisites

- Prometheus data source configured in Grafana
- ServiceMonitor deployed and scraping metrics from the application
- Prometheus Operator running in your cluster

## Usage

### Key Metrics to Monitor

**🎯 Performance Indicators:**

- API response time should stay under 1 second (P95)
- Cache hit rate should be above 85%
- Error rate should be near zero

**📊 User Experience:**

- Monitor observations displayed to track data consumption
- Watch new data detections for real-time system health
- Track refresh patterns to understand user behavior

**🔍 Troubleshooting:**

- Use error analysis panels when issues arise
- Check external API status if data seems stale
- Monitor memory usage for resource planning

### Alerting Recommendations

Consider setting up alerts for:

- Cache hit rate below 70%
- API response time P95 above 3 seconds
- Error rate above 5 errors per second
- External API failure rate above 10%

## Customization

### Adding Panels

The dashboard uses standard Prometheus queries. Add new panels by:

1. Click **Add Panel**
2. Use metric names from our custom metrics (see `src/lib/metrics.ts`)
3. Follow the naming pattern: `{metric_name}_total` for counters

### Modifying Thresholds

Update color thresholds in panel settings based on your performance requirements:

- **Field Config** → **Thresholds** → **Edit**

### Time Ranges

Default queries use `[5m]` rate windows. Adjust based on your monitoring needs:

- `[1m]` for more responsive metrics
- `[15m]` for smoother trend lines

## Metric Reference

All metrics collected by the ServiceMonitor:

- `cache_hits_total` - Cache hit events by type and key prefix
- `cache_misses_total` - Cache miss events by type and key prefix
- `external_api_requests_total` - External API calls with status
- `observations_displayed_total` - Data shown to users by view mode
- `user_refresh_actions_total` - User interactions by type
- `new_data_detections_total` - Real-time data discovery events
- `application_errors_total` - Application errors by type and severity
