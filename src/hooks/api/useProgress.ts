import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useToast } from '@/hooks/ui/useToast';
import type { BodyMeasurement } from '@/types/entities';
import type { PaginatedResponse, SuccessResponse } from '@/types/api';

/** Progress data shape returned by GET /api/progress */
export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  dataPoints: Array<{
    id: string;
    exerciseId: string;
    exerciseName: string;
    workoutDate: string;
    weight: number;
    volume: number;
    setsCompleted: number;
    repsPerSet: number[];
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  startWeight: number;
  currentWeight: number;
  changePercent: number;
}

/** Fetch progress data for all exercises or a specific one */
async function fetchProgress(
  exerciseId?: string,
  range = '90',
): Promise<SuccessResponse<ExerciseProgress[]>> {
  const params: Record<string, string> = { range };
  if (exerciseId) params.exerciseId = exerciseId;
  const { data } = await apiClient.get<SuccessResponse<ExerciseProgress[]>>('/progress', { params });
  return data;
}

/** Fetch body measurements (paginated) */
async function fetchMeasurements(
  page: number,
  limit: number,
): Promise<PaginatedResponse<BodyMeasurement>> {
  const { data } = await apiClient.get<PaginatedResponse<BodyMeasurement>>('/progress/measurements', {
    params: { page, limit },
  });
  return data;
}

/** Create a body measurement */
async function addMeasurement(
  input: {
    measurementType: string;
    value: number;
    unit: string;
    measurementDate: string;
    notes?: string;
  },
): Promise<SuccessResponse<BodyMeasurement>> {
  const { data } = await apiClient.post<SuccessResponse<BodyMeasurement>>(
    '/progress/measurements',
    {
      ...input,
      measurementDate: new Date(input.measurementDate),
    },
  );
  return data;
}

/** Delete a body measurement */
async function deleteMeasurement(measurementId: string): Promise<void> {
  await apiClient.delete(`/progress/measurements/${measurementId}`);
}

/** Query hook: Get exercise progress data */
export function useProgress(exerciseId?: string, range = '90') {
  return useQuery({
    queryKey: ['progress', exerciseId, range],
    queryFn: () => fetchProgress(exerciseId, range),
  });
}

/** Query hook: List body measurements */
export function useMeasurements(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['measurements', page, limit],
    queryFn: () => fetchMeasurements(page, limit),
  });
}

/** Mutation hook: Add a body measurement */
export function useAddMeasurement() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: addMeasurement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['measurements'] });
      toast.success('Measurement added successfully.');
    },
    onError: () => { toast.error('Failed to add measurement.'); },
  });
}

/** Mutation hook: Delete a body measurement */
export function useDeleteMeasurement() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: deleteMeasurement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['measurements'] });
      toast.success('Measurement deleted successfully.');
    },
    onError: () => { toast.error('Failed to delete measurement.'); },
  });
}
