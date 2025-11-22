import { useEffect, useState } from 'react';

export type BreakPointLabel = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BreakPoint = { breakPoint: BreakPointLabel; width: number };

export function useScreenWidth() {
  const [{ breakPoint, width }, setBreakpoint] = useState<{
    breakPoint: BreakPointLabel;
    width: number;
  }>({
    breakPoint: '2xl',
    width: 1920,
  });

  useEffect(() => {
    const getBreakPoint = (): { breakPoint: BreakPointLabel; width: number } => {
      const { innerWidth } = window;
      if (innerWidth >= 1536) return { breakPoint: '2xl', width: innerWidth };
      if (innerWidth >= 1280) return { breakPoint: 'xl', width: innerWidth };
      if (innerWidth >= 1024) return { breakPoint: 'lg', width: innerWidth };
      if (innerWidth >= 768) return { breakPoint: 'md', width: innerWidth };
      if (innerWidth >= 640) return { breakPoint: 'sm', width: innerWidth };
      return { breakPoint: 'xs', width: innerWidth };
    };

    const handle = () => setBreakpoint(getBreakPoint());
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  return { breakPoint, width };
}
