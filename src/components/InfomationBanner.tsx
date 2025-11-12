import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import BannerEVCounts from '#/components/charts/BannerEVCounts';
import BannerWinRate from '#/components/charts/BannerWinRate';
import SimulationResult from '#/components/charts/SimulationResult';
import TotalGachaResult from '#/components/charts/TotalGachaResult';
import SimulationResultModal from '#/components/modals/SimulationResultModal';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function InfomationBanner({
  isTrySim,
  result,
}: {
  isTrySim: boolean;
  result: GachaSimulationMergedResult | null;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-[480px] space-y-6">
      <motion.div
        variants={cardVariants}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...cardTransition, ease: 'easeIn' }}
        initial="exit"
        className="font-S-CoreDream-500 flex w-[480px] items-center justify-between rounded-xl p-4"
      >
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
          className="text-lg"
        >
          <span className="text-amber-400">{isTrySim ? '가챠 확률' : '재화 소모'} 시뮬레이션 </span>
          <span>통계</span>
        </motion.div>
        <div className="relative">
          <TypeSelectionButton
            name="자세히보기"
            hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
            onTypeClick={() => {
              setIsModalOpen(true);
            }}
            className="px-4"
          />
          {result === null && (
            <div className="absolute top-0 left-0 size-full rounded-xl bg-[#505050aa]" />
          )}
        </div>
      </motion.div>
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
  );
}
