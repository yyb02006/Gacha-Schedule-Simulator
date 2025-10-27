'use client';

import Modal from '#/components/modals/Modal';
import { Dispatch, SetStateAction, useState } from 'react';
import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { InsetNumberInput } from '#/components/PickupBanner';
import { motion } from 'motion/react';
import { toOpacityZero } from '#/constants/variants';
import { GachaSimulationMergedResult, SimulationOptions } from '#/components/PickupList';
import { stringToNumber } from '#/libs/utils';
import ToggleButton from '#/components/buttons/ToggleButton';
import SimulationResult from '#/components/charts/SimulationResult';
import BannerWinRate from '#/components/charts/BannerWinRate';
import BannerAverageCount from '#/components/charts/BannerAverageCount';
import TotalGachaResult from '#/components/charts/TotalGachaResult';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GachaSimulationMergedResult | null;
}

export default function SimulationResultModal({ isOpen, onClose, result }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className="h-fit w-[1280px] space-y-6 rounded-xl bg-[#202020] p-6">
        <h1>Contents</h1>
        <SimulationResult result={result} />
        <TotalGachaResult result={result} />
        <BannerWinRate result={result} />
        <BannerAverageCount result={result} />
      </section>
    </Modal>
  );
}
