'use client';

import DiamondButton from '#/components/buttons/DiamondButton';
import { useIsMount } from '#/hooks/useIsMount';
import { cls } from '#/libs/utils';
import { motion, Variants } from 'motion/react';
import { MouseEventHandler, useState } from 'react';
import Add from '#/icons/Add.svg';

const addShadowVariants: Variants = {
  idle: (custom: { isMount: boolean }) => ({
    filter: 'drop-shadow(4px 4px 4px #101010) drop-shadow(-3px -4px 4px #404040)',
    opacity: 1,
    transition: { duration: 0.3, delay: custom.isMount ? 0 : 0.3 },
  }),
  exit: {
    filter: 'drop-shadow(0px 0px 0px #202020) drop-shadow(0px 0px 0px #202020)',
    opacity: 0,
  },
  hover: {
    filter: 'drop-shadow(4px -4px 4px #101010) drop-shadow(-3px 4px 4px #404040)',
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

const addVariants: Variants = {
  idle: (custom: { from: string; to: string }) => ({
    background: `linear-gradient(135deg, ${custom?.from || '#d97706'} , ${custom?.from || '#fde047'})`,
  }),
  exit: {
    background: 'linear-gradient(135deg, #202020, #202020)',
  },
  hover: (custom: { from: string; to: string }) => ({
    background: `linear-gradient(45deg, ${custom?.from || '#d97706'} , ${custom?.from || '#fde047'})`,
  }),
};

const shaking45Variants: Variants = {
  idle: { x: 0, y: 0 },
  shake: {
    x: [0, -5.7, 5.7, -4.2, 4.2, -2.1, 2.1, 0],
    y: [0, 5.7, -5.7, 4.2, -4.2, 2.1, -2.1, 0],
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

interface AddButtonProps {
  onAddClick: MouseEventHandler<HTMLDivElement>;
  diamondCustom?: { size?: 'small' | 'default'; boxShadow?: string; from?: string; to?: string };
  addCustom?: { from: string; to: string };
  isOtherElHover?: boolean;
  isAddPrevent?: boolean;
}

export default function AddButton({
  onAddClick,
  diamondCustom,
  addCustom,
  isOtherElHover,
  isAddPrevent,
}: AddButtonProps) {
  const [isHover, setIsHover] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const isMount = useIsMount();
  const initialDelay = 0.2;
  const currentHover = isOtherElHover !== undefined ? isOtherElHover : isHover;
  const mergedCustom: AddButtonProps['diamondCustom'] = {
    size: diamondCustom?.size || 'default',
    ...diamondCustom,
  };
  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onClick={(e) => {
        if (isAddPrevent) setIsShaking(true);
        if (isShaking || isAddPrevent) return;
        onAddClick(e);
      }}
      variants={shaking45Variants}
      animate={isShaking ? 'shake' : 'idle'}
      onAnimationComplete={() => {
        if (isShaking) {
          setIsShaking(false);
        }
      }}
      className={cls(
        mergedCustom?.size === 'default' ? 'size-18' : 'size-11',
        'relative flex rotate-45 items-center justify-center',
      )}
    >
      <DiamondButton
        isHover={currentHover}
        initialDelay={initialDelay}
        isMount={isMount}
        custom={mergedCustom}
      >
        <div
          className={cls(
            mergedCustom?.size === 'default' ? 'size-12' : 'size-8',
            'absolute flex items-center justify-center select-none',
          )}
        >
          <div className="absolute flex size-full items-center justify-center overflow-hidden">
            <motion.div
              variants={addShadowVariants}
              animate={currentHover ? 'hover' : 'idle'}
              initial="exit"
              exit="exit"
              custom={{ isMount }}
              className="absolute -rotate-z-45"
            >
              <Add
                className={cls(
                  mergedCustom?.size === 'small' ? 'size-5' : 'size-8',
                  'text-[#202020]',
                )}
              />
            </motion.div>
          </div>
          <motion.div
            variants={addVariants}
            transition={{ duration: 0.3, delay: isMount ? 0 : 0.6 }}
            initial="exit"
            animate={currentHover ? 'hover' : 'idle'}
            exit="exit"
            className={cls(
              mergedCustom?.size === 'default' ? 'size-8' : 'size-5',
              'absolute -rotate-z-45',
            )}
            style={{
              maskImage: 'url(icons/add.svg)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
            }}
            custom={addCustom}
          />
        </div>
      </DiamondButton>
    </motion.div>
  );
}
