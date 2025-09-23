import { useEffect, useState } from 'react';

export const useIsMount = () => {
  const [isFirstRenderOver, setIsFirstRenderOver] = useState(false);
  useEffect(() => {
    setIsFirstRenderOver(true);
  }, []);
  return isFirstRenderOver;
};
