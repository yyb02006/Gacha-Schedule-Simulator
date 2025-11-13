'use client';

import Modal from '#/components/modals/Modal';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import SimulationResult from '#/components/charts/SimulationResult';
import BannerWinRate from '#/components/charts/BannerWinRate';
import TotalGachaResult from '#/components/charts/TotalGachaResult';
import { toOpacityZero } from '#/constants/variants';
import { AnimatePresence, motion } from 'motion/react';
import CancelButton from '#/components/buttons/CancelButton';
import BannerSuccessTrialCounts from '#/components/charts/BannerSuccessTrialCounts';
import { RefObject, useEffect, useRef, useState } from 'react';
import BannerEVShareRate from '#/components/charts/BannerEVShareRate';
import BannerEntryCurrency from '#/components/charts/BannerEntryCurrency';
import ExpectedCumulativeConsumption from '#/components/charts/ExpectedCumulativeConsumption';
import GachaSurvivalProbability from '#/components/charts/GachaSurvivalProbability';
import BannerEVCounts from '#/components/charts/BannerEVCounts';
import ToTopButton from '#/components/buttons/ToTopButton';
import ChevronDown from '#/icons/ChevronDown.svg';
import ChevronUp from '#/icons/ChevronUp.svg';
import { cls } from '#/libs/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GachaSimulationMergedResult | null;
}

const FloatingActionBar = ({
  result,
  isOpen,
  chartRefs,
  modalRef,
  handleToTop,
}: {
  result: GachaSimulationMergedResult | null;
  isOpen: boolean;
  chartRefs: RefObject<HTMLDivElement[]>;
  modalRef: RefObject<HTMLDivElement | null>;
  handleToTop: () => void;
}) => {
  const [currentBanner, setCurrentBanner] = useState<HTMLDivElement | undefined>(undefined);
  const [isListOpen, setIsListOpen] = useState(false);
  const listItemRefs = useRef<HTMLButtonElement[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const prevIsListOpen = useRef(false);

  useEffect(() => {
    if (!result || !isOpen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleCharts = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleCharts.length > 0) {
          const el = chartRefs.current.find((el) => el === visibleCharts[0].target);
          setCurrentBanner(el);
        }
      },
      { threshold: 0.5 }, // 화면에 50% 이상 보여야 진입으로 간주
    );

    chartRefs.current.forEach((el) => el && observer.observe(el));

    return () => {
      chartRefs.current.forEach((el) => el && observer.unobserve(el));
    };
  }, [isOpen, result, chartRefs]);

  useEffect(() => {
    if (!isListOpen || listItemRefs.current.length === 0) {
      prevIsListOpen.current = isListOpen;
      return;
    }

    if (!prevIsListOpen.current && isListOpen) {
      // 빠진 index가 있어서 undefined 빼줘야함 안그러면 undefined 요소에서 dataset을 찾다가 에러남
      const currentItem = listItemRefs.current
        .filter(Boolean)
        .find((banner) => banner.dataset.id === currentBanner?.dataset.id);

      if (currentItem && listRef.current) {
        listRef.current.scrollTo({ top: currentItem.offsetTop });
      }
    }

    prevIsListOpen.current = isListOpen;
  }, [isListOpen, currentBanner?.dataset.id]);

  return (
    <div className="fixed bottom-6 left-1/2 flex w-[400px] -translate-x-1/2 gap-2 text-stone-50">
      <ToTopButton handleToTop={handleToTop} />
      <div className="relative flex flex-1 items-center justify-between self-stretch rounded-xl bg-[#202020] pl-4 text-base shadow-[4px_4px_12px_#101010,-5px_-4px_10px_#303030]">
        {currentBanner ? currentBanner.dataset.name : '시뮬레이션 결과'}
        <button
          onClick={() => {
            setIsListOpen((p) => !p);
          }}
          className="aspect-square h-full cursor-pointer p-[6px] hover:text-amber-500"
        >
          {isListOpen ? <ChevronDown className="size-full" /> : <ChevronUp className="size-full" />}
        </button>
        <AnimatePresence>
          {isListOpen && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              ref={listRef}
              className="font-S-CoreDream-300 absolute -top-[216px] right-0 size-full h-[200px] overflow-y-auto rounded-xl bg-[#202020] px-4 py-3 text-sm shadow-[4px_4px_12px_#101010,-5px_-4px_10px_#303030]"
            >
              {chartRefs.current.map((banner, index) => (
                <button
                  onClick={() => {
                    modalRef.current?.scrollTo({ top: Math.max(banner.offsetTop - 32, 0) });
                  }}
                  key={index}
                  data-id={banner.dataset.id}
                  ref={(el) => {
                    if (!el) return;
                    listItemRefs.current[index] = el;
                  }}
                  className={cls(
                    currentBanner?.offsetTop === banner.offsetTop
                      ? 'bg-[#292929] text-sky-500'
                      : '',
                    'block w-full cursor-pointer py-[4px] text-left hover:bg-[#303030] hover:text-amber-500',
                  )}
                >
                  {banner.dataset.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function SimulationResultModal({ isOpen, onClose, result }: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<HTMLDivElement[]>([]);

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
            id="1"
            name="시뮬레이션 통계"
            result={result}
          />
          <TotalGachaResult
            ref={(el) => {
              if (!el) return;
              chartRefs.current[1] = el;
            }}
            id="2"
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
                id="3"
                name="가챠배너 도달 / 중단 확률"
                result={result}
                chartHeight="h-[400px]"
              />
              <BannerWinRate
                ref={(el) => {
                  if (!el) return;
                  chartRefs.current[3] = el;
                }}
                id="4"
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
            id="5"
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
              id="6"
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
              id="7"
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
            id="8"
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
                id={`${8 + index}`}
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
          modalRef.current?.scrollTo({ top: 0, behavior: 'auto' });
        }}
        chartRefs={chartRefs}
        modalRef={modalRef}
        isOpen={isOpen}
        result={result}
      />
    </Modal>
  ) : null;
}
