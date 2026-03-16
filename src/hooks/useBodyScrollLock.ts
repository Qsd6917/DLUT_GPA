import { useEffect } from 'react';

let activeBodyScrollLocks = 0;
let previousBodyOverflow = '';

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') {
      return undefined;
    }

    if (activeBodyScrollLocks === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    activeBodyScrollLocks += 1;

    return () => {
      activeBodyScrollLocks = Math.max(0, activeBodyScrollLocks - 1);

      if (activeBodyScrollLocks === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
    };
  }, [locked]);
}
