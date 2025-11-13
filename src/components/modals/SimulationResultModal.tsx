'use client';

import Modal from '#/components/modals/Modal';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import SimulationResult from '#/components/charts/SimulationResult';
import BannerWinRate from '#/components/charts/BannerWinRate';
import TotalGachaResult from '#/components/charts/TotalGachaResult';
import { toOpacityZero } from '#/constants/variants';
import { motion } from 'motion/react';
import CancelButton from '#/components/buttons/CancelButton';
import BannerSuccessTrialCounts from '#/components/charts/BannerSuccessTrialCounts';
import { useEffect, useRef, useState } from 'react';
import BannerEVShareRate from '#/components/charts/BannerEVShareRate';
import BannerEntryCurrency from '#/components/charts/BannerEntryCurrency';
import ExpectedCumulativeConsumption from '#/components/charts/ExpectedCumulativeConsumption';
import GachaSurvivalProbability from '#/components/charts/GachaSurvivalProbability';
import BannerEVCounts from '#/components/charts/BannerEVCounts';
import { cls } from '#/libs/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GachaSimulationMergedResult | null;
}

function LazyRender({
  children,
  minHeight = 300,
  className = '',
}: {
  children: React.ReactNode;
  minHeight?: number;
  className?: string;
}) {
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
    <div
      ref={ref}
      className={cls('flex w-full items-center justify-center', className)}
      // style={{ minHeight }}
    >
      {inView ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full w-full"
        >
          {children}
        </motion.div>
      ) : (
        <div
          className="w-full animate-pulse rounded-lg bg-neutral-800/50"
          style={{ height: minHeight }}
        />
      )}
    </div>
  );
}

export default function SimulationResultModal({ isOpen, onClose, result }: SettingsModalProps) {
  return result ? (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className="w-[1280px] space-y-6 rounded-xl bg-[#202020] p-6">
        <div className="flex items-center justify-between">
          <motion.div
            variants={toOpacityZero}
            whileInView="idle"
            viewport={{ once: true, amount: 0.5 }}
            initial="exit"
            className="font-S-CoreDream-700 text-2xl"
          >
            <span className="text-amber-500">시뮬레이션</span> 결과
          </motion.div>
          <CancelButton handleCancel={onClose} />
        </div>
        <div className="grid h-fit w-full grid-cols-2 items-stretch gap-6">
          <SimulationResult result={result} />
          <TotalGachaResult result={result} />
          {!(result.total.isSimpleMode && result.total.isTrySim) && (
            <>
              <GachaSurvivalProbability result={result} chartHeight="h-[400px]" />
              <BannerWinRate result={result} chartHeight="h-[400px]" />
            </>
          )}
          <BannerEVCounts result={result} chartHeight="h-[400px]" />
          {result.total.isTrySim ? (
            <ExpectedCumulativeConsumption result={result} chartHeight="h-[400px]" />
          ) : (
            <BannerEntryCurrency result={result} chartHeight="h-[400px]" />
          )}
          {/* <BannerPreEVSuccess result={result} chartHeight="h-[400px]" /> */}
          <BannerEVShareRate
            result={{
              ...result,
              perBanner: result.perBanner.map((bannerResult, index) => ({
                ...bannerResult,
                name: `${index + 1}. ${bannerResult.name}`,
              })),
            }}
            isColspanTwo={true}
          />
        </div>
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
          className="font-S-CoreDream-700 pt-4 text-2xl"
        >
          <span className="text-amber-500">배너별</span> 성공 기록 통계
        </motion.div>
        <div className="flex flex-col gap-6">
          {result.total.simulationTry > 10 ? (
            result.perBanner.map((bannerResult) => (
              <LazyRender key={bannerResult.id}>
                <BannerSuccessTrialCounts
                  bannerResult={bannerResult}
                  isTrySim={result.total.isTrySim}
                  simulationTry={result.total.simulationTry}
                  chartHeight="h-[400px]"
                />
              </LazyRender>
            ))
          ) : (
            <span>
              시뮬레이션 반복 횟수 <span className="text-amber-400">10회 이하</span>에서는 배너별
              세부기록를 표시하지 않습니다.
            </span>
          )}
        </div>
      </section>
    </Modal>
  ) : null;
}
