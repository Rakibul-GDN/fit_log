import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { WorkoutLog } from '@/types/entities';
import type { PaginatedResponse, SuccessResponse } from '@/types/api';

/** Fetch workouts list with optional date filter */
async function fetchWorkouts(
  page: number,
  pageSize: number,
  fromDate?: string,
  toDate?: string,
): Promise<PaginatedResponse<WorkoutLog>> {
  const { data } = await apiClient.get<PaginatedResponse<WorkoutLog>>('/workouts', {
    params: { page, pageSize, fromDate, toDate },
  });
  return data;
}

/** Fetch single workout detail */
async function fetchWorkout(workoutId: string): Promise<SuccessResponse<WorkoutLog>> {
  const { data } = await apiClient.get<SuccessResponse<WorkoutLog>>(`/workouts/${workoutId}`);
  return data;
}

/** Create workout mutation */
async function createWorkout(
  input: { dayOfWeek: string; workoutDate: string; notes?: string; entries: { exerciseId: string; setsCompleted: number; repsPerSet: number[]; weight: number; notes?: string }[] },
): Promise<SuccessResponse<WorkoutLog>> {
  const { data } = await apiClient.post<SuccessResponse<WorkoutLog>>('/workouts', input);
  return data;
}

/** Update workout mutation */
async function updateWorkout(
  workoutId: string,
  input: { dayOfWeek?: string; workoutDate?: string; notes?: string; entries?: { exerciseId: string; setsCompleted: number; repsPerSet: number[]; weight: number; notes?: string }[] },
): Promise<SuccessResponse<WorkoutLog>> {
  const { data } = await apiClient.patch<SuccessResponse<WorkoutLog>>(`/workouts/${workoutId}`, input);
  return data;
}

/** Delete workout mutation */
async function deleteWorkout(workoutId: string): Promise<void> {
  await apiClient.delete(`/workouts/${workoutId}`);
}

/** Query hook: List workouts */
export function useWorkouts(page = 1, pageSize = 20, fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: ['workouts', page, pageSize, fromDate, toDate],
    queryFn: () => fetchWorkouts(page, pageSize, fromDate, toDate),
  });
}

/** Query hook: Single workout */
export function useWorkout(workoutId: string) {
  return useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => fetchWorkout(workoutId),
    enabled: !!workoutId,
  });
}

/** Mutation hook: Create workout */
export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkout,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['workouts'] }); },
  });
}

/** Mutation hook: Update workout */
export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workoutId, input }: { workoutId: string; input: { dayOfWeek?: string; workoutDate?: string; notes?: string; entries?: { exerciseId: string; setsCompleted: number; repsPerSet: number[]; weight: number; notes?: string }[] } }) =>
      updateWorkout(workoutId, input),
    onSuccess: (_, { workoutId }) => {
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      void queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
    },
  });
}

/** Mutation hook: Delete workout */
export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['workouts'] }); },
  });
}
