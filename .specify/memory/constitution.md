<!--
## Sync Impact Report
- **Version Change**: N/A → 1.0.0 (Initial constitution)
- **Modified Principles**: N/A (first version)
- **Added Sections**:
  - Core Principles (5 principles)
  - Technology Stack & Architecture Constraints
  - Development Workflow & Quality Gates
  - Governance
- **Templates Requiring Updates**:
  - ✅ plan-template.md: Constitution Check section will reference Next.js/React specifics
  - ✅ spec-template.md: Aligned with TDD-first approach
  - ✅ tasks-template.md: Includes TDD workflow, TypeScript setup tasks
- **Follow-up TODOs**: None
-->

# Fit Log Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

Every feature, component, and integration MUST follow strict TDD methodology:

- **Red-Green-Refactor Cycle**: Tests written FIRST → Tests fail → Implementation → Tests pass → Refactor
- **Contract Tests**: All API routes, server actions, and shared interfaces MUST have contract tests before implementation
- **Component Tests**: React components MUST be tested with React Testing Library using behavior-driven tests
- **Integration Tests**: Database operations, authentication flows, and external service integrations require integration tests
- **No Exceptions**: Code without corresponding tests MUST NOT be merged, regardless of time pressure

**Rationale**: TDD ensures correctness by design, reduces regression bugs, and forces clear API boundaries before implementation begins.

### II. TypeScript Strictness (NON-NEGOTIABLE)

All code MUST be written in TypeScript with strict compiler settings enabled:

- **`strict: true`**: NoImplicitAny, strictNullChecks, strictFunctionTypes all enforced
- **No `any` Type**: Use `unknown` with type guards, or define proper interfaces
- **Explicit Return Types**: All functions MUST declare return types explicitly
- **Discriminated Unions**: Prefer tagged unions over optional properties for variant types
- **Type Imports**: Use `import type` for type-only imports to optimize bundle size
- **Generics Over Overloads**: Use generic functions instead of function overloading where possible

**Rationale**: Strict TypeScript catches errors at compile time, improves IDE experience, and serves as living documentation for data shapes.

### III. Functional Programming First

Prefer functional programming patterns over object-oriented approaches:

- **Pure Functions**: All business logic MUST be pure functions with explicit input/output types
- **Immutability**: Use `readonly` modifiers, avoid mutations, prefer spread operators and immutable update patterns
- **Function Composition**: Compose small functions rather than creating large class methods
- **Custom Hooks Over HOCs**: Extract React logic into custom hooks, not higher-order components
- **Server Components by Default**: Use React Server Components unless client interactivity is required
- **No Classes for Business Logic**: Classes only for React components (if using class components) or third-party library requirements

**Rationale**: Functional programming reduces side effects, improves testability, enables better React Server Component patterns, and aligns with Next.js App Router architecture.

### IV. Next.js Best Practices & Architecture

Follow Next.js conventions and leverage framework capabilities:

- **App Router Structure**: Use `app/` directory with nested layouts, server components, and route handlers
- **Server Actions**: Prefer Server Actions for form handling and mutations over API routes when possible
- **Route Handlers**: Use `route.ts` for external APIs, webhooks, or third-party integrations
- **File-Based Routing**: Leverage Next.js routing conventions; avoid dynamic routing unless necessary
- **Metadata API**: Use `generateMetadata` for SEO; avoid hardcoded `<head>` tags
- **Image Optimization**: Always use `next/image` for performance; never use raw `<img>` tags
- **Environment Variables**: Access via `process.env` with runtime validation; never expose server secrets to client
- **Middleware**: Use `middleware.ts` for authentication, redirects, and request modification at edge

**Rationale**: Next.js provides optimized patterns out-of-the-box; fighting the framework leads to performance issues and maintenance overhead.

### V. Component Architecture & Testing Discipline

React components MUST follow strict architectural and testing standards:

