'use client';

import { useIsMount } from '#/hooks/useIsMount';
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  animate,
  AnimatePresence,
  AnimationPlaybackControls,
  motion,
  MotionValue,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import GridCellBackground from '#/components/GridCellBackground';
import { toOpacityZero } from '#/constants/variants';
import { cls, safeNumberOrZero, truncateToDecimals } from '#/libs/utils';
import { ProgressRefProps } from '#/types/types';

const ButtonBackgroundDiamond = ({
  strokeInset,
  width = 120,
  fill,
  scaleMV,
  onHoverStart,
  onHoverEnd,
  onClick,
}: {
  strokeInset: number;
  width: number;
  fill: string;
  scaleMV?: MotionValue<number>;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onClick?: () => void;
}) => {
  const topY = 189 - width;
  const rightX = 100 + width / 2;
  const leftX = 100 - width / 2;
  const leftAndRightY = 189 - width / 2;
  return (
    <motion.polygon
      points={`100,${topY + strokeInset} ${rightX - strokeInset},${leftAndRightY} 100,${189 - strokeInset} ${leftX + strokeInset},${leftAndRightY}`}
      fill={fill}
      style={{ scale: scaleMV ?? 1 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={onClick}
      className={cls(onClick ? 'cursor-pointer' : 'select-none')}
    />
  );
};

const LoadingSpinnerContent = ({
  progressRef,
  loadingRef,
  onStopClick,
}: {
  progressRef: RefObject<ProgressRefProps>;
  loadingRef: RefObject<boolean>;
  onStopClick: () => void;
}) => {
  const buttonWidth = 100;

  const textAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const whiteTextRef = useRef<SVGTextElement>(null);
  const whiteFragmentRef = useRef<SVGTextElement>(null);
  const blackTextRef = useRef<SVGTextElement>(null);
  const blackFragmentRef = useRef<SVGTextElement>(null);
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
  const winRateMV = useMotionValue(0);
  const progressMV = useMotionValue(0);
  const opacityMV = useTransform(progressMV, [0, 0.01], [0, 1]);
  const reverseScaleMV = useTransform(scaleMV, [0, 1], [1, 0]);
  const textMV = useMotionValue(0);
  const progressRateMV = useMotionValue(0);
  const hoverMV = useMotionValue(0);
  const smoothHover = useSpring(hoverMV, { stiffness: 400, damping: 30 });
  const hoverBgColorAMV = useTransform(smoothHover, [0, 1], ['#202020', '#ff4f51']);
  const hoverBgColorBMV = useTransform(smoothHover, [0, 1], ['#eaeaea', '#ff4f51']);
  const hoverFillMV = useTransform(smoothHover, [0, 1], ['#202020', '#eaeaea']);
  const hoverScaleMV = useTransform(smoothHover, [0, 1], [1, 1.2]);

  const lastUpdateRef = useRef(0);
  const throttleMs = 100; // 0.1초마다 업데이트

  useEffect(() => {
    const { current: whiteTextRefCurrent } = whiteTextRef;
    const { current: blackTextRefCurrent } = blackTextRef;
    const { current: whiteFragmentCurrent } = whiteFragmentRef;
    const { current: blackFragmentCurrent } = blackFragmentRef;
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
            animate(progressMV, safeNumberOrZero(progressRate), { duration: 0.3 });
            animate(scaleMV, safeNumberOrZero(winRate), { duration: 2 });

            if (
              !(
                whiteTextRefCurrent &&
                blackTextRefCurrent &&
                whiteFragmentCurrent &&
                blackFragmentCurrent &&
                winRateRefCurrent &&
                progessRefCurrent
              )
            )
              return;

            // 텍스트들 아직 시뮬레이션 결과 도착 안했을 때는 표시 X
            if (progressRef.current.progressTry > 0) {
              // 시뮬레이션 끝나면 duration 0.1로 빠르게 마무리
              if (loadingRef.current) {
                textAnimRef.current = animate(textMV, progressRef.current.gachaRuns, {
                  duration: 0.3,
                  onUpdate: (v) => {
                    whiteTextRefCurrent.textContent = Math.round(v).toLocaleString();
                    blackTextRefCurrent.textContent = Math.round(v).toLocaleString();
                    whiteFragmentCurrent.textContent = Math.round(v).toLocaleString();
                    blackFragmentCurrent.textContent = Math.round(v).toLocaleString();
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
                    whiteFragmentCurrent.textContent = Math.round(v).toLocaleString();
                    blackFragmentCurrent.textContent = Math.round(v).toLocaleString();
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
        />
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
          {/* 기본 가운데 마름모 마스크 */}
          <mask id="mask">
            <rect x="0" y="0" width="200" height="200" fill="black" />
            <polygon
              points={`100,${10 + strokeInset} ${190 - strokeInset},100 100,${190 - strokeInset} ${10 + strokeInset},100`}
              fill="white"
            />
          </mask>

          {/* 승률에 따라 차오르는 마름모 */}
          <g mask="url(#mask)">
            <motion.rect
              x={strokeInset}
              y={strokeInset}
              width={200 - 2 * strokeInset}
              height={200 - 2 * strokeInset}
              fill="#ffcc3e"
              style={{ originY: 1, scaleY: scaleMV }}
              className="select-none"
            />
          </g>

          {/* 승률에 따라 아래에서 위로 점차 가려지는 마름모 마스크 (1px 인셋 추가) */}
          <mask id="innerEmptyMask">
            <rect x="0" y="0" width="200" height="200" fill="black" />
            <ButtonBackgroundDiamond
              width={buttonWidth}
              strokeInset={strokeInset}
              fill="white"
              scaleMV={hoverScaleMV}
            />
          </mask>

          {/* 승률에 따라 아래에서 위로 점차 보여지는 마름모 마스크 (1px 인셋 추가) */}
          <mask id="innerContentMask">
            <rect x="0" y="0" width="200" height="200" fill="black" />
            <ButtonBackgroundDiamond
              width={buttonWidth}
              strokeInset={strokeInset}
              fill="white"
              scaleMV={hoverScaleMV}
            />
            <motion.rect
              x={strokeInset}
              y={strokeInset}
              width={200 - 2 * strokeInset}
              height={200 - 2 * strokeInset}
              fill="black"
              style={{ originY: 0, scaleY: reverseScaleMV }}
            />
          </mask>

          {/* 승률에 따라 아래에서 위로 점차 가려지는 흰색 버튼 */}
          <g mask="url(#innerEmptyMask)">
            <motion.rect
              x={strokeInset}
              y={strokeInset}
              width={200 - 2 * strokeInset}
              height={200 - 2 * strokeInset}
              // fill="#eaeaea"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ originY: 1, fill: hoverBgColorBMV }}
              className="select-none"
            />
            <motion.text
              x="50%"
              y="70%"
              textAnchor="middle"
              dominantBaseline="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.4 } }}
              exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.4 } }}
              fontSize={14}
              fontFamily="S-CoreDream-500, monospace"
              // fill="#202020"
              style={{ scale: hoverScaleMV, fill: hoverFillMV }}
              className="select-none"
            >
              STOP
            </motion.text>
          </g>
          {/* 승률에 따라 아래에서 위로 점차 보여지는 검은색 버튼 */}
          <g mask="url(#innerContentMask)">
            <motion.rect
              x={strokeInset}
              y={strokeInset}
              width={200 - 2 * strokeInset}
              height={200 - 2 * strokeInset}
              // fill="#202020"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ originY: 1, fill: hoverBgColorAMV }}
              className="select-none"
            />
            <motion.text
              x="50%"
              y="70%"
              textAnchor="middle"
              dominantBaseline="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.4 } }}
              exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.4 } }}
              fontSize={14}
              fontFamily="S-CoreDream-500, monospace"
              fill="#eaeaea"
              style={{ scale: hoverScaleMV }}
              className="select-none"
            >
              STOP
            </motion.text>
          </g>

          {/* 진짜 버튼 */}
          <ButtonBackgroundDiamond
            fill="transparent"
            strokeInset={strokeInset}
            width={buttonWidth}
            onHoverStart={() => hoverMV.set(1)}
            onHoverEnd={() => hoverMV.set(0)}
            onClick={onStopClick}
            scaleMV={hoverScaleMV}
          />

          <g className="pointer-events-none">
            {/* 승률에 따라 아래에서 위로 점차 가려지는 버튼 마름모를 제외한 전체 사각형 마스크 */}
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
              <ButtonBackgroundDiamond width={buttonWidth} strokeInset={strokeInset} fill="black" />
            </mask>

            {/* 승률에 따라 아래에서 위로 점차 보여지는 버튼 마름모를 제외한 전체 사각형 마스크 */}
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
              <ButtonBackgroundDiamond width={buttonWidth} strokeInset={strokeInset} fill="black" />
            </mask>

            {/* 버튼 마름모를 제외한 하얀색 백그라운드 카운트 */}
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
                className="select-none"
              />
            </g>

            {/* 버튼 마름모를 제외한 검은색 오버라이트 카운트 */}
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
                className="select-none"
              />
            </g>

            {/* 버튼과 겹치는 부분 하얀색 백그라운드 카운트 */}
            <g mask="url(#innerEmptyMask)">
              <motion.text
                ref={whiteFragmentRef}
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
                className="select-none"
              />
            </g>

            {/* 버튼과 겹치는 부분 검은색 백그라운드 카운트 */}
            <g mask="url(#innerContentMask)">
              <motion.text
                ref={blackFragmentRef}
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
                className="select-none"
              />
            </g>

            {/* 우측 상단 승률 카운트 */}
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
              className="select-none"
            />

            {/* 좌측 상단 진행률 카운트 */}
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
              className="select-none"
            />

            {/* 진행률 마름모 선 */}
            <motion.path
              d="M100 10 L190 100 L100 190 L10 100 Z"
              fill="none"
              stroke="#ffcc3e"
              strokeWidth={strokeWidth}
              strokeLinecap="square"
              style={{ pathLength: progressMV, opacity: opacityMV }}
              className="select-none"
            />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default function LoadingSpinner({
  isLoading,
  isRunning,
  progressRef,
  setRunningTime,
}: {
  isLoading: boolean;
  isRunning: RefObject<boolean>;
  progressRef: RefObject<ProgressRefProps>;
  setRunningTime: Dispatch<SetStateAction<number | null>>;
}) {
  const MIN_DURATION = 1000; // 최소 로딩 시간(ms)
  const EXIT_DELAY = 300;
  const [visible, setVisible] = useState(false);
  const mountTimeRef = useRef<number | null>(null);
  const loadingRef = useRef(true);

  const testLoadingRef = useRef(true);
  const testRef = useRef({
    gachaRuns: 10000000,
    progressTry: 10000,
    success: 10000,
    total: 10000,
    results: [],
  });

  useEffect(() => {
    loadingRef.current = isLoading;
    if (!isRunning.current) return;
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
        const timer = setTimeout(() => {
          setVisible(false);
          isRunning.current = false;
          setRunningTime(elapsed + EXIT_DELAY);
        }, EXIT_DELAY);

        return () => clearTimeout(timer);
      } else {
        // 최소 시간 안 지남 → 나머지 시간 기다린 뒤 종료
        const remaining = MIN_DURATION - elapsed + EXIT_DELAY;

        const timer = setTimeout(() => {
          setVisible(false);
          isRunning.current = false;
          setRunningTime(MIN_DURATION + EXIT_DELAY);
        }, remaining);

        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, progressRef, setRunningTime, isRunning]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        progressRef.current = { gachaRuns: 0, progressTry: 0, success: 0, total: 0, results: [] };
      }}
    >
      {visible && (
        <LoadingSpinnerContent
          progressRef={progressRef}
          loadingRef={testLoadingRef}
          onStopClick={() => {}}
        />
      )}
    </AnimatePresence>
  );
}
