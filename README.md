# Observation Explorer

A real-time biodiversity data dashboard built with Next.js and the observation-js API, showcasing live data from the Observation International platform.

## ✨ Features

- **Real-time Data**: Live biodiversity data from the observation database
- **6-Tab Interface**: Challenges, Countries, Species, Lists, Regions, and Insights
- **Universal Detail Modal**: Click any item to view detailed information
- **Responsive Design**: Modern UI built with shadcn/ui components
- **Type Safety**: Full TypeScript support with custom observation-js types
- **Automated CI/CD**: GitHub Actions pipeline with formatting, linting, and builds

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **API Integration**: observation-js library
- **Package Manager**: Bun
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/robbeverhelst/observation-explorer.git
cd observation-explorer

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the dashboard.

## 📋 Available Scripts

### Development

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run format       # Format code with Prettier
bun run format:check # Check code formatting
bun run ci           # Run full CI pipeline (format + lint + build)
```

### Docker

```bash
bun run docker:build    # Build production Docker image
bun run docker:run      # Run production container
bun run docker:prod     # Start production with docker-compose
bun run docker:dev      # Start development with docker-compose (port 3001)
bun run docker:stop     # Stop all containers
bun run docker:clean    # Complete cleanup
```

### Testing

```bash
bun run test:all        # Run all tests (format, lint, build)
bun run test:build      # Test Next.js build
bun run test:lint       # Test ESLint
bun run test:format     # Test Prettier formatting
bun run test:docker     # Test Docker build and run
bun run health-check    # Test if app is responding
```

### Release & Deployment

```bash
bun run release         # Create semantic release
bun run release:dry     # Dry run semantic release
bun run deploy:prod     # Deploy using production image
bun run deploy:stop     # Stop production deployment
bun run deploy:logs     # View deployment logs
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (CORS proxy)
│   │   ├── challenges/    # Biodiversity challenges
│   │   ├── countries/     # Geographic countries
│   │   ├── regions/       # Geographic regions
│   │   ├── species/       # Individual species
│   │   └── species-groups/ # Species lists
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/
│   ├── ui/                # shadcn/ui components
│   └── DetailModal.tsx    # Universal detail modal
├── lib/
│   └── utils.ts           # Utility functions
└── types/
    └── observation-js.d.ts # TypeScript declarations
```

## 🌐 API Integration

The dashboard uses Next.js API routes as a proxy to bypass CORS restrictions when fetching data from the observation platform. Each route corresponds to different data types:

- `/api/challenges` - Biodiversity challenges
- `/api/countries` - Geographic countries
- `/api/regions` - Geographic regions
- `/api/species` - Individual species data
- `/api/species-groups` - Regional species lists

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) components:

- Cards for data display
- Tabs for navigation
- Badges for status indicators
- Dialog modal for detail views
- Responsive grid layouts

## 🚀 CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline using GitHub Actions:

### Workflow Steps

1. **Test**: Runs formatting, linting, and build tests
2. **Release**: Uses semantic-release for automated versioning
3. **Build & Push**: Builds and pushes Docker images to GitHub Container Registry

### Semantic Versioning

- **feat:** - New features (minor version bump)
- **fix:** - Bug fixes (patch version bump)
- **BREAKING CHANGE:** - Breaking changes (major version bump)
- **chore:** - Maintenance tasks (no version bump)

### Docker Images

Images are automatically built and pushed to:

- `ghcr.io/robbeverhelst/observation-explorer:latest`
- `ghcr.io/robbeverhelst/observation-explorer:v1.2.3` (tagged versions)

### Deployment

Use the included deployment script for production deployments:

```bash
# Deploy specific version
IMAGE_NAME=ghcr.io/robbeverhelst/observation-explorer:v1.2.3 ./scripts/deploy.sh

# Deploy latest
./scripts/deploy.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 💝 Support

If you find this project helpful, consider supporting the development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-robbeverhec-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/robbeverhec)

## 🔗 Related Projects

- [observation-js](https://github.com/robbeverhelst/observation-js) - TypeScript client for the observation API
- [observation-js Documentation](https://robbeverhelst.github.io/observation-js/) - API documentation

---

Built with ❤️ by [Robbe Verhelst](https://github.com/robbeverhelst)
