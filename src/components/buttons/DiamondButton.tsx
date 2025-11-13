'use client';

import { motion, Variants } from 'motion/react';

const buttonVariants: Variants = {
  idle: {
    rotateZ: 0,
    boxShadow: '6px 0px 13px 0px #101010ff, -4px 0px 16px 2px #303030ff',
    background: 'linear-gradient(90deg, #202020ff, #303030ff)',
  },
  exit: {
    rotateZ: 0,
    boxShadow: '0px 0px 0px 0px #2020200, 0px 0px 0px 0px #2020200',
    background: 'linear-gradient(90deg, #20202000, #20202000)',
  },
  hover: (custom?: {
    size?: 'default' | 'small';
    boxShadow?: string;
    from?: string;
    to?: string;
  }) => ({
    rotateZ: 90,
    boxShadow:
      custom?.boxShadow ||
      (custom?.size === 'default'
        ? '0px -10px 20px 0px #000000, 0px 7px 22px 3px #505050'
        : '0px -6px 14px 0px #000000, 0px 4px 15px 2px #505050'),
    background: `linear-gradient(0deg, ${custom?.from || '#dba100'}, ${custom?.to || '#ffd84d'})`,
  }),
};

const insetVariants: Variants = {
  idle: {
    boxShadow: 'inset 6px 0px 13px #141414ff, inset -6px 0px 13px #2c2c2cff',
    background: '#202020ff',
  },
  exit: {
    boxShadow: 'inset 0px 0px 0px #20202000, inset 0px 0px 0px #20202000',
    background: '#20202000',
  },
  hover: {
    boxShadow: 'inset 0px -6px 13px #0a0a0aff, inset 0px 6px 13px #3a3a3aff',
    background: '#202020ff',
  },
};

const ButtonInset = ({
  isHover,
  initialDelay = 0,
  isMount = true,
}: {
  isHover: boolean;
  initialDelay?: number;
  isMount?: boolean;
}) => {
  return (
    <motion.div
      variants={insetVariants}
      transition={{ duration: 0.3, delay: isMount ? 0 : initialDelay }}
      initial="exit"
      animate={isHover ? 'hover' : 'idle'}
      exit="exit"
      className="absolute size-2/3"
    />
  );
};

export default function DiamondButton({
  children,
  isHover,
  initialDelay = 0,
  isMount = true,
  custom,
}: {
  children: React.ReactNode;
  isHover: boolean;
  initialDelay?: number;
  isMount?: boolean;
  custom?: { size?: 'small' | 'default'; boxShadow?: string; from?: string; to?: string };
}) {
  return (
    <motion.button
      variants={buttonVariants}
      transition={{ duration: 0.3, delay: isMount ? 0 : initialDelay, ease: 'easeOut' }}
      initial="exit"
      animate={isHover ? 'hover' : 'idle'}
      exit="exit"
      custom={custom}
      className="relative flex size-full cursor-pointer items-center justify-center p-4"
    >
      <ButtonInset isHover={isHover} initialDelay={initialDelay} isMount={isMount} />
      {children}
    </motion.button>
  );
}
