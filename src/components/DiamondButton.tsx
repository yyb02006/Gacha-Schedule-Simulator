'use client';

import { motion, Variants } from 'motion/react';

const buttonVariants: Variants = {
  idle: {
    rotateZ: 0,
    boxShadow: '6px 0px 13px #101010, -4px 0px 16px 2px #303030',
    background: 'linear-gradient(90deg, #202020, #303030)',
  },
  hover: {
    rotateZ: 90,
    boxShadow: '0px -10px 20px #000000, 0px 7px 22px 3px #505050',
    background: 'linear-gradient(0deg, #dba100, #ffd84d)',
  },
};

const insetVariants: Variants = {
  idle: { boxShadow: 'inset 6px 0px 13px #141414, inset -6px 0px 13px #2c2c2c' },
  hover: { boxShadow: 'inset 0px -6px 13px #0a0a0a, inset 0px 6px 13px #3a3a3a' },
};

const ButtonInset = ({
  isHover,
  initialDelay = 0,
  isFirstRenderOver = true,
}: {
  isHover: boolean;
  initialDelay?: number;
  isFirstRenderOver?: boolean;
}) => {
  return (
    <motion.div
      variants={insetVariants}
      animate={isHover ? 'hover' : 'idle'}
      transition={{ duration: 0.3, delay: isFirstRenderOver ? 0 : initialDelay }}
      initial={{ boxShadow: 'inset 0px 0px 0px #202020, inset 0px 0px 0px #202020' }}
      className="absolute size-2/3 bg-[#202020]"
    />
  );
};

export default function DiamondButton({
  children,
  isHover,
  initialDelay = 0,
  isFirstRenderOver = true,
}: {
  children: React.ReactNode;
  isHover: boolean;
  initialDelay?: number;
  isFirstRenderOver?: boolean;
}) {
  return (
    <motion.button
      variants={buttonVariants}
      animate={isHover ? 'hover' : 'idle'}
      transition={{ duration: 0.3, delay: isFirstRenderOver ? 0 : initialDelay, ease: 'easeOut' }}
      initial={{
        boxShadow: '0px 0px 0px #202020, 0px 0px 0px 0px #202020',
        background: 'linear-gradient(90deg, #202020, #202020)',
      }}
      className="relative flex size-full cursor-pointer items-center justify-center bg-gradient-to-r from-[#1d1d1d] to-[#222222] p-4"
    >
      <ButtonInset
        isHover={isHover}
        initialDelay={initialDelay}
        isFirstRenderOver={isFirstRenderOver}
      />
      {children}
    </motion.button>
  );
}
