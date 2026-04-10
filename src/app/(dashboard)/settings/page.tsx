'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { SettingsForm } from '@/components/forms/SettingsForm';
import { useSettings, useUpdateSettings } from '@/hooks/api/useSettings';
import { signOut } from 'next-auth/react';

function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close };
}

export default function SettingsPage(): React.ReactElement {
  const { data: settingsData, isLoading } = useSettings();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateSettings();
  const deleteModal = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const user = settingsData?.data;

  const handleSubmit = (data: { name: string; email: string; preferredUnits: 'METRIC' | 'IMPERIAL' }): void => updateSettings(data);
  const handleSignOut = (): void => { void signOut({ callbackUrl: '/login' }); };
  const handleDeleteAccount = async (): Promise<void> => {
    if (deleteConfirm !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await fetch('/api/settings/delete-account', { method: 'DELETE' });
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch { /* error toast */ }
    finally { setIsDeleting(false); deleteModal.close(); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and preferences</p>
      </div>
      {isLoading && <p className="text-muted-foreground">Loading settings...</p>}
      {user && (
        <div className="space-y-6">
          <SettingsForm user={user} onSubmit={handleSubmit} isSubmitting={isUpdating} />
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 text-lg font-semibold">Session</h3>
              <p className="mb-4 text-sm text-muted-foreground">Signed in as <strong>{user.email}</strong></p>
              <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
            </CardContent>
          </Card>
          <div className="border-t border-border" />
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 text-lg font-semibold text-destructive">Danger Zone</h3>
              <p className="mb-4 text-sm text-muted-foreground">Once you delete your account, all your data will be permanently removed.</p>
              <Button variant="destructive" onClick={deleteModal.open}>Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      )}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Delete Account">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Type <strong>DELETE</strong> to confirm.</p>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Type DELETE to confirm" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={deleteModal.close}>Cancel</Button>
            <Button variant="destructive" disabled={deleteConfirm !== 'DELETE'} onClick={() => void handleDeleteAccount()}>{isDeleting ? 'Deleting...' : 'Delete My Account'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
