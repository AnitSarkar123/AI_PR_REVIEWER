'use client';

import { useEffect, useCallback } from 'react';
import { useUnsavedChangesState } from './provider';
import { UnsavedChangesConfig } from './types';

export function useUnsavedChanges(hasUnsavedChanges: boolean, config: UnsavedChangesConfig = {}) {
  const { setDirty } = useUnsavedChangesState();
  const message = config.message || 'You have unsaved changes. Are you sure you want to leave?';

  useEffect(() => {
    setDirty(hasUnsavedChanges);
    return () => setDirty(false);
  }, [hasUnsavedChanges, setDirty]);

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    },
    [hasUnsavedChanges, message],
  );

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload]);
}
