# Observation Explorer 2.0 - Project Instructions

## 📋 **Current Development Plan**

**⚠️ IMPORTANT: The detailed development plan has been moved to `DEVELOPMENT_PLAN.md`**

Please refer to [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) for the complete, up-to-date development strategy including:

- **Three Core Features**: Observations, Species, User Dashboard
- **Phased Development Approach**: Basic → Enhanced implementation
- **API Integration Details**: Specific observation-js endpoint usage
- **Technical Architecture**: Authentication, data flow, components
- **Implementation Timelines**: Week-by-week development phases

## 📊 **Progress Tracking**

**⚠️ CRITICAL: Always update [`PROGRESS.md`](./PROGRESS.md) when features are completed**

Track development progress with detailed checkboxes for each feature:

- **Phase 1**: Basic Observations View (Map, Table, Details)
- **Phase 2**: Basic Species View (Browser, Profiles, Data)
- **Phase 3**: Basic User Dashboard (Auth, Stats, Achievements)
- **Phase 4**: Enhanced Features (Advanced functionality)

**📝 Update Rules:**

- Check off tasks immediately when completed
- Update "Last Updated" date and completion count
- Reference this file in commit messages for completed features

## 🎨 **Page Layouts & Design**

**Visual specifications for all pages: [`PAGE_LAYOUTS.md`](./PAGE_LAYOUTS.md)**

Detailed layout wireframes and component specifications:

- **Home Page**: Hero section with stats and quick access
- **Observations Page**: Map/table views with filtering
- **Species Pages**: Browser grid and detailed profiles
- **User Dashboard**: Personal stats, maps, and achievements
- **Mobile Layouts**: Responsive adaptations and navigation

## 🎯 **Project Focus**

The current iteration focuses on three main areas:

1. **📍 Observations**: Map and table views with detailed observation pages
2. **🦋 Species**: Comprehensive species browser and profile pages
3. **👤 User Dashboard**: Personal statistics and achievement tracking

## 🔧 **Technical Stack**

- **Framework**: Next.js 15+ with App Router
- **API**: observation-js SDK for waarneming.nl data
  - **Documentation**: https://robbeverhelst.github.io/observation-js/
- **Authentication**: Google OAuth + optional waarneming.nl linking
- **Maps**: Mapbox GL for geographic visualization
- **UI Components**: shadcn/ui with Tailwind CSS

## 📝 **Development Guidelines**

### **Type Safety & API Integration**

- **ALWAYS use observation-js types** as the base for our interfaces
- **Import types from observation-js** before creating custom ones
- **Extend observation-js types** rather than recreating them
- **Keep code clean** by leveraging the existing type system

Example:

```typescript
import type { Observation, Species, User } from 'observation-js';

// Extend existing types rather than recreate
interface ObservationWithLocation extends Observation {
  displayLocation?: string;
}
```

---

## Development Commands

### Essential Commands

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier
- `bun run ci` - Run full CI pipeline (format + lint + build)

### Testing

- `bun run test:all` - Run all tests (format, lint, build)
- `bun run test:build` - Test Next.js build
- `bun run test:lint` - Test ESLint
- `bun run test:format` - Test Prettier formatting

Always run `bun run ci` before committing to ensure code quality.
