'use client';

import { SizeClass } from '#/types/types';
import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { shakingVariants, smallButtonVariants } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { useIsMount } from '#/hooks/useIsMount';

export default function SmallButton({
  children,
  background,
  color,
  size = 'size-[44px]',
  className = '',
  isAnimateLocked = false,
  isClickPrevent,
  onButtonClick,
}: {
  children: ReactNode;
  background: string;
  color: string;
  size?: SizeClass;
  className?: string;
  isAnimateLocked?: boolean;
  isClickPrevent?: boolean;
  onButtonClick: () => void;
}) {
  const [isHover, setIsHover] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const isMount = useIsMount();

  useEffect(() => {
    if (isAnimateLocked) {
      setIsHover(false);
      setIsClicked(false);
    }
  }, [isAnimateLocked]);

  const animate = isAnimateLocked
    ? 'idle'
    : isClicked
      ? 'active'
      : isShaking
        ? 'shake'
        : isHover
          ? 'hover'
          : 'idle';
  return (
    <motion.button
      onClick={() => {
        if (isClickPrevent) setIsShaking(true);
        if (isShaking || isClickPrevent) return;
        onButtonClick();
      }}
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onMouseLeave={() => setIsClicked(false)}
      onTapStart={() => setIsClicked(true)}
      onTapCancel={() => setIsClicked(false)}
      variants={{ ...smallButtonVariants, ...shakingVariants }}
      viewport={{ once: true, amount: 0.5 }}
      initial="idle"
      animate={animate}
      custom={{
        state: isMount ? 'normal' : 'initial',
        background,
        color,
        shakingBackground: 'linear-gradient(135deg, #bd1b36, #ff637e)',
      }}
      onAnimationComplete={() => {
        if (isShaking) {
          setIsShaking(false);
        }
      }}
      aria-pressed={isClicked}
      className={cls(
        'relative shrink-0 cursor-pointer rounded-xl p-1 text-[#51a2ff]',
        size,
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
