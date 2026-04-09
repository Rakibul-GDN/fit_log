# API Response Contracts

**Feature**: 001-workout-logging-platform
**Date**: 2026-04-09
**Purpose**: Define standardized API response shapes for all route handlers

---

## Standard Response Envelope

All API responses follow this envelope pattern:

### Success Response (Non-Paginated)

```typescript
{
  success: true;
  data: T;
  message?: string;  // Optional user-facing confirmation message
}
```

### Success Response (Paginated)

```typescript
{
  success: true;
  data: T[];
  pagination: {
    page: number;       // Current page (1-indexed)
    limit: number;      // Items per page
    total: number;      // Total items across all pages
    totalPages: number; // Calculated: Math.ceil(total / limit)
    hasNext: boolean;   // page < totalPages
    hasPrev: boolean;   // page > 1
  };
  message?: string;
}
```

### Error Response

```typescript
{
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // User-friendly message (for toast display)
    details?: Record<string, string[]>;  // Field-level validation errors
  };
}
```

---

## Error Code Registry

| Code                 | HTTP Status | Description                                 |
| -------------------- | ----------- | ------------------------------------------- |
| `VALIDATION_ERROR`   | 400         | Request body/query params failed validation |
| `UNAUTHORIZED`       | 401         | User not authenticated or session expired   |
| `FORBIDDEN`          | 403         | User lacks permission for this resource     |
| `NOT_FOUND`          | 404         | Resource does not exist                     |
| `CONFLICT`           | 409         | Resource conflict (e.g., duplicate name)    |
| `RATE_LIMITED`       | 429         | Too many requests                           |
| `INTERNAL_ERROR`     | 500         | Unexpected server error                     |
| `EMAIL_NOT_VERIFIED` | 403         | User email not yet verified                 |

---

## Contract: Authentication

### POST `/api/auth/register`

**Request Body**:

```typescript
{
  email: string;       // Valid email format
  password: string;    // Min 8 chars, uppercase, lowercase, number
  name?: string;       // Optional, max 100 chars
}
```

**Response 201** (Success):

```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: false;
    message: 'Account created. Please check your email to verify your account.';
  }
}
```

**Response 409** (Email already registered):

```typescript
{
  success: false;
  error: {
    code: 'CONFLICT';
    message: 'An account with this email already exists.';
  }
}
```

**Response 400** (Validation error):

```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR";
    message: "Invalid input data.";
    details: {
      email?: string[];  // e.g., ["Invalid email format"]
      password?: string[];  // e.g., ["Password must contain at least one uppercase letter"]
    };
  };
}
```

---

### POST `/api/auth/verify-email`

**Request Body**:

```typescript
{
  token: string; // Verification token from email link
}
```

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    verified: true;
    message: 'Email verified successfully. You can now log in.';
  }
}
```

**Response 400** (Invalid/expired token):

```typescript
{
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: 'Invalid or expired verification link.';
  }
}
```

---

### POST `/api/auth/resend-verification`

**Request Body**:

```typescript
{
  email: string;
}
```

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    message: 'Verification email resent. Please check your inbox.';
  }
}
```

---

### POST `/api/auth/forgot-password`

**Request Body**:

```typescript
{
  email: string;
}
```

**Response 200** (Success — always returns 200 even if email not found, to prevent email enumeration):

```typescript
{
  success: true;
  data: {
    message: 'If an account exists with this email, a password reset link has been sent.';
  }
}
```

---

### POST `/api/auth/reset-password`

**Request Body**:

```typescript
{
  token: string;
  newPassword: string; // Min 8 chars, uppercase, lowercase, number
}
```

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    message: 'Password reset successfully. You can now log in.';
  }
}
```

**Response 400** (Invalid/expired token):

```typescript
{
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: 'Invalid or expired reset link.';
  }
}
```

---

## Contract: Routines

### GET `/api/routines`

**Query Params**:

```typescript
{
  page?: number;   // Default: 1
  limit?: number;  // Default: 10, max: 50
}
```

**Response 200** (Paginated):

```typescript
{
  success: true;
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: string;  // ISO 8601 date
    updatedAt: string;
    exerciseCount: number;  // Total exercises across all days
  }>;
  pagination: { ... };
}
```

---

### POST `/api/routines`

**Request Body**:

```typescript
{
  name: string;         // 1-100 chars, unique per user
  description?: string; // Optional, max 500 chars
  exercises: Array<{
    exerciseId: string;
    dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
    defaultSets?: number;    // 1-100, default: 3
    defaultReps?: number;    // 1-500, default: 10
    defaultWeight?: number;  // >= 0, default: 0
    order?: number;          // >= 0
  }>;
}
```

**Response 201** (Success):

```typescript
{
  success: true;
  data: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }
}
```

**Response 409** (Duplicate name):

```typescript
{
  success: false;
  error: {
    code: 'CONFLICT';
    message: 'A routine with this name already exists.';
  }
}
```

---

### GET `/api/routines/[routineId]`

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    exercises: Array<{
      id: string;
      exerciseId: string;
      exercise: {
        id: string;
        name: string;
        category: string;
        primaryMuscles: string[];
      };
      dayOfWeek: string;
      defaultSets: number;
      defaultReps: number;
      defaultWeight: number;
      order: number;
    }>;
  }
}
```

