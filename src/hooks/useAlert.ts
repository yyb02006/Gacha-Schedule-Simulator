import { useState, useCallback, ReactNode } from 'react';

export function useAlert() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<ReactNode>('');
  const [resolver, setResolver] = useState<(v: boolean) => void>(() => () => {});

  const openAlert = useCallback((msg: ReactNode) => {
    setAlertMessage(msg);
    setIsAlertOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const confirm = () => {
    resolver(true);
    setIsAlertOpen(false);
  };

  const cancel = () => {
    resolver(false);
    setIsAlertOpen(false);
  };

  return { isAlertOpen, alertMessage, openAlert, confirm, cancel };
}
