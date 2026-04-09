'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { SettingsForm } from '@/components/forms/SettingsForm';
import { useSettings, useUpdateSettings } from '@/hooks/api/useSettings';
import { useToast } from '@/hooks/ui/useToast';
import { signOut } from 'next-auth/react';
import apiClient from '@/lib/api/client';

/** Simple disclosure state hook for Modal */
function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close };
}

/** Settings page — account details and preferences */
export default function SettingsPage(): React.ReactElement {
  const { data: settingsData, isLoading } = useSettings();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateSettings();
  const toast = useToast();
  const deleteModal = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const user = settingsData?.data;

  const handleSubmit = (data: {
    name: string;
    email: string;
    preferredUnits: 'METRIC' | 'IMPERIAL';
  }): void => {
    updateSettings(data);
  };

  const handleSignOut = (): void => {
    void signOut({ callbackUrl: '/login' });
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (deleteConfirm !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await apiClient.delete('/settings/delete-account');
      toast.success('Account deleted. Redirecting...');
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      deleteModal.close();
    }
  };

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Settings</h1>
        <p className='mt-1 text-default-500'>Manage your account and preferences</p>
      </div>

      {isLoading && <p className='text-default-400'>Loading settings...</p>}

      {user && (
        <div className='space-y-6'>
          <SettingsForm
            user={user}
            onSubmit={handleSubmit}
            isSubmitting={isUpdating}
          />

          <Card>
            <div className='p-4'>
              <h3 className='mb-2 text-lg font-semibold'>Session</h3>
              <p className='mb-4 text-sm text-default-500'>
                Signed in as <strong>{user.email}</strong>
              </p>
              <Button color='danger' variant='bordered' onPress={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </Card>

          <div className='border-t border-default-200' />

          <Card>
            <div className='p-4'>
              <h3 className='mb-2 text-lg font-semibold text-danger-600'>Danger Zone</h3>
              <p className='mb-4 text-sm text-default-500'>
                Once you delete your account, all your data will be permanently removed. This action cannot be undone.
              </p>
              <Button color='danger' onPress={deleteModal.open}>
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title='Delete Account'
      >
        <div className='space-y-4'>
          <p className='text-sm text-default-600'>
            This will permanently delete your account and all associated data (routines, workouts, exercises, measurements).
            Type <strong>DELETE</strong> to confirm.
          </p>
          <input
            className='w-full rounded border border-default-300 bg-transparent p-2 text-sm'
            placeholder='Type DELETE to confirm'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
          />
          <div className='flex gap-2 justify-end'>
            <Button
              variant='bordered'
              onPress={deleteModal.close}
            >
              Cancel
            </Button>
            <Button
              color='danger'
              isLoading={isDeleting}
              isDisabled={deleteConfirm !== 'DELETE'}
              onPress={() => void handleDeleteAccount()}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
