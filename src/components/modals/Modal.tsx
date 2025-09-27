'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion, Transition } from 'motion/react';
import { createPortal } from 'react-dom';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const modalTransition: Transition = {
  duration: 0.4,
  type: 'spring',
  bounce: 0.5,
};

export default function Modal({ children, isOpen, onClose }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
            className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center bg-[#00000090]"
          >
            <div className="relative flex h-screen items-center justify-center py-6">
              <motion.div
                animate={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
                  transition: {
                    ...modalTransition,
                  },
                }}
                initial={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 50%, 0 50%)' }}
                exit={{
                  clipPath: 'polygon(0 50%, 100% 50%, 100% 50%, 0 50%)',
                  transition: {
                    ...modalTransition,
                  },
                }}
                className="relative -top-16 flex max-w-[960px] flex-col space-y-6 rounded-xl bg-[#202020] p-6"
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.getElementById('portal-root') as HTMLDivElement,
    )
  );
}
