'use client';

import { useIsMount } from '#/hooks/useIsMount';
import { RefObject, useEffect, useRef, useState } from 'react';
import {
  animate,
  AnimatePresence,
  AnimationPlaybackControls,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'motion/react';
import GridCellBackground from '#/components/GridCellBackground';
import { toOpacityZero } from '#/constants/variants';
import { safeNumberOrZero, truncateToDecimals } from '#/libs/utils';

const LoadingSpinnerContent = ({
  progressRef,
  loadingRef,
}: {
  progressRef: RefObject<{
    progressTry: number;
    total: number;
    gachaRuns: number;
    success: number;
  }>;
  loadingRef: RefObject<boolean>;
}) => {
  const whiteTextRef = useRef<SVGTextElement>(null);
  const textAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const blackTextRef = useRef<SVGTextElement>(null);
  const winRateRef = useRef<SVGTextElement>(null);
  const winRateAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const progressRateRef = useRef<SVGTextElement>(null);
  const progressRateAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const textSize = 18;
  const winRateSize = 12;

  const isMount = useIsMount();
  const spinnerControls = useAnimation();
  const rotateControls = useAnimation();
  const strokeWidth = 10;
  const strokeInset = strokeWidth * Math.sqrt(2);

  const scaleMV = useMotionValue(0);
  const progressMV = useMotionValue(0);
  const opacityMV = useTransform(progressMV, [0, 0.01], [0, 1]);
  const textMV = useMotionValue(0);
  const winRateMV = useMotionValue(0);
  const progressRateMV = useMotionValue(0);

  const lastUpdateRef = useRef(0);
  const throttleMs = 100; // 0.1초마다 업데이트

  useEffect(() => {
    const { current: whiteTextRefCurrent } = whiteTextRef;
    const { current: blackTextRefCurrent } = blackTextRef;
    const { current: winRateRefCurrent } = winRateRef;
    const { current: progessRefCurrent } = progressRateRef;
    const lastProgress = {
      gachaRuns: progressRef.current.gachaRuns,
      total: progressRef.current.total,
      progressTry: progressRef.current.progressTry,
      success: progressRef.current.success,
    };
    let rafId: number;

    function updateProgressWithRAF() {
      rafId = requestAnimationFrame(() => {
        const now = performance.now();
        if (now - lastUpdateRef.current >= throttleMs) {
          lastUpdateRef.current = now;
          if (
            progressRef.current.progressTry / progressRef.current.total !==
              lastProgress.progressTry / lastProgress.total ||
            progressRef.current.success / progressRef.current.progressTry !==
              lastProgress.success / lastProgress.progressTry
          ) {
            lastProgress.progressTry = progressRef.current.progressTry;
            lastProgress.success = progressRef.current.success;
            const progressRate = progressRef.current.progressTry / progressRef.current.total;
            const winRate = progressRef.current.success / progressRef.current.progressTry;
            animate(progressMV, safeNumberOrZero(progressRate), { duration: 0.2 });
            animate(scaleMV, safeNumberOrZero(winRate), { duration: 0.4 });

            if (
              !(
                whiteTextRefCurrent &&
                blackTextRefCurrent &&
                winRateRefCurrent &&
                progessRefCurrent
              )
            )
              return;

            if (progressRef.current.progressTry > 0) {
              if (loadingRef.current) {
                textAnimRef.current = animate(textMV, progressRef.current.gachaRuns, {
                  duration: 0.3,
                  onUpdate: (v) => {
                    whiteTextRefCurrent.textContent = Math.round(v).toLocaleString();
                    blackTextRefCurrent.textContent = Math.round(v).toLocaleString();
                  },
                });
                winRateAnimRef.current = animate(winRateMV, winRate * 100, {
                  duration: 0.3,
                  onUpdate: (v) => {
                    winRateRefCurrent.textContent = `${truncateToDecimals(v).toLocaleString()}%`;
                  },
                });
                progressRateAnimRef.current = animate(progressRateMV, progressRate * 100, {
                  duration: 0.3,
                  onUpdate: (v) => {
                    progessRefCurrent.textContent = `${truncateToDecimals(v).toLocaleString()}%`;
                  },
                });
              } else {
                textAnimRef.current = animate(textMV, progressRef.current.gachaRuns, {
                  duration: 0.1,
                  onUpdate: (v) => {
                    whiteTextRefCurrent.textContent = Math.round(v).toLocaleString();
                    blackTextRefCurrent.textContent = Math.round(v).toLocaleString();
                  },
                });
                winRateAnimRef.current = animate(winRateMV, winRate * 100, {
                  duration: 0.1,
                  onUpdate: (v) => {
                    winRateRefCurrent.textContent = `${truncateToDecimals(v).toLocaleString()}%`;
                  },
                });
                progressRateAnimRef.current = animate(progressRateMV, progressRate * 100, {
                  duration: 0.1,
                  onUpdate: (v) => {
                    progessRefCurrent.textContent = `${truncateToDecimals(v).toLocaleString()}%`;
                  },
                });
              }
            }
          }
        }
        updateProgressWithRAF();
      });
    }

    updateProgressWithRAF();
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [progressRef, progressMV, scaleMV, textMV, loadingRef, winRateMV, progressRateMV]);

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
        background: '#00000066',
        backdropFilter: 'blur(10px)',
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
      {progressRef && (
        <GridCellBackground
          cellSize={120}
          divisions={5}
          strokeColor="#555"
          progressRef={progressRef}
        />
      )}
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
      <motion.div
        variants={toOpacityZero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.4 } }}
        exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.4 } }}
        className="absolute h-[200px] w-full max-w-[200px] min-w-[200px]"
      >
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask id="mask">
            <rect x="0" y="0" width="200" height="200" fill="black" />
            <polygon
              points={`100,${10 + strokeInset} ${190 - strokeInset},100 100,${190 - strokeInset} ${10 + strokeInset},100`}
              fill="white"
            />
          </mask>

          <g mask="url(#mask)">
            <motion.rect
              x={strokeInset}
              y={strokeInset}
              width={200 - 2 * strokeInset}
              height={200 - 2 * strokeInset}
              fill="#eaeaea"
              style={{ originY: 1, scaleY: scaleMV }}
            />
          </g>

          <mask id="emptyAreaMask">
            <motion.rect
              x={strokeInset}
              y={strokeInset}
              width={200 - 2 * strokeInset}
              height={200 - 2 * strokeInset}
              fill="white"
            />
            <motion.rect
              x={strokeInset}
              y={strokeInset}
              width={200 - 2 * strokeInset}
              height={200 - 2 * strokeInset}
              fill="black"
              style={{ originY: 1, scaleY: scaleMV }}
            />
          </mask>

          <mask id="contentAreaMask">
            <motion.rect
              x={strokeInset}
              y={strokeInset}
              width={200 - 2 * strokeInset}
              height={200 - 2 * strokeInset}
              fill="black"
            />
            <motion.rect
              x={strokeInset}
              y={strokeInset}
              width={200 - 2 * strokeInset}
              height={200 - 2 * strokeInset}
              fill="white"
              style={{ originY: 1, scaleY: scaleMV }}
            />
          </mask>

          <g mask="url(#emptyAreaMask)">
            <motion.text
              ref={whiteTextRef}
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.4 } }}
              exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.4 } }}
              fontSize={textSize}
              fontFamily="S-CoreDream-500, monospace"
              fill="#eaeaea"
            />
          </g>

          <g mask="url(#contentAreaMask)">
            <motion.text
              ref={blackTextRef}
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.4 } }}
              exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.4 } }}
              fontSize={textSize}
              fontFamily="S-CoreDream-500, monospace"
              fill="#202020"
            />
          </g>

          <motion.text
            ref={winRateRef}
            x="77%"
            y="23%"
            textAnchor="middle"
            dominantBaseline="middle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.4 } }}
            exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.4 } }}
            fontSize={winRateSize}
            fontFamily="S-CoreDream-400, monospace"
            fill="#ffffff"
            style={{
              rotate: 45,
              originX: '50%',
              originY: '50%',
            }}
          />

          <motion.text
            ref={progressRateRef}
            x="22.3%"
            y="22.3%"
            textAnchor="middle"
            dominantBaseline="middle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.4 } }}
            exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.4 } }}
            fontSize={winRateSize}
            fontFamily="S-CoreDream-400, monospace"
            fill="#ffffff"
            style={{
              rotate: -45,
              originX: '50%',
              originY: '50%',
            }}
          />

          <motion.path
            d="M100 10 L190 100 L100 190 L10 100 Z"
            fill="none"
            stroke="#ffcc3e"
            strokeWidth={strokeWidth}
            strokeLinecap="square"
            style={{ pathLength: progressMV, opacity: opacityMV }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default function LoadingSpinner({
  isLoading,
  progressRef,
}: {
  isLoading: boolean;
  progressRef: RefObject<{
    progressTry: number;
    total: number;
    gachaRuns: number;
    success: number;
  }>;
}) {
  const MIN_DURATION = 1000; // 최소 로딩 시간(ms)
  const [visible, setVisible] = useState(false);
  const mountTimeRef = useRef<number | null>(null);
  const loadingRef = useRef(true);

  useEffect(() => {
    loadingRef.current = isLoading;
    if (isLoading) {
      setVisible(true);
      // 시작 시간 측정
      mountTimeRef.current = performance.now();
    } else {
      // 데이터 종료 시간 측정
      const now = performance.now();
      const elapsed = now - (mountTimeRef.current ?? now);
      const baseExitDelay = 300;

      if (elapsed >= MIN_DURATION) {
        // 최소 시간 지난 상태 → 즉시 종료
        const timer = setTimeout(() => {
          setVisible(false);
        }, baseExitDelay);

        return () => clearTimeout(timer);
      } else {
        // 최소 시간 안 지남 → 나머지 시간 기다린 뒤 종료
        const remaining = MIN_DURATION - elapsed + baseExitDelay;

        const timer = setTimeout(() => {
          setVisible(false);
        }, remaining);

        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, progressRef]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        progressRef.current = { gachaRuns: 0, progressTry: 0, success: 0, total: 0 };
      }}
    >
      {visible && <LoadingSpinnerContent progressRef={progressRef} loadingRef={loadingRef} />}
    </AnimatePresence>
  );
}
