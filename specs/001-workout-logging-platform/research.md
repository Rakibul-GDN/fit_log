# Research: LogFit Workout Logging Platform

**Feature**: 001-workout-logging-platform
**Date**: 2026-04-09
**Purpose**: Resolve all NEEDS CLARIFICATION items and document technology decisions with rationale

---

## Decision 1: Email Service Provider

**Context**: Spec requires email verification for user login. Need to select an email delivery service for sending verification links and password reset emails.

**Decision**: **Resend** (primary) with Nodemailer as fallback

**Rationale**:

- Resend provides excellent developer experience with TypeScript SDK, built-in React email templates, and generous free tier (100 emails/day, 3,000/month)
- Native Next.js integration with documented patterns
- Simple API: `resend.emails.send()` with JSX template support
- Delivery analytics and webhook support for bounce/complaint tracking
- Nodemailer kept as fallback for local development (ETHereal.email) or self-hosted SMTP

**Alternatives considered**:

- **SendGrid**: More complex setup, requires API key management, less TypeScript-friendly
- **AWS SES**: Cheapest at scale but higher operational overhead; overkill for initial phase
- **Nodemailer only**: Requires SMTP server setup; unreliable for production delivery

---

## Decision 2: Authentication Strategy

**Context**: User requirement for email verification before account activation. Need to integrate NextAuth.js v5 with credentials provider + email verification flow.

**Decision**: **NextAuth.js v5 (Auth.js)** with custom credentials provider + manual email verification flow

**Rationale**:

- NextAuth.js v5 has native Next.js App Router support
- Provides session management, CSRF protection, secure password hashing (bcrypt)
- Credentials provider allows custom email verification flow (vs. built-in email provider which is OAuth-focused)
- Session can be stored in database (Prisma adapter) for server-side validation
- Middleware integration for route protection

**Email verification flow**:

1. User registers with email + password
2. System generates verification token (UUID), stores in DB with expiration (24 hours)
3. Verification email sent via Resend with tokenized link
4. User clicks link → token validated → email marked as verified
5. User cannot log in until email is verified
6. Password reset follows similar token-based flow

**Alternatives considered**:

- **Clerk**: Easier setup but vendor lock-in; less control over email verification flow
- **Custom JWT**: Reinventing auth is error-prone; NextAuth provides battle-tested patterns
- **Supabase Auth**: Requires external service; conflicts with self-hosted PostgreSQL decision

---

## Decision 3: API Response Contract Design

**Context**: User requirement for "common response pattern for paginated, non-paginated or error responses."

**Decision**: **Standardized envelope pattern** with discriminated union types

**Rationale**:

- Consistent response shape enables centralized Axios interceptor for error/loading state management
- TypeScript discriminated unions (`success: true | false`) provide type-safe response handling
- Pagination metadata (page, limit, total, totalPages, hasNext, hasPrev) included only when applicable

**Response contracts**:

```typescript
// Success: Non-paginated
{
  success: true;
  data: T;
  message?: string;
}

// Success: Paginated
{
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

// Error
{
  success: false;
  error: {
    code: string;        // Machine-readable error code (e.g., "VALIDATION_ERROR", "NOT_FOUND")
    message: string;     // User-friendly error message (for toast display)
    details?: Record<string, string[]>;  // Field-level validation errors
  };
}
```

**Alternatives considered**:

- **JSON:API spec**: More verbose; overkill for internal API
- **GraphQL**: Adds complexity; REST sufficient for this project scope
- **No envelope pattern**: Inconsistent error handling; harder to centralize loading/error states

---

## Decision 4: UI Component Library (HeroUI v3)

**Context**: User selected HeroUI v3 as the UI component library.

**Decision**: **HeroUI v3** (formerly NextUI) with Tailwind CSS customization

**Rationale**:

- HeroUI v3 is built for Next.js App Router with native React Server Component support
- Beautiful, minimal design system out-of-the-box (aligns with "unique, beautiful and minimal UI" requirement)
- Built-in accessibility (keyboard navigation, ARIA attributes, focus management)
- Tailwind CSS integration for custom styling (mobile-first responsive)
- Component variety: forms, modals, tables, charts, toasts — all required features covered
- Active development, good TypeScript support

**Alternatives considered**:

- **shadcn/ui**: More customizable but requires manual assembly of components
- **Chakra UI**: Good accessibility but larger bundle size
- **MUI**: Enterprise-grade but heavy; design system feels generic
- **Radix UI + Tailwind**: Maximum flexibility but requires building all components from scratch

---

## Decision 5: Animation Strategy (Framer Motion)

**Context**: User requirement for "proper page transitions and framer motion animations."

