# Data Model: LogFit Workout Logging Platform

**Feature**: 001-workout-logging-platform
**Date**: 2026-04-09
**Source**: [spec.md](./spec.md) — Key Entities section + Functional Requirements

---

## Entities

### 1. User

**Description**: Account holder with authentication credentials, preferences, and ownership of all personal data.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary key, auto-generated | Unique user identifier |
| `email` | String | Unique, required, indexed | User email address |
| `emailVerified` | Boolean | Required, default: `false` | Whether email has been verified |
| `passwordHash` | String | Required | Bcrypt hashed password |
| `name` | String | Optional, max 100 chars | Display name |
| `preferredUnits` | Enum | Required, default: `METRIC` | `METRIC` (kg/cm) or `IMPERIAL` (lbs/inches) |
| `createdAt` | DateTime | Required, auto-generated | Account creation timestamp |
| `updatedAt` | DateTime | Required, auto-updated | Last modification timestamp |
| `deletedAt` | DateTime | Optional | Soft delete timestamp (for account deletion grace period) |

**Relationships**:

- One-to-many: `User` → `Routine` (user can have multiple routines)
- One-to-many: `User` → `WorkoutLog` (user can have multiple workout logs)
- One-to-many: `User` → `Exercise` (user can create custom exercises)
- One-to-many: `User` → `BodyMeasurement` (user can record multiple measurements)
- One-to-many: `User` → `VerificationToken` (email verification/password reset tokens)

**Validation Rules**:

- Email must match standard email format regex
- Password must be minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number
- Name must be 1-100 characters if provided
- `emailVerified` must be `true` before user can access protected routes (enforced by middleware)

---

### 2. VerificationToken

**Description**: Token for email verification and password reset flows.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary key, auto-generated | Unique token identifier |
| `userId` | String (UUID) | Foreign key → `User.id`, required | Associated user |
| `token` | String | Unique, required, indexed | Random UUID token value |
| `type` | Enum | Required | `EMAIL_VERIFICATION` or `PASSWORD_RESET` |
| `expiresAt` | DateTime | Required | Token expiration (24 hours from creation) |
| `createdAt` | DateTime | Required, auto-generated | Creation timestamp |

**Relationships**:

- Many-to-one: `VerificationToken` → `User`

**Validation Rules**:

- Token expires after 24 hours
- Token is single-use (deleted after successful verification)
- Only one active token per type per user (previous tokens invalidated on new request)

**State Transitions**:

```
Created → Active → (Used | Expired)
                  → Deleted after use or cleanup
```

---

### 3. Routine

**Description**: Named weekly workout plan created by a user, containing exercise assignments for specific days. Users can maintain multiple concurrent routines.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary key, auto-generated | Unique routine identifier |
| `userId` | String (UUID) | Foreign key → `User.id`, required | Owner user |
| `name` | String | Required, max 100 chars, unique per user | Routine name (e.g., "Strength Phase") |
| `description` | String | Optional, max 500 chars | Routine description/notes |
| `createdAt` | DateTime | Required, auto-generated | Creation timestamp |
| `updatedAt` | DateTime | Required, auto-updated | Last modification timestamp |

**Relationships**:

- Many-to-one: `Routine` → `User`
- One-to-many: `Routine` → `ExerciseAssignment` (routine contains multiple exercise assignments)

**Validation Rules**:

- Name must be 1-100 characters
- Name must be unique per user (case-insensitive)
- User can create unlimited routines (no hard limit, but SC-002 implies reasonable usage)
- Deleting a routine DOES NOT delete associated workout logs (logs retain snapshot of data at time of creation)

---

### 4. Exercise

**Description**: Definition of a specific workout activity. Can be system-provided (default library) or user-created (personal exercise).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary key, auto-generated | Unique exercise identifier |
| `name` | String | Required, max 100 chars | Exercise name (e.g., "Bench Press") |
| `description` | String | Optional, max 500 chars | Exercise description/form notes |
| `category` | Enum | Required | Exercise category (see enum below) |
| `primaryMuscles` | String[] | Required | Primary muscle groups targeted |
| `isSystemExercise` | Boolean | Required, default: `false` | Whether this is a default library exercise |
| `createdById` | String (UUID) | Foreign key → `User.id`, required if `isSystemExercise = false` | User who created this custom exercise |
| `createdAt` | DateTime | Required, auto-generated | Creation timestamp |

**Category Enum Values**:

- `BARBELL`, `DUMBBELL`, `MACHINE`, `CABLE`, `BODYWEIGHT`, `KETTLEBELL`, `RESISTANCE_BAND`, `OTHER`

**Relationships**:

- Many-to-one: `Exercise` → `User` (only for user-created exercises; `null` for system exercises)
- One-to-many: `Exercise` → `ExerciseAssignment` (exercise used in multiple routines)
- One-to-many: `Exercise` → `LogEntry` (exercise logged in multiple workouts)

