'use client';

import { useIsMount } from '#/hooks/useIsMount';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'motion/react';
import GridCellBackground from '#/components/GridCellBackground';

const LoadingSpinnerContent = () => {
  const isMount = useIsMount();

  const spinnerControls = useAnimation();
  const rotateControls = useAnimation();

  useEffect(() => {
    if (isMount) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMount]);

  useEffect(() => {
    async function sequence() {
      rotateControls.start({
        boxShadow: '0px 0px 16px #101010ff',
        transition: { duration: 0.3, delay: 0.4, ease: 'easeIn' },
      });

      await spinnerControls.start({
        background: 'radial-gradient(circle at center, #808080 50%, #c0c0c0 75%, #ffffff 100%)',
        transition: { duration: 0.3, delay: 0.4, ease: 'easeIn' },
      });

      rotateControls.start({
        rotate: 405,
        transition: {
          repeat: Infinity,
          duration: 14,
          ease: 'linear',
        },
      });
    }

    sequence();
  }, [rotateControls, spinnerControls]);

  return (
    <motion.div
      initial={{ background: '#00000000', backdropFilter: 'blur(0px)' }}
      animate={{
        background: '#00000033',
        backdropFilter: 'blur(4px)',
        transition: {
          background: { duration: 0.3 },
          backdropFilter: { duration: 0.15, delay: 0.15 },
        },
      }}
      exit={{
        background: '#00000000',
        backdropFilter: 'blur(0px)',
        transition: {
          background: { duration: 0.3 },
          backdropFilter: { duration: 0.15, delay: 0.15 },
        },
      }}
      className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center"
    >
      <GridCellBackground cellSize={120} divisions={5} strokeColor="#777" />
      <motion.div
        animate={rotateControls}
        initial={{ boxShadow: '0px 0px 0px #202020ff', rotate: 45 }}
        exit={{ boxShadow: '0px 0px 0px #202020ff', transition: { duration: 0.4 } }}
        className="size-[min(70vw,70vh)] min-h-[200px] min-w-[200px]"
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <mask id="myMask" maskUnits="userSpaceOnUse">
              <rect width="100%" height="100%" fill="white" />
              <rect x="7%" y="7%" width="86%" height="86%" fill="black" />
            </mask>
          </defs>
        </svg>
        <motion.div
          animate={spinnerControls}
          initial={{
            background:
              'radial-gradient(circle at center, #20202000 50%, #20202000 75%, #20202000 100%)',
          }}
          exit={{
            background:
              'radial-gradient(circle at center, #20202000 50%, #20202000 75%, #20202000 100%)',
            transition: { duration: 0.4, delay: 0.2 },
          }}
          style={{ mask: 'url(#myMask)', WebkitMask: 'url(#myMask)' }}
          className="relative flex size-full items-center justify-center p-4"
        ></motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function LoadingSpinner({ isLoading }: { isLoading: boolean }) {
  const MIN_DURATION = 1000; // 최소 로딩 시간(ms)
  const [visible, setVisible] = useState(false);
  const mountTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      // 시작 시간 측정
      mountTimeRef.current = performance.now();
    } else {
      // 데이터 종료 시간 측정
      const now = performance.now();
      const elapsed = now - (mountTimeRef.current ?? now);

      if (elapsed >= MIN_DURATION) {
        // 최소 시간 지난 상태 → 즉시 종료
        setVisible(false);
      } else {
        // 최소 시간 안 지남 → 나머지 시간 기다린 뒤 종료
        const remaining = MIN_DURATION - elapsed;

        const timer = setTimeout(() => {
          setVisible(false);
        }, remaining);

        return () => clearTimeout(timer);
      }
    }
  }, [isLoading]);

  return <AnimatePresence>{visible && <LoadingSpinnerContent />}</AnimatePresence>;
}
