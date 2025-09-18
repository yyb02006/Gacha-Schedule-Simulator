'use client';

import AddButton from '#/components/AddButton';
import ScheduleOverview from '#/components/InfomationBanner';
import PickupCard from '#/components/PickupCard';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { motion } from 'motion/react';
import PlayButton from '#/components/PlayButton';
import ResetButton from '#/components/ResetButton';
import { cardTransition, cardVariants } from '#/constants/variants';
import OptionBar from '#/components/OptionBar';

export interface PickupData {
  id: string;
  operators: { name: string; currentQty: number }[];
  gachaType: 'limited' | 'standard' | 'collab';
  pickupDetails: { pickupOpersCount: number; targetPickupCount: number; pickupChance: number };
}

const dummy: Array<PickupData> = [
  {
    id: '970b5b98-edda-4af6-ae22-49a9227e1ad4',
    gachaType: 'limited',
    operators: [
      { name: '위셔델', currentQty: 0 },
      { name: '로고스', currentQty: 0 },
    ],
    pickupDetails: { pickupOpersCount: 2, targetPickupCount: 2, pickupChance: 70 },
  },
  {
    id: 'a1b2c3d4-e5f6-4789-b0c1-d2e3f4a5b6c7',
    gachaType: 'standard',
    operators: [{ name: '네크라스', currentQty: 0 }],
    pickupDetails: { pickupOpersCount: 1, targetPickupCount: 1, pickupChance: 50 },
  },
];

export default function PickupList() {
  const [pickupDatas, setPickupDatas] = useState<PickupData[]>(dummy);
  const addBanner = () => {
    setPickupDatas((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        gachaType: 'standard',
        operators: [{ name: '오퍼레이터A', currentQty: 0 }],
        pickupDetails: { pickupOpersCount: 2, targetPickupCount: 1, pickupChance: 50 },
      },
    ]);
  };
  const deleteBanner = (targetId: string) => () => {
    setPickupDatas((p) => p.filter(({ id }) => id !== targetId));
  };
  return (
    <div className="mt-12 flex space-x-6">
      <div className="flex flex-col items-center space-y-12">
        <ScheduleOverview />
      </div>
      <div className="flex flex-col items-center space-y-8">
        <div className="mb-12 flex space-x-16">
          <ResetButton onResetClick={() => {}} />
          <PlayButton onPlayClick={() => {}} />
        </div>
        <OptionBar />
        <div className="grid grid-cols-2 gap-x-6 gap-y-9">
          <AnimatePresence>
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              initial="exit"
              animate="idle"
              transition={cardTransition}
              className="flex items-center justify-center rounded-xl p-4"
            >
              <AddButton onAddClick={addBanner} />
            </motion.div>
            {pickupDatas.map((pickupData, index) => (
              <PickupCard
                key={pickupData.id}
                index={index + 1}
                pickupData={pickupData}
                deleteBanner={deleteBanner(pickupData.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
