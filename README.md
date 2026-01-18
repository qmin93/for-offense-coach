# ForOffensiveCoordinator

[한국어](README.ko.md) | **English**

> Football Play Diagramming Tool for Coaches

Create professional play diagrams in under 3 minutes with context-aware concept recommendations and auto-build functionality.

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Features

### Core Editor
- SVG-based field rendering with drag & drop players
- Route, Block, Motion, Text, Landmark actions
- Multi-select (Shift+Click) and Bulk Delete (Del/Backspace)
- Copy/Paste (Ctrl+C/V) with cross-tab support
- Alignment guides on drag
- Undo/Redo (Ctrl+Z/Y)

### Auto-Build System
- Context-aware concept recommendations
- One-click play generation from concepts
- Formation validation with 7 on LOS rule
- Error/Warning feedback system

### Playbook Management
- Multi-section playbooks with tags and filters
- Install Plan Generator with day-based scheduling
- Drill connections and coaching emphasis

### Formation Packages
- 12+ formation presets (Trips, Bunch, Empty, etc.)
- Personnel display (11/12/21)
- Context-based formation recommendations

### Export & Share
- High-res PNG export (2x scale)
- PDF export with 10 page limit
- View-only share links with fork capability
- Mobile-optimized viewer with pinch zoom

### Plan Tiers

| Tier | Plays | Playbooks | Exports/mo | Price |
|------|-------|-----------|------------|-------|
| Free | 5 | 1 | 10 | $0 |
| Team | 50 | 10 | 100 | $19/mo |
| Season | Unlimited | Unlimited | Unlimited | $49/mo |

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Database**: Prisma + PostgreSQL
- **Auth**: NextAuth.js
- **Testing**: Playwright (E2E)

## Documentation

- [MVP Summary](docs/MVP_SUMMARY.md) - Complete feature documentation
- [DSL Specification](docs/DSL_SPECIFICATION.md) - Play data schema
- [PRD](docs/PRD.md) - Product requirements
- [User Flow Spec](docs/USER_FLOW_SPEC.md) - User journey documentation

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── editor/[playId]/    # Play editor
│   ├── playbook/           # Playbook management
│   └── s/[token]/          # Share viewer
├── components/ui/          # Reusable UI components
├── contexts/               # React contexts (Plan tier)
├── domain/
│   ├── dsl/                # DSL types and schema
│   ├── engine/             # Auto-build, concepts
│   └── render/             # SVG renderer
├── features/
│   └── editor/             # Editor feature module
│       ├── components/     # Editor components
│       └── store.ts        # Zustand store
├── hooks/                  # Custom React hooks
└── lib/                    # Utilities (telemetry, etc.)
```

## Testing

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright E2E tests |

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## License

MIT

---

**MVP Status: 99%+ Complete**

See [docs/MVP_SUMMARY.md](docs/MVP_SUMMARY.md) for detailed feature documentation.
