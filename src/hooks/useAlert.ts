import { useState, useCallback, ReactNode } from 'react';

export function useAlert() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<ReactNode>('');
  const [alertTitle, setAlertTitle] = useState<ReactNode>('');
  const [isCancelActive, setIsCancelActive] = useState(true);
  const [resolver, setResolver] = useState<(v: boolean) => void>(() => () => {});

  const openAlert = useCallback(
    ({
      title,
      message,
      isCancelActive = true,
    }: {
      title: ReactNode;
      message: ReactNode;
      isCancelActive?: boolean;
    }) => {
      setAlertMessage(message);
      setAlertTitle(title);
      setIsCancelActive(isCancelActive);
      setIsAlertOpen(true);

      return new Promise<boolean>((resolve) => {
        setResolver(() => resolve);
      });
    },
    [],
  );

  const confirm = () => {
    resolver(true);
    setIsAlertOpen(false);
  };

  const cancel = () => {
    resolver(false);
    setIsAlertOpen(false);
  };

  return {
    isAlertOpen,
    alertMessage,
    alertTitle,
    openAlert,
    confirm,
    cancel: isCancelActive ? cancel : undefined,
  };
}
