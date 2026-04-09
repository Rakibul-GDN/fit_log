import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { Routine } from '@/types/entities';
import type { PaginatedResponse, SuccessResponse } from '@/types/api';

/** Fetch routines list */
async function fetchRoutines(page: number, pageSize: number): Promise<PaginatedResponse<Routine>> {
  const { data } = await apiClient.get<PaginatedResponse<Routine>>('/routines', {
    params: { page, pageSize },
  });
  return data;
}

/** Fetch single routine detail */
async function fetchRoutine(routineId: string): Promise<SuccessResponse<Routine>> {
  const { data } = await apiClient.get<SuccessResponse<Routine>>(`/routines/${routineId}`);
  return data;
}

/** Create routine mutation */
async function createRoutine(
  input: { name: string; description?: string; assignments: { exerciseId: string; dayOfWeek: string; defaultSets: number; defaultReps: number; defaultWeight: number; order: number }[] },
): Promise<SuccessResponse<Routine>> {
  const { data } = await apiClient.post<SuccessResponse<Routine>>('/routines', input);
  return data;
}

/** Update routine mutation */
async function updateRoutine(
  routineId: string,
  input: { name?: string; description?: string; assignments?: { exerciseId: string; dayOfWeek: string; defaultSets: number; defaultReps: number; defaultWeight: number; order: number }[] },
): Promise<SuccessResponse<Routine>> {
  const { data } = await apiClient.patch<SuccessResponse<Routine>>(`/routines/${routineId}`, input);
  return data;
}

/** Delete routine mutation */
async function deleteRoutine(routineId: string): Promise<void> {
  await apiClient.delete(`/routines/${routineId}`);
}

/** Query hook: List routines */
export function useRoutines(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['routines', page, pageSize],
    queryFn: () => fetchRoutines(page, pageSize),
  });
}

/** Query hook: Single routine */
export function useRoutine(routineId: string) {
  return useQuery({
    queryKey: ['routine', routineId],
    queryFn: () => fetchRoutine(routineId),
    enabled: !!routineId,
  });
}

/** Mutation hook: Create routine */
export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoutine,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['routines'] }); },
  });
}

/** Mutation hook: Update routine */
export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routineId, input }: { routineId: string; input: { name?: string; description?: string; assignments?: { exerciseId: string; dayOfWeek: string; defaultSets: number; defaultReps: number; defaultWeight: number; order: number }[] } }) =>
      updateRoutine(routineId, input),
    onSuccess: (_, { routineId }) => {
      void queryClient.invalidateQueries({ queryKey: ['routines'] });
      void queryClient.invalidateQueries({ queryKey: ['routine', routineId] });
    },
  });
}

/** Mutation hook: Delete routine */
export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['routines'] }); },
  });
}