**Validation Rules**:

- Name must be 1-100 characters
- System exercises have `createdById = null` and `isSystemExercise = true`
- User exercises have `createdById` set and `isSystemExercise = false`
- Deleting a user exercise that is referenced by active routines or workout logs: **soft delete** (mark as `deleted: true`) rather than hard delete to preserve historical data integrity

---

### 5. ExerciseAssignment

**Description**: Association of an exercise to a specific day within a routine, including default sets, reps, and weight.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary key, auto-generated | Unique assignment identifier |
| `routineId` | String (UUID) | Foreign key → `Routine.id`, required | Parent routine |
| `exerciseId` | String (UUID) | Foreign key → `Exercise.id`, required | Associated exercise |
| `dayOfWeek` | Enum | Required | `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY` |
| `defaultSets` | Int | Required, min: 1, default: 3 | Default number of sets |
| `defaultReps` | Int | Required, min: 1, default: 10 | Default repetitions per set |
| `defaultWeight` | Float | Required, min: 0, default: 0 | Default weight (0 for bodyweight) |
| `order` | Int | Required, min: 0 | Display order within the day (for sorting exercises) |

**Relationships**:

- Many-to-one: `ExerciseAssignment` → `Routine`
- Many-to-one: `ExerciseAssignment` → `Exercise`

**Validation Rules**:

- `defaultSets` must be 1-100
- `defaultReps` must be 1-500
- `defaultWeight` must be >= 0 (0 = bodyweight exercise)
- Same exercise can be assigned to multiple days within the same routine
- Same exercise can appear only once per day within a routine (no duplicates on same day)
- `order` determines display sequence within a day's exercise list

---

### 6. WorkoutLog

**Description**: Record of a completed workout session containing date, day of week, exercises performed, and performance data. May originate from routine copy (quick log) or manual entry.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary key, auto-generated | Unique workout log identifier |
| `userId` | String (UUID) | Foreign key → `User.id`, required | Owner user |
| `routineId` | String (UUID) | Foreign key → `Routine.id`, optional | Source routine if copied via quick log; `null` for manual logs |
| `dayOfWeek` | Enum | Required | Day of week the workout was performed |
| `workoutDate` | DateTime | Required, indexed | Date the workout was performed (supports backdated entries) |
| `notes` | String | Optional, max 1000 chars | User notes for this workout session |
| `createdAt` | DateTime | Required, auto-generated | Creation timestamp |
| `updatedAt` | DateTime | Required, auto-updated | Last modification timestamp |

**Relationships**:

- Many-to-one: `WorkoutLog` → `User`
- Many-to-one: `WorkoutLog` → `Routine` (optional, for quick logs)
- One-to-many: `WorkoutLog` → `LogEntry` (workout contains multiple exercise records)

**Validation Rules**:

- `workoutDate` cannot be in the future
- If `routineId` is set, the routine must belong to the same user
- Deleting a workout log deletes all associated `LogEntry` records (cascade)
- `notes` limited to 1000 characters

---

### 7. LogEntry

**Description**: Individual exercise record within a workout log with specific performance metrics. For copied logs, stores actual performed values separate from routine defaults.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary key, auto-generated | Unique log entry identifier |
| `workoutLogId` | String (UUID) | Foreign key → `WorkoutLog.id`, required | Parent workout log |
| `exerciseId` | String (UUID) | Foreign key → `Exercise.id`, required | Exercise performed |
| `setsCompleted` | Int | Required, min: 1 | Actual sets completed |
| `repsPerSet` | Int[] | Required, length = `setsCompleted` | Repetitions for each set (allows varying reps per set) |
| `weight` | Float | Required, min: 0 | Weight used (0 for bodyweight) |
| `notes` | String | Optional, max 500 chars | Notes for this specific exercise |

**Relationships**:

- Many-to-one: `LogEntry` → `WorkoutLog`
- Many-to-one: `LogEntry` → `Exercise`

**Validation Rules**:

- `setsCompleted` must be 1-100
- `repsPerSet` array length must match `setsCompleted`
- Each value in `repsPerSet` must be 1-500
- `weight` must be >= 0
- `notes` limited to 500 characters

**Computed Properties** (not stored, calculated on-demand):

- `totalVolume` = `weight` × sum(`repsPerSet`) — used for progress tracking (FR-013)
- `totalReps` = sum(`repsPerSet`) — used for progress tracking

---

### 8. BodyMeasurement

