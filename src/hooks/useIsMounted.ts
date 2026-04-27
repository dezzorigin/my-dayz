import { useState, useEffect } from 'react';

/**
 * Custom hook to check if the component has mounted.
 * Useful for preventing hydration mismatches in Next.js when using persisted state.
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
