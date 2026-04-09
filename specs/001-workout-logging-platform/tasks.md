# Tasks: LogFit Workout Logging Platform

**Input**: Design documents from `/specs/001-workout-logging-platform/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**⚠️ TDD GATE (Constitution I — NON-NEGOTIABLE)**: For every user story, ALL contract/component/integration tests MUST be written first and confirmed FAILING before any implementation task begins. No exceptions.

**Tests**: TDD is MANDATORY per constitution. All tasks include test-first workflow.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router monorepo with co-located frontend and backend:

- `src/app/` — Pages and API routes
- `src/components/` — Reusable UI components
- `src/hooks/` — Custom React hooks (React Query)
- `src/lib/` — Utilities (API client, formatters, validators)
- `src/store/` — Zustand stores
- `src/types/` — TypeScript type definitions
- `prisma/` — Database schema and migrations
- `tests/` — Test suites (contract, integration, components, E2E)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js project with TypeScript: `npx create-next-app@latest . --typescript --tailwind --app --src-dir` then move all generated files into `src/` folder structure
- [x] T002 [P] Configure ESLint with `@typescript-eslint`, `eslint-config-next`, and strict rules in `.eslintrc.json` — enforce functional programming patterns (ban class-based utilities)
- [x] T003 [P] Configure Prettier with single quotes, trailing commas, 100 char wrap in `.prettierrc`
- [x] T004 [P] Configure `tsconfig.json` with `strict: true`, path aliases (`@/*` → `src/*`)
- [x] T005 Install and configure HeroUI v3: `npm i @heroui/react framer-motion` with Tailwind plugin setup
- [x] T006 [P] Install and configure Vitest: `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [x] T007 [P] Install and configure Playwright: `npm i -D @playwright/test`
- [x] T008 [P] Install Prisma ORM: `npm i -D prisma @prisma/client && npx prisma init`
- [x] T009 [P] Install dependencies: `npm i @tanstack/react-query axios zustand next-auth@beta zod @hookform/resolvers react-hook-form`
- [x] T010 [P] Install Resend email SDK: `npm i resend`
- [x] T011 [P] Create `.env.example` with all required variables (DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY, etc.)
- [x] T012 Create root `layout.tsx` with providers (NextAuth Session, React Query, Theme) in `src/app/layout.tsx`
- [x] T013 [P] Create global error boundary `src/app/error.tsx` with user-friendly retry UI
- [x] T014 [P] Create 404 page `src/app/not-found.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Layer

- [ ] T015 [P] Define auth entities in Prisma schema (User, VerificationToken) in `prisma/schema.prisma`
- [ ] T016 [P] Define workout entities in Prisma schema (Routine, Exercise, ExerciseAssignment, WorkoutLog, LogEntry, BodyMeasurement) in `prisma/schema.prisma`
- [ ] T017 Merge entity definitions and run initial migration: `npx prisma migrate dev --name init` in `prisma/schema.prisma`
- [ ] T018 [P] Create Prisma seed script with 30-50 default exercises in `prisma/seed.ts`
- [ ] T019 [P] Configure Prisma adapter with NextAuth v5 in `src/app/api/auth/[...nextauth]/route.ts`

### Type Definitions

- [ ] T020 [P] Define API response contract types (SuccessResponse, PaginatedResponse, ErrorResponse) in `src/types/api.ts`
- [ ] T021 [P] Define domain entity types (User, Routine, Exercise, WorkoutLog, LogEntry, BodyMeasurement) in `src/types/entities.ts`
- [ ] T022 [P] Define form validation types (RegisterForm, LoginForm, RoutineForm, WorkoutForm) in `src/types/forms.ts`

### API Client Infrastructure

- [ ] T023 Create Axios instance with interceptors (auth header injection, error transformation, toast triggers) in `src/lib/api/client.ts`
- [ ] T024 [P] Create API response transformer utilities (envelope parsing, pagination metadata) in `src/lib/api/transformers.ts`
- [ ] T025 Create Zod validation schemas for all API request/response bodies in `src/lib/api/validators.ts`

### Authentication Infrastructure

- [ ] T026 Configure NextAuth v5 credentials provider with session strategy in `src/app/api/auth/[...nextauth]/route.ts`
- [ ] T027 Create Next.js middleware for route protection (auth guard, email verification check, redirect logic) in `src/middleware.ts`
- [ ] T028 [P] Implement email verification token generation service in `src/lib/services/email-verification.ts`
- [ ] T029 [P] Implement Resend email sending service (verification template, password reset template) in `src/lib/services/email-sender.ts`
- [ ] T030 Create auth-related Zustand store (session state, user info) in `src/store/authStore.ts`

### UI Foundation

- [ ] T031 [P] Create Button component wrapping HeroUI in `src/components/ui/Button.tsx`
- [ ] T032 [P] Create Input component wrapping HeroUI in `src/components/ui/Input.tsx`
- [ ] T033 [P] Create Card component wrapping HeroUI in `src/components/ui/Card.tsx`
- [ ] T034 [P] Create Modal component wrapping HeroUI in `src/components/ui/Modal.tsx`
- [ ] T035 [P] Create Toast component wrapping HeroUI in `src/components/ui/Toast.tsx`
- [ ] T036 [P] Create layout components (Header, Sidebar, Container, DashboardLayout) in `src/components/layout/`
- [ ] T037 [P] Create feedback components (Skeleton loaders, ErrorBoundary wrapper, LoadingSpinner, EmptyState) in `src/components/feedback/`
- [ ] T038 Create Zustand UI store (sidebar state, modal state, toast queue) in `src/store/uiStore.ts`
- [ ] T039 Create Zustand settings store (preferred units, display preferences) in `src/store/settingsStore.ts`

### Framer Motion Setup

- [ ] T040 [P] Create page transition wrapper component (fade + slide animation) in `src/components/layout/PageTransition.tsx`
- [ ] T041 [P] Create animated list item component (staggered fade-in) in `src/components/ui/AnimatedListItem.tsx`

### Contract Test Foundation

- [ ] T042 [P] Create Vitest contract test setup with response shape validators in `tests/contract/helpers.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Account Creation & Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can register with email/password, verify email via link, sign in, reset password, and access protected routes only after verification.

**Independent Test**: Can be fully tested by creating a new account, verifying email confirmation flow, signing in with valid/invalid credentials, and confirming secure session management. Delivers the ability to establish user identity and personalized data isolation.

### Contract Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T043 [P] [US1] Contract test for POST `/api/auth/register` response shape in `tests/contract/auth.test.ts`
- [ ] T044 [P] [US1] Contract test for POST `/api/auth/verify-email` response shape in `tests/contract/auth.test.ts`
- [ ] T045 [P] [US1] Contract test for POST `/api/auth/forgot-password` response shape in `tests/contract/auth.test.ts`
- [ ] T046 [P] [US1] Contract test for POST `/api/auth/reset-password` response shape in `tests/contract/auth.test.ts`

### Integration Tests for User Story 1 ⚠️

- [ ] T047 [US1] Integration test for full registration → email verification → login flow in `tests/integration/auth-flow.test.ts`
- [ ] T048 [US1] Integration test for password reset flow in `tests/integration/auth-flow.test.ts`
- [ ] T049 [US1] Integration test for unauthenticated access rejection (middleware) in `tests/integration/auth-flow.test.ts`

### Component Tests for User Story 1 ⚠️

- [ ] T050 [P] [US1] Test LoginForm displays errors correctly in `tests/components/forms/LoginForm.test.tsx`
- [ ] T051 [P] [US1] Test RegisterForm validates input and submits correctly in `tests/components/forms/RegisterForm.test.tsx`

### Implementation for User Story 1

- [ ] T052 [P] [US1] Create Zod validation schemas for RegisterForm and LoginForm in `src/types/forms.ts`
- [ ] T053 [P] [US1] Create RegisterForm component with HeroUI + React Hook Form in `src/components/forms/RegisterForm.tsx`
- [ ] T054 [P] [US1] Create LoginForm component with HeroUI + React Hook Form in `src/components/forms/LoginForm.tsx`
- [ ] T055 [US1] Implement POST `/api/auth/register` route handler (email, password hashing, token generation, email send) in `src/app/api/auth/register/route.ts`
- [ ] T056 [US1] Implement email verification page (token validation, success/error UI) in `src/app/(auth)/verify-email/page.tsx`
- [ ] T057 [US1] Implement POST `/api/auth/verify-email` route handler (token validation, emailVerified = true) in `src/app/api/auth/verify-email/route.ts`
- [ ] T058 [US1] Implement login page with NextAuth credentials login in `src/app/(auth)/login/page.tsx`
- [ ] T059 [US1] Implement Forgot Password page (email input, request submission) in `src/app/(auth)/reset-password/page.tsx`
- [ ] T060 [US1] Implement POST `/api/auth/forgot-password` route handler (token generation, reset email) in `src/app/api/auth/forgot-password/route.ts`
- [ ] T061 [US1] Implement POST `/api/auth/reset-password` route handler (token validation, password update) in `src/app/api/auth/reset-password/route.ts`
- [ ] T062 [US1] Implement dashboard home page (protected, displays welcome + quick actions) in `src/app/(dashboard)/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional — users can register, verify email, log in, reset password, and access protected dashboard

---

## Phase 4: User Story 2 — Create & Manage Weekly Workout Routines (Priority: P2)

**Goal**: Signed-in users can create multiple named weekly routines, assign exercises to days with default sets/reps/weight, view/edit/delete routines, and switch between them.

**Independent Test**: Can be fully tested by creating multiple routines, assigning exercises to specific days in each, viewing the weekly schedules, editing existing assignments, switching between routines, and deleting routines.

### Contract Tests for User Story 2 ⚠️

- [ ] T063 [P] [US2] Contract test for GET `/api/routines` paginated response shape in `tests/contract/routines.test.ts`
- [ ] T064 [P] [US2] Contract test for POST `/api/routines` response shape in `tests/contract/routines.test.ts`
- [ ] T065 [P] [US2] Contract test for GET `/api/routines/[id]` response shape in `tests/contract/routines.test.ts`
- [ ] T066 [P] [US2] Contract test for PATCH `/api/routines/[id]` response shape in `tests/contract/routines.test.ts`
- [ ] T067 [P] [US2] Contract test for DELETE `/api/routines/[id]` response shape in `tests/contract/routines.test.ts`

### Integration Tests for User Story 2 ⚠️

- [ ] T068 [US2] Integration test for routine CRUD (create, read, update, delete) in `tests/integration/routine-crud.test.ts`
- [ ] T069 [US2] Integration test for data isolation (user A cannot access user B's routines) in `tests/integration/routine-crud.test.ts`

### Component Tests for User Story 2 ⚠️

- [ ] T070 [P] [US2] Test RoutineForm validates name, exercise assignments in `tests/components/forms/RoutineForm.test.tsx`
- [ ] T071 [P] [US2] Test RoutineWeekView displays exercises organized by day in `tests/components/layout/RoutineWeekView.test.tsx`

### Implementation for User Story 2

- [ ] T072 [P] [US2] Create React Query hooks for routines (useRoutines, useRoutine, useCreateRoutine, useUpdateRoutine, useDeleteRoutine) in `src/hooks/api/useRoutines.ts`
- [ ] T073 [P] [US2] Create RoutineForm component (name, description, exercise assignment builder) in `src/components/forms/RoutineForm.tsx`
- [ ] T074 [P] [US2] Create RoutineCard component (summary display) in `src/components/ui/RoutineCard.tsx`
- [ ] T075 [P] [US2] Create RoutineWeekView component (weekly schedule display with day tabs) in `src/components/layout/RoutineWeekView.tsx`
- [ ] T076 [US2] Implement GET `/api/routines` route handler (paginated list, filtered by userId) in `src/app/api/routines/route.ts`
- [ ] T077 [US2] Implement POST `/api/routines` route handler (create routine with exercise assignments) in `src/app/api/routines/route.ts`
- [ ] T078 [US2] Implement GET `/api/routines/[routineId]` route handler (detail with nested exercises) in `src/app/api/routines/[routineId]/route.ts`
- [ ] T079 [US2] Implement PATCH `/api/routines/[routineId]` route handler (update routine + assignments) in `src/app/api/routines/[routineId]/route.ts`
- [ ] T080 [US2] Implement DELETE `/api/routines/[routineId]` route handler (soft delete) in `src/app/api/routines/[routineId]/route.ts`
- [ ] T081 [US2] Implement routines list page in `src/app/(dashboard)/routines/page.tsx`
- [ ] T082 [US2] Implement routine detail page (weekly view + edit/delete actions) in `src/app/(dashboard)/routines/[routineId]/page.tsx`

**Checkpoint**: User Story 2 complete — users can create, view, edit, delete, and switch between multiple routines

---

## Phase 5: User Story 4 — Manage Exercises & Personal Exercise Library (Priority: P2)

**Goal**: Users can browse the default exercise library, search/filter exercises, and create personal custom exercises linked to their account.

**Independent Test**: Can be fully tested by browsing the default exercise library, searching/filtering exercises, adding a new personal exercise, and using it in a routine.

### Contract Tests for User Story 4 ⚠️

- [ ] T083 [P] [US4] Contract test for GET `/api/exercises` paginated response shape in `tests/contract/exercises.test.ts`
- [ ] T084 [P] [US4] Contract test for POST `/api/exercises` response shape in `tests/contract/exercises.test.ts`

### Integration Tests for User Story 4 ⚠️

- [ ] T085 [US4] Integration test for exercise browsing + custom exercise creation in `tests/integration/exercise-flow.test.ts`
- [ ] T086 [US4] Integration test for data isolation (user A cannot access user B's custom exercises) in `tests/integration/exercise-flow.test.ts`

### Component Tests for User Story 4 ⚠️

- [ ] T087 [P] [US4] Test ExerciseCard displays exercise info correctly in `tests/components/ui/ExerciseCard.test.tsx`
- [ ] T088 [P] [US4] Test ExerciseSearchFilter component works in `tests/components/forms/ExerciseSearch.test.tsx`

### Implementation for User Story 4

- [ ] T089 [P] [US4] Create React Query hooks for exercises (useExercises, useCreateExercise) in `src/hooks/api/useExercises.ts`
- [ ] T090 [P] [US4] Create ExerciseCard component in `src/components/ui/ExerciseCard.tsx`
- [ ] T091 [P] [US4] Create ExerciseSearchFilter component (search input, category dropdown) in `src/components/forms/ExerciseSearchFilter.tsx`
- [ ] T092 [US4] Implement GET `/api/exercises` route handler (paginated, search, category filter, include custom) in `src/app/api/exercises/route.ts`
- [ ] T093 [US4] Implement POST `/api/exercises` route handler (create user-custom exercise) in `src/app/api/exercises/route.ts`
- [ ] T094 [US4] Implement exercise library page (browse, search, create custom) in `src/app/(dashboard)/exercises/page.tsx`
- [ ] T095 [US4] Implement create custom exercise form page in `src/app/(dashboard)/exercises/create/page.tsx`

**Checkpoint**: User Story 4 complete — users can browse default exercises and create personal exercises

---

## Phase 6: User Story 7 — Quick Log: Copy Routine to Workout (Priority: P2)

**Goal**: Users can initiate a quick workout log by selecting a routine and day, which pre-fills exercises with planned sets/reps/weight. Users can then edit, add, remove exercises, or discard and start fresh.

**Independent Test**: Can be fully tested by creating multiple routines, selecting one to copy from, verifying all exercises and default values are pre-filled, editing individual values, adding a new exercise, removing an existing one, and saving the session.

### Contract Tests for User Story 7 ⚠️

- [ ] T096 [P] [US7] Contract test for POST `/api/routines/[id]/quick-log` response shape in `tests/contract/routines.test.ts`

### Integration Tests for User Story 7 ⚠️

- [ ] T097 [US7] Integration test for quick-log flow (copy → edit → save) in `tests/integration/workout-logging.test.ts`
- [ ] T098 [US7] Integration test for discard-flow behavior (discarded log does not persist) in `tests/integration/workout-logging.test.ts`

### Component Tests for User Story 7 ⚠️

- [ ] T099 [P] [US7] Test QuickLogReview displays pre-filled exercises with editable fields in `tests/components/forms/QuickLogReview.test.tsx`

### Implementation for User Story 7

- [ ] T100 [P] [US7] Create React Query hook for quick-log (useQuickLog) in `src/hooks/api/useRoutines.ts` (append)
- [ ] T101 [P] [US7] Create QuickLogReview component (pre-filled exercise list with editable sets/reps/weight, add/remove exercise buttons) in `src/components/forms/QuickLogReview.tsx`
- [ ] T102 [US7] Implement POST `/api/routines/[routineId]/quick-log` route handler (copy exercises from routine day, pre-fill defaults, create workout log) in `src/app/api/routines/[routineId]/quick-log/route.ts`
- [ ] T103 [US7] Implement quick-log page (routine selector, day selector, review/edit pre-filled exercises, save/discard actions) in `src/app/(dashboard)/routines/[routineId]/quick-log/page.tsx`

**Checkpoint**: User Story 7 complete — users can quick-log from routines with pre-filled data

---

## Phase 7: User Story 3 — Log Workout Sessions (Priority: P3)

**Goal**: Users can manually log workout sessions with date, day, exercises, sets, reps, weight. Users can view workout history organized by date.

**Independent Test**: Can be fully tested by selecting a planned workout, logging each exercise with sets/reps/weight data, saving the session, and viewing the completed workout history.

### Contract Tests for User Story 3 ⚠️

- [ ] T104 [P] [US3] Contract test for GET `/api/workouts` paginated response shape in `tests/contract/workouts.test.ts`
- [ ] T105 [P] [US3] Contract test for POST `/api/workouts` response shape in `tests/contract/workouts.test.ts`
- [ ] T106 [P] [US3] Contract test for GET `/api/workouts/[id]` response shape in `tests/contract/workouts.test.ts`
- [ ] T107 [P] [US3] Contract test for PATCH `/api/workouts/[id]` response shape in `tests/contract/workouts.test.ts`
- [ ] T108 [P] [US3] Contract test for DELETE `/api/workouts/[id]` response shape in `tests/contract/workouts.test.ts`

### Integration Tests for User Story 3 ⚠️

- [ ] T109 [US3] Integration test for manual workout logging flow in `tests/integration/workout-logging.test.ts`
- [ ] T110 [US3] Integration test for workout history pagination and filtering in `tests/integration/workout-logging.test.ts`
- [ ] T111 [US3] Integration test for data isolation (user A cannot access user B's workouts) in `tests/integration/workout-logging.test.ts`

### Component Tests for User Story 3 ⚠️

- [ ] T112 [P] [US3] Test WorkoutLogForm allows manual exercise entry in `tests/components/forms/WorkoutLogForm.test.tsx`
- [ ] T113 [P] [US3] Test WorkoutHistoryCard displays session summary in `tests/components/layout/WorkoutHistoryCard.test.tsx`

### Implementation for User Story 3

- [ ] T114 [P] [US3] Create React Query hooks for workouts (useWorkouts, useWorkout, useCreateWorkout, useUpdateWorkout, useDeleteWorkout) in `src/hooks/api/useWorkouts.ts`
- [ ] T115 [P] [US3] Create WorkoutLogForm component (manual exercise entry, add/remove exercises, save) in `src/components/forms/WorkoutLogForm.tsx`
- [ ] T116 [P] [US3] Create WorkoutHistoryCard component in `src/components/layout/WorkoutHistoryCard.tsx`
- [ ] T117 [P] [US3] Create WorkoutDetailPage component in `src/components/layout/WorkoutDetailPage.tsx`
- [ ] T118 [US3] Implement GET `/api/workouts` route handler (paginated list with date filter) in `src/app/api/workouts/route.ts`
- [ ] T119 [US3] Implement POST `/api/workouts` route handler (manual workout log creation) in `src/app/api/workouts/route.ts`
- [ ] T120 [US3] Implement GET `/api/workouts/[workoutId]` route handler (detail with entries) in `src/app/api/workouts/[workoutId]/route.ts`
- [ ] T121 [US3] Implement PATCH `/api/workouts/[workoutId]` route handler (update workout + entries) in `src/app/api/workouts/[workoutId]/route.ts`
- [ ] T122 [US3] Implement DELETE `/api/workouts/[workoutId]` route handler (cascade delete entries) in `src/app/api/workouts/[workoutId]/route.ts`
- [ ] T123 [US3] Implement workout history page (list, filter by date, pagination) in `src/app/(dashboard)/workouts/page.tsx`
- [ ] T124 [US3] Implement workout detail page (full session view) in `src/app/(dashboard)/workouts/[workoutId]/page.tsx`
- [ ] T125 [US3] Implement manual workout logging page in `src/app/(dashboard)/workouts/log/page.tsx`

**Checkpoint**: User Story 3 complete — users can manually log workouts and view history

---

## Phase 8: User Story 5 — Track Progress & View Improvements (Priority: P3)

**Goal**: Users view workout progress charts (weight progression + total volume) for each exercise, add body weight/measurements, and see visual trends over time.

**Independent Test**: Can be fully tested by viewing progress charts for a specific exercise, adding body weight/measurements, and seeing visual representations of improvement over time.

### Contract Tests for User Story 5 ⚠️

- [ ] T126 [P] [US5] Contract test for GET `/api/progress` response shape in `tests/contract/progress.test.ts`
- [ ] T127 [P] [US5] Contract test for GET `/api/progress/measurements` response shape in `tests/contract/progress.test.ts`
- [ ] T128 [P] [US5] Contract test for POST `/api/progress/measurements` response shape in `tests/contract/progress.test.ts`

### Integration Tests for User Story 5 ⚠️

- [ ] T129 [US5] Integration test for progress data retrieval and calculation in `tests/integration/progress-flow.test.ts`
- [ ] T130 [US5] Integration test for data isolation (user A cannot access user B's progress/measurements) in `tests/integration/progress-flow.test.ts`

### Component Tests for User Story 5 ⚠️

- [ ] T131 [P] [US5] Test ProgressChart displays data points correctly in `tests/components/charts/ProgressChart.test.tsx`
- [ ] T132 [P] [US5] Test BodyMeasurementForm validates and submits in `tests/components/forms/BodyMeasurementForm.test.tsx`

### Implementation for User Story 5

- [ ] T133 [P] [US5] Create React Query hooks for progress (useProgress, useMeasurements, useAddMeasurement) in `src/hooks/api/useProgress.ts`
- [ ] T134 [P] [US5] Create ProgressChart component (line chart with weight + volume series) in `src/components/charts/ProgressChart.tsx`
- [ ] T135 [P] [US5] Create BodyMeasurementForm component in `src/components/forms/BodyMeasurementForm.tsx`
- [ ] T136 [P] [US5] Create MeasurementHistoryList component in `src/components/layout/MeasurementHistoryList.tsx`
- [ ] T137 [US5] Implement GET `/api/progress` route handler (exercise progress data with summary calculations) in `src/app/api/progress/route.ts`
- [ ] T138 [US5] Implement GET `/api/progress/measurements` route handler in `src/app/api/progress/measurements/route.ts`
- [ ] T139 [US5] Implement POST `/api/progress/measurements` route handler in `src/app/api/progress/measurements/route.ts`
- [ ] T140 [US5] Implement DELETE `/api/progress/measurements/[id]` route handler in `src/app/api/progress/measurements/[measurementId]/route.ts`
- [ ] T141 [US5] Implement progress tracking page (exercise selector, time range, dual-metric chart, body measurements) in `src/app/(dashboard)/progress/page.tsx`

**Checkpoint**: User Story 5 complete — users can view progress charts and manage body measurements

---

## Phase 9: User Story 6 — Account & General Settings (Priority: P3)

**Goal**: Users manage account details (email, password) and configure preferences (measurement units, display settings).

**Independent Test**: Can be fully tested by updating account information, changing measurement units, and confirming settings persist across sessions.

### Contract Tests for User Story 6 ⚠️

- [ ] T142 [P] [US6] Contract test for GET `/api/settings` response shape in `tests/contract/settings.test.ts`
- [ ] T143 [P] [US6] Contract test for PATCH `/api/settings` response shape in `tests/contract/settings.test.ts`

### Component Tests for User Story 6 ⚠️

- [ ] T144 [P] [US6] Test SettingsForm validates and updates correctly in `tests/components/forms/SettingsForm.test.tsx`

### Implementation for User Story 6

- [ ] T145 [P] [US6] Create React Query hooks for settings (useSettings, useUpdateSettings) in `src/hooks/api/useSettings.ts`
- [ ] T146 [P] [US6] Create SettingsForm component (name, email, password, unit toggle) in `src/components/forms/SettingsForm.tsx`
- [ ] T147 [US6] Implement GET `/api/settings` route handler in `src/app/api/settings/route.ts`
- [ ] T148 [US6] Implement PATCH `/api/settings` route handler in `src/app/api/settings/route.ts`
- [ ] T149 [US6] Implement settings page in `src/app/(dashboard)/settings/page.tsx`

**Checkpoint**: User Story 6 complete — users can manage account and preferences

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T150 [P] Add toast notifications for all CRUD operations (success/error feedback) using HeroUI toast in `src/components/feedback/ToastContainer.tsx`
- [ ] T151 [P] Add loading skeletons for all list views (workout history, exercise library, routines, progress) in respective component files
- [ ] T152 [P] Add empty state components for zero-data scenarios (no routines, no workouts, no progress) in `src/components/feedback/EmptyState.tsx`
- [ ] T153 [P] Create unit conversion utility functions (metric ↔ imperial) in `src/lib/utils/unitConverter.ts`
- [ ] T154 Integrate unit conversion into all workout data displays (routines, workouts, progress) across affected components
- [ ] T155 [P] Add account deletion flow with confirmation + data cleanup in `src/app/(dashboard)/settings/page.tsx`
- [ ] T156 Implement resend verification email functionality for users who haven't received email in `src/app/(auth)/verify-email/page.tsx`
- [ ] T157 [P] Add Framer Motion page transitions across all route groups
- [ ] T158 [P] Add accessibility audit (axe-core) and fix any violations
- [ ] T159 Run E2E test suite with Playwright across critical user journeys
- [ ] T160 [P] Performance audit: bundle analysis, LCP optimization, code splitting review
- [ ] T161 Update README.md with project overview, setup instructions, and architecture diagram
- [ ] T162 Run `quickstart.md` validation — follow steps end-to-end and fix any issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **User Stories (Phases 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story                | Priority | Can Start After                         | Independent MVP                    |
| -------------------- | -------- | --------------------------------------- | ---------------------------------- |
| US1: Auth            | P1       | Phase 2 (Foundational)                  | ✅ Yes — core gateway              |
| US2: Routines        | P2       | Phase 2 (Foundational)                  | ✅ Yes — independent planning      |
| US4: Exercises       | P2       | Phase 2 (Foundational)                  | ✅ Yes — library browsing          |
| US7: Quick Log       | P2       | Phase 2 + US2 (routines must exist)     | ⚠️ Partial — needs routines        |
| US3: Workout Logging | P3       | Phase 2 + US4 (exercises must exist)    | ⚠️ Partial — needs exercises       |
| US5: Progress        | P3       | Phase 2 + US3 (workout data must exist) | ⚠️ Partial — needs workout history |
| US6: Settings        | P3       | Phase 2 (Foundational)                  | ✅ Yes — account management        |

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD GATE)
- Types/validators before API routes
- API routes before React Query hooks
- Hooks before components
- Components before pages
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T011)
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - US1 (Auth) can start immediately
  - US2 (Routines), US4 (Exercises), US6 (Settings) can start in parallel after US1
  - US7 (Quick Log) starts after US2 completes
  - US3 (Workout Logging) starts after US4 completes
  - US5 (Progress) starts after US3 completes
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 2 (Routines)

```bash
# Launch all contract tests together:
Task: "Contract test for GET /api/routines in tests/contract/routines.test.ts"
Task: "Contract test for POST /api/routines in tests/contract/routines.test.ts"
Task: "Contract test for GET /api/routines/[id] in tests/contract/routines.test.ts"

# Launch all components together:
Task: "Create RoutineForm in src/components/forms/RoutineForm.tsx"
Task: "Create RoutineCard in src/components/ui/RoutineCard.tsx"
Task: "Create RoutineWeekView in src/components/layout/RoutineWeekView.tsx"

# Launch all API routes together:
Task: "Implement GET /api/routines in src/app/api/routines/route.ts"
Task: "Implement POST /api/routines in src/app/api/routines/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T014)
2. Complete Phase 2: Foundational (T015-T042) — **CRITICAL — blocks all stories**
3. Complete Phase 3: User Story 1 (T043-T062)
4. **STOP and VALIDATE**: Test registration → email verification → login → dashboard access
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Auth) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Routines) + US4 (Exercises) in parallel → Test independently → Deploy/Demo
4. Add US7 (Quick Log) → Test independently → Deploy/Demo
5. Add US3 (Workout Logging) → Test independently → Deploy/Demo
6. Add US5 (Progress) + US6 (Settings) in parallel → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Auth) — must complete first
   - After US1: Developer A → US2, Developer B → US4, Developer C → US6
   - After US2: Developer A → US7
   - After US4: Developer B → US3
   - After US3: Developer B → US5
3. Stories complete and integrate independently

---

## Summary

- **Total Tasks**: 162
- **Task Count by Phase**:
  - Setup: 14 tasks
  - Foundational: 28 tasks
  - US1 (Auth, P1): 20 tasks (4 contract tests, 3 integration tests, 2 component tests, 11 implementation)
  - US2 (Routines, P2): 20 tasks (5 contract tests, 2 integration tests, 2 component tests, 11 implementation)
  - US4 (Exercises, P2): 15 tasks (2 contract tests, 2 integration tests, 2 component tests, 9 implementation)
  - US7 (Quick Log, P2): 9 tasks (1 contract test, 2 integration tests, 1 component test, 5 implementation)
  - US3 (Workout Logging, P3): 22 tasks (5 contract tests, 3 integration tests, 2 component tests, 12 implementation)
  - US5 (Progress, P3): 16 tasks (3 contract tests, 2 integration tests, 2 component tests, 9 implementation)
  - US6 (Settings, P3): 8 tasks (2 contract tests, 1 component test, 5 implementation)
  - Polish: 13 tasks
- **Parallel Opportunities**: 50+ tasks marked [P] for parallel execution
- **Independent Test Criteria**: Each user story has explicit independent test definition in spec.md
- **Data Isolation Coverage**: T069 (routines), T086 (exercises), T111 (workouts), T130 (progress) — all user stories with data have isolation tests
- **Suggested MVP Scope**: US1 (Auth) — registration, email verification, login, protected dashboard
