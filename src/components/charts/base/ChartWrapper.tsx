'use client';

import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { motion } from 'motion/react';
import { ReactNode } from 'react';

export default function ChartWrapper({
  children,
  title,
}: {
  children: ReactNode;
  title: ReactNode;
}) {
  return (
    <motion.div
      variants={cardVariants}
      transition={{ ...cardTransition, ease: 'easeIn' }}
      initial="exit"
      animate="idle"
      exit="exit"
      className="w-full space-y-4 rounded-xl p-4"
    >
      <motion.div
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        className="font-S-CoreDream-500 text-lg"
      >
        {title}
      </motion.div>
      {children}
    </motion.div>
  );
}
