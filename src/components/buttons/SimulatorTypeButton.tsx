'use client';

import {
  fontPop,
  insetInputVariants,
  toggleButtonVariants,
  toOpacityZero,
} from '#/constants/variants';
import { motion } from 'motion/react';

export default function SimulatorTypeButton({
  isGachaSim,
  onTypeClick,
}: {
  isGachaSim: boolean;
  onTypeClick: () => void;
}) {
  return (
    <div className="flex min-w-[100px] flex-col space-y-1">
      <motion.div
        variants={insetInputVariants}
        animate="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        onClick={onTypeClick}
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
            animate={isGachaSim ? 'inAcitve' : 'active'}
            initial={isGachaSim ? 'active' : 'inAcitve'}
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
            animate={isGachaSim ? 'inAcitve' : 'active'}
            initial={isGachaSim ? 'active' : 'inAcitve'}
            exit="exit"
            className="font-S-CoreDream-700"
          >
            재화 소모 시뮬레이션
          </motion.div>
        </motion.div>
        <div
          style={{ justifyContent: isGachaSim ? 'flex-start' : 'flex-end' }}
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
              animate={isGachaSim ? 'left' : 'right'}
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex size-full items-center justify-center rounded-lg"
            >
              <motion.span variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
                {isGachaSim ? '가챠 확률 시뮬레이션' : '재화 소모 시뮬레이션'}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
