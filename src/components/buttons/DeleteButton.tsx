'use client';

import { SizeClass } from '#/types/types';
import { useState } from 'react';
import { motion } from 'motion/react';
import { smallButtonVariants, toOpacityZero } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { useIsMount } from '#/hooks/useIsMount';

export default function DeleteButton({
  onDelete,
  size = 'size-[44px]',
  className = '',
}: {
  onDelete: () => void;
  size?: SizeClass;
  className?: string;
}) {
  const [isHover, setIsHover] = useState(false);
  const isMount = useIsMount();
  return (
    <motion.button
      onClick={onDelete}
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      variants={smallButtonVariants}
      viewport={{ once: true, amount: 0.5 }}
      initial="exit"
      animate={isHover ? 'hover' : 'idle'}
      exit="exit"
      custom={{
        state: isMount ? 'normal' : 'initial',
        background: 'linear-gradient(135deg, #bd1b36, #ff637e)',
        color: '#eaeaea',
      }}
      className={cls(size, className, 'cursor-pointer rounded-xl p-1 text-[#ff637e]')}
    >
      <motion.svg
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        className="size-full"
      >
        <motion.use
          animate={
            isHover
              ? { rotateZ: -45, transformOrigin: 'bottom left' }
              : { rotateZ: 0, transformOrigin: 'bottom left' }
          }
          href="/icons/icons.svg#delete-cap"
        />
        <use href="/icons/icons.svg#delete" />
      </motion.svg>
    </motion.button>
  );
}
