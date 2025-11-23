'use client';

import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { cls } from '#/libs/utils';
import ToTopButton from '#/components/buttons/ToTopButton';
import OverlayScrollbar from '#/components/OverlayScrollbar';
import { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  hasModalClass?: boolean;
  backdropBlur?: boolean;
  ref?: RefObject<HTMLDivElement | null>;
  scrollRef?: RefObject<OverlayScrollbarsComponentRef<'div'> | null>;
  activeToTop?: boolean;
  className?: string;
  padding?: string;
}

export default function Modal({
  children,
  isOpen,
  onClose,
  hasModalClass = true,
  backdropBlur,
  ref,
  scrollRef,
  activeToTop = false,
  padding = 'p-4 lg:p-12',
  className = '',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<OverlayScrollbarsComponentRef<'div'>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
      scrollRef.current = scrollBarRef.current;
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
            ref={modalRef}
            tabIndex={-1}
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget ||
                e.target === wrapperRef.current ||
                e.target === scrollBarRef.current?.osInstance()?.elements().viewport ||
                e.target === contentRef.current
              ) {
                isMouseDownOnTarget.current = true;
              } else {
                isMouseDownOnTarget.current = false;
              }
            }}
            onMouseUp={(e) => {
              if (
                e.target === e.currentTarget ||
                e.target === wrapperRef.current ||
                e.target === scrollBarRef.current?.osInstance()?.elements().viewport ||
                (e.target === contentRef.current && isMouseDownOnTarget.current)
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cls(
              hasModalClass ? 'modal' : '',
              'fixed top-0 left-0 flex h-dvh w-dvw justify-center bg-[#00000090]',
              backdropBlur ? 'backdrop-blur-sm' : '',
            )}
          >
            <OverlayScrollbar
              ref={scrollBarRef}
              className={cls('h-full w-full', padding, className)}
            >
              <div ref={wrapperRef} className="flex h-full">
                <div ref={contentRef} className="my-auto flex w-full justify-center">
                  {children}
                </div>
              </div>
            </OverlayScrollbar>
            {activeToTop && (
              <div className="fixed right-4 bottom-4 lg:right-6">
                <ToTopButton
                  handleToTop={() => {
                    if (!scrollBarRef.current) return;
                    scrollBarRef.current
                      .osInstance()
                      ?.elements()
                      .viewport.scrollTo({ top: 0, behavior: 'smooth' });
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
