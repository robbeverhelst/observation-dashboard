# Documentation Index

This directory contains all project documentation organized by category.

## 📁 Documentation Structure

### Core Documentation

- **[PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)** - Complete performance guide (caching, monitoring, optimization strategies)
- **[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)** - Feature development roadmap and strategy
- **[PROGRESS.md](./PROGRESS.md)** - Feature completion tracking and status

### Development Guidelines

- **[CLAUDE.md](./CLAUDE.md)** - Project instructions for Claude development assistance
- **[PAGE_LAYOUTS.md](./PAGE_LAYOUTS.md)** - UI/UX design specifications and wireframes

### Infrastructure Documentation

- **[infrastructure/README.md](./infrastructure/README.md)** - Infrastructure deployment guide
- **[infrastructure/MONITORING.md](./infrastructure/MONITORING.md)** - Prometheus monitoring setup
- **[infrastructure/grafana.md](./infrastructure/grafana.md)** - Grafana dashboard configuration

## 🎯 Quick Reference

### Performance & Optimization

- **Current Status**: 75-100% API usage reduction achieved
- **Technologies**: Redis, SWR pattern, request deduplication, intelligent prefetching
- **Monitoring**: Prometheus metrics, Grafana dashboards
- **Details**: See [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)

### Development Features

- **Core Features**: Observations, Species, User Dashboard (3 main areas)
- **Technical Stack**: Next.js 15, TypeScript, observation-js SDK
- **Status**: Phase 1-3 implementation complete
- **Details**: See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)

### Infrastructure

- **Deployment**: Docker with Pulumi infrastructure as code
- **Monitoring**: Prometheus + Grafana stack
- **Caching**: Redis with advanced invalidation strategies
- **Details**: See [infrastructure/](./infrastructure/) folder

## 📋 Document Types

| Type           | Purpose                   | Audience            |
| -------------- | ------------------------- | ------------------- |
| **Guides**     | Step-by-step instructions | Developers          |
| **References** | Technical specifications  | Developers/DevOps   |
| **Plans**      | Feature roadmaps          | Product/Development |
| **Status**     | Progress tracking         | All stakeholders    |

## 🔄 Maintenance

- **PERFORMANCE_OPTIMIZATION.md**: Updated when new optimizations are implemented
- **DEVELOPMENT_PLAN.md**: Updated when features are completed or new features planned
- **PROGRESS.md**: Updated after each feature completion
- **Infrastructure docs**: Updated when deployment or monitoring changes

---

For the main project overview, see the [root README.md](../README.md).
