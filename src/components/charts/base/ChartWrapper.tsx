'use client';

import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { motion } from 'motion/react';
import { ReactNode } from 'react';

export default function ChartWrapper({
  children,
  title,
  className = '',
}: {
  children: ReactNode;
  title: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      transition={{ ...cardTransition, ease: 'easeIn' }}
      initial="exit"
      animate="idle"
      exit="exit"
      className={cls('w-full rounded-xl', className)}
    >
      <motion.div
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        className="font-S-CoreDream-500 p-4 text-lg"
      >
        {title}
      </motion.div>
      {children}
    </motion.div>
  );
}
