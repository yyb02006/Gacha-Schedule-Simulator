'use client';

import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { motion } from 'motion/react';
import { ReactNode, useEffect, useRef, useState } from 'react';

const LazyRender = ({
  children,
  minHeight = 300,
  className = '',
}: {
  children: React.ReactNode;
  minHeight?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target); // 한 번만 트리거
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cls('flex w-full items-center justify-center', className)}>
      {inView ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="size-full"
        >
          {children}
        </motion.div>
      ) : (
        <div className="w-full animate-pulse rounded-lg bg-neutral-800/50" />
      )}
    </div>
  );
};

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
      className={cls('flex w-full flex-col justify-between rounded-xl', className)}
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
      <div>{children}</div>
    </motion.div>
  );
}
