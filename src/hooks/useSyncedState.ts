'use client';

import { useEffect, useState } from 'react';

export const useSyncedState = <T>(propValue: T) => {
  const [state, setState] = useState(propValue);

  useEffect(() => {
    setState(propValue);
  }, [propValue]);

  return [state, setState] as const;
};
