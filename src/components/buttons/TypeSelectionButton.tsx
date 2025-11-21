'use client';

import { GachaTypeButtonCustom } from '#/types/types';
import { useState } from 'react';
import { motion } from 'motion/react';
import { gachaTypeButtonVariants, toOpacityZero } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { useIsMount } from '#/hooks/useIsMount';

export default function TypeSelectionButton({
  name,
  hoverBackground,
  isActive = false,
  onTypeClick,
  className = '',
}: {
  name: string;
  hoverBackground: string;
  isActive?: boolean;
  onTypeClick: () => void;
  className?: string;
}) {
  const [isHover, setIsHover] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const isMount = useIsMount();
  const isButtonDown = isActive ? true : isMouseDown ? true : false;
  const custom: GachaTypeButtonCustom = {
    hoverBackground,
    state: isMount ? 'normal' : 'initial',
    isActive,
  };
  return (
    <motion.button
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
      onTapStart={() => setIsMouseDown(true)}
      onTapCancel={() => setIsMouseDown(false)}
      variants={gachaTypeButtonVariants}
      onClick={() => {
        onTypeClick();
      }}
      viewport={{ once: true, amount: 0.5 }}
      animate={isButtonDown ? 'active' : isHover ? 'hover' : 'idle'}
      initial="exit"
      custom={custom}
      aria-pressed={isActive}
      className={cls(
        'font-S-CoreDream-400 lg:font-S-CoreDream-500 flex cursor-pointer items-center justify-center rounded-xl p-2',
        className,
      )}
    >
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        className="relative top-[1px] whitespace-nowrap select-none"
      >
        {name}
      </motion.div>
    </motion.button>
  );
}
