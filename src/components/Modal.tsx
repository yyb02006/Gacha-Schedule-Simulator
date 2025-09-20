'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { cancelButtonVariants, toOpacityZero } from '#/constants/variants';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const CancelButton = ({
  handleCancel,
  isFirstRenderOver = true,
}: {
  handleCancel: () => void;
  isFirstRenderOver?: boolean;
}) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.button
      key="cancel"
      onHoverStart={() => {
        setIsHover(true);
      }}
      onHoverEnd={() => {
        setIsHover(false);
      }}
      onClick={handleCancel}
      variants={cancelButtonVariants}
      viewport={{ once: true, amount: 0.5 }}
      custom={{ state: isFirstRenderOver ? 'normal' : 'initial' }}
      initial="exit"
      animate={isHover ? 'hover' : 'idle'}
      exit="exit"
      className="size-[44px] cursor-pointer rounded-xl p-2 text-[#ff637e]"
    >
      <motion.svg
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        className="size-full"
      >
        <use href="/icons/icons.svg#cancel" />
      </motion.svg>
    </motion.button>
  );
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
            <motion.div
              animate={{ scaleY: 1, transition: { duration: 0.3, type: 'spring' } }}
              initial={{ scaleY: 0 }}
              exit={{ scaleY: 0, transition: { duration: 0.3, type: 'spring' } }}
              className="size-full max-h-[640px] max-w-[960px] rounded-xl bg-[#202020] p-6"
            >
              <div className="flex items-center justify-between">
                <h1 className="font-S-CoreDream-700 text-2xl">
                  <span className="text-amber-400">고오급</span> 옵션
                </h1>
                <CancelButton
                  handleCancel={() => {
                    onClose();
                  }}
                />
              </div>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.getElementById('portal-root') as HTMLDivElement,
    )
  );
}
