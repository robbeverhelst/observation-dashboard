# Observation Dashboard

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
git clone https://github.com/robbeverhelst/observation-dashboard.git
cd observation-dashboard

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the dashboard.

## 📋 Available Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run format       # Format code with Prettier
bun run format:check # Check code formatting
bun run ci           # Run full CI pipeline (format + lint + build)
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
