'use client';

import DiamondButton from '#/components/buttons/DiamondButton';
import { cls } from '#/libs/utils';
import { motion, Variants } from 'motion/react';
import Image from 'next/image';
import { MouseEventHandler, useState } from 'react';

const addShadowVariants: Variants = {
  idle: {
    filter: 'drop-shadow(4px 4px 4px #101010) drop-shadow(-3px -4px 4px #404040)',
    transition: { duration: 0.3 },
  },
  hover: {
    filter: 'drop-shadow(4px -4px 4px #101010) drop-shadow(-3px 4px 4px #404040)',
    transition: { duration: 0.3 },
  },
};

const addVariants: Variants = {
  idle: { background: 'linear-gradient(145deg, #dba100, #ffd84d)' },
  hover: { background: 'linear-gradient(-35deg, #dba100, #ffd84d)' },
};

export default function AddButton({
  onAddClick,
  size = 'default',
}: {
  onAddClick: MouseEventHandler<HTMLDivElement>;
  size?: 'small' | 'default';
}) {
  const [isHover, setIsHover] = useState(false);
  const [isFirstRenderOver, setIsFirstRenderOver] = useState(false);
  const initialDelay = 0.3;
  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onClick={onAddClick}
      onViewportEnter={() => setIsFirstRenderOver(true)}
      className={cls(
        size === 'default' ? 'size-18' : 'size-11',
        'relative flex rotate-45 items-center justify-center',
      )}
    >
      <DiamondButton
        isHover={isHover}
        initialDelay={initialDelay}
        isFirstRenderOver={isFirstRenderOver}
        size={size}
      >
        <div
          className={cls(
            size === 'default' ? 'size-12' : 'size-8',
            'absolute flex items-center justify-center',
          )}
        >
          <div className="absolute flex size-full items-center justify-center overflow-hidden">
            <motion.div
              variants={addShadowVariants}
              animate={isHover ? 'hover' : 'idle'}
              initial={{
                filter: 'drop-shadow(0px 0px 0px #202020) drop-shadow(0px 0px 0px #202020)',
              }}
              className="absolute -rotate-z-45"
            >
              <Image
                alt="test"
                src={'/add.svg'}
                width={32}
                height={32}
                className={size === 'small' ? 'size-5' : ''}
              />
            </motion.div>
          </div>
          <motion.div
            variants={addVariants}
            animate={isHover ? 'hover' : 'idle'}
            transition={{ duration: 0.3, delay: isFirstRenderOver ? 0 : initialDelay }}
            initial={{
              background: 'linear-gradient(145deg, #202020, #202020)',
            }}
            className={cls(size === 'default' ? 'size-8' : 'size-5', 'absolute -rotate-z-45')}
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
