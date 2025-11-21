import { getDeviceType } from '#/libs/utils';
import { useState, useEffect } from 'react';

export type DviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * 현재 디바이스 타입을 반환하는 훅
 *
 * @returns {'mobile' | 'tablet' | 'desktop'} 현재 디바이스 타입
 *
 * @example
 * const deviceType = useDeviceType();
 * if (deviceType === 'mobile') { ... }
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(() =>
    getDeviceType(),
  );

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceType;
}
