'use client';

import DiamondButton from '#/components/buttons/DiamondButton';
import { useIsMount } from '#/hooks/useIsMount';
import { cls } from '#/libs/utils';
import { motion, Variants } from 'motion/react';
import Image from 'next/image';
import { MouseEventHandler, useState } from 'react';

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
  idle: { background: 'linear-gradient(145deg, #dba100, #ffd84d)' },
  exit: {
    background: 'linear-gradient(145deg, #202020, #202020)',
  },
  hover: { background: 'linear-gradient(-35deg, #dba100, #ffd84d)' },
};

interface AddButtonProps {
  onAddClick: MouseEventHandler<HTMLDivElement>;
  custom?: { size?: 'small' | 'default'; boxShadow?: string };
  isOtherElHover?: boolean;
}

export default function AddButton({
  onAddClick,
  custom,
  isOtherElHover,
}: {
  onAddClick: MouseEventHandler<HTMLDivElement>;
  custom?: { size?: 'small' | 'default'; boxShadow?: string };
  isOtherElHover?: boolean;
}) {
  const [isHover, setIsHover] = useState(false);
  const isMount = useIsMount();
  const initialDelay = 0.2;
  const currentHover = isOtherElHover !== undefined ? isOtherElHover : isHover;
  const mergedCustom: AddButtonProps['custom'] = custom && {
    size: custom.size || 'default',
    boxShadow: custom.boxShadow,
  };
  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onClick={onAddClick}
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
            'absolute flex items-center justify-center',
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
              <Image
                alt="test"
                src={'/add.svg'}
                width={32}
                height={32}
                className={mergedCustom?.size === 'small' ? 'size-5' : ''}
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
              maskImage: 'url(add.svg)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
            }}
          />
        </div>
      </DiamondButton>
    </motion.div>
  );
}
