'use client';

import { SizeClass } from '#/types/types';
import { useState } from 'react';
import { motion } from 'motion/react';
import { smallButtonVariants } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { useIsMount } from '#/hooks/useIsMount';

export default function MaximizeButton({
  onMaximize,
  isMaximized,
  size = 'size-[44px]',
  className = '',
}: {
  onMaximize: () => void;
  isMaximized: boolean;
  size?: SizeClass;
  className?: string;
}) {
  const [isHover, setIsHover] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const isMount = useIsMount();
  return (
    <motion.button
      onClick={onMaximize}
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
        background: 'linear-gradient(135deg, #1447e6, #51a2ff)',
        color: '#eaeaea',
      }}
      aria-pressed={isClicked}
      className={cls(
        size,
        className,
        'relative shrink-0 cursor-pointer rounded-xl p-1 text-[#51a2ff]',
      )}
    >
      {isMaximized ? (
        <svg className="relative top-2 size-full">
          <use href="/icons/icons.svg#minimize" />
        </svg>
      ) : (
        <svg className="size-full">
          <use href="/icons/icons.svg#maximize" />
        </svg>
      )}
    </motion.button>
  );
}
