'use client';

import AddButton from '#/components/buttons/AddButton';
import ScheduleOverview from '#/components/InfomationBanner';
import { AnimatePresence } from 'motion/react';
import { useReducer, useState } from 'react';
import { motion } from 'motion/react';
import PlayButton from '#/components/buttons/PlayButton';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import OptionBar from '#/components/OptionBar';
import ResetButton from '#/components/buttons/ResetButton';
import PickupBanner from '#/components/PickupBanner';
import BannerAddModal from '#/components/BannerAddModal';
import { useModal } from '#/hooks/useModal';

export type GachaType = 'limited' | 'standard' | 'collab' | 'revival';

export interface Dummy {
  id: string;
  name: string;
  maxGachaAttempts: number | null;
  minGachaAttempts: number;
  gachaType: GachaType;
  operators: {
    name: string;
    currentQty: number;
    operType: 'limited' | 'normal';
    targetCount: number | null;
  }[];
  pickupDetails: { pickupOpersCount: number; targetPickupCount: number; pickupChance: number };
}

const dummies: Dummy[] = [
  {
    id: '970b5b98-edda-4af6-ae22-49a9227e1ad4',
    name: '우리 종족',
    gachaType: 'limited',
    operators: [
      { name: '위셔델', currentQty: 0, operType: 'limited', targetCount: 1 },
      { name: '로고스', currentQty: 0, operType: 'normal', targetCount: 1 },
    ],
    pickupDetails: { pickupOpersCount: 2, targetPickupCount: 2, pickupChance: 70 },
    maxGachaAttempts: 200,
    minGachaAttempts: 0,
  },
  {
    id: 'a1b2c3d4-e5f6-4789-b0c1-d2e3f4a5b6c7',
    name: '모래위의 각인',
    gachaType: 'limited',
    operators: [
      { name: '페페', currentQty: 0, operType: 'limited', targetCount: 1 },
      { name: '나란투야', currentQty: 0, operType: 'normal', targetCount: 1 },
    ],
    pickupDetails: { pickupOpersCount: 2, targetPickupCount: 2, pickupChance: 70 },
    maxGachaAttempts: null,
    minGachaAttempts: 0,
  },
  {
    id: 'f8e7d6c5-b4a3-4210-9876-543210fedcba',
    name: '불타는 엘레지여',
    gachaType: 'standard',
    operators: [{ name: '네크라스', currentQty: 0, operType: 'normal', targetCount: 1 }],
    pickupDetails: { pickupOpersCount: 1, targetPickupCount: 1, pickupChance: 50 },
    maxGachaAttempts: null,
    minGachaAttempts: 0,
  },
];

export type AddType = 'addSimpleBanner' | 'addDetailedBanner';

export type PickupDatasAction = {
  addType: 'addSimpleBanner';
  payload: { gachaType: GachaType; pickupOpersCount: number; targetPickupCount: number };
};

export type PickupDataPayload<T extends AddType> = PickupDatasAction extends { addType: T }
  ? PickupDatasAction
  : never;

const reducer = (state: Dummy[], action: PickupDatasAction) => {
  switch (action.addType) {
    case 'addSimpleBanner': {
      const { gachaType, pickupOpersCount, targetPickupCount } = action.payload;
      const pickupChance = gachaType === 'limited' || gachaType === 'collab' ? 70 : 50;
      const operators: Dummy['operators'] = Array.from(
        { length: pickupOpersCount },
        (_, index) => ({
          currentQty: 0,
          name: `오퍼레이터 ${index + 1}`,
          operType: pickupChance === 70 && index === 0 ? 'limited' : 'normal',
          targetCount: 1,
        }),
      );
      return [
        ...state,
        {
          id: crypto.randomUUID(),
          gachaType: gachaType,
          pickupDetails: { pickupChance, pickupOpersCount, targetPickupCount },
          maxGachaAttempts: Infinity,
          minGachaAttempts: 0,
          name: `새 가챠 배너`,
          operators: operators,
        } satisfies Dummy,
      ];
    }
    default:
      throw new Error();
  }
};

export default function PickupList() {
  const [pickupDatas, dispatch] = useReducer(reducer, dummies);
  const [isBannerAddHover, setIsBannerAddHover] = useState(false);
  const [isGachaSim, setIsGachaSim] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const {
    isOpen: isBannerAddModalOpen,
    openModal: openBannerAddModal,
    closeModal: closeBannerAddModal,
  } = useModal();
  const addBanner = isSimpleMode
    ? (payload: PickupDataPayload<'addSimpleBanner'>['payload']) => {
        dispatch({ addType: 'addSimpleBanner', payload });
      }
    : (payload: PickupDataPayload<'addSimpleBanner'>['payload']) => {
        dispatch({ addType: 'addSimpleBanner', payload });
      };
  console.log(pickupDatas);

  /*   const addBanner = (payload: Partial<Dummy>) => {
    setPickupDatas((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        gachaType: payload.gachaType ?? 'standard',
        operators: payload.operators?.length
          ? payload.operators
          : Array({ length: payload.pickupDetails?.pickupOpersCount ?? 2 }).map((_, index) => ({
              name: `오퍼레이터${index + 1}`,
              currentQty: 0,
              operType:
                (payload.gachaType === 'limited' || payload.gachaType === 'collab') && index === 0
                  ? 'limited'
                  : 'normal',
              targetCount: 1,
            })),
        pickupDetails: {
          pickupOpersCount:
            payload.pickupDetails?.pickupOpersCount ?? payload.operators?.length ?? 2,
          targetPickupCount:
            payload.pickupDetails?.pickupOpersCount ??
            payload.operators?.filter(
              ({ targetCount }) => !(targetCount === 0 || targetCount === null),
            ).length ??
            2,
          pickupChance: payload.gachaType === 'limited' || payload.gachaType === 'collab' ? 70 : 50,
        },
        maxGachaAttempts: 300,
        minGachaAttempts: 0,
        name: 'scheduleA',
      },
    ]);
  }; */
  /*   const deleteBanner = (targetId: string) => () => {
    setPickupDatas((p) => p.filter(({ id }) => id !== targetId));
  }; */
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
              onClick={openBannerAddModal}
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
                onAddClick={() => {}}
                isOtherElHover={isBannerAddHover}
                custom={{ boxShadow: '0px -7px 20px 5px #bd5b00, 0px 7px 22px 3px #ffde26' }}
              />
            </motion.div>
            {pickupDatas.map((data, index) => (
              <PickupBanner
                key={data.id}
                data={data}
                index={index}
                isSimpleMode={isSimpleMode}
                isGachaSim={isGachaSim}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
      <BannerAddModal
        isOpen={isBannerAddModalOpen}
        isSimpleMode={isSimpleMode}
        onSave={addBanner}
        onClose={closeBannerAddModal}
      />
    </div>
  );
}
