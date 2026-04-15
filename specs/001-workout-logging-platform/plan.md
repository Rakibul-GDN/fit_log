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

## Implementation Note: Routine Name Uniqueness (Bugfix)

- **Issue**: Users were unable to create a routine with a name that exists for any user, not just themselves. The API returned a 409 ROUTINE_NAME_EXISTS error even if the routine name was unique for the current user.
- **Root Cause**: The error handler for the POST /api/routines endpoint did not check which unique constraint was violated, so any P2002 error triggered the name-exists response.
- **Fix**: The error handler now checks that the unique constraint violated is specifically the `[userId, name]` constraint before returning the ROUTINE_NAME_EXISTS error. This ensures only routines with the same name for the same user are blocked.
- **Tracking**: See src/app/api/routines/route.ts (POST handler) for the updated logic.

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

## Audit Findings & Remediation Plan

> **Date**: 2026-04-09 — Post-implementation audit of all Phase 1-10 tasks.
> **Method**: Automated agent audit + manual verification of critical paths.

### User Testing Feedback

> Issues reported during manual testing. Each item is logged here before being fixed.

| # | Issue | Status | Reported |
|---|-------|--------|----------|
| T1 | **GET `/api/routines` returns 500** — `deletedAt` column in Prisma schema but not in DB. Reverted from schema. **User must restart dev server + run `npx prisma generate`** for Prisma client to pick up the change. | **In Progress** (waiting for server restart) | 2026-04-09 |
| T2 | **"Create Routine" button does nothing** — `Button as={Link}` not working with HeroUI v3. Replaced all `Button as={Link}` instances with plain `<Link>` tags across routines, workouts, exercises, and routine detail pages (6 occurrences fixed). | **Fixed** | 2026-04-09 |
| T3 | **Polish design — rebuild dashboard layout** with fixed left sidebar, top header bar, KPI stat cards, DataTable, breadcrumbs, CTA buttons, mobile drawer. | **Fixed** | 2026-04-09 |
| T4 | **Migrate from HeroUI v3 → shadcn/ui** — full redesign complete. Removed HeroUI, installed shadcn dependencies (Radix primitives, CVA, lucide-react), configured Tailwind with CSS variables, created 14 shadcn UI components, rewrote all pages/forms with shadcn classes, replaced HeroUI color tokens with shadcn equivalents. **0 TS errors, 120 tests pass, build passes with 30 pages.** | **Fixed** | 2026-04-09 |

### Critical Bugs (Must Fix Before Production)

| # | Issue | Impact | Files Affected |
|---|-------|--------|----------------|
| A1 | **Quick Log workflow broken** — `onSave` is a no-op; workout log is created on `handleStart` (before review), user cannot discard after save | Users cannot complete quick-log flow as designed | `src/app/(dashboard)/routines/[routineId]/quick-log/page.tsx`, `src/components/forms/QuickLogReview.tsx` |
| A2 | **RoutineForm exercise assignment UI non-functional** — select `onChange` handlers are no-ops; `addAssignment` is defined but never called; users cannot add exercises to routines | Users cannot create routines with exercises | `src/components/forms/RoutineForm.tsx` |
| A3 | **WorkoutLogForm has no dynamic entry management** — no "Add Exercise" or "Remove Exercise" button; only renders default entries | Users cannot build a workout with multiple exercises | `src/components/forms/WorkoutLogForm.tsx` |
| A4 | **Forgot Password page missing** — API route exists but no `/forgot-password` UI page; users who navigate there get 404 | Password reset flow broken for direct navigation | Missing: `src/app/(auth)/forgot-password/page.tsx` |
| A5 | **No SessionProvider** — `Providers.tsx` only has QueryClientProvider; `useSession()` may not work correctly across client navigations | Auth session may be unreliable in client components | `src/components/providers/Providers.tsx` |

### High Priority Issues

| # | Issue | Impact | Files Affected |
|---|-------|--------|----------------|
| A6 | **Exercise `@@unique([name])` is global** — prevents users from creating custom exercises with same name as system exercises (e.g., "Bench Press") | Custom exercise creation blocked for common exercise names | `prisma/schema.prisma` (Exercise model) |
| A7 | **Routine list shows `exerciseCount={0}`** — hardcoded value, never uses actual count from API | Users see "0 exercises assigned" for all routines | `src/app/(dashboard)/routines/page.tsx` |
| A8 | **Quick Log creates DB record before review** — should create on save, not on start; user cannot truly "discard" | Data integrity: orphaned workout logs on discard | `src/app/(dashboard)/routines/[routineId]/quick-log/page.tsx` |
| A9 | **No password change endpoint** — settings API doesn't support password updates | Users cannot change password (FR-011, US6) | Missing: `src/app/api/settings/password/route.ts` |
| A10 | **Soft deletes not implemented** — `deletedAt` exists on User but unused; routines/exercises are hard-deleted | No data recovery possible after deletion | `prisma/schema.prisma`, `src/app/api/routines/route.ts`, settings page |

