'use client';

import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  ref?: RefObject<HTMLDivElement | null>;
}

export default function Modal({ children, isOpen, onClose, ref }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const isMouseDownOnTarget = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      modalRef.current?.focus();
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

  useEffect(() => {
    if (!ref) return;
    ref.current = modalRef.current;
  }, [ref, isOpen]);

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
              // tabIndex = -1의 의미는 포커스 가능한 요소이나 탭 순서 안에 안에 포함시키지는 않는다는 것
              // div는 원래 포커스 가능한 요소가 아니기 때문에 tabIndex = -1을 주어야 focus() 메서드가 정상 작동함
              ref={modalRef}
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                  isMouseDownOnTarget.current = true;
                } else {
                  isMouseDownOnTarget.current = false;
                }
              }}
              onMouseUp={(e) => {
                if (e.target === e.currentTarget && isMouseDownOnTarget.current) {
                  onClose();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
                  onClose();
                }
              }}
              role="button"
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