**Response 404**:

```typescript
{
  success: false;
  error: {
    code: 'NOT_FOUND';
    message: 'Routine not found.';
  }
}
```

---

### PATCH `/api/routines/[routineId]`

**Request Body** (all fields optional):

```typescript
{
  name?: string;
  description?: string;
  exercises?: Array<{
    id?: string;       // Existing assignment ID (for updates)
    exerciseId: string;
    dayOfWeek: string;
    defaultSets?: number;
    defaultReps?: number;
    defaultWeight?: number;
    order?: number;
  }>;
}
```

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    id: string;
    name: string;
    updatedAt: string;
  }
}
```

---

### DELETE `/api/routines/[routineId]`

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    message: 'Routine deleted successfully.';
  }
}
```

**Note**: Soft delete — routine marked as deleted but preserved for historical workout log integrity.

---

### POST `/api/routines/[routineId]/quick-log`

**Request Body**:

```typescript
{
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  workoutDate?: string;  // ISO 8601, default: today
}
```

**Response 201** (Success — creates a new workout log pre-filled from routine):

```typescript
{
  success: true;
  data: {
    workoutLogId: string;
    routineId: string;
    dayOfWeek: string;
    workoutDate: string;
    entries: Array<{
      id: string;
      exerciseId: string;
      exercise: {
        id: string;
        name: string;
        category: string;
      };
      setsCompleted: number; // Pre-filled from routine defaultSets
      repsPerSet: number[]; // Pre-filled: array of defaultReps, length = defaultSets
      weight: number; // Pre-filled from routine defaultWeight
    }>;
  }
}
```

**Response 400** (No exercises for selected day):

```typescript
{
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: 'No exercises are scheduled for this day in the selected routine.';
  }
}
```

---

## Contract: Workouts

### GET `/api/workouts`

**Query Params**:

```typescript
{
  page?: number;
  limit?: number;
  startDate?: string;  // ISO 8601, filter by date range
  endDate?: string;    // ISO 8601
}
```

**Response 200** (Paginated):

```typescript
{
  success: true;
  data: Array<{
    id: string;
    dayOfWeek: string;
    workoutDate: string;
    notes: string | null;
    routineName: string | null;  // null if manual log
    entryCount: number;          // Number of exercises logged
    totalVolume: number;         // Sum of all entry volumes
    createdAt: string;
  }>;
  pagination: { ... };
}
```

---

### POST `/api/workouts`

**Request Body** (Manual workout logging):

```typescript
{
  dayOfWeek: string;
  workoutDate: string;  // ISO 8601, not in future
  notes?: string;       // Max 1000 chars
  entries: Array<{
    exerciseId: string;
    setsCompleted: number;   // 1-100
    repsPerSet: number[];    // Length = setsCompleted, each 1-500
    weight: number;          // >= 0
    notes?: string;          // Max 500 chars
  }>;
}
```

**Response 201** (Success):

```typescript
{
  success: true;
  data: {
    id: string;
    workoutDate: string;
    entryCount: number;
    totalVolume: number;
  }
}
```

---

### GET `/api/workouts/[workoutId]`

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    id: string;
    dayOfWeek: string;
    workoutDate: string;
    notes: string | null;
    routineName: string | null;
    createdAt: string;
    updatedAt: string;
    entries: Array<{
      id: string;
      exercise: {
        id: string;
        name: string;
        category: string;
      };
      setsCompleted: number;
      repsPerSet: number[];
      weight: number;
      totalVolume: number; // Computed: weight * sum(repsPerSet)
      notes: string | null;
    }>;
  }
}
```

---

### PATCH `/api/workouts/[workoutId]`

**Request Body** (all fields optional):

```typescript
{
  notes?: string;
  entries?: Array<{
    id?: string;       // Existing entry ID (for updates)
    exerciseId: string;
    setsCompleted: number;
    repsPerSet: number[];
    weight: number;
    notes?: string;
  }>;
}
```

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    id: string;
    updatedAt: string;
  }
}
```

---

