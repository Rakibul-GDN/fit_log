# Implementation Plan: LogFit Workout Logging Platform

**Branch**: `001-workout-logging-platform` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-workout-logging-platform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

LogFit is a full-stack Next.js workout logging platform enabling users to create authenticated accounts, manage weekly workout routines, log workouts with exercise performance data (sets, reps, weight), track progress through visualizations, and manage personal exercise libraries. The platform uses Next.js App Router with API routes for backend services, PostgreSQL with Prisma ORM for data persistence, HeroUI v3 + Tailwind CSS for mobile-first responsive UI, React Query + Axios for client-side data fetching, Zustand for global state management, and Framer Motion for page transitions and animations. The architecture enforces strict TDD, TypeScript strictness, functional programming patterns, and standardized API response contracts with comprehensive error boundaries and loading states throughout the UI.

## Technical Context

**Language/Version**: TypeScript 5+ with `strict: true` (all strict flags enabled)
**Primary Dependencies**:

- **Framework**: Next.js 15+ with App Router
- **UI Library**: HeroUI v3 (component library), Tailwind CSS (styling), Framer Motion (animations)
- **Database**: PostgreSQL (local development), Prisma ORM (type-safe queries)
- **API Client**: Axios (HTTP client), @tanstack/react-query (data fetching, caching, mutations)
- **State Management**: Zustand (global client state: auth session, UI preferences, unit settings)
- **Authentication**: NextAuth.js v5 (credentials provider + email verification flow)
- **Email Service**: Resend or Nodemailer for verification emails (NEEDS CLARIFICATION: provider selection)
- **Testing**: Vitest (unit/integration), @testing-library/react (component tests), Playwright (E2E)
  **Storage**: PostgreSQL database via Prisma ORM; no direct DB access—all data operations through API layer
  **Testing**: Vitest (unit/integration), React Testing Library (components), Playwright (E2E), custom contract test suite for API routes
  **Target Platform**: Web browser (desktop + mobile); mobile-first responsive design
  **Project Type**: Full-stack web application (Next.js serving both frontend and backend API routes)
  **Performance Goals**:
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- API Response Time: p95 < 500ms for all route handlers
- Initial client bundle < 200KB gzipped
- Page transitions < 300ms (Framer Motion)
  **Constraints**:
- Mobile-first design; all components must work on 320px+ viewport widths
- API responses MUST follow standardized contract (paginated, non-paginated, error formats)
- Component-level error boundaries; no full-app crashes on partial failures
- Email verification required before account activation (no unverified accounts)
- All data accessed via API routes; no direct database calls from components
  **Scale/Scope**:
- Initial phase: Single-user workout logging (no social/sharing features)
- Supports 1,000 concurrent users (SC-005)
- 20-50 exercises in default library at launch
- Unlimited user-created exercises, routines, and workout logs

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Design Gate Evaluation

| Constitution Principle              | Compliance Status | Notes                                                                                                                   |
| ----------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| I. TDD (NON-NEGOTIABLE)             | ✅ Pass           | Contract tests for API routes, component tests with RTL, integration tests for auth/DB flows planned                    |
| II. TypeScript Strictness           | ✅ Pass           | `strict: true` enforced; no `any` types; explicit return types; type imports for contracts                              |
| III. Functional Programming First   | ✅ Pass           | Pure functions for business logic; custom hooks over HOCs; Server Components by default; Zustand for client state       |
| IV. Next.js Best Practices          | ✅ Pass           | App Router structure; route handlers for APIs; middleware for auth; `next/image` enforced; env validation               |
| V. Component Architecture & Testing | ✅ Pass           | Small composable components; props over context; behavior-driven tests; accessibility (axe-core); responsive by default |
| Performance Requirements            | ✅ Pass           | Core Web Vitals targets defined; bundle size budget set; API response time targets                                      |
| Pre-Commit Gates                    | ✅ Pass           | ESLint, Prettier, `tsc --noEmit`, tests required                                                                        |
| No `@ts-ignore`                     | ✅ Pass           | Documented justification required if used                                                                               |

**Gate Status (Pre-Design)**: ALL GATES PASS — Proceed to Phase 0 research

### Post-Design Gate Re-Evaluation

