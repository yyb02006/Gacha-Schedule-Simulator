import { useSyncExternalStore } from 'react';

export const useIsMount = () => {
  return useSyncExternalStore(
    () => () => {},
    () => true, // 클라이언트
    () => false, // 서버
  );
};
