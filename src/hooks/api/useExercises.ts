import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useToast } from '@/hooks/ui/useToast';
import type { Exercise } from '@/types/entities';
import type { PaginatedResponse, SuccessResponse } from '@/types/api';

/** Fetch exercises list with optional filters */
async function fetchExercises(
  page: number,
  limit: number,
  search?: string,
  category?: string,
): Promise<PaginatedResponse<Exercise>> {
  const { data } = await apiClient.get<PaginatedResponse<Exercise>>('/exercises', {
    params: { page, limit, search, category },
  });
  return data;
}

/** Create exercise mutation */
async function createExercise(
  input: { name: string; description?: string; category: string; primaryMuscles: string[] },
): Promise<SuccessResponse<Exercise>> {
  const { data } = await apiClient.post<SuccessResponse<Exercise>>('/exercises', input);
  return data;
}

/** Query hook: List exercises with optional filters */
export function useExercises(
  page = 1,
  limit = 20,
  search?: string,
  category?: string,
) {
  return useQuery({
    queryKey: ['exercises', page, limit, search, category],
    queryFn: () => fetchExercises(page, limit, search, category),
  });
}

/** Mutation hook: Create exercise */
export function useCreateExercise() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: createExercise,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercise created successfully.');
    },
    onError: () => { toast.error('Failed to create exercise.'); },
  });
}
