'use client';

import { useEffect } from 'react';

// Location is now detected automatically via IP on login/signup.
// This modal is disabled — it auto-completes instantly without rendering anything.
export function LocationPermissionModal({ isOpen, onComplete }: { isOpen: boolean; onComplete: () => void }) {
  useEffect(() => {
    if (isOpen) onComplete();
  }, [isOpen, onComplete]);

  return null;
}