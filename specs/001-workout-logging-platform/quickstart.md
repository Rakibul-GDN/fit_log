# Quickstart Guide: LogFit Workout Logging Platform

**Feature**: 001-workout-logging-platform
**Date**: 2026-04-09
**Audience**: Developers setting up local development environment

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** 9+ or **npm** 10+
- **PostgreSQL** 15+ (running locally on port 5432)
- **Git**

---

## 1. Clone & Install

```bash
git clone <repository-url>
cd fit_log
npm install
```

---

## 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# Database — update with your local PostgreSQL credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/fitlog"

# NextAuth — generate a secure secret
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend) — get API key from https://resend.com
RESEND_API_KEY="<your-resend-api-key>"
EMAIL_FROM="noreply@fitlog.com"

# App
NODE_ENV="development"
```

Generate a NextAuth secret:

```bash
openssl rand -base64 32
```

---

## 3. Database Setup

```bash
# Run Prisma migrations (creates database schema)
npx prisma migrate dev --name init

# Seed the database with default exercise library
npx prisma db seed
```

---

## 4. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## 5. First-Time Setup Flow

1. Navigate to `http://localhost:3000/register`
2. Create an account with email + password
3. **Email verification**: Check your email inbox (or ETHereal inbox for local dev) and click the verification link
4. Log in with your verified credentials
5. You'll be redirected to the dashboard

---

## 6. Key Development Commands

| Command                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `npm run dev`              | Start development server with hot reloading     |
| `npm run build`            | Build for production                            |
| `npm run start`            | Start production server                         |
| `npm run lint`             | Run ESLint                                      |
| `npm run lint:fix`         | Run ESLint with auto-fix                        |
| `npm run type-check`       | Run TypeScript compiler (`tsc --noEmit`)        |
| `npm run format`           | Format code with Prettier                       |
| `npm test`                 | Run all tests (Vitest)                          |
| `npm test:watch`           | Run tests in watch mode                         |
| `npm run test:e2e`         | Run E2E tests (Playwright)                      |
| `npx prisma studio`        | Open Prisma Studio (database GUI)               |
| `npx prisma migrate dev`   | Create and apply a new migration                |
| `npx prisma migrate reset` | Reset database and re-run migrations            |
| `npx prisma generate`      | Regenerate Prisma client (after schema changes) |

---

## 7. Project Structure Overview

```
fit_log/
├── prisma/                  # Database schema & migrations
├── src/
│   ├── app/                 # Next.js App Router (pages + API routes)
│   │   ├── (auth)/          # Public auth pages
│   │   ├── (dashboard)/     # Protected dashboard pages
│   │   └── api/             # API route handlers
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks (React Query)
│   ├── lib/                 # Utilities (API client, formatters, validators)
│   ├── store/               # Zustand stores (global client state)
│   └── types/               # TypeScript type definitions
├── tests/                   # Test suites (contract, integration, component, E2E)
└── public/                  # Static assets
```

---

## 8. Testing Workflow (TDD)

Following our constitution's TDD mandate:

```bash
# 1. Write a failing test first
# Example: tests/contract/routines.test.ts

# 2. Run tests in watch mode
npm run test:watch

# 3. Implement the feature until test passes
# Example: src/app/api/routines/route.ts

# 4. Refactor with confidence
# 5. Commit
```

**Test organization**:

- `tests/contract/` — API response shape validation
- `tests/integration/` — Multi-step flows with real DB
- `tests/components/` — Component behavior (React Testing Library)
- `tests/e2e/` — Full user journeys (Playwright)

---

## 9. Common Tasks

### Adding a New API Route

1. Define the route handler in `src/app/api/[resource]/route.ts`
2. Add Zod validation schema in `src/types/forms.ts` or `src/types/api.ts`
3. Write contract tests in `tests/contract/[resource].test.ts`
4. Implement the route handler
5. Create React Query hook in `src/hooks/api/use[Resource].ts`

### Adding a New Component

1. Create component in `src/components/[category]/[ComponentName].tsx`
2. Write component tests in `tests/components/[category]/`
3. Export from `src/components/[category]/index.ts`
4. Use in pages via import

### Database Schema Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name describe_your_change
# 3. Regenerate client
npx prisma generate
```

---

## 10. Troubleshooting

**PostgreSQL connection refused**:

```bash
# Ensure PostgreSQL is running
# macOS: brew services start postgresql
# Windows: Check Services app for PostgreSQL service
```

**Prisma migration fails**:

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

**Email not sending in development**:

- Resend requires a valid API key; for local dev, consider using ETHereal.email via Nodemailer
- Check `.env.local` has correct `RESEND_API_KEY`
- Check Resend dashboard for delivery logs

**Port 3000 already in use**:

```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000, then taskkill /PID <pid> /F
# Or use a different port:
PORT=3001 npm run dev
```

---

## 11. Next Steps

1. Read the [Feature Specification](./spec.md) for user requirements
2. Review the [Data Model](./data-model.md) for entity relationships
3. Review the [API Contracts](./contracts/api-contracts.md) for response shapes
4. Check the [Implementation Plan](./plan.md) for architecture decisions
5. Start implementing features following TDD workflow
