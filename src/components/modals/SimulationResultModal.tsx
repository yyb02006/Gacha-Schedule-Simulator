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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GachaSimulationMergedResult | null;
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
          <SimulationResult result={result} />
          <TotalGachaResult result={result} />
          <BannerWinRate result={result} />
          <BannerAverageCount result={result} />
        </div>
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
          className="font-S-CoreDream-700 pt-4 text-2xl"
        >
          <span className="text-amber-500">배너별</span> 평균 가챠 성공 시점
        </motion.div>
        <div className="flex flex-col gap-6">
          <BannerSuccessTrialCounts bannerResult={result.perBanner[0]} />
        </div>
      </section>
    </Modal>
  ) : null;
}
