'use client';

import { SizeClass } from '#/types/types';
import { useState } from 'react';
import { motion } from 'motion/react';
import { cancelButtonVariants, toOpacityZero } from '#/constants/variants';
import { cls } from '#/libs/utils';

export default function DeleteButton({
  handleDelete,
  isFirstRenderOver = true,
  size = 'size-[44px]',
  className = '',
}: {
  handleDelete: () => void;
  isFirstRenderOver?: boolean;
  size?: SizeClass;
  className?: string;
}) {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.button
      onClick={handleDelete}
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      variants={cancelButtonVariants}
      whileInView="idle"
      whileHover="hover"
      viewport={{ once: true, amount: 0.5 }}
      custom={{ state: isFirstRenderOver ? 'normal' : 'initial' }}
      initial="exit"
      exit="exit"
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
