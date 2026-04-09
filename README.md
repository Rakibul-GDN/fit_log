# LogFit — Workout Logging Platform

A full-stack workout logging platform built with Next.js 15 App Router, enabling users to manage routines, log workouts, track progress, and maintain a personal exercise library.

## Architecture

```
fit_log/
├── src/
│   ├── app/              # Next.js App Router (pages + API routes)
│   │   ├── (auth)/       # Auth route group (login, register, verify-email)
│   │   ├── (dashboard)/  # Authenticated routes (routines, workouts, exercises, progress, settings)
│   │   └── api/          # Backend API route handlers
│   ├── components/       # Shared UI components
│   │   ├── ui/           # Base primitives (Button, Input, Card, Modal)
│   │   ├── forms/        # Form components (Login, Register, Routine, Workout)
│   │   ├── layout/       # Layout components (Header, Sidebar, DashboardLayout)
│   │   ├── charts/       # Data visualization (ProgressChart)
│   │   └── feedback/     # Loading states, skeletons, error boundaries, toasts
│   ├── hooks/            # Custom React hooks
│   │   ├── api/          # React Query hooks for API data fetching
│   │   └── ui/           # UI hooks (useToast)
│   ├── lib/              # Shared utilities
│   │   ├── api/          # Axios client, response transformers, validators
│   │   ├── utils/        # Unit converters, formatters
│   │   └── services/     # Auth, email, Prisma services
│   ├── store/            # Zustand stores (auth, UI, settings)
│   └── types/            # TypeScript type definitions
├── prisma/               # Database schema, migrations, seed script
└── tests/                # Test suites (contract, integration, component, E2E)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5+ (`strict: true`) |
| UI | HeroUI v3 + Tailwind CSS |
| Animations | Framer Motion |
| API Client | Axios + React Query |
| State | Zustand |
| Auth | NextAuth.js v5 (Credentials) |
| Database | PostgreSQL + Prisma ORM |
| Email | Resend |
| Forms | React Hook Form + Zod |
| Testing | Vitest + React Testing Library + Playwright |

## Features

- **Authentication**: Email/password registration with email verification, password reset
- **Routine Management**: Create/edit/delete weekly workout routines with exercise assignments
- **Workout Logging**: Manual logging + quick-log from routines (pre-filled defaults)
- **Exercise Library**: Browse default exercises, create custom personal exercises
- **Progress Tracking**: Weight/volume progression charts, body measurements
- **Settings**: Account management, preferred units (metric/imperial), account deletion

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your database URL, NextAuth secret, and Resend API key.

3. **Initialize the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Development

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm test` | Run Vitest unit/integration tests |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | TypeScript type check |
| `npx playwright test` | Run E2E tests |

### Database

```bash
npx prisma studio          # Open Prisma GUI
npx prisma migrate dev     # Create and apply migration
npx prisma db seed         # Seed default exercise library
```

## Testing Strategy

- **Contract Tests**: Verify API response shapes match TypeScript types
- **Integration Tests**: Full user flows (auth, CRUD, data isolation)
- **Component Tests**: React Testing Library for form validation and UI behavior
- **E2E Tests**: Playwright for critical user journeys across browsers

```bash
npm test                    # Unit + contract + integration + component tests
npx playwright test         # E2E tests (requires running dev server)
```

## API Response Contract

All API routes return standardized JSON envelopes:

**Success (single)**:
```json
{ "success": true, "data": { ... } }
```

**Success (paginated)**:
```json
{
  "success": true,
  "data": [...],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 50, "totalPages": 3 }
}
```

**Error**:
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { ... } }
}
```

## License

MIT
