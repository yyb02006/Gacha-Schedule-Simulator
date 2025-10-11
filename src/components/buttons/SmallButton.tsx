'use client';

import { SizeClass } from '#/types/types';
import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { smallButtonVariants } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { useIsMount } from '#/hooks/useIsMount';

export default function SmallButton({
  children,
  onButtonClick,
  size = 'size-[44px]',
  className = '',
  background,
  color,
  isAnimateLocked = false,
}: {
  children: ReactNode;
  onButtonClick: () => void;
  size?: SizeClass;
  className?: string;
  background: string;
  color: string;
  isAnimateLocked?: boolean;
}) {
  const [isHover, setIsHover] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const isMount = useIsMount();

  useEffect(() => {
    if (isAnimateLocked) {
      setIsHover(false);
      setIsClicked(false);
    }
  }, [isAnimateLocked]);
  return (
    <motion.button
      onClick={() => onButtonClick()}
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
      animate={isAnimateLocked ? 'idle' : isClicked ? 'active' : isHover ? 'hover' : 'idle'}
      custom={{
        state: isMount ? 'normal' : 'initial',
        background,
        color,
      }}
      aria-pressed={isClicked}
      className={cls(
        size,
        className,
        'relative shrink-0 cursor-pointer rounded-xl p-1 text-[#51a2ff]',
      )}
    >
      {children}
    </motion.button>
  );
}
