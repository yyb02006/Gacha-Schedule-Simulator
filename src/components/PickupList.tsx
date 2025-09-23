'use client';

import AddButton from '#/components/buttons/AddButton';
import ScheduleOverview from '#/components/InfomationBanner';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { motion } from 'motion/react';
import PlayButton from '#/components/buttons/PlayButton';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import OptionBar from '#/components/OptionBar';
import ResetButton from '#/components/buttons/ResetButton';
import PickupBanner from '#/components/PickupBanner';

export type GachaType = 'limited' | 'standard' | 'collab' | 'revival';

export interface Dummy {
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

/* const GachaBanners = ({ isGachaSim }: { isGachaSim: boolean }) => {
  return (
    <section className="flex h-0 grow flex-col space-y-2">
      <div className="hide-scrollbar relative -mx-3 space-y-6 overflow-y-auto px-3 py-[10px]">
        {dummies.map((dummy, index) => (
          <GachaBannerOptionCard
            key={dummy.id}
            isGachaSim={isGachaSim}
            data={dummy}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}; */

export default function PickupList() {
  const [pickupDatas, setPickupDatas] = useState<Dummy[]>(dummies);
  const [isBannerAddHover, setIsBannerAddHover] = useState(false);
  const [isGachaSim, setIsGachaSim] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const addBanner = () => {
    setPickupDatas((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        gachaType: 'standard',
        operators: [],
        pickupDetails: { pickupOpersCount: 2, targetPickupCount: 1, pickupChance: 50 },
        gachaMax: 300,
        gachaMin: 0,
        name: 'scheduleA',
      },
    ]);
  };
  const deleteBanner = (targetId: string) => () => {
    setPickupDatas((p) => p.filter(({ id }) => id !== targetId));
  };
  return (
    <div className="mt-12 flex space-x-6">
      <ScheduleOverview />
      <div className="flex w-[984px] flex-col items-center space-y-6">
        <div className="mb-12 flex space-x-16">
          <ResetButton onResetClick={() => {}} />
          <PlayButton onPlayClick={() => {}} />
        </div>
        <OptionBar
          isGachaSim={isGachaSim}
          setIsGachaSim={setIsGachaSim}
          isSimpleMode={isSimpleMode}
          setIsSimpleMode={setIsSimpleMode}
        />
        <div className="flex w-full flex-col gap-y-6">
          <AnimatePresence>
            <motion.div
              onHoverStart={() => setIsBannerAddHover(true)}
              onHoverEnd={() => setIsBannerAddHover(false)}
              variants={cardVariants}
              whileHover={{ scale: 1.02, background: 'linear-gradient(155deg, #bb4d00, #ffb900)' }}
              whileTap={{ scale: 1.02, background: 'linear-gradient(155deg, #bb4d00, #ffb900)' }}
              initial="exit"
              animate="idle"
              transition={cardTransition}
              onClick={addBanner}
              className="flex cursor-pointer items-center justify-center gap-x-24 overflow-hidden rounded-xl py-8"
            >
              <motion.div
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="font-S-CoreDream-700 text-2xl"
              >
                픽업 배너 추가
              </motion.div>
              <AddButton
                onAddClick={addBanner}
                isOtherElHover={isBannerAddHover}
                custom={{ boxShadow: '0px -7px 20px 5px #bd5b00, 0px 7px 22px 3px #ffde26' }}
              />
            </motion.div>
            {pickupDatas.map((data, index) => (
              <PickupBanner key={data.id} data={data} index={index} isGachaSim={isGachaSim} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
