import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import BannerAverageCount from '#/components/charts/BannerAverageCount';
import BannerWinRate from '#/components/charts/BannerWinRate';
import SimulationResult from '#/components/charts/SimulationResult';
import TotalGachaResult from '#/components/charts/TotalGachaResult';
import SimulationResultModal from '#/components/modals/SimulationResultModal';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { motion } from 'motion/react';
import { useState } from 'react';

// 배너별 성공 시기 통계
export default function ScheduleOverview({
  isGachaSim,
  result,
}: {
  isGachaSim: boolean;
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
          <span className="text-amber-400">
            {isGachaSim ? '가챠 확률' : '재화 소모'} 시뮬레이션{' '}
          </span>
          <span>통계</span>
        </motion.div>
        <TypeSelectionButton
          name="자세히보기"
          hoverBackground="linear-gradient(155deg, #bb4d00, #3b372a)"
          onTypeClick={() => {
            setIsModalOpen(true);
          }}
          className="px-4"
        />
      </motion.div>
      <SimulationResult result={result} />
      <TotalGachaResult result={result} />
      <BannerWinRate result={result} />
      <BannerAverageCount result={result} />
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
