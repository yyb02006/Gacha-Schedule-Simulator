'use client';

import ScheduleOverview from '#/components/InfomationBanner';
import { AnimatePresence } from 'motion/react';
import { useReducer, useState } from 'react';
import PlayButton from '#/components/buttons/PlayButton';
import OptionBar from '#/components/OptionBar';
import ResetButton from '#/components/buttons/ResetButton';
import PickupBanner from '#/components/PickupBanner';
import { useModal } from '#/hooks/useModal';
import { GachaType, OperatorRarity, OperatorType } from '#/types/types';
import BannerAddModal from '#/components/modals/BannerAddModal';
import pickupDatas from '#/data/pickupDatas.json';
import AddBannerCard from '#/components/AddBannerCard';

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
  image: string | null;
  maxGachaAttempts: number;
  minGachaAttempts: number;
  firstSixthTry: boolean;
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

/* const dummies: Dummy[] = [
  {
    id: '970b5b98-edda-4af6-ae22-49a9227e1ad4',
    name: '바벨 복각',
    image: '/images/ascaron.jpg',
    gachaType: 'single',
    operators: [
      {
        operatorId: '970b5b98-edda-4af6-ae22-49a9227e1ad4',
        name: '아스카론',
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
  {
    id: 'a1b2c3d4-e5f6-4789-b0c1-d2e3f4a5b6c7',
    name: '중생의 순례기',
    image: '/images/exusiai.jpg',
    gachaType: 'limited',
    operators: [
      {
        operatorId: 'a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p',
        name: '엑시아 더 뉴 커버넌트',
        currentQty: 0,
        operatorType: 'limited',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'b1c2d3e4-f5g6-7h8i-9j0k-1l2m3n4o5p6q',
        name: '르무엔',
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
    name: '크림슨 벨벳',
    image: '/images/tragodia.jpg',
    gachaType: 'single',
    operators: [
      {
        operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r',
        name: '트라고디아',
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
  {
    id: 'f8e7d6c5-b4a3-4210-9876-543ddddedcba',
    name: '지향 헤드헌팅',
    image: '/images/orient-1.jpg',
    gachaType: 'orient',
    operators: [
      {
        operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r',
        name: '데겐블레허',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2zzzzz5q6r',
        name: '리드 더 플레임 섀도우',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2sdfsddq6r',
        name: '님프',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
    ],
    pickupDetails: {
      pickupOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
      targetOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
      pickupChance: 100,
      simpleMode: {
        pickupOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
        targetOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
      },
    },
    maxGachaAttempts: Infinity,
    minGachaAttempts: 0,
    additionalResource: { simpleMode: 0, extendedMode: 0 },
  },
  {
    id: 'f8e7d6c5-b4a3-4zz0-9876-54zzzddedcba',
    name: '삶의 길 복각',
    image: '/images/ulpianus.jpg',
    gachaType: 'single',
    operators: [
      {
        operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r',
        name: '울피아누스',
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
  {
    id: 'f8e7d6c5-b4a1-4zz0-9876-54zzzddedcba',
    name: '경중집',
    image: '/images/leizi.jpg',
    gachaType: 'single',
    operators: [
      {
        operatorId: 'c1d233f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r',
        name: '레이즈 더 썬더브링어',
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
  {
    id: 'f8e7d6c5-b4a3-4zz0-9556-54zzzddedcba',
    name: '허',
    image: '/images/hoshiguma.jpg',
    gachaType: 'limited',
    operators: [
      {
        operatorId: 'c1d2e3f4-g556-7i8j-9k0l-1m2n3o4p5q6r',
        name: '호시구마 더 브리처',
        currentQty: 0,
        operatorType: 'limited',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'czf2e3f4-g556-7i8j-9k0l-1m2n3o4p5q6r',
        name: '하루카',
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
    id: 'f8e7d6c5-b4g3-4zz0-9876-54zzzddedcba',
    name: '4중 픽업',
    image: '/images/contract-1.jpg',
    gachaType: 'contract',
    operators: [
      {
        operatorId: 'c1gge3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r',
        name: '님프',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'c1ggebf4-g5h6-7i8j-9k0l-1m2n3o4p5q6r',
        name: '이네스',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'c1xge3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r',
        name: '엔텔레키아',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'c1cce3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r',
        name: '블레이즈 디 이그나이팅 스파크',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
    ],
    pickupDetails: {
      pickupOpersCount: { sixth: 4, fifth: 0, fourth: 0 },
      targetOpersCount: { sixth: 4, fifth: 0, fourth: 0 },
      pickupChance: 100,
      simpleMode: {
        pickupOpersCount: { sixth: 4, fifth: 0, fourth: 0 },
        targetOpersCount: { sixth: 4, fifth: 0, fourth: 0 },
      },
    },
    maxGachaAttempts: Infinity,
    minGachaAttempts: 0,
    additionalResource: { simpleMode: 0, extendedMode: 0 },
  },
  {
    id: 'f8e7d6c5-b4a3-4zz0-9876-54zzzxdedcba',
    name: '근심없는 잠꼬대',
    image: '/images/avemujica.jpg',
    gachaType: 'collab',
    operators: [
      {
        operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2n3oxx5q6r',
        name: '토가와 사키코',
        currentQty: 0,
        operatorType: 'limited',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'c1d2e3f4-xxxx-7i8j-9k0l-1m2n3oxx5q6r',
        name: '미스미 우이카',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 5,
      },
      {
        operatorId: 'c1dxxxf4-g5h6-7i8j-9k0l-1m2n3oxx5q6r',
        name: '와카바 무츠미',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 5,
      },
    ],
    pickupDetails: {
      pickupOpersCount: { sixth: 1, fifth: 2, fourth: 0 },
      targetOpersCount: { sixth: 1, fifth: 2, fourth: 0 },
      pickupChance: 50,
      simpleMode: {
        pickupOpersCount: { sixth: 1, fifth: 2, fourth: 0 },
        targetOpersCount: { sixth: 1, fifth: 2, fourth: 0 },
      },
    },
    maxGachaAttempts: Infinity,
    minGachaAttempts: 0,
    additionalResource: { simpleMode: 0, extendedMode: 0 },
  },
  {
    id: 'f8e7d6c5-b4a3-4zz0-9876-xxzzzxdedcba',
    name: '위대한 서곡의 끝',
    image: '/images/siege.jpg',
    gachaType: 'single',
    operators: [
      {
        operatorId: 'c1d2ecd4-g5h6-7i8j-9k0l-1m2n3oxx5q6r',
        name: '비나 빅토리아',
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
  {
    id: 'xxe7d6c5-b4a3-4zz0-9876-54zzzddddcba',
    name: '지향 헤드헌팅',
    image: '/images/orient-2.jpg',
    gachaType: 'orient',
    operators: [
      {
        operatorId: 'c1d2ecv4-g5h6-7i8j-9k0l-1m2n3oxvvq6r',
        name: 'Mon3tr',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'c1d2e3f4-vvvx-vv8j-9k0l-1m2n3oxx5q6r',
        name: '로고스',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
      {
        operatorId: 'c1dxxxf4-g5h6-7dej-vvvl-1m2n3oxx5q6r',
        name: '아스카론',
        currentQty: 0,
        operatorType: 'normal',
        targetCount: 1,
        rarity: 6,
      },
    ],
    pickupDetails: {
      pickupOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
      targetOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
      pickupChance: 100,
      simpleMode: {
        pickupOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
        targetOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
      },
    },
    maxGachaAttempts: Infinity,
    minGachaAttempts: 0,
    additionalResource: { simpleMode: 0, extendedMode: 0 },
  },
]; */

