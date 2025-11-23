'use client';

import { useState } from 'react';

export const useModal = (): { isOpen: boolean; openModal: () => void; closeModal: () => void } => {
  const [isOpen, setIsOpen] = useState(Boolean);
  const closeModal = () => {
    setIsOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);
  };
  return { isOpen, openModal, closeModal };
};
