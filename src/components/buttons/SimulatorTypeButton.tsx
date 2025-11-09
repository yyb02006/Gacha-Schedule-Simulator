'use client';

import {
  fontPop,
  insetInputVariants,
  toggleButtonVariants,
  toOpacityZero,
} from '#/constants/variants';
import { animate } from 'motion';
import { motion, useMotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export default function SimulatorTypeButton({
  isTrySim,
  onTypeClick,
}: {
  isTrySim: boolean;
  onTypeClick: (isLeft?: boolean) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  useEffect(() => {
    const rect = constraintsRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxX = rect.width / 2;
    animate(x, isTrySim ? 0 : maxX, { type: 'spring', stiffness: 400, damping: 30 });
  }, [isTrySim, x]);
  return (
    <div className="flex min-w-[100px] flex-col space-y-1">
      <motion.div
        variants={insetInputVariants}
        animate="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        onClick={() => {
          if (isDragging) return;
          onTypeClick();
        }}
        className="relative flex h-[48px] cursor-pointer items-center justify-center rounded-xl px-4 pt-3 pb-2 font-bold"
      >
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative w-full text-center whitespace-nowrap"
        >
          <motion.div
            variants={fontPop}
            animate={isTrySim ? 'inAcitve' : 'active'}
            initial={isTrySim ? 'active' : 'inAcitve'}
            exit="exit"
            className="font-S-CoreDream-700"
          >
            가챠 확률 시뮬레이션
          </motion.div>
        </motion.div>
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative w-full text-center whitespace-nowrap"
        >
          <motion.div
            variants={fontPop}
            animate={isTrySim ? 'inAcitve' : 'active'}
            initial={isTrySim ? 'active' : 'inAcitve'}
            exit="exit"
            className="font-S-CoreDream-700"
          >
            재화 소모 시뮬레이션
          </motion.div>
        </motion.div>
        <div ref={constraintsRef} className="absolute top-0 flex size-full">
          <motion.div
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.04}
            onDragStart={() => {
              setIsDragging(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
              const rect = constraintsRef.current?.getBoundingClientRect();
              if (!rect) return;
              const maxX = rect.width / 2;
              const currentX = x.get();
              if (isTrySim) {
                if (currentX > maxX * (1 / 4)) {
                  onTypeClick(false);
                } else {
                  animate(x, 0, { type: 'spring' });
                }
              } else {
                if (currentX < maxX * (3 / 4)) {
                  onTypeClick(true);
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
              animate={isTrySim ? 'left' : 'right'}
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex size-full items-center justify-center rounded-lg"
            >
              <motion.span variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
                {isTrySim ? '가챠 확률 시뮬레이션' : '재화 소모 시뮬레이션'}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
