import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      // Device-emulation / responsive resizes often update matchMedia
      // without firing `change` — resize keeps the snapshot honest.
      window.addEventListener('resize', onChange);
      return () => {
        list.removeEventListener('change', onChange);
        window.removeEventListener('resize', onChange);
      };
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