### DELETE `/api/workouts/[workoutId]`

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    message: 'Workout log deleted successfully.';
  }
}
```

---

## Contract: Exercises

### GET `/api/exercises`

**Query Params**:

```typescript
{
  page?: number;
  limit?: number;
  search?: string;       // Search by name
  category?: string;     // Filter by category
  includeCustom?: boolean;  // Include user-created exercises, default: true
}
```

**Response 200** (Paginated):

```typescript
{
  success: true;
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    primaryMuscles: string[];
    isSystemExercise: boolean;
    createdById: string | null;
  }>;
  pagination: { ... };
}
```

---

### POST `/api/exercises`

**Request Body**:

```typescript
{
  name: string;           // 1-100 chars
  description?: string;   // Max 500 chars
  category: "BARBELL" | "DUMBBELL" | "MACHINE" | "CABLE" | "BODYWEIGHT" | "KETTLEBELL" | "RESISTANCE_BAND" | "OTHER";
  primaryMuscles: string[];  // At least 1 muscle group
}
```

**Response 201** (Success):

```typescript
{
  success: true;
  data: {
    id: string;
    name: string;
    category: string;
    isSystemExercise: false;
  }
}
```

---

## Contract: Progress

### GET `/api/progress`

**Query Params**:

```typescript
{
  exerciseId: string;   // Required: which exercise to get progress for
  startDate?: string;   // ISO 8601, default: 90 days ago
  endDate?: string;     // ISO 8601, default: today
}
```

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    exerciseId: string;
    exerciseName: string;
    datapoints: Array<{
      date: string;
      workoutLogId: string;
      setsCompleted: number;
      repsPerSet: number[];
      weight: number;
      totalVolume: number; // Computed
      totalReps: number; // Computed
    }>;
    summary: {
      firstRecord: {
        date: string;
        weight: number;
        totalVolume: number;
      }
      latestRecord: {
        date: string;
        weight: number;
        totalVolume: number;
      }
      weightProgression: number; // latest.weight - first.weight
      volumeProgression: number; // latest.totalVolume - first.totalVolume;
    }
  }
}
```

**Response 404** (No data):

```typescript
{
  success: false;
  error: {
    code: 'NOT_FOUND';
    message: 'No workout data found for this exercise.';
  }
}
```

---

## Contract: Body Measurements

### GET `/api/progress/measurements`

**Query Params**:

```typescript
{
  measurementType?: string;  // Filter by type, optional
  startDate?: string;        // ISO 8601
  endDate?: string;          // ISO 8601
}
```

**Response 200** (Success):

```typescript
{
  success: true;
  data: Array<{
    id: string;
    measurementType: string;
    value: number;
    unit: string;
    measurementDate: string;
    notes: string | null;
  }>;
}
```

---

### POST `/api/progress/measurements`

**Request Body**:

```typescript
{
  measurementType: "BODY_WEIGHT" | "CHEST" | "WAIST" | "HIPS" | "LEFT_ARM" | "RIGHT_ARM" | "LEFT_THIGH" | "RIGHT_THIGH" | "LEFT_CALF" | "RIGHT_CALF" | "SHOULDERS" | "NECK" | "BODY_FAT_PERCENTAGE";
  value: number;        // > 0, max 1000
  unit: "KG" | "LBS" | "CM" | "INCHES";
  measurementDate?: string;  // ISO 8601, default: today
  notes?: string;            // Max 500 chars
}
```

**Response 201** (Success):

```typescript
{
  success: true;
  data: {
    id: string;
    measurementType: string;
    value: number;
    measurementDate: string;
  }
}
```

---

### DELETE `/api/progress/measurements/[measurementId]`

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    message: 'Measurement deleted successfully.';
  }
}
```

---

## Contract: Settings

### GET `/api/settings`

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    preferredUnits: 'METRIC' | 'IMPERIAL';
    name: string | null;
    email: string;
    emailVerified: boolean;
  }
}
```

---

### PATCH `/api/settings`

**Request Body** (all fields optional):

```typescript
{
  name?: string;          // 1-100 chars
  preferredUnits?: "METRIC" | "IMPERIAL";
}
```

**Response 200** (Success):

```typescript
{
  success: true;
  data: {
    preferredUnits: string;
    name: string | null;
    updatedAt: string;
  }
}
```

---

## Notes

- **Authentication**: All routes except `/api/auth/register`, `/api/auth/verify-email`, `/api/auth/resend-verification`, and `/api/auth/forgot-password` require valid session. Unauthenticated requests return `401 UNAUTHORIZED`.
- **Data Isolation**: All authenticated endpoints filter results by `userId` from session — users can only access their own data.
- **Pagination**: Default page size 10, max 50. Client can specify `page` and `limit` query params.
- **Date Format**: All dates returned in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Error Handling**: All errors return standardized error envelope. HTTP status codes align with error codes.
