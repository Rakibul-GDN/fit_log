import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useToast } from '@/hooks/ui/useToast';
import type { User } from '@/types/entities';
import type { SuccessResponse } from '@/types/api';

/** Fetch user settings */
async function fetchSettings(): Promise<SuccessResponse<User>> {
  const { data } = await apiClient.get<SuccessResponse<User>>('/settings');
  return data;
}

/** Update user settings */
async function updateSettings(
  input: { name?: string; email?: string; preferredUnits?: 'METRIC' | 'IMPERIAL' },
): Promise<SuccessResponse<User>> {
  const { data } = await apiClient.patch<SuccessResponse<User>>('/settings', input);
  return data;
}

/** Query hook: Get user settings */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });
}

/** Mutation hook: Update user settings */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully.');
    },
    onError: () => { toast.error('Failed to update settings.'); },
  });
}