| Constitution Principle              | Compliance Status | Notes                                                                                                                                                     |
| ----------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. TDD (NON-NEGOTIABLE)             | ✅ Pass           | Research.md confirms Vitest + RTL + Playwright stack; contract test suite defined; test-first workflow documented in quickstart.md                        |
| II. TypeScript Strictness           | ✅ Pass           | Data model uses strict types; API contracts use discriminated unions; no `any` in response types; type imports used for contracts                         |
| III. Functional Programming First   | ✅ Pass           | Custom hooks for API (not HOCs); pure utility functions in `src/lib/`; Server Components by default; Zustand for client state (not Redux classes)         |
| IV. Next.js Best Practices          | ✅ Pass           | App Router with route groups; middleware for auth; route handlers for API; `next/image` mandated; env validation via Zod; metadata API for SEO            |
| V. Component Architecture & Testing | ✅ Pass           | Component hierarchy defined; error boundaries at component level; HeroUI components are accessible; Tailwind for responsive design; mobile-first enforced |
| Performance Requirements            | ✅ Pass           | Bundle budget < 200KB; HeroUI tree-shakeable; React Query caching reduces redundant fetches; Framer Motion GPU-accelerated                                |
| Pre-Commit Gates                    | ✅ Pass           | Tooling configured (ESLint, Prettier, `tsc --noEmit`, Vitest)                                                                                             |
| No `@ts-ignore`                     | ✅ Pass           | Strict types defined in data model and API contracts eliminate need for escape hatches                                                                    |

**Gate Status (Post-Design)**: ALL GATES PASS — No violations. Proceed to task generation.

## Project Structure

### Documentation (this feature)