export type ActionType =
  | 'addBanner'
  | 'addBannerUsePreset'
  | 'addOperator'
  | 'delete'
  | 'updateFirstSixTry'
  | 'updatePickupCount'
  | 'updateAttempts'
  | 'updateBannerName'
  | 'updateOperatorDetails'
  | 'updateSimplePickupCount'
  | 'updateAdditionalResource'
  | 'updateGachaType';

export type PickupDatasAction =
  | {
      type: 'addBanner';
      payload: {
        gachaType: GachaType;
        pickupOpersCount: { sixth: number; fifth: number; fourth: number };
        targetOpersCount: { sixth: number; fifth: number; fourth: number };
      };
    }
  | {
      type: 'addBannerUsePreset';
      payload: Dummy;
    }
  | {
      type: 'addOperator';
      payload: {
        id: string;
      };
    }
  | { type: 'delete'; payload: { id: string; operatorId?: string; target: 'banner' | 'operator' } }
  | { type: 'updateFirstSixTry'; payload: { id: string; isTry: boolean } }
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
    case 'addBanner': {
      const { gachaType, pickupOpersCount, targetOpersCount } = action.payload;
      const pickupChance = gachaType === 'limited' || gachaType === 'collab' ? 70 : 50;
      const operators: Dummy['operators'] = [
        ...Array.from(
          { length: targetOpersCount.sixth },
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
          image: null,
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
          firstSixthTry: false,
          name: `새 가챠 배너`,
          operators: operators,
          additionalResource: { simpleMode: 0, extendedMode: 0 },
        } satisfies Dummy,
      ];
    }
    case 'addBannerUsePreset': {
      return [...pickupDatas, { ...action.payload, id: crypto.randomUUID() }];
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
        const newOppositeCount = {
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
              [oppositeCountType]: { ...simpleMode[oppositeCountType], ...newOppositeCount },
            },
          },
        };
      });
    }
    case 'updateFirstSixTry': {
      const { id, isTry } = action.payload;
      return modifyBannerDetails(id, (pickupData) => ({ ...pickupData, firstSixthTry: isTry }));
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

const prepickupDatas: Dummy[] = pickupDatas.datas.map((data) => ({
  ...data,
  operators: data.operators as Operator[],
  gachaType: data.gachaType as GachaType,
  maxGachaAttempts:
    data.maxGachaAttempts === 'Infinity' ? Infinity : parseInt(data.maxGachaAttempts),
}));

export default function PickupList() {
  const [pickupDatas, dispatch] = useReducer(reducer, prepickupDatas);
  const [isGachaSim, setIsGachaSim] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const { isOpen: isModalOpen, openModal: openModal, closeModal: closeModal } = useModal();

  const addBanner = (payload: ExtractPayloadFromAction<'addBanner'>) => {
    dispatch({ type: 'addBanner', payload });
  };

  const addBannerUsePreset = (payload: Dummy) => {
    dispatch({ type: 'addBannerUsePreset', payload });
  };

  /*   const addBanner = (payload: Partial<Dummy>) => {
    setPickupDatas((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        gachaType: payload.gachaType ?? 'single',
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
          <AddBannerCard openModal={openModal} />
          <AnimatePresence>
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
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={addBanner}
        onSavePreset={addBannerUsePreset}
      />
    </div>
  );
}
