'use client';

import Modal from '#/components/Modal';
import { GachaType } from '#/components/PickupList';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { insetInputVariants, toOpacityZero } from '#/constants/variants';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import SimulatorTypeButton from '#/components/buttons/SimulatorTypeButton';
import CancelButton from '#/components/buttons/CancelButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Dummy {
  id: string;
  name: string;
  gachaMax: number | null;
  gachaMin: number;
  gachaType: GachaType;
  operators: { name: string; currentQty: number; operType: 'limited' | 'normal' }[];
  pickupDetails: { pickupOpersCount: number; targetPickupCount: number; pickupChance: number };
}

const dummies: Dummy[] = [
  {
    id: '970b5b98-edda-4af6-ae22-49a9227e1ad4',
    name: '우리 종족',
    gachaType: 'limited',
    operators: [
      { name: '위셔델', currentQty: 0, operType: 'limited' },
      { name: '로고스', currentQty: 0, operType: 'normal' },
    ],
    pickupDetails: { pickupOpersCount: 2, targetPickupCount: 2, pickupChance: 70 },
    gachaMax: 200,
    gachaMin: 0,
  },
  {
    id: 'a1b2c3d4-e5f6-4789-b0c1-d2e3f4a5b6c7',
    name: '모래위의 각인',
    gachaType: 'limited',
    operators: [
      { name: '페페', currentQty: 0, operType: 'limited' },
      { name: '나란투야', currentQty: 0, operType: 'normal' },
    ],
    pickupDetails: { pickupOpersCount: 2, targetPickupCount: 2, pickupChance: 70 },
    gachaMax: null,
    gachaMin: 0,
  },
  {
    id: 'f8e7d6c5-b4a3-4210-9876-543210fedcba',
    name: '불타는 엘레지여',
    gachaType: 'standard',
    operators: [{ name: '네크라스', currentQty: 0, operType: 'normal' }],
    pickupDetails: { pickupOpersCount: 1, targetPickupCount: 1, pickupChance: 50 },
    gachaMax: null,
    gachaMin: 0,
  },
];

/* 가챠 배너는 20개까지 */

export default function SimulatorOptionModal({ isOpen, onClose }: SettingsModalProps) {
  const [isGachaSim, setIsGachaSim] = useState(true);
  const [settingA, setSettingA] = useState(false);
  const [settingB, setSettingB] = useState('option1');

  const handleSave = () => {
    console.log('설정 저장:', { settingA, settingB });
    onClose();
  };

  const changeSimType = () => {
    setIsGachaSim((p) => !p);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-S-CoreDream-700 text-2xl">
            <span className="text-amber-400">고오급</span> 옵션
          </h1>
          <CancelButton handleCancel={onClose} />
        </div>
      </div>
    </Modal>
  );
}