**Decision**: **Framer Motion** for page transitions + component-level animations

**Rationale**:

- Industry standard for React animations; declarative API
- Page transitions: Wrap route content in `<AnimatePresence>` + `<motion.div>` for enter/exit animations
- Component animations: Staggered list items, fade-ins, slide-ins for cards
- Performance: GPU-accelerated transforms (translate, opacity); avoids layout thrashing
- Integration: Works seamlessly with Next.js App Router using `usePathname()` for route change detection

**Animation patterns to implement**:

- Page transitions: Fade + slight vertical slide (200-300ms duration)
- Card/list items: Staggered fade-in on mount
- Modals/sheets: Scale + fade animation
- Loading states: Skeleton pulse animation (CSS)
- Form submissions: Button loading spinner with disabled state

**Alternatives considered**:

- **CSS transitions only**: Limited for page-level transitions; no React integration
- **React Spring**: More powerful but steeper learning curve; overkill for this project
- **GSAP**: Commercial license required for some features; larger bundle

---

## Decision 6: Database Architecture (API Layer Abstraction)

**Context**: User requirement: "we will not access db directly, we will create api's to fetch data."

**Decision**: **Prisma ORM + Next.js Route Handlers** as the exclusive data access pattern

**Rationale**:

- Prisma provides type-safe queries with auto-generated TypeScript types from schema
- Route handlers (`app/api/.../route.ts`) encapsulate all database operations
- Client components NEVER import `@prisma/client` directly — only interact through React Query hooks
- Enables contract testing: API responses validated against TypeScript types before consumption
- Future-proof: If external consumers need API access later, the contract already exists

**Data flow**:

```
Client Component → React Query Hook → Axios → API Route → Prisma → PostgreSQL
                    ↑                                          ↓
                    └────────── Response ◄─────────────────────┘
```

**Alternatives considered**:

- **Server Actions**: Simpler for internal-only data access but violates user requirement
- **tRPC**: Type-safe end-to-end but adds complexity; REST sufficient for this scope
- **Direct Prisma in Server Components**: Violates user requirement; harder to test in isolation

---

## Decision 7: Form Validation Strategy

**Context**: Multiple forms throughout app (login, register, routine creation, workout logging, settings). Need validation strategy.

**Decision**: **React Hook Form + Zod** for form validation

**Rationale**:

- React Hook Form: Performant (minimizes re-renders), uncontrolled form handling
- Zod: Schema validation with TypeScript type inference; shared between frontend and API routes
- `@hookform/resolvers`: Connects Zod schemas to React Hook Form
- Validation errors returned in standardized API error response format (`error.details` field)
- Enables DRY validation: Define Zod schema once, use on both client and server

**Alternatives considered**:

- **Formik + Yup**: Older pattern; React Hook Form is more performant
- **Zod alone**: Requires manual form state management
- **HTML5 validation**: Insufficient for complex cross-field validation; poor UX feedback

---

## Decision 8: Testing Framework Selection

**Context**: Constitution requires TDD with contract tests, component tests, integration tests, and E2E tests.

**Decision**: **Vitest** (unit/integration) + **React Testing Library** (components) + **Playwright** (E2E)

**Rationale**:

- **Vitest**: Faster than Jest, native ESM support, shared config with Vite, better TypeScript experience
- **React Testing Library**: Industry standard for component behavior testing; aligns with "behavior-driven tests" constitution requirement
- **Playwright**: Best cross-browser testing; auto-waiting, tracing, screenshots on failure
- **Contract testing**: Custom Vitest suite that validates API responses against TypeScript types using `zod` schemas

**Test organization**:

- `tests/contract/` — Validate API response shapes match contract types
- `tests/integration/` — Test multi-step flows (auth, routine CRUD, workout logging) with real DB
- `tests/components/` — Component behavior tests (forms, layouts, feedback states)
- `tests/e2e/` — Full user journey tests (Playwright)

**Alternatives considered**:

- **Jest**: Slower, requires Babel config; Vitest is drop-in replacement with better DX
- **Cypress**: Good E2E but Playwright has better multi-browser support and faster execution
- **Testing Library only**: Insufficient for API contract validation

---

## Decision 9: Error Boundary Strategy

**Context**: User requirement: "if some error occurs the whole app should not break, only the component that got the error should show proper and user friendly error message."

**Decision**: **Component-level error boundaries** with React 19 `use()` hook error handling + React Query error states

**Rationale**:

