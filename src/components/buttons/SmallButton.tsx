'use client';

import { SizeClass } from '#/types/types';
import { ReactNode, useState } from 'react';
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
}: {
  children: ReactNode;
  onButtonClick: () => void;
  size?: SizeClass;
  className?: string;
  background: string;
  color: string;
}) {
  const [isHover, setIsHover] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const isMount = useIsMount();
  const initiaLizeState = () => {
    setIsHover(false);
    setIsClicked(false);
  };
  return (
    <motion.button
      onClick={() => {
        onButtonClick();
        initiaLizeState();
      }}
      onHoverStart={() => {
        console.log('hover start');
        setIsHover(true);
      }}
      onHoverEnd={() => {
        console.log('hover end');
        setIsHover(false);
      }}
      onMouseDown={() => {
        console.log('mouse down');
        setIsClicked(true);
      }}
      onMouseUp={() => {
        console.log('mouse up');
        setIsClicked(false);
      }}
      onMouseLeave={() => {
        console.log('mouse leave');
        setIsClicked(false);
      }}
      onTapStart={() => setIsClicked(true)}
      onTapCancel={() => setIsClicked(false)}
      variants={smallButtonVariants}
      viewport={{ once: true, amount: 0.5 }}
      initial="idle"
      animate={isClicked ? 'active' : isHover ? 'hover' : 'idle'}
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
