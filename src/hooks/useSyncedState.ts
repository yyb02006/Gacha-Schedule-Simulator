'use client';

import { useEffect, useRef, useState } from 'react';
import isEqual from 'fast-deep-equal';

export const useSyncedState = <T>(propValue: T) => {
  const [state, setState] = useState(propValue);
  const prevPropRef = useRef<T>(propValue);

  useEffect(() => {
    if (!isEqual(prevPropRef.current, propValue)) {
      setState(propValue);
      prevPropRef.current = propValue;
    }
  }, [propValue]);

  return [state, setState] as const;
};
