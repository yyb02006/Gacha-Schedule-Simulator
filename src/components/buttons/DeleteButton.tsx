'use client';

import { SizeClass } from '#/types/types';
import { useState } from 'react';
import { motion } from 'motion/react';
import { smallButtonVariants } from '#/constants/variants';
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
  const [isClicked, setIsClicked] = useState(false);
  const isMount = useIsMount();
  return (
    <motion.button
      onClick={onDelete}
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onMouseLeave={() => setIsClicked(false)}
      onTapStart={() => setIsClicked(true)}
      onTapCancel={() => setIsClicked(false)}
      variants={smallButtonVariants}
      viewport={{ once: true, amount: 0.5 }}
      initial="idle"
      animate={isClicked ? 'active' : isHover ? 'hover' : 'idle'}
      custom={{
        state: isMount ? 'normal' : 'initial',
        background: 'linear-gradient(135deg, #bd1b36, #ff637e)',
        color: '#eaeaea',
      }}
      aria-pressed={isClicked}
      className={cls(size, className, 'cursor-pointer rounded-xl p-1 text-[#ff637e]')}
    >
      <svg className="size-full">
        <motion.use
          animate={
            isHover
              ? { rotateZ: -45, transformOrigin: 'bottom left' }
              : { rotateZ: 0, transformOrigin: 'bottom left' }
          }
          href="/icons/icons.svg#delete-cap"
        />
        <use href="/icons/icons.svg#delete" />
      </svg>
    </motion.button>
  );
}
