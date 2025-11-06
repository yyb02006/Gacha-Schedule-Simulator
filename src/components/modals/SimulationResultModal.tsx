'use client';

import Modal from '#/components/modals/Modal';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import SimulationResult from '#/components/charts/SimulationResult';
import BannerWinRate from '#/components/charts/BannerWinRate';
import BannerAverageCount from '#/components/charts/BannerAverageCounts';
import TotalGachaResult from '#/components/charts/TotalGachaResult';
import { toOpacityZero } from '#/constants/variants';
import { motion } from 'motion/react';
import CancelButton from '#/components/buttons/CancelButton';
import BannerSuccessTrialCounts from '#/components/charts/BannerSuccessTrialCounts';
import { useEffect, useRef, useState } from 'react';
import BannerEVShareRate from '#/components/charts/BannerEVShareRate';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GachaSimulationMergedResult | null;
}

function LazyRender({
  children,
  minHeight = 300,
}: {
  children: React.ReactNode;
  minHeight?: number;
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
    <div ref={ref} className="flex w-full items-center justify-center" style={{ minHeight }}>
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
        <div className="grid h-fit w-full grid-cols-2 gap-6">
          <LazyRender>
            <SimulationResult result={result} />
          </LazyRender>
          <LazyRender>
            <TotalGachaResult result={result} />
          </LazyRender>
          <LazyRender>
            <BannerWinRate result={result} />
          </LazyRender>
          <LazyRender>
            <BannerAverageCount result={result} />
          </LazyRender>
          <LazyRender>
            <BannerEVShareRate
              result={{
                ...result,
                perBanner: result.perBanner.map((bannerResult, index) => ({
                  ...bannerResult,
                  name: `${index + 1}. ${bannerResult.name}`,
                })),
              }}
            />
          </LazyRender>
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
          {result.perBanner.map((bannerResult) => (
            <LazyRender key={bannerResult.id}>
              <BannerSuccessTrialCounts
                bannerResult={bannerResult}
                simulationTry={result.total.simulationTry}
                chartHeight="h-[400px]"
              />
            </LazyRender>
          ))}
        </div>
      </section>
    </Modal>
  ) : null;
}