### Medium Priority Issues (Spec Compliance Gaps)

| # | Issue | Spec vs Implementation |
|---|-------|----------------------|
| A11 | Pagination fields mismatch — spec: `{page, limit, total, totalPages, hasNext, hasPrev}` vs impl: `{page, pageSize, totalItems, totalPages}` | `src/lib/api/validators.ts`, all list API routes, `src/types/api.ts` |
| A12 | Default page size mismatch — spec: default 10, max 50 vs impl: default 20, max 100 | `src/lib/api/validators.ts` |
| A13 | Error codes mismatch — multiple routes use different error codes than spec (`EMAIL_EXISTS` vs `CONFLICT`, `INVALID_TOKEN` vs `VALIDATION_ERROR`, etc.) | Auth routes, quick-log route |
| A14 | Register response shape mismatch — spec: `{id, email, name, emailVerified, message}` vs impl: `{userId, email, message, emailSent}` | `src/app/api/auth/register/route.ts` |
| A15 | Verify email response missing `verified: true` field | `src/app/api/auth/verify-email/route.ts` |
| A16 | Routine PATCH replaces ALL assignments instead of partial update | `src/app/api/routines/[routineId]/route.ts` |
| A17 | Workout PATCH replaces ALL entries instead of partial update | `src/app/api/workouts/[workoutId]/route.ts` |
| A18 | Progress API response shape differs from spec (missing `summary` block, different field names) | `src/app/api/progress/route.ts` |
| A19 | Body measurements API missing filter params (`measurementType`, `startDate`, `endDate`) | `src/app/api/progress/measurements/route.ts` |
| A20 | Exercises API missing `includeCustom` query param | `src/app/api/exercises/route.ts` |
| A21 | Missing `workoutDate` param in Quick Log POST | `src/app/api/routines/[routineId]/quick-log/route.ts` |
| A22 | No future-date validation for `workoutDate` / `measurementDate` | `src/lib/api/validators.ts` |
| A23 | Missing API route: `GET/PATCH/DELETE /api/exercises/[exerciseId]` | Custom exercise management incomplete |
| A24 | Missing API route: `/api/workouts/[workoutId]/entries/` | Individual log entry CRUD |

### Low Priority Issues

| # | Issue | Impact |
|---|-------|--------|
| A25 | Axios auth interceptor is a no-op (comment says "token will be injected") | Works via cookies for same-origin but interceptor is dead code |
| A26 | Multiple `any` type usages with `eslint-disable` comments violate "no `any`" constitution rule | Code quality / type safety |
| A27 | Multiple `// eslint-disable-next-line` for unused directives (no problems reported) | Code cleanliness |
| A28 | WorkoutLogForm and RoutineForm use raw `<select>` instead of HeroUI Select | UI consistency |
| A29 | `measurementDate` required in schema but spec says default to today | Minor UX gap |
| A30 | All test files in `tests/` have placeholder stubs (`expect(true).toBe(true)`) | TDD constitution not fully met for integration/E2E |

### Recommended Improvements (Not In Original Spec)

| # | Improvement | Reason |
|---|-------------|--------|
| I1 | Add `SessionProvider` to Providers wrapper | Enable `useSession()` in client components reliably |
| I2 | Add optimistic updates to React Query mutations | Better UX: instant feedback without waiting for server |
| I3 | Add React Query `staleTime`/`gcTime` tuning per resource | Reduce unnecessary refetches |
| I4 | Add input sanitization for exercise names (trim, normalize whitespace) | Prevent duplicate exercises from whitespace variations |
| I5 | Add `createdById` to Exercise `@@unique` constraint: `@@unique([name, createdById])` | Allow users to create custom exercises with system exercise names |
| I6 | Add computed fields to API responses (`exerciseCount`, `entryCount`, `routineName`, `totalVolume`) | Match spec contracts and reduce client-side computation |
| I7 | Add error boundary around each dashboard page section | Prevent full-page crashes on partial failures |
| I8 | Add `react-hook-form` `mode: 'onBlur'` validation to all forms | Better UX: validate on blur instead of only on submit |
| I9 | Add keyboard shortcuts (Ctrl+S to save forms, Escape to close modals) | Power user productivity |
| I10 | Add `next/image` for any future image assets | Performance and layout shift prevention |

## Implementation Note: Full-Page Calendar for Workouts

- **Feature**: The /workouts route now displays a large, visually rich calendar for the current month. Each day with workouts shows a "View All Logs" button and individual log buttons. The UI is styled to match the app's design system.
- **Component**: Enhanced `WorkoutCalendar` in src/components/layout/WorkoutCalendar.tsx for full-width, modern calendar experience.
- **Tracking**: See src/app/(dashboard)/workouts/page.tsx for usage and integration.

---
