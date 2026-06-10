import { useState, useCallback, useEffect } from 'react';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

interface UnsavedChangesOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function useUnsavedChanges(opts?: UnsavedChangesOptions) {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const withWarning = useCallback((action: () => void) => {
    if (isDirty) {
      setPendingAction(() => action);
      setDialogOpen(true);
    } else {
      action();
    }
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const confirm = () => {
    pendingAction?.();
    setDialogOpen(false);
    setPendingAction(null);
    setIsDirty(false);
  };

  const cancel = () => {
    setDialogOpen(false);
    setPendingAction(null);
  };

  const UnsavedChangesDialog = (
    <ConfirmDialog
      open={dialogOpen}
      onOpenChange={(o) => { if (!o) cancel(); }}
      title={opts?.title || 'Unsaved changes'}
      description={opts?.description || 'You have unsaved changes. Do you want to discard them?'}
      confirmLabel={opts?.confirmLabel || 'Discard'}
      cancelLabel={opts?.cancelLabel || 'Keep editing'}
      variant="destructive"
      onConfirm={confirm}
    />
  );

  return { isDirty, setIsDirty, withWarning, UnsavedChangesDialog };
}
