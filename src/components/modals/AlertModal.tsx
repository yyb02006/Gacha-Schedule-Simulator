'use client';

import { ReactNode, useEffect, useRef, forwardRef, Ref, KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { useIsMount } from '#/hooks/useIsMount';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

function BaseModal(
  { children, isOpen, ariaLabelledBy, ariaDescribedBy }: ModalProps,
  ref: Ref<HTMLDivElement | null>,
) {
  const isMount = useIsMount();
  const modalRef = useRef<HTMLDivElement>(null);

  // ref forwarding
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(modalRef.current);
    } else {
      ref.current = modalRef.current;
    }
  }, [ref, isOpen]);

  // body scroll lock + focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // 첫 포커스
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements?.length) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab → 첫 요소에서 다시 마지막으로
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab → 마지막에서 다시 첫 요소로
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  return (
    isMount &&
    createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 flex h-screen w-screen justify-center bg-black/60"
          >
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <div
              ref={modalRef}
              tabIndex={-1}
              role="alertdialog"
              onKeyDown={handleKeyDown}
              aria-modal="true"
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              className="relative my-auto max-w-[90%]"
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.getElementById('portal-root') as HTMLDivElement,
    )
  );
}

const AlertModal = forwardRef(BaseModal);
export default AlertModal;
