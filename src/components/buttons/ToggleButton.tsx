'use client';

import { insetInputVariants, toggleButtonVariants, toOpacityZero } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { motion } from 'motion/react';

export default function ToggleButton({
  isLeftToggle,
  onToggle,
  labels,
  className = '',
}: {
  isLeftToggle: boolean;
  onToggle: () => void;
  labels: { left: string; right: string };
  className?: string;
}) {
  return (
    <div className="flex min-w-[100px] flex-col space-y-1">
      <motion.div
        variants={insetInputVariants}
        animate="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        onClick={onToggle}
        className={cls(
          className,
          'font-S-CoreDream-500 relative flex h-full cursor-pointer items-center rounded-xl text-sm',
        )}
      >
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative top-[2px] left-[2px] flex size-full items-center justify-center px-3 text-center whitespace-nowrap text-[#a4a4a4]"
        >
          {labels.left}
        </motion.div>
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative top-[2px] right-[2px] flex size-full items-center justify-center px-3 text-center whitespace-nowrap text-[#a4a4a4]"
        >
          {labels.right}
        </motion.div>
        <div
          style={{ justifyContent: isLeftToggle ? 'flex-start' : 'flex-end' }}
          className="absolute top-0 flex size-full justify-end"
        >
          <motion.div
            layout
            transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.2 }}
            className="relative h-full w-1/2 p-[2px]"
          >
            <motion.div
              variants={toggleButtonVariants}
              initial="exit"
              animate={isLeftToggle ? 'left' : 'right'}
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex size-full items-center justify-center rounded-lg"
            >
              <motion.span variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
                {isLeftToggle ? labels.left : labels.right}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
