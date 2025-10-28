'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ children, isOpen, onClose }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  return (
    mounted &&
    createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 flex h-screen w-screen justify-center bg-[#00000090]"
          >
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onClose();
                }
              }}
              role="button"
              tabIndex={0}
              className="flex min-h-screen w-screen justify-center overflow-y-auto p-12"
            >
              <div className="my-auto">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.getElementById('portal-root') as HTMLDivElement,
    )
  );
}