```text
specs/001-workout-logging-platform/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
fit_log/
├── prisma/
│   ├── schema.prisma          # Prisma schema (data model, relations, constraints)
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed script (default exercise library)
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Auth route group (login, register, verify-email, reset-password)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/       # Authenticated route group (protected by middleware)
│   │   │   ├── layout.tsx     # Dashboard layout with sidebar/navigation
│   │   │   ├── page.tsx       # Dashboard home (recent workouts, quick actions)
│   │   │   ├── routines/
│   │   │   │   ├── page.tsx               # Routine list/create
│   │   │   │   ├── [routineId]/
│   │   │   │   │   ├── page.tsx           # Routine detail (weekly view)
│   │   │   │   │   └── quick-log/
│   │   │   │   │       └── page.tsx       # Quick log: copy routine to workout
│   │   │   ├── workouts/
│   │   │   │   ├── page.tsx               # Workout history (list, filter)
│   │   │   │   ├── [workoutId]/
│   │   │   │   │   └── page.tsx           # Workout detail (log entries)
│   │   │   │   └── log/
│   │   │   │       └── page.tsx           # Manual workout logging
│   │   │   ├── exercises/
│   │   │   │   ├── page.tsx               # Exercise library (browse, search, filter)
│   │   │   │   └── create/
│   │   │   │       └── page.tsx           # Add custom exercise
│   │   │   ├── progress/
│   │   │   │   └── page.tsx               # Progress tracking (charts, body measurements)
│   │   │   └── settings/
│   │   │       └── page.tsx               # Account & general settings
│   │   ├── api/                 # API route handlers (backend-only, not exposed to client directly)
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts           # NextAuth handler
│   │   │   ├── routines/
│   │   │   │   ├── route.ts               # GET (list), POST (create)
│   │   │   │   └── [routineId]/
│   │   │   │       ├── route.ts           # GET, PATCH, DELETE
│   │   │   │       └── quick-log/
│   │   │   │           └── route.ts       # POST (copy to workout log)
│   │   │   ├── workouts/
│   │   │   │   ├── route.ts               # GET (list with pagination), POST (create)
│   │   │   │   └── [workoutId]/
│   │   │   │       ├── route.ts           # GET, PATCH, DELETE
│   │   │   │       └── entries/
│   │   │   │           └── route.ts       # POST (add entry), PATCH, DELETE
│   │   │   ├── exercises/
│   │   │   │   ├── route.ts               # GET (list with search/filter), POST (create custom)
│   │   │   │   └── [exerciseId]/
│   │   │   │       └── route.ts           # GET, PATCH, DELETE
│   │   │   ├── progress/
│   │   │   │   ├── route.ts               # GET (progress data with time range)
│   │   │   │   └── measurements/
│   │   │   │       └── route.ts           # GET, POST, DELETE body measurements
│   │   │   └── settings/
│   │   │       └── route.ts               # GET, PATCH (user preferences)
│   │   ├── layout.tsx           # Root layout (providers, theme, metadata)
│   │   ├── not-found.tsx        # 404 page
│   │   └── error.tsx            # Global error boundary
│   │
│   ├── components/              # Shared UI components
│   │   ├── ui/                  # Base UI primitives (Button, Input, Card, Modal, etc.)
│   │   ├── layout/              # Layout components (Header, Sidebar, Container, etc.)
│   │   ├── forms/               # Form components (LoginForm, RoutineForm, WorkoutLogForm, etc.)
│   │   ├── charts/              # Progress visualization components
│   │   └── feedback/            # Loading states, skeletons, error boundaries, toasts
│   │
│   ├── lib/                     # Shared utilities (pure functions)
│   │   ├── api/                 # API client utilities (axios instance, response transformers)
│   │   ├── utils/               # General utilities (formatters, validators, date helpers)
│   │   └── constants/           # App-wide constants (units, exercise categories, etc.)
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── api/                 # React Query hooks for each API endpoint (useRoutines, useWorkouts, etc.)
│   │   ├── auth/                # Auth-related hooks (useSession, useRequireAuth)
│   │   └── ui/                  # UI-related hooks (useToast, useMediaQuery, useLocalStorage)
│   │
│   ├── store/                   # Zustand stores
│   │   ├── authStore.ts         # Auth session state
│   │   ├── settingsStore.ts     # User preferences (units, display settings)
│   │   └── uiStore.ts           # UI state (sidebar, modals, toasts)
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── api.ts               # API response contracts (paginated, non-paginated, error)
│   │   ├── entities.ts          # Domain entity types (User, Routine, Workout, Exercise, etc.)
│   │   └── forms.ts             # Form validation schemas/types
│   │
│   └── middleware.ts             # Next.js middleware (auth guard, route protection)
│
├── tests/
│   ├── contract/                # API contract tests (verify response shapes match types)
│   │   ├── auth.test.ts
│   │   ├── routines.test.ts
│   │   ├── workouts.test.ts
│   │   ├── exercises.test.ts
│   │   └── progress.test.ts
│   ├── integration/             # Integration tests (DB operations, auth flows)
│   │   ├── auth-flow.test.ts
│   │   ├── routine-crud.test.ts
│   │   └── workout-logging.test.ts
│   ├── components/              # Component tests (React Testing Library)
│   │   ├── forms/
│   │   ├── layout/
│   │   └── feedback/
│   └── e2e/                     # Playwright E2E tests
│       ├── auth.spec.ts
│       ├── routine-flow.spec.ts
│       └── workout-logging.spec.ts
│
├── public/                      # Static assets (favicon, OG images, etc.)
├── .env.example                 # Environment variable template
├── .env.local                   # Local environment variables (gitignored)
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── vitest.config.ts             # Vitest configuration
├── playwright.config.ts         # Playwright configuration
├── package.json
├── tsconfig.json
└── README.md
```

**Structure Decision**: Single Next.js monorepo with App Router architecture. Backend API routes co-located with frontend under `src/app/api/`. Data model managed via Prisma schema. Client-side data fetching through React Query custom hooks per API endpoint. Zustand for global state (auth session, settings, UI state). Component-level error boundaries and loading skeletons throughout. Mobile-first responsive design using Tailwind CSS breakpoints.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                                     | Why Needed                                                                                                                                                    | Simpler Alternative Rejected Because                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Zustand + React Query (dual state management) | React Query handles server state (API data); Zustand handles client state (auth session, UI state, settings)                                                  | Using React Query for everything would conflate server and client concerns; Zustand provides simpler API for local UI state           |
| Axios + React Query (vs. native fetch)        | Axios provides built-in interceptors for standardized error handling, request/response transformation, timeout configuration                                  | Native fetch requires manual interceptor setup; Axios interceptors centralize API response contract enforcement                       |
| Route handlers instead of Server Actions      | User requirement: "we will not access db directly, we will create api's to fetch data" — API layer abstraction needed for potential future external consumers | Server Actions would be simpler for internal-only data access, but API routes provide cleaner separation and contract testing surface |
