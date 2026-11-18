import { useState, useEffect } from 'react';

/**
 * Custom hook to check if the component has mounted.
 * Useful for preventing hydration mismatches in Next.js when using persisted state.
 *
 * State disetel lewat requestAnimationFrame (bukan sinkron di badan effect)
 * supaya tidak memicu cascading render saat commit (react-hooks/set-state-in-effect).
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return isMounted;
}
