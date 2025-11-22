import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import BannerEVCounts from '#/components/charts/BannerEVCounts';
import BannerWinRate from '#/components/charts/BannerWinRate';
import SimulationResult from '#/components/charts/SimulationResult';
import TotalGachaResult from '#/components/charts/TotalGachaResult';
import SimulationResultModal from '#/components/modals/SimulationResultModal';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { useScreenWidth } from '#/hooks/useScreenWidth';
import { cls, safeNumberOrZero, truncateToDecimals } from '#/libs/utils';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

export default function SummaryBanner({ result }: { result: GachaSimulationMergedResult | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const screenWidth = useScreenWidth();
  return (
    <div
      className={cls(
        'lg:static lg:block lg:w-[240px] lg:flex-1 lg:space-y-6 xl:w-[480px]',
        result ? 'fixed bottom-4 w-[calc(100%-32px)]' : 'hidden',
      )}
    >
      <motion.div
        variants={cardVariants}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...cardTransition, ease: 'easeIn' }}
        initial="exit"
        custom={{
          background:
            screenWidth.width > 1024 ? undefined : 'linear-gradient(135deg, #e67a00, #ffb900)',
        }}
        className="font-S-CoreDream-500 rounded-xl p-2 lg:p-4"
      >
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
          className="flex items-center justify-between text-lg"
        >
          <div className="text-lg lg:hidden">
            <span>시뮬레이션 성공률 : </span>
            {result ? (
              <span className="font-S-CoreDream-700 text-[#404040]">
                {truncateToDecimals(
                  safeNumberOrZero(result?.total.simulationSuccess / result?.total.simulationTry) *
                    100,
                )}
                %
              </span>
            ) : null}
          </div>
          <div className="hidden lg:block">
            <span
              className={cls(result?.total.isTrySim === false ? 'text-red-400' : 'text-amber-400')}
            >
              {result?.total.isTrySim === false ? '재화 소모' : '가챠 확률'} 시뮬레이션{' '}
            </span>
            <span>통계</span>
          </div>
          <div className="relative">
            <TypeSelectionButton
              name="자세히"
              hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
              shadow="2px 2px 6px #101010, -2px -2px 5px #303030"
              innerShadow="inset 3px 3px 6px #bb4d00, inset -3px -3px 6px #ffb900"
              onTypeClick={() => {
                setIsModalOpen(true);
              }}
              className="px-4 text-base"
            />
            <AnimatePresence>
              {result === null && (
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-0 left-0 size-full rounded-xl bg-[#505050aa]"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
      <div className="hidden space-y-6 lg:block">
        <SimulationResult result={result} />
        <TotalGachaResult result={result} />
        <BannerWinRate result={result} enableBrush={false} chartHeight="h-[240px]" />
        <BannerEVCounts result={result} enableBrush={false} chartHeight="h-[240px]" />
        <SimulationResultModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          result={result}
        />
      </div>
    </div>
  );
}
