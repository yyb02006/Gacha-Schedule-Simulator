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
import ToTopButton from '#/components/buttons/ToTopButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GachaSimulationMergedResult | null;
}

const FloatingActionBar = ({
  currentBanner,
  handleToTop,
}: {
  currentBanner: HTMLDivElement | undefined;
  handleToTop: () => void;
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 flex h-[60px] w-[400px] -translate-x-1/2 items-center justify-between rounded-xl bg-[#202020] px-2 text-stone-50 shadow-[4px_4px_12px_#101010,-5px_-4px_10px_#303030]">
      <ToTopButton handleToTop={handleToTop} />
      <div className="mr-3 text-lg">
        {currentBanner ? currentBanner.dataset.name : '시뮬레이션 결과'}
      </div>
    </div>
  );
};

export default function SimulationResultModal({ isOpen, onClose, result }: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<HTMLDivElement[]>([]);
  const [currentChartIndex, setCurrentChartIndex] = useState<HTMLDivElement | undefined>(undefined);

  // 이 코드 파고들기
  useEffect(() => {
    if (!result || !isOpen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleCharts = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleCharts.length > 0) {
          const el = chartRefs.current.find((el) => el === visibleCharts[0].target);
          setCurrentChartIndex(el);
        }
      },
      { threshold: 0.5 }, // 화면에 50% 이상 보여야 진입으로 간주
    );

    chartRefs.current.forEach((el) => el && observer.observe(el));

    return () => {
      chartRefs.current.forEach((el) => el && observer.unobserve(el));
    };
  }, [isOpen, result]);

  return result ? (
    <Modal isOpen={isOpen} onClose={onClose} ref={modalRef}>
      <section className="mb-[200px] w-[1280px] space-y-6 rounded-xl bg-[#202020] p-6">
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
          <SimulationResult
            ref={(el) => {
              if (!el) return;
              chartRefs.current[0] = el;
            }}
            name="시뮬레이션 통계"
            result={result}
          />
          <TotalGachaResult
            ref={(el) => {
              if (!el) return;
              chartRefs.current[1] = el;
            }}
            name="전체 단일가챠 통계"
            result={result}
          />
          {!(result.total.isSimpleMode && result.total.isTrySim) && (
            <>
              <GachaSurvivalProbability
                ref={(el) => {
                  if (!el) return;
                  chartRefs.current[2] = el;
                }}
                name="가챠배너 도달 / 중단 확률"
                result={result}
                chartHeight="h-[400px]"
              />
              <BannerWinRate
                ref={(el) => {
                  if (!el) return;
                  chartRefs.current[3] = el;
                }}
                name="배너별 성공 / 실패 비율"
                result={result}
                chartHeight="h-[400px]"
              />
            </>
          )}
          <BannerEVCounts
            ref={(el) => {
              if (!el) return;
              chartRefs.current[4] = el;
            }}
            name="배너별 성공 시 기대값"
            result={result}
            chartHeight="h-[400px]"
          />
          {result.total.isTrySim ? (
            <ExpectedCumulativeConsumption
              ref={(el) => {
                if (!el) return;
                chartRefs.current[5] = el;
              }}
              name="평균 누적 소모 합성옥"
              result={result}
              chartHeight="h-[400px]"
            />
          ) : (
            <BannerEntryCurrency
              ref={(el) => {
                if (!el) return;
                chartRefs.current[6] = el;
              }}
              name="배너별 진입 시 평균 재화"
              result={result}
              chartHeight="h-[400px]"
            />
          )}
          {/* <BannerPreEVSuccess result={result} chartHeight="h-[400px]" /> */}
          <BannerEVShareRate
            ref={(el) => {
              if (!el) return;
              chartRefs.current[7] = el;
            }}
            name="배너별 기대값 점유율"
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
            result.perBanner.map((bannerResult, index) => (
              <BannerSuccessTrialCounts
                key={bannerResult.id}
                ref={(el) => {
                  if (!el) return;
                  chartRefs.current[8 + index] = el;
                }}
                name={bannerResult.name}
                bannerResult={bannerResult}
                isTrySim={result.total.isTrySim}
                simulationTry={result.total.simulationTry}
                chartHeight="h-[400px]"
              />
            ))
          ) : (
            <span>
              시뮬레이션 반복 횟수 <span className="text-amber-400">10회 이하</span>에서는 배너별
              세부기록를 표시하지 않습니다.
            </span>
          )}
        </div>
      </section>
      <FloatingActionBar
        handleToTop={() => {
          console.log(modalRef);
          modalRef.current?.scrollTo({ top: 0, behavior: 'auto' });
        }}
        currentBanner={currentChartIndex}
      />
    </Modal>
  ) : null;
}
