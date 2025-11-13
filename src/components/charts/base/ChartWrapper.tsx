'use client';

import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { motion } from 'motion/react';
import { ReactNode, Ref } from 'react';

export default function ChartWrapper({
  children,
  header,
  className = '',
  chartRef,
  name,
}: {
  children: ReactNode;
  header: ReactNode;
  name: string;
  className?: string;
  chartRef?: Ref<HTMLDivElement>;
}) {
  return (
    <motion.div
      ref={chartRef}
      data-name={name}
      variants={cardVariants}
      transition={{ ...cardTransition, ease: 'easeIn' }}
      initial="exit"
      animate="idle"
      exit="exit"
      className={cls('flex w-full flex-col justify-between rounded-xl', className)}
    >
      <motion.div
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        className="font-S-CoreDream-500 p-4 text-lg"
      >
        {header}
      </motion.div>
      <div>{children}</div>
    </motion.div>
  );
}
