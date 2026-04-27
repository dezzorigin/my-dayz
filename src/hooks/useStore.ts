import { useState, useEffect } from 'react';

/**
 * Custom hook to safely consume persisted Zustand stores and prevent hydration mismatch.
 * 
 * @param store - The Zustand store hook
 * @param callback - The selector function
 * @returns The selected state, or undefined if not mounted yet
 */
export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
