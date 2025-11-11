'use client';

import { insetInputVariants, toggleButtonVariants, toOpacityZero } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { animate } from 'motion';
import { motion, useMotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export default function ToggleButton({
  isLeft,
  onToggle,
  labels,
  className = '',
}: {
  isLeft: boolean;
  onToggle: (isLeft?: boolean) => void;
  labels: { left: string; right: string };
  className?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  useEffect(() => {
    const rect = constraintsRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxX = rect.width / 2;
    setIsAnimating(true);
    animate(x, isLeft ? 0 : maxX, { type: 'spring', stiffness: 400, damping: 30 }).finished.then(
      () => setIsAnimating(false),
    );
  }, [isLeft, x]);

  return (
    <div className={cls(className, 'flex min-w-[100px] flex-col space-y-1')}>
      <motion.div
        variants={insetInputVariants}
        animate="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        onClick={() => {
          if (isDragging || isAnimating) return;
          onToggle();
        }}
        className="font-S-CoreDream-500 relative flex h-full cursor-pointer items-center rounded-xl text-sm"
      >
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative top-[2px] left-[2px] flex h-full w-1/2 items-center justify-center px-3 text-center whitespace-nowrap text-[#a4a4a4] select-none"
        >
          {labels.left}
        </motion.div>
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative top-[2px] right-[2px] flex h-full w-1/2 items-center justify-center px-3 text-center whitespace-nowrap text-[#a4a4a4] select-none"
        >
          {labels.right}
        </motion.div>
        <div ref={constraintsRef} className="absolute top-0 flex size-full">
          <motion.div
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.04}
            onDragStart={() => {
              if (isDragging || isAnimating) return;
              setIsDragging(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
              const rect = constraintsRef.current?.getBoundingClientRect();
              if (!rect) return;
              const maxX = rect.width / 2;
              const currentX = x.get();
              if (isLeft) {
                if (currentX > maxX * (1 / 4)) {
                  onToggle(false);
                } else {
                  animate(x, 0, { type: 'spring' });
                }
              } else {
                if (currentX < maxX * (3 / 4)) {
                  onToggle(true);
                } else {
                  animate(x, maxX, { type: 'spring' });
                }
              }
            }}
            style={{ x }}
            className="relative h-full w-1/2 p-[2px]"
          >
            <motion.div
              variants={toggleButtonVariants}
              initial="exit"
              animate={isLeft ? 'left' : 'right'}
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex size-full items-center justify-center rounded-lg"
            >
              <motion.span
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="select-none"
              >
                {isLeft ? labels.left : labels.right}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