- **Component Composition**: Small, single-responsibility components composed into larger features
- **Props Over Context**: Use props for data flow; Context only for truly global state (theme, auth, locale)
- **Behavior-Driven Tests**: Test user interactions and outcomes, not implementation details
- **Accessibility (a11y)**: All components MUST pass axe-core accessibility tests
- **Responsive by Default**: Components MUST work across mobile, tablet, and desktop breakpoints
- **Storybook for Complex UI**: Components with 3+ states or complex interactions require Storybook documentation

**Rationale**: Component discipline ensures reusability, accessibility compliance, and testable UI that matches user expectations.

## Technology Stack & Architecture Constraints

**Framework**: Next.js 14+ with App Router (TypeScript)
**Language**: TypeScript 5+ with `strict: true` enabled
**Testing Stack**:

- Unit/Integration: Vitest or Jest (project decision)
- Component Testing: React Testing Library
- E2E Testing: Playwright
- Contract Testing: Custom contract test suite for API routes
  **State Management**: React Server Components + Server Actions (prefer); Zustand/Jotai for client state if needed
  **Styling**: Tailwind CSS or CSS Modules (project decision); no inline styles
  **Database/ORM**: Prisma or Drizzle (project decision); type-safe queries required
  **Authentication**: NextAuth.js or Clerk (project decision); server-side session validation
  **Linting/Formatting**: ESLint with `@typescript-eslint`, Prettier, `eslint-config-next`
  **CI/CD**: GitHub Actions; all PRs MUST pass lint, type-check, and test gates

**Performance Requirements**:

- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- API Response Time: p95 < 500ms for server actions/route handlers
- Bundle Size: Client bundles < 200KB gzipped (initial load)

## Development Workflow & Quality Gates

**Pre-Commit Requirements**:

1. ESLint passes with zero warnings
2. Prettier formatting applied
3. TypeScript compiler (`tsc --noEmit`) passes with zero errors
4. All tests pass (`npm test`)
5. Test coverage meets project minimum (TBD: set percentage threshold)

**Pull Request Requirements**:

1. All automated CI checks pass
2. Code reviewed by at least one team member
3. Constitution compliance verified by reviewer
4. No `@ts-ignore` or `@ts-expect-error` without documented justification
5. Changes tested on both development and production builds

**Deployment Gates**:

1. Full test suite passes (unit + integration + E2E)
2. No TypeScript errors or ESLint violations
3. Production build succeeds (`next build`)
4. Environment-specific configurations validated
5. Rollback plan documented for production deployments

**Code Review Checklist**:

- [ ] TDD followed: tests exist and were written before implementation
- [ ] No `any` types used without justification
- [ ] Functional patterns preferred over classes
- [ ] Server Components used unless client interactivity required
- [ ] Accessibility requirements met
- [ ] Error handling comprehensive
- [ ] Environment variables properly validated

## Governance

**Amendment Process**:
This constitution supersedes all development practices. Amendments require:

1. Proposed change documented with rationale
2. Team review and approval
3. Migration plan for existing code if change is breaking
4. Version bump according to semantic versioning
5. All dependent templates updated before merge

**Versioning Policy**:

- **MAJOR**: Backward incompatible principle removals or redefinitions
- **MINOR**: New principles added or existing guidance expanded
- **PATCH**: Clarifications, wording improvements, typo fixes

**Compliance Review**:

- All PRs MUST verify constitution compliance before merge
- Violations require documented justification in PR description
- Complexity or deviations from principles MUST be justified in Complexity Tracking section of implementation plan
- Regular audits of codebase against constitution principles (frequency: TBD)

**Runtime Guidance**:
For day-to-day development decisions not covered here, follow:

1. Next.js official documentation and recommended patterns
2. React Server Components documentation
3. TypeScript Handbook (strict mode guidelines)
4. This constitution takes precedence over external guidelines when conflicts arise

**Version**: 1.0.0 | **Ratified**: 2026-04-09 | **Last Amended**: 2026-04-09
