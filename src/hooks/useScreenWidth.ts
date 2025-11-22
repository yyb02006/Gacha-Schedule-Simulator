import { useEffect, useState } from 'react';

export type BreakPointLabel = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BreakPoint = { breakPoint: BreakPointLabel; width: number };

export function useScreenWidth() {
  const [{ breakPoint, width }, setBreakpoint] = useState<{
    breakPoint: BreakPointLabel;
    width: number;
  }>({
    breakPoint: '2xl',
    width: 1980,
  });

  useEffect(() => {
    const getBreakPoint = (): { breakPoint: BreakPointLabel; width: number } => {
      const minScreen = Math.min(window.innerWidth, window.innerHeight);
      if (minScreen >= 1536) return { breakPoint: '2xl', width: minScreen };
      if (minScreen >= 1280) return { breakPoint: 'xl', width: minScreen };
      if (minScreen >= 1024) return { breakPoint: 'lg', width: minScreen };
      if (minScreen >= 768) return { breakPoint: 'md', width: minScreen };
      if (minScreen >= 640) return { breakPoint: 'sm', width: minScreen };
      return { breakPoint: 'xs', width: minScreen };
    };

    const handle = () => setBreakpoint(getBreakPoint());
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  return { breakPoint, width };
}
