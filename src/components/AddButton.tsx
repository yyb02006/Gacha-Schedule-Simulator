'use client';

import { motion, Variants } from 'motion/react';
import { useState } from 'react';

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

const plusShadowVariants: Variants = {
  idle: {
    boxShadow: '6px 6px 13px #141414, -6px -6px 13px #2c2c2c',
    transition: { duration: 0.3 },
  },
  hover: {
    boxShadow: '6px -6px 13px #141414, -6px 6px 13px #2c2c2c',
    transition: { duration: 0.3 },
  },
};

const plusVariants: Variants = {
  idle: { background: 'linear-gradient(135deg, #dba100, #ffd84d)' },
  hover: { background: 'linear-gradient(45deg, #dba100, #ffd84d)' },
};

export default function AddButton({ onAddClick }: { onAddClick: () => void }) {
  const [isHover, setIsHover] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onClick={onAddClick}
      className="relative flex size-18 rotate-45 items-center justify-center"
    >
      <motion.button
        variants={buttonVariants}
        animate={isHover ? 'hover' : 'idle'}
        transition={{ duration: 0.3 }}
        initial={{
          boxShadow: '6px 0px 13px #101010, -4px 0px 16px 2px #303030',
          background: 'linear-gradient(90deg, #202020, #303030)',
        }}
        className="relative flex size-full cursor-pointer items-center justify-center bg-gradient-to-r from-[#1d1d1d] to-[#222222] p-4"
      >
        <motion.div
          variants={insetVariants}
          animate={isHover ? 'hover' : 'idle'}
          transition={{ duration: 0.3 }}
          initial={{ boxShadow: 'inset 6px 0px 13px #141414, inset -6px 0px 13px #2c2c2c' }}
          className="absolute size-2/3 bg-[#202020]"
        />
        <motion.div
          variants={plusShadowVariants}
          animate={isHover ? 'hover' : 'idle'}
          initial={{ boxShadow: '6px 6px 13px #141414, -6px -6px 13px #2c2c2c' }}
          className="absolute h-2 w-7 -rotate-z-45 rounded-full"
        />
        <motion.div
          variants={plusShadowVariants}
          animate={isHover ? 'hover' : 'idle'}
          initial={{ boxShadow: '6px 6px 13px #141414, -6px -6px 13px #2c2c2c' }}
          className="absolute h-7 w-2 -rotate-z-45 rounded-full"
        />
        <motion.div
          variants={plusVariants}
          animate={isHover ? 'hover' : 'idle'}
          transition={{ duration: 0.3 }}
          initial={{
            background: 'linear-gradient(145deg, #dba100, #ffd84d)',
          }}
          className="absolute size-8 -rotate-z-45"
          style={{
            maskImage: 'url(plus.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
          }}
        />
      </motion.button>
    </motion.div>
  );
}