- React error boundaries (`componentDidCatch`) wrap individual components or component trees
- Each major section (workout log, progress chart, routine list) wrapped in its own `<ErrorBoundary>`
- Error boundary displays user-friendly message with retry option
- React Query provides error state in `useQuery` hook — components can display inline errors
- API-level errors caught by Axios interceptor and transformed into toast notifications
- Global `error.tsx` in App Router catches unhandled route-level errors

**Error boundary hierarchy**:

```
<App Error Boundary (route-level fallback)>
  <Dashboard Layout>
    <ErrorBoundary (sidebar section)>
    <ErrorBoundary (main content area)>
      <WorkoutLogSection>
        <ErrorBoundary (individual exercise card)>
```

**Alternatives considered**:

- **Single global error boundary**: Violates requirement; would break entire app on partial failure
- **Try/catch everywhere**: Insufficient for render-time errors; error boundaries required

---

## Decision 10: Loading State Strategy

**Context**: User requirement: "proper loading screens, loading messages, skeletons throughout the ui."

**Decision**: **Multi-level loading states** based on data fetch context

**Rationale**:

- **Full-page loading**: Route transitions (Next.js navigation) — spinner + loading message
- **Skeleton screens**: Data fetching for lists (workout history, exercise library, routine list)
- **Inline loading**: Form submissions (button spinner with disabled state)
- **Optimistic updates**: React Query `optimisticUpdates` for instant UI feedback on routine edits, with rollback on failure

**Loading state patterns**:

```typescript
// React Query loading states
const { data, isLoading, isError, error } = useWorkouts();

if (isLoading) return <WorkoutListSkeleton />;  // Skeleton
if (isError) return <ErrorBoundary error={error} />;  // Error
return <WorkoutList data={data} />;  // Content
```

**Skeleton components**:

- `WorkoutListSkeleton` — Card placeholders with pulsing animation
- `RoutineWeekSkeleton` — Table skeleton for weekly routine view
- `ProgressChartSkeleton` — Chart area placeholder
- `DashboardSkeleton` — Full page skeleton for initial load

**Alternatives considered**:

- **Spinner everywhere**: Poor UX; skeletons provide visual context during loading
- **No loading states**: Violates user requirement; unacceptable for async data fetching

---

## Decision 11: Image Handling

**Context**: Constitution requires `next/image` for all images. No user-uploaded images in current scope.

**Decision**: **`next/image`** for all images; static assets only (no user uploads in initial phase)

**Rationale**:

- Automatic optimization (WebP/AVIF conversion, responsive sizing, lazy loading)
- Constitution mandate: "Always use `next/image` for performance; never use raw `<img>` tags"
- No user-uploaded images in scope — only static assets (logos, icons, placeholder images)
- If user uploads added later: Integrate with Vercel Blob, Cloudinary, or AWS S3

---

## Decision 12: Environment Configuration

**Context**: Need to define environment variables for local development and production deployment.

**Decision**: **`.env.example` + `.env.local`** pattern with runtime validation

**Required environment variables**:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fitlog"

# NextAuth
NEXTAUTH_SECRET="<generate-with-openssl>"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="<api-key>"
EMAIL_FROM="noreply@fitlog.com"

# App
NODE_ENV="development" | "production"
```

**Runtime validation**: Zod schema validates env vars at startup; fails fast if required vars missing

---

## Summary of Resolved Decisions

| #   | Decision                  | Resolution                                            | Status      |
| --- | ------------------------- | ----------------------------------------------------- | ----------- |
| 1   | Email service provider    | Resend + Nodemailer fallback                          | ✅ Resolved |
| 2   | Authentication strategy   | NextAuth.js v5 + custom email verification            | ✅ Resolved |
| 3   | API response contract     | Standardized envelope with discriminated unions       | ✅ Resolved |
| 4   | UI component library      | HeroUI v3 + Tailwind CSS                              | ✅ Resolved |
| 5   | Animation strategy        | Framer Motion for page + component transitions        | ✅ Resolved |
| 6   | Database architecture     | Prisma + Route Handlers (no direct DB access)         | ✅ Resolved |
| 7   | Form validation           | React Hook Form + Zod                                 | ✅ Resolved |
| 8   | Testing framework         | Vitest + RTL + Playwright                             | ✅ Resolved |
| 9   | Error boundary strategy   | Component-level error boundaries + React Query errors | ✅ Resolved |
| 10  | Loading state strategy    | Multi-level (page, skeleton, inline, optimistic)      | ✅ Resolved |
| 11  | Image handling            | `next/image` for static assets only                   | ✅ Resolved |
| 12  | Environment configuration | `.env.example` + `.env.local` with Zod validation     | ✅ Resolved |

**All NEEDS CLARIFICATION items resolved.** Ready for Phase 1: Design & Contracts.
