'use client';

import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { cls } from '#/libs/utils';
import ToTopButton from '#/components/buttons/ToTopButton';
import SimpleBar from 'simplebar-react';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  backdropBlur?: boolean;
  ref?: RefObject<HTMLDivElement | null>;
  scrollRef?: RefObject<HTMLDivElement | null>;
  activeToTop?: boolean;
  className?: string;
  padding?: string;
}

export default function Modal({
  children,
  isOpen,
  onClose,
  backdropBlur,
  ref,
  scrollRef,
  activeToTop = false,
  padding = 'p-4 lg:p-12',
  className = '',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const simpleBarRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
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
    if (scrollRef) {
      scrollRef.current = simpleBarRef.current;
    }
    if (!ref) return;
    ref.current = modalRef.current;
  }, [ref, isOpen, scrollRef]);

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
            className={cls(
              'fixed top-0 left-0 flex h-screen w-screen justify-center bg-[#00000090]',
              backdropBlur ? 'backdrop-blur-sm' : '',
            )}
          >
            <div
              // tabIndex = -1의 의미는 포커스 가능한 요소이나 탭 순서 안에 안에 포함시키지는 않는다는 것
              // div는 원래 포커스 가능한 요소가 아니기 때문에 tabIndex = -1을 주어야 focus() 메서드가 정상 작동함
              ref={modalRef}
              tabIndex={-1}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget || e.target === wrapperRef.current) {
                  isMouseDownOnTarget.current = true;
                } else {
                  isMouseDownOnTarget.current = false;
                }
              }}
              onMouseUp={(e) => {
                if (
                  (e.target === e.currentTarget || e.target === wrapperRef.current) &&
                  isMouseDownOnTarget.current
                ) {
                  onClose();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
                  onClose();
                }
              }}
              role="button"
              // className={cls(
              //   'flex min-h-screen w-screen justify-center overflow-y-auto p-4 lg:p-12',
              //   className,
              // )}
            >
              <SimpleBar
                scrollableNodeProps={{
                  ref: simpleBarRef,
                }}
                autoHide={false}
                className={cls('h-full min-h-screen w-screen', padding, className)}
                style={{ minHeight: 4 }}
              >
                <div ref={wrapperRef} className="my-auto flex w-full justify-center">
                  {children}
                </div>
              </SimpleBar>
            </div>
            {activeToTop && (
              <div className="fixed right-4 bottom-4 lg:right-6">
                <ToTopButton
                  handleToTop={() => {
                    if (!simpleBarRef.current) return;
                    simpleBarRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>,
      document.getElementById('portal-root') as HTMLDivElement,
    )
  );
}
