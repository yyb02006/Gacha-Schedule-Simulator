'use client';

import { useIsMount } from '#/hooks/useIsMount';
import { useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import GridCellBackground from '#/components/GridCellBackground';

export default function LoadingSpinner() {
  const isMount = useIsMount();

  const buttonControls = useAnimation();
  const insetControls = useAnimation();
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
      // 2️⃣ inset 등장
      rotateControls.start({
        boxShadow: '0px 0px 16px #101010ff',
        transition: { duration: 0.3, delay: 0.4, ease: 'easeIn' },
      });

      // 1️⃣ 버튼 등장
      await buttonControls.start({
        background: 'radial-gradient(circle at center, #808080 50%, #c0c0c0 75%, #ffffff 100%)',
        transition: { duration: 0.3, delay: 0.4, ease: 'easeIn' },
      });

      // 3️⃣ 등장 완료 후 회전 시작 (무한 반복)
      rotateControls.start({
        rotate: 405,
        transition: {
          repeat: Infinity,
          duration: 16,
          ease: 'linear',
        },
      });
    }

    sequence();
  }, [rotateControls, buttonControls, insetControls]);

  return (
    <div className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center bg-[#00000033] backdrop-blur-sm">
      <GridCellBackground cellSize={120} divisions={5} strokeColor="#777" />
      <motion.div
        animate={rotateControls}
        initial={{ rotate: 45 }}
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
          animate={buttonControls}
          initial={{
            boxShadow: '0px 0px 0px #202020ff',
            background: 'radial-gradient(circle at center, #202020 50%, #202020 75%, #202020 100%)',
          }}
          style={{ mask: 'url(#myMask)', WebkitMask: 'url(#myMask)' }}
          className="relative flex size-full items-center justify-center p-4"
        ></motion.div>
      </motion.div>
    </div>
  );
}