**Description**: Recorded body weight or body part measurement with an associated date for tracking physical changes.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary key, auto-generated | Unique measurement identifier |
| `userId` | String (UUID) | Foreign key → `User.id`, required | Owner user |
| `measurementType` | Enum | Required | Body part being measured (see enum below) |
| `value` | Float | Required, min: 0, max: 1000 | Measurement value |
| `unit` | Enum | Required | `KG`, `LBS`, `CM`, `INCHES` |
| `measurementDate` | DateTime | Required, indexed | Date of measurement |
| `notes` | String | Optional, max 500 chars | Optional notes |
| `createdAt` | DateTime | Required, auto-generated | Creation timestamp |

**MeasurementType Enum Values**:

- `BODY_WEIGHT`, `CHEST`, `WAIST`, `HIPS`, `LEFT_ARM`, `RIGHT_ARM`, `LEFT_THIGH`, `RIGHT_THIGH`, `LEFT_CALF`, `RIGHT_CALF`, `SHOULDERS`, `NECK`, `BODY_FAT_PERCENTAGE`

**Relationships**:

- Many-to-one: `BodyMeasurement` → `User`

**Validation Rules**:

- `value` must be > 0
- `unit` must match user's preferred unit system (metric/imperial) — conversion on display only
- `measurementDate` cannot be in the future
- Multiple measurements of same type on same date allowed (user can update throughout day)

---

## Entity Relationship Diagram

```
User (1) ────< (M) Routine
User (1) ────< (M) WorkoutLog
User (1) ────< (M) Exercise (user-created only)
User (1) ────< (M) BodyMeasurement
User (1) ────< (M) VerificationToken

Routine (1) ────< (M) ExerciseAssignment
Exercise (1) ────< (M) ExerciseAssignment

WorkoutLog (1) ────< (M) LogEntry
Exercise (1) ────< (M) LogEntry

Routine (1) ────< (0..1) WorkoutLog (via routineId, optional for quick logs)
```

---

## Validation Rules Summary (from Functional Requirements)

| Requirement | Entity               | Validation Rule                                                                           |
| ----------- | -------------------- | ----------------------------------------------------------------------------------------- |
| FR-001      | User                 | Email format valid, password meets complexity (min 8 chars, uppercase, lowercase, number) |
| FR-004      | Routine              | Name 1-100 chars, unique per user                                                         |
| FR-005      | ExerciseAssignment   | Sets 1-100, reps 1-500, weight >= 0                                                       |
| FR-007      | WorkoutLog, LogEntry | Date not in future, sets 1-100, reps 1-500, weight >= 0                                   |
| FR-010      | Exercise             | Name 1-100 chars, category required, primary muscles required                             |
| FR-012      | User                 | preferredUnits must be METRIC or IMPERIAL                                                 |
| FR-014      | BodyMeasurement      | Value > 0, unit matches measurement type, date not in future                              |
| FR-016      | All entities         | Data isolation: all queries filtered by `userId` (enforced by middleware + API layer)     |
| FR-017      | All entities         | Input validation at API layer with Zod schemas; clear error messages returned             |

---

## Indexing Strategy

| Entity             | Index                                                    | Purpose                                            |
| ------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| User               | `email` (unique)                                         | Fast lookup during authentication                  |
| WorkoutLog         | `userId + workoutDate` (composite)                       | Fast workout history queries by date range         |
| WorkoutLog         | `userId + routineId` (composite)                         | Quick log deduplication, routine-based queries     |
| LogEntry           | `exerciseId + workoutLogId` (composite)                  | Progress tracking queries for specific exercise    |
| ExerciseAssignment | `routineId + dayOfWeek + order` (composite)              | Routine weekly view rendering                      |
| BodyMeasurement    | `userId + measurementType + measurementDate` (composite) | Progress chart queries by measurement type         |
| VerificationToken  | `token` (unique)                                         | Fast token lookup during verification              |
| VerificationToken  | `userId + type + expiresAt` (composite)                  | Active token validation, cleanup of expired tokens |

---

## State Transitions

### VerificationToken

```
Created (active, not expired) → Used (deleted after successful verification)
                              → Expired (past expiresAt, cleaned up by cron or on next request)
```

### WorkoutLog

```
Draft (in progress, auto-saved) → Completed (saved by user)
                                → Discarded (deleted without saving)
```

### Exercise (user-created)

```
Active → Soft Deleted (marked deleted, preserved for historical log entry integrity)
```

---

## Notes

- **Soft deletes**: Exercises and Routines use soft delete pattern to preserve historical workout log integrity
- **No cascade deletes for routines**: Deleting a routine does NOT cascade to workout logs — logs retain snapshot data
- **Cascading deletes**: Deleting a workout log DOES cascade to its log entries (entries have no meaning without parent log)
- **Data isolation**: Every query MUST include `WHERE userId = currentUser.id` clause — enforced at API layer, never trusted to client
- **Audit trail**: `createdAt` and `updatedAt` timestamps on all entities for debugging and progress tracking
