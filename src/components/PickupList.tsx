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
import BannerAddModal from '#/components/modals/BannerAddModal';
import { useModal } from '#/hooks/useModal';
import { GachaType, OperatorRarity, OperatorType } from '#/types/types';

export type Operator = {
  operatorId: string;
  name: string;
  currentQty: number;
  operatorType: OperatorType;
  targetCount: number | null;
  rarity: OperatorRarity;
};

export interface Dummy {
  id: string;
  name: string;
  maxGachaAttempts: number;
  minGachaAttempts: number;
  gachaType: GachaType;
  operators: Operator[];
  pickupDetails: {
    pickupOpersCount: { sixth: number; fifth: number; fourth: number };
    targetOpersCount: { sixth: number; fifth: number; fourth: number };
    pickupChance: number;
    simpleMode: {
      pickupOpersCount: { sixth: number; fifth: number; fourth: number };
      targetOpersCount: { sixth: number; fifth: number; fourth: number };
    };
  };
  additionalResource: { simpleMode: number; extendedMode: number };
}

const dummies: Dummy[] = [
  {
    id: '970b5b98-edda-4af6-ae22-49a9227e1ad4',
    name: '우리 종족',
    gachaType: 'limited',
    operators: [
      {
        operatorId: '970b5b98-edda-4af6-ae22-49a9227e1ad4',
        name: '위셔델',
        currentQty: 0,
        operatorType: 'limited',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
        name: '로고스',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
    ],
    pickupDetails: {
      pickupOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
      targetOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
      pickupChance: 70,
      simpleMode: {
        pickupOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
        targetOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
      },
    },
    maxGachaAttempts: 200,
    minGachaAttempts: 0,
    additionalResource: { simpleMode: 0, extendedMode: 0 },
  },
  {
    id: 'a1b2c3d4-e5f6-4789-b0c1-d2e3f4a5b6c7',
    name: '모래위의 각인',
    gachaType: 'limited',
    operators: [
      {
        operatorId: 'a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p',
        name: '페페',
        currentQty: 0,
        operatorType: 'limited',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'b1c2d3e4-f5g6-7h8i-9j0k-1l2m3n4o5p6q',
        name: '나란투야',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
    ],
    pickupDetails: {
      pickupOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
      targetOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
      pickupChance: 70,
      simpleMode: {
        pickupOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
        targetOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
      },
    },
    maxGachaAttempts: Infinity,
    minGachaAttempts: 0,
    additionalResource: { simpleMode: 0, extendedMode: 0 },
  },
  {
    id: 'f8e7d6c5-b4a3-4210-9876-543210fedcba',
    name: '불타는 엘레지여',
    gachaType: 'standard',
    operators: [
      {
        operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r',
        name: '네크라스',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
    ],
    pickupDetails: {
      pickupOpersCount: { sixth: 1, fifth: 0, fourth: 0 },
      targetOpersCount: { sixth: 1, fifth: 0, fourth: 0 },
      pickupChance: 50,
      simpleMode: {
        pickupOpersCount: { sixth: 1, fifth: 0, fourth: 0 },
        targetOpersCount: { sixth: 1, fifth: 0, fourth: 0 },
      },
    },
    maxGachaAttempts: Infinity,
    minGachaAttempts: 0,
    additionalResource: { simpleMode: 0, extendedMode: 0 },
  },
];

export type ActionType =
  | 'addSimpleBanner'
  | 'addDetailedBanner'
  | 'addOperator'
  | 'delete'
  | 'updatePickupCount'
  | 'updateAttempts'
  | 'updateBannerName'
  | 'updateOperatorDetails'
  | 'updateSimplePickupCount'
  | 'updateAdditionalResource'
  | 'updateGachaType';

export type PickupDatasAction =
  | {
      type: 'addSimpleBanner';
      payload: {
        gachaType: GachaType;
        pickupOpersCount: { sixth: number; fifth: number; fourth: number };
        targetOpersCount: { sixth: number; fifth: number; fourth: number };
      };
    }
  | {
      type: 'addOperator';
      payload: {
        id: string;
      };
    }
  | { type: 'delete'; payload: { id: string; operatorId?: string; target: 'banner' | 'operator' } }
  | {
      type: 'updatePickupCount';
      payload: {
        id: string;
        count: number;
        rarityType: 'sixth' | 'fifth' | 'fourth';
      };
    }
  | {
      type: 'updateSimplePickupCount';
      payload: {
        id: string;
        count: number;
        countType: 'pickupOpersCount' | 'targetOpersCount';
        rarityType: 'sixth' | 'fifth' | 'fourth';
      };
    }
  | {
      type: 'updateAttempts';
      payload: {
        id: string;
        attempts: number;
        target: 'max' | 'min' | 'both';
      };
    }
  | {
      type: 'updateBannerName';
      payload: {
        id: string;
        name: string;
      };
    }
  | {
      type: 'updateOperatorDetails';
      payload: {
        id: string;
        operatorId: string;
        targetCount?: number;
        currentQty?: number;
        name?: string;
        operatorType?: OperatorType;
        rarity?: OperatorRarity;
      };
    }
  | {
      type: 'updateAdditionalResource';
      payload: {
        id: string;
        mode: 'simpleMode' | 'extendedMode';
        additionalResource: number;
      };
    }
  | {
      type: 'updateGachaType';
      payload: {
        id: string;
        gachaType: GachaType;
      };
    };

export type ExtractPayloadFromAction<K extends ActionType> =
  Extract<PickupDatasAction, { type: K }> extends { payload: infer P } ? P : never;

export const rarities = {
  6: 'sixth',
  5: 'fifth',
  4: 'fourth',
  sixth: 6,
  fifth: 5,
  fourth: 4,
} as const;

const reducer = (pickupDatas: Dummy[], action: PickupDatasAction): Dummy[] => {
  const modifyBannerDetails = (id: string, transform: (pickupData: Dummy) => Partial<Dummy>) =>
    pickupDatas.map((pickupData) =>
      pickupData.id === id ? { ...pickupData, ...transform(pickupData) } : pickupData,
    );
  const modifyOperatorDetails = ({
    operatorId,
    operators,
    transform,
  }: {
    operatorId: string;
    operators: Operator[];
    transform: (operator: Operator) => Partial<Operator>;
  }) =>
    operators.map((operator) =>
      operator.operatorId === operatorId ? { ...operator, ...transform(operator) } : operator,
    );
  const getCurrentOperatorsCount = (operators: Operator[]) =>
    operators.reduce(
      (acc, current) => ({
        ...acc,
        [rarities[current.rarity]]: acc[rarities[current.rarity]] + 1,
      }),
      { sixth: 0, fifth: 0, fourth: 0 },
    );
  switch (action.type) {
    case 'addSimpleBanner': {
      const { gachaType, pickupOpersCount, targetOpersCount } = action.payload;
      const pickupChance = gachaType === 'limited' || gachaType === 'collab' ? 70 : 50;
      const operators: Dummy['operators'] = [
        ...Array.from(
          { length: pickupOpersCount.sixth },
          (_, index) =>
            ({
              operatorId: crypto.randomUUID(),
              currentQty: 0,
              name: `오퍼레이터 ${index + 1}`,
              operatorType:
                (gachaType === 'limited' || gachaType === 'collab') && index === 0
                  ? 'limited'
                  : 'normal',
              targetCount: 1,
              rarity: 6,
            }) satisfies Operator,
        ),
        ...Array.from(
          { length: pickupOpersCount.fifth },
          (_, index) =>
            ({
              operatorId: crypto.randomUUID(),
              currentQty: 0,
              name: `오퍼레이터 ${index + 1}`,
              operatorType: 'normal',
              targetCount: 1,
              rarity: 5,
            }) satisfies Operator,
        ),
        ...Array.from(
          { length: pickupOpersCount.fourth },
          (_, index) =>
            ({
              operatorId: crypto.randomUUID(),
              currentQty: 0,
              name: `오퍼레이터 ${index + 1}`,
              operatorType: 'normal',
              targetCount: 1,
              rarity: 4,
            }) satisfies Operator,
        ),
      ];
      return [
        ...pickupDatas,
        {
          id: crypto.randomUUID(),
          gachaType: gachaType,
          pickupDetails: {
            pickupChance,
            pickupOpersCount,
            targetOpersCount,
            simpleMode: {
              pickupOpersCount,
              targetOpersCount,
            },
          },
          maxGachaAttempts: Infinity,
          minGachaAttempts: 0,
          name: `새 가챠 배너`,
          operators: operators,
          additionalResource: { simpleMode: 0, extendedMode: 0 },
        } satisfies Dummy,
      ];
    }
    case 'addOperator': {
      const { id } = action.payload;
      const currentBanner = pickupDatas.find((pickupData) => pickupData.id === id);
      if (!currentBanner) return pickupDatas;
      const operatorCount = currentBanner.operators.length;
      const {
        pickupDetails: { pickupOpersCount },
      } = currentBanner;
      const { sixth, fifth } = pickupOpersCount;
      const isFirstOperatorInLimitedBanner =
        (currentBanner.gachaType === 'limited' || currentBanner.gachaType === 'collab') &&
        operatorCount === 0;
      const currentOperatorsCount = getCurrentOperatorsCount(currentBanner.operators);
      const newRarity =
        currentOperatorsCount.sixth >= sixth ? (currentOperatorsCount.fifth >= fifth ? 4 : 5) : 6;
      const newOperator: Operator = {
        name: `오퍼레이터 ${operatorCount + 1}`,
        operatorId: crypto.randomUUID(),
        currentQty: 0,
        operatorType: isFirstOperatorInLimitedBanner ? 'limited' : 'normal',
        rarity: newRarity,
        targetCount: 1,
      };
      return modifyBannerDetails(id, (originalPickupData) => ({
        pickupDetails: {
          ...originalPickupData.pickupDetails,
          pickupOpersCount: {
            ...originalPickupData.pickupDetails.pickupOpersCount,
            [rarities[newRarity]]:
              currentOperatorsCount[rarities[newRarity]] + 1 >=
              pickupOpersCount[rarities[newRarity]]
                ? currentOperatorsCount[rarities[newRarity]] + 1
                : originalPickupData.pickupDetails.pickupOpersCount[rarities[newRarity]],
          },
        },
        operators: [...originalPickupData.operators, newOperator],
      }));
    }
    case 'delete': {
      const { id: bannerId, target, operatorId: payloadOperatorId } = action.payload;
      if (target === 'banner') {
        return pickupDatas.filter(({ id }) => id !== action.payload.id);
      } else if (target === 'operator') {
        return pickupDatas.map((pickupData) =>
          pickupData.id === bannerId
            ? {
                ...pickupData,
                operators: pickupData.operators.filter(
                  ({ operatorId }) => operatorId !== payloadOperatorId,
                ),
              }
            : pickupData,
        );
      } else {
        return pickupDatas;
      }
    }
    case 'updatePickupCount': {
      const { id, count, rarityType } = action.payload;
      const currentBanner = pickupDatas.find((pickupData) => pickupData.id === id);
      if (isNaN(count) || !currentBanner) return pickupDatas;
      return modifyBannerDetails(id, (pickupData) => {
        const { pickupDetails } = pickupData;
        const filteredOperator = currentBanner.operators.reduce<{
          accumulatedCount: number;
          accumulatedOperators: Operator[];
        }>(
          (acc, current) =>
            current.rarity === rarities[rarityType]
              ? {
                  accumulatedCount: acc.accumulatedCount + 1,
                  accumulatedOperators:
                    acc.accumulatedCount >= count
                      ? acc.accumulatedOperators
                      : [...acc.accumulatedOperators, current],
                }
              : {
                  accumulatedCount: acc.accumulatedCount,
                  accumulatedOperators: [...acc.accumulatedOperators, current],
                },
          { accumulatedCount: 0, accumulatedOperators: [] },
        );
        const newPickupDetails: Partial<Dummy> = {
          pickupDetails: {
            ...pickupDetails,
            pickupOpersCount: { ...pickupDetails.pickupOpersCount, [rarityType]: count },
          },
          operators: filteredOperator.accumulatedOperators,
        };
        return newPickupDetails;
      });
    }
    case 'updateSimplePickupCount': {
      const { id, count, countType, rarityType } = action.payload;
      const oppositeCountType: typeof countType =
        countType === 'pickupOpersCount' ? 'targetOpersCount' : 'pickupOpersCount';
      return modifyBannerDetails(id, (pickupData) => {
        const { pickupDetails } = pickupData;
        const { simpleMode } = pickupDetails;
        const currentTargetOpersCount = pickupDetails.simpleMode.targetOpersCount[rarityType];
        const currentPickupOpersCount = pickupDetails.simpleMode.pickupOpersCount[rarityType];
        const isTargetOpersCountExceeded = count > currentPickupOpersCount;
        const isPickupOpersCountDeficit = count < currentTargetOpersCount;
        const newOppoisteCount = {
          [rarityType]:
            countType === 'pickupOpersCount'
              ? isPickupOpersCountDeficit
                ? count
                : currentTargetOpersCount
              : isTargetOpersCountExceeded
                ? count
                : currentPickupOpersCount,
        };
        return {
          pickupDetails: {
            ...pickupDetails,
            simpleMode: {
              ...simpleMode,
              [countType]: { ...simpleMode[countType], [rarityType]: count },
              [oppositeCountType]: { ...simpleMode[oppositeCountType], ...newOppoisteCount },
            },
          },
        };
      });
    }
    case 'updateAttempts': {
      const { id, attempts, target } = action.payload;
      if (isNaN(attempts)) return pickupDatas;
      return modifyBannerDetails(id, (pickupBanner) => {
        const { maxGachaAttempts, minGachaAttempts } = pickupBanner;
        if (target === 'max') {
          return {
            maxGachaAttempts: attempts,
            minGachaAttempts: attempts < minGachaAttempts ? attempts : minGachaAttempts,
          };
        } else if (target === 'min') {
          return {
            maxGachaAttempts: attempts > maxGachaAttempts ? attempts : maxGachaAttempts,
            minGachaAttempts: attempts,
          };
        } else if (target === 'both') {
          return { maxGachaAttempts: attempts, minGachaAttempts: attempts };
        } else {
          return pickupBanner;
        }
      });
    }
    case 'updateBannerName': {
      const { id, name } = action.payload;
      return modifyBannerDetails(id, () => {
        return { name };
      });
    }
    case 'updateOperatorDetails': {
      const { id, operatorId, rarity } = action.payload;
      return modifyBannerDetails(id, (pickupData) => {
        const prevOperator = pickupData.operators.find(
          (operator) => operator.operatorId === operatorId,
        );
        if (!prevOperator) return pickupData;
        const prevStringRarity = rarities[prevOperator.rarity];
        return {
          pickupDetails:
            rarity === undefined
              ? pickupData.pickupDetails
              : {
                  ...pickupData.pickupDetails,
                  pickupOpersCount: {
                    ...pickupData.pickupDetails.pickupOpersCount,
                    [prevStringRarity]:
                      pickupData.pickupDetails.pickupOpersCount[prevStringRarity] - 1,
                    [rarities[rarity]]:
                      pickupData.pickupDetails.pickupOpersCount[rarities[rarity]] + 1,
                  },
                },
          operators: modifyOperatorDetails({
            operatorId,
            operators: pickupData.operators,
            transform: () =>
              Object.fromEntries(
                Object.entries(action.payload).filter(([, value]) => value !== undefined),
              ),
          }),
        };
      });
    }
    case 'updateAdditionalResource': {
      const { id, mode, additionalResource } = action.payload;
      return modifyBannerDetails(id, (pickupData) => {
        return {
          additionalResource: { ...pickupData.additionalResource, [mode]: additionalResource },
        };
      });
    }
    case 'updateGachaType': {
      const { id, gachaType } = action.payload;
      return modifyBannerDetails(id, () => {
        return { gachaType };
      });
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
    ? (payload: ExtractPayloadFromAction<'addSimpleBanner'>) => {
        dispatch({ type: 'addSimpleBanner', payload });
      }
    : (payload: ExtractPayloadFromAction<'addSimpleBanner'>) => {
        dispatch({ type: 'addSimpleBanner', payload });
      };

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
              operatorType:
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
            {pickupDatas.map((pickupData, index) => (
              <PickupBanner
                key={pickupData.id}
                pickupData={pickupData}
                dispatch={dispatch}
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
