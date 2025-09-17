'use client';

import AddButton from '#/components/AddButton';
import PickupCard from '#/components/PickupCard';
import { useState } from 'react';

export interface PickupData {
  index: number;
  operators: { name: string; currentQty: number }[];
  gachaType: 'limited' | 'standard' | 'collab';
  pickupDetails: { pickupOpersCount: number; targetPickupCount: number; pickupChance: number };
}

const dummy: Array<PickupData> = [
  {
    index: 1,
    gachaType: 'limited',
    operators: [
      { name: '위셔델', currentQty: 0 },
      { name: '로고스', currentQty: 0 },
    ],
    pickupDetails: { pickupOpersCount: 2, targetPickupCount: 2, pickupChance: 70 },
  },
];

export default function PickupList() {
  const [pickupDatas, setPickupDatas] = useState<PickupData[]>(dummy);
  const addBanner = () => {
    setPickupDatas((p) => [
      ...p,
      {
        index: p.length + 1,
        gachaType: 'standard',
        operators: [{ name: '오퍼레이터A', currentQty: 0 }],
        pickupDetails: { pickupOpersCount: 2, targetPickupCount: 1, pickupChance: 50 },
      },
    ]);
  };
  return (
    <div className="mt-12 flex flex-col items-center space-y-12">
      <AddButton onAddClick={addBanner} />
      <div className="flex flex-col space-y-6">
        {pickupDatas.map((pickupData) => (
          <PickupCard key={pickupData.index} pickupData={pickupData} />
        ))}
      </div>
    </div>
  );
}
