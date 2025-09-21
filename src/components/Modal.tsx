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
            key="modal-backdrop" // AnimatePresence의 직접 자식은 반드시 key prop을 가져야 합니다.
            initial={{ opacity: 0 }} // 오버레이 등장 애니메이션
            animate={{ opacity: 1 }} // 오버레이 유지 애니메이션
            exit={{ opacity: 0 }} // 오버레이 퇴장 애니메이션
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
            className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center bg-[#00000090]"
          >
            <div className="h-screen py-6">
              <motion.div
                animate={{ scaleY: 1, transition: { duration: 0.3, type: 'spring' } }}
                initial={{ scaleY: 0 }}
                exit={{ scaleY: 0, transition: { duration: 0.3, type: 'spring' } }}
                className="flex h-full max-w-[960px] flex-col space-y-6 rounded-xl bg-[#202020] p-6"
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
