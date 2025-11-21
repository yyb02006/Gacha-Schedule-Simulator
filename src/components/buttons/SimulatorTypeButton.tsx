'use client';

import {
  fontPop,
  insetInputVariants,
  toggleButtonVariants,
  toOpacityZero,
} from '#/constants/variants';
import { useResizeDragToggle } from '#/hooks/useResizeDragToggle';
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
  const [dragEnabled] = useResizeDragToggle(100);

  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  useEffect(() => {
    const rect = constraintsRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxX = rect.width / 2;
    animate(x, isTrySim ? 0 : maxX, { type: 'spring', stiffness: 400, damping: 30 });
  }, [isTrySim, x]);
  return (
    <div className="text-standard font-S-CoreDream-500 lg:font-S-CoreDream-700 flex min-w-[100px] flex-col space-y-1 lg:text-base">
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
        className="relative flex h-[48px] cursor-pointer items-center justify-center rounded-xl pt-3 pb-2"
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
            className="select-none"
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
            className="select-none"
          >
            재화 소모 시뮬레이션
          </motion.div>
        </motion.div>
        <div ref={constraintsRef} className="absolute top-0 flex size-full">
          <motion.div
            drag={dragEnabled ? 'x' : false}
            dragConstraints={constraintsRef}
            dragElastic={0}
            // timeConstant = 관성 적용 시간 이며, 관성 적용 시간이 길어진다는 것은 느려지는 것이므로 관성이 약하게 나타나게 된다.
            dragTransition={{
              power: 0.2,
              timeConstant: 750,
              modifyTarget: (target) => {
                // 관성 한계값 제한
                const rect = constraintsRef.current?.getBoundingClientRect();
                if (!rect) return target;
                const padding = 160; // 160이 괜찮긴 한데 정확히 어느 수치가 좋은지는 보면서 찾아야함
                const maxX = rect.width / 2 + padding;
                const minX = 0 - padding;

                return Math.min(Math.max(target, minX), maxX);
              },
            }}
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
                  animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
                }
              } else {
                if (currentX < maxX * (3 / 4)) {
                  onTypeClick(true);
                } else {
                  animate(x, maxX, { type: 'spring', stiffness: 400, damping: 30 });
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
              <motion.span
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="select-none"
              >
                {isTrySim ? '가챠 확률 시뮬레이션' : '재화 소모 시뮬레이션'}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
