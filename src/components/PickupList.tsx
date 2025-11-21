'use client';

import SummaryBanner from '#/components/SummaryBanner';
import { AnimatePresence } from 'motion/react';
import { useEffect, useReducer, useRef, useState } from 'react';
import PlayButton from '#/components/buttons/PlayButton';
import OptionBar from '#/components/OptionBar';
import ResetButton from '#/components/buttons/ResetButton';
import PickupBanner from '#/components/PickupBanner';
import { useModal } from '#/hooks/useModal';
import {
  BatchGachaGoal,
  GachaType,
  OperatorRarity,
  OperatorRarityForString,
  OperatorType,
  ProgressRefProps,
} from '#/types/types';
import BannerAddModal from '#/components/modals/BannerAddModal';
import AddBannerCard from '#/components/AddBannerCard';
import { operatorLimitByBannerType, rarities } from '#/constants/variables';
import {
  canHaveLimited,
  deriveWorkerSeeds,
  filterLimitArray,
  getDeviceType,
  mergeGachaSimulationResults,
} from '#/libs/utils';
import LoadingSpinner from '#/components/LoadingSpinner';
import { useAlert } from '#/hooks/useAlert';
import ResetAlert from '#/components/modals/ResetAlert';
import ToTopButton from '#/components/buttons/ToTopButton';

export type Operator = {
  operatorId: string;
  name: string;
  currentQty: number;
  operatorType: OperatorType;
  targetCount: number;
  rarity: OperatorRarity;
  isPityReward: boolean;
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
  active: boolean;
}

interface ObtainedStatistics {
  totalObtained: number;
  pickupObtained: number;
  targetObtained: number;
}

export interface BannerResult {
  id: string;
  name: string;
  bannerType: GachaType;
  bannerSuccess: number;
  bannerTotalGachaRuns: number;
  bannerWinGachaRuns: number;
  bannerHistogram: number[];
  pityHistogram: number[];
  anyPityRewardObtained: number;
  winPityRewardObtained: number;
  actualEntryCount: number;
  bannerStartingCurrency: number;
  additionalResource: number;
  currencyShortageFailure: number;
  maxAttemptsFailure: number;
  successIndexUntilCutoff: number;
  cumulativeUntilCutoff: number;
  minIndex: number;
  maxIndex: number;
  sixth: ObtainedStatistics;
  fifth: ObtainedStatistics;
  fourth: ObtainedStatistics;
}

export interface GachaSimulationResult {
  total: {
    simulationTry: number;
    simulationSuccess: number;
    totalGachaRuns: number;
    anyPityRewardObtained: number;
    initialResource: number;
    isTrySim: boolean;
    isSimpleMode: boolean;
    bannerFailureAction: BannerFailureAction;
    statistics: Record<OperatorRarityForString, ObtainedStatistics>;
    seed: number;
  };
  perBanner: BannerResult[];
}

export interface GachaSimulationMergedResult {
  total: {
    simulationTry: number;
    simulationSuccess: number;
    totalGachaRuns: number;
    anyPityRewardObtained: number;
    initialResource: number;
    isTrySim: boolean;
    isSimpleMode: boolean;
    bannerFailureAction: BannerFailureAction;
    statistics: Record<OperatorRarityForString, ObtainedStatistics>;
    seeds: number[];
  };
  perBanner: BannerResult[];
}

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
  | 'updateGachaType'
  | 'toggleActive'
  | 'swapIndex'
  | 'reset'
  | 'initialize';

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
  | {
      type: 'delete';
      payload: {
        id: string;
        operatorId?: string;
        rarity?: OperatorRarity;
        target: 'banner' | 'operator';
      };
    }
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
        isSimpleMode: boolean;
      };
    }
  | {
      type: 'toggleActive';
      payload: {
        id: string;
        isLeft?: boolean;
      };
    }
  | {
      type: 'swapIndex';
      payload: {
        fromIndex: number;
        toIndex: number;
      };
    }
  | { type: 'initialize'; payload: { initialData: Dummy[] } };

export type ExtractPayloadFromAction<K extends ActionType> =
  Extract<PickupDatasAction, { type: K }> extends { payload: infer P } ? P : never;

const getOptimalWorkerCount = (): { isMobile: boolean; workerCount: number } => {
  const cores = navigator.hardwareConcurrency || 4;
  const deviceType = getDeviceType();

  const isIpadOS =
    /iPad/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  switch (deviceType) {
    case 'mobile': {
      if (cores <= 6) return { isMobile: true, workerCount: 2 }; // 저사양 모바일
      return { isMobile: true, workerCount: 3 }; // 고급기 (스냅 8Gen2 / A16)
    }
    case 'tablet': {
      if (isIpadOS) {
        return { isMobile: true, workerCount: Math.min(Math.ceil(cores * 0.5), 6) };
      }
      if (cores <= 6) return { isMobile: true, workerCount: 2 };
      return { isMobile: true, workerCount: 3 };
    }
    default: {
      if (cores <= 4) return { isMobile: false, workerCount: 2 };
      if (cores <= 8) return { isMobile: false, workerCount: Math.ceil(cores * 0.75) }; // 6개 정도
      if (cores <= 12) return { isMobile: false, workerCount: Math.ceil(cores * 0.6) }; // 7~8개
      return { isMobile: false, workerCount: Math.min(Math.ceil(cores * 0.5), 8) }; // 과도한 병렬 방지
    }
  }
};

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
    case 'initialize': {
      const { initialData } = action.payload;
      return initialData;
    }
    case 'addBanner': {
      if (pickupDatas.length > 20) {
        return pickupDatas;
      }
      const { gachaType, pickupOpersCount, targetOpersCount } = action.payload;
      const pickupChance = gachaType === 'limited' || gachaType === 'collab' ? 70 : 50;
      const isSinglePityBanner =
        gachaType === 'collab' || gachaType === 'limited' || gachaType === 'single';
      const isDoublePityBanner = gachaType === 'rotation';
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
              isPityReward:
                (isSinglePityBanner && index < 1) || (isDoublePityBanner && index < 2)
                  ? true
                  : false,
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
              isPityReward: false,
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
              isPityReward: false,
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
          maxGachaAttempts: 9999,
          minGachaAttempts: 0,
          firstSixthTry: false,
          name: `새 가챠 배너`,
          operators: operators,
          additionalResource: { simpleMode: 0, extendedMode: 0 },
          active: true,
        } satisfies Dummy,
      ];
    }
    case 'addBannerUsePreset': {
      if (pickupDatas.length >= 20) {
        return pickupDatas;
      }
      return [...pickupDatas, { ...action.payload, id: crypto.randomUUID() }];
    }
    case 'addOperator': {
      const { id } = action.payload;
      const currentBanner = pickupDatas.find((pickupData) => pickupData.id === id);
      if (!currentBanner) return pickupDatas;
      const operatorCount = currentBanner.operators.length;
      const {
        pickupDetails: { pickupOpersCount, targetOpersCount },
        gachaType,
      } = currentBanner;
      const { sixth, fifth, fourth } = pickupOpersCount;
      const canHaveLimitedOperator =
        currentBanner.gachaType === 'collab' ||
        (currentBanner.gachaType === 'limited' &&
          !currentBanner.operators.some(({ operatorType }) => operatorType === 'limited'));
      const currentOperatorsCount = getCurrentOperatorsCount(currentBanner.operators);
      const newRarity =
        currentOperatorsCount.sixth < sixth || sixth < operatorLimitByBannerType[gachaType]['sixth']
          ? 6
          : currentOperatorsCount.fifth < fifth ||
              fifth < operatorLimitByBannerType[gachaType]['fifth']
            ? 5
            : currentOperatorsCount.fourth < fourth ||
                fourth < operatorLimitByBannerType[gachaType]['fourth']
              ? 4
              : null;
      if (newRarity === null) return pickupDatas;
      const currentPityRewardOpersLength = filterLimitArray(
        currentBanner.operators,
        ({ isPityReward }) => isPityReward,
        2,
      ).length;
      const isSingleLimitPityEligible =
        (gachaType === 'collab' || gachaType === 'limited') &&
        currentPityRewardOpersLength < 1 &&
        canHaveLimitedOperator;
      const isSingleGachaEligible = gachaType === 'single' && currentPityRewardOpersLength < 1;
      const isRotationGachaEligible = gachaType === 'rotation' && currentPityRewardOpersLength < 2;
      const newOperator: Operator = {
        name: `오퍼레이터 ${operatorCount + 1}`,
        operatorId: crypto.randomUUID(),
        currentQty: 0,
        operatorType: canHaveLimitedOperator ? 'limited' : 'normal',
        rarity: newRarity,
        targetCount: 1,
        isPityReward:
          newRarity === 6 &&
          (isSingleLimitPityEligible || isSingleGachaEligible || isRotationGachaEligible)
            ? true
            : false,
      };
      return modifyBannerDetails(id, (originalPickupData) => ({
        pickupDetails: {
          ...originalPickupData.pickupDetails,
          targetOpersCount: {
            ...originalPickupData.pickupDetails.targetOpersCount,
            [rarities[newRarity]]:
              currentOperatorsCount[rarities[newRarity]] + 1 >=
              targetOpersCount[rarities[newRarity]]
                ? currentOperatorsCount[rarities[newRarity]] + 1
                : originalPickupData.pickupDetails.targetOpersCount[rarities[newRarity]],
          },
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
      const { id: bannerId, target, operatorId: payloadOperatorId, rarity } = action.payload;
      if (target === 'banner') {
        if (pickupDatas.length === 1) return pickupDatas;
        return pickupDatas.filter(({ id }) => id !== action.payload.id);
      } else if (target === 'operator') {
        const currentBanner = pickupDatas.find((pickupData) => pickupData.id === bannerId);
        if (currentBanner?.operators.length === 1) return pickupDatas;
        return pickupDatas.map((pickupData) => {
          if (rarity === undefined) return pickupData;
          const rarityString = rarities[rarity];
          const prevTargetOpersCount = pickupData.pickupDetails.targetOpersCount[rarityString];
          return pickupData.id === bannerId
            ? {
                ...pickupData,
                operators: pickupData.operators.filter(
                  ({ operatorId }) => operatorId !== payloadOperatorId,
                ),
                pickupDetails: {
                  ...pickupData.pickupDetails,
                  targetOpersCount: {
                    ...pickupData.pickupDetails.targetOpersCount,
                    [rarityString]: prevTargetOpersCount - 1 < 0 ? 0 : prevTargetOpersCount - 1,
                  },
                },
              }
            : pickupData;
        });
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
      return modifyBannerDetails(id, (pickupData) => ({
        ...pickupData,
        firstSixthTry: isTry,
        maxGachaAttempts: 0,
        minGachaAttempts: 0,
      }));
    }
    case 'updateAttempts': {
      const { id, attempts, target } = action.payload;
      if (isNaN(attempts)) return pickupDatas;
      return modifyBannerDetails(id, (pickupBanner) => {
        const { maxGachaAttempts, minGachaAttempts } = pickupBanner;
        if (target === 'max') {
          const newAttempts = attempts > 3000 ? 9999 : attempts;
          return {
            maxGachaAttempts: newAttempts,
            minGachaAttempts: newAttempts < minGachaAttempts ? attempts : minGachaAttempts,
            firstSixthTry: false,
          };
        } else if (target === 'min') {
          return {
            maxGachaAttempts: attempts > maxGachaAttempts ? attempts : maxGachaAttempts,
            minGachaAttempts: attempts,
            firstSixthTry: false,
          };
        } else if (target === 'both') {
          return { maxGachaAttempts: attempts, minGachaAttempts: attempts, firstSixthTry: false };
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
      const { id, operatorId, rarity, operatorType } = action.payload;
      return modifyBannerDetails(id, (pickupData) => {
        const { gachaType, pickupDetails } = pickupData;
        const prevOperator = pickupData.operators.find(
          (operator) => operator.operatorId === operatorId,
        );
        if (!prevOperator) return pickupData;
        const prevStringRarity = rarities[prevOperator.rarity];
        const currentOperatorType = operatorType || prevOperator.operatorType;
        const currentOperatorRarity = rarity || prevOperator.rarity;

        const newOperators = modifyOperatorDetails({
          operatorId,
          operators: pickupData.operators,
          transform: () => ({
            // 값이 undefined인 프로퍼티를 제외하고 새로운 객체 반환
            ...Object.fromEntries(
              Object.entries(action.payload).filter(([, value]) => value !== undefined),
            ),
          }),
        }).map<Operator>((newOperator) =>
          // 한정배너에서 지금 오퍼레이터 이외에 다른 6성 오퍼레이터가 있다면 그 오퍼레이터와 지금 오퍼레이터의 한정 상태 서로 교환
          gachaType === 'limited' &&
          newOperator.operatorId !== operatorId &&
          newOperator.rarity === 6
            ? operatorType === 'limited'
              ? { ...newOperator, isPityReward: false, operatorType: 'normal' }
              : { ...newOperator, isPityReward: true, operatorType: 'limited' }
            : newOperator,
        );
        const currentPityRewardOpersLength = filterLimitArray(
          newOperators,
          ({ isPityReward }) => isPityReward,
          2,
        ).length;
        const currentIndex = newOperators.findIndex(
          ({ operatorId: newOperatorId }) => newOperatorId === operatorId,
        );

        const isSinglePityRewardLengthVaild = !newOperators[currentIndex].isPityReward
          ? currentPityRewardOpersLength < 1
          : currentPityRewardOpersLength < 2;

        const isSingleLimitPityEligible =
          (gachaType === 'collab' || gachaType === 'limited') &&
          currentOperatorType === 'limited' &&
          isSinglePityRewardLengthVaild;
        const isSingleGachaEligible = gachaType === 'single' && isSinglePityRewardLengthVaild;
        const isRotationGachaEligible =
          gachaType === 'rotation' && !newOperators[currentIndex].isPityReward
            ? currentPityRewardOpersLength < 2
            : currentPityRewardOpersLength < 3;
        const isPityReward =
          currentOperatorRarity === 6 &&
          (isSingleLimitPityEligible || isSingleGachaEligible || isRotationGachaEligible);

        newOperators[currentIndex].isPityReward = isPityReward;

        return {
          pickupDetails:
            rarity === undefined
              ? pickupDetails
              : {
                  ...pickupDetails,
                  targetOpersCount: {
                    ...pickupDetails.targetOpersCount,
                    [prevStringRarity]: pickupDetails.targetOpersCount[prevStringRarity] - 1,
                    [rarities[rarity]]: pickupDetails.targetOpersCount[rarities[rarity]] + 1,
                  },
                  pickupOpersCount: {
                    ...pickupDetails.pickupOpersCount,
                    [prevStringRarity]: pickupDetails.pickupOpersCount[prevStringRarity] - 1,
                    [rarities[rarity]]: pickupDetails.pickupOpersCount[rarities[rarity]] + 1,
                  },
                },
          operators: newOperators,
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
      const { id, gachaType, isSimpleMode } = action.payload;
      const prevBanner = pickupDatas.find((pickupData) => pickupData.id === id);
      if (!prevBanner) return pickupDatas;
      if (isSimpleMode) {
        const { targetOpersCount: prevTargetOpersCount } = prevBanner.pickupDetails.simpleMode;
        const newPickupOpersCount = operatorLimitByBannerType[gachaType];
        const newTargetOpersCount = {
          sixth: Math.min(newPickupOpersCount['sixth'], prevTargetOpersCount.sixth),
          fifth: Math.min(newPickupOpersCount['fifth'], prevTargetOpersCount.fifth),
          fourth: Math.min(newPickupOpersCount['fourth'], prevTargetOpersCount.fourth),
        };
        return modifyBannerDetails(id, (pickupData) => {
          const operators = [
            ...pickupData.operators
              .filter(({ rarity }) => rarity === 6)
              .slice(0, newTargetOpersCount.sixth)
              .map((operator, index) =>
                !canHaveLimited(gachaType, 6)
                  ? ({
                      ...operator,
                      operatorType: 'normal',
                      isPityReward:
                        (gachaType === 'single' && index < 1) ||
                        (gachaType === 'rotation' && index < 2)
                          ? true
                          : false,
                    } satisfies Operator)
                  : {
                      ...operator,
                      operatorType: gachaType === 'collab' ? 'limited' : operator.operatorType,
                      isPityReward:
                        gachaType === 'collab'
                          ? true
                          : operator.operatorType === 'limited'
                            ? true
                            : false,
                    },
              ),
            ...pickupData.operators
              .filter(({ rarity }) => rarity === 5)
              .slice(0, newTargetOpersCount.fifth)
              .map((operator) =>
                !canHaveLimited(gachaType, 5)
                  ? ({ ...operator, operatorType: 'normal' } satisfies Operator)
                  : {
                      ...operator,
                      operatorType: gachaType === 'collab' ? 'limited' : operator.operatorType,
                    },
              ),
            ...pickupData.operators
              .filter(({ rarity }) => rarity === 4)
              .slice(0, newTargetOpersCount.fourth),
          ];
          return {
            gachaType,
            pickupDetails: {
              ...pickupData.pickupDetails,
              simpleMode: {
                pickupOpersCount: newPickupOpersCount,
                targetOpersCount: newTargetOpersCount,
              },
            },
            operators,
          };
        });
      } else {
        const { targetOpersCount: prevTargetOpersCount } = prevBanner.pickupDetails;
        const newPickupOpersCount = {
          sixth: Math.min(
            operatorLimitByBannerType[gachaType]['sixth'],
            prevTargetOpersCount.sixth,
          ),
          fifth: Math.min(
            operatorLimitByBannerType[gachaType]['fifth'],
            prevTargetOpersCount.fifth,
          ),
          fourth: Math.min(
            operatorLimitByBannerType[gachaType]['fourth'],
            prevTargetOpersCount.fourth,
          ),
        };
        const newTargetOpersCount = {
          sixth: Math.min(newPickupOpersCount['sixth'], prevTargetOpersCount.sixth),
          fifth: Math.min(newPickupOpersCount['fifth'], prevTargetOpersCount.fifth),
          fourth: Math.min(newPickupOpersCount['fourth'], prevTargetOpersCount.fourth),
        };
        return modifyBannerDetails(id, (pickupData) => {
          const operators = [
            ...pickupData.operators
              .filter(({ rarity }) => rarity === 6)
              .slice(0, newTargetOpersCount.sixth)
              .map((operator, index) =>
                !canHaveLimited(gachaType, 6)
                  ? ({
                      ...operator,
                      operatorType: 'normal',
                      isPityReward:
                        (gachaType === 'single' && index < 1) ||
                        (gachaType === 'rotation' && index < 2)
                          ? true
                          : false,
                    } satisfies Operator)
                  : {
                      ...operator,
                      operatorType: gachaType === 'collab' ? 'limited' : operator.operatorType,
                      isPityReward:
                        gachaType === 'collab'
                          ? true
                          : operator.operatorType === 'limited'
                            ? true
                            : false,
                    },
              ),
            ...pickupData.operators
              .filter(({ rarity }) => rarity === 5)
              .slice(0, newTargetOpersCount.fifth)
              .map((operator) =>
                !canHaveLimited(gachaType, 5)
                  ? ({ ...operator, operatorType: 'normal' } satisfies Operator)
                  : {
                      ...operator,
                      operatorType: gachaType === 'collab' ? 'limited' : operator.operatorType,
                    },
              ),
            ...pickupData.operators
              .filter(({ rarity }) => rarity === 4)
              .slice(0, newTargetOpersCount.fourth),
          ];
          return {
            gachaType,
            pickupDetails: {
              ...pickupData.pickupDetails,
              pickupOpersCount: newPickupOpersCount,
              targetOpersCount: newTargetOpersCount,
            },
            operators,
          };
        });
      }
    }
    case 'toggleActive': {
      const { id, isLeft } = action.payload;
      return modifyBannerDetails(id, (pickupData) => {
        return { active: isLeft === undefined ? !pickupData.active : isLeft };
      });
    }
    case 'swapIndex': {
      const { fromIndex, toIndex } = action.payload;
      const newPickupDatas = [...pickupDatas];
      [newPickupDatas[fromIndex], newPickupDatas[toIndex]] = [
        newPickupDatas[toIndex],
        newPickupDatas[fromIndex],
      ];
      return newPickupDatas;
    }
    default:
      throw new Error();
  }
};

export interface WorkerInput {
  type: string;
  workerIndex: number;
  payload: {
    seed: number;
    pickupDatas: Dummy[];
    options: {
      isTrySim: boolean;
      isSimpleMode: boolean;
      batchGachaGoal: BatchGachaGoal;
      initialResource: number;
    } & SimulationOptions;
  };
}

export interface WorkerOutput {
  type: string;
  result: GachaSimulationMergedResult;
}
export type BannerFailureAction = 'interruption' | 'continueExecution';

export type SimulationOptions = {
  probability: { limited: number; normal: number };
  simulationTry: number;
  bannerFailureAction: BannerFailureAction;
  showBannerImage: boolean;
};

export default function PickupList({ pickupDataPresets }: { pickupDataPresets: Dummy[] }) {
  const [pickupDatas, dispatch] = useReducer(reducer, pickupDataPresets);
  const [isTrySim, setIsGachaSim] = useState(true);
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [options, setOptions] = useState<SimulationOptions>({
    probability: { limited: 70, normal: 50 },
    simulationTry: 10000,
    bannerFailureAction: 'interruption',
    showBannerImage: true,
  });
  const [batchGachaGoal, setBatchGachaGoal] = useState<'allFirst' | 'allMax' | null>(null);
  const [initialResource, setInitialResource] = useState(0);
  const [results, setResults] = useState<GachaSimulationMergedResult | null>(null);
  const { isOpen: isModalOpen, openModal: openModal, closeModal: closeModal } = useModal();

  const workersRef = useRef<Worker[]>([]);
  const progressRef = useRef<ProgressRefProps>({
    progressTry: 0,
    total: 0,
    gachaRuns: 0,
    success: 0,
    results: [],
  });
  const isRunning = useRef(false);
  const [runningTime, setRunningTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAlertOpen, openAlert, alertMessage, confirm, cancel } = useAlert();
  const listRef = useRef<HTMLDivElement>(null);

  const addBanner = (payload: ExtractPayloadFromAction<'addBanner'>) => {
    dispatch({ type: 'addBanner', payload });
  };

  const addBannerUsePreset = (payload: Dummy) => {
    dispatch({ type: 'addBannerUsePreset', payload });
  };

  const resetSimulator = () => {
    setIsSimpleMode(true);
    setIsGachaSim(true);
    setResults(null);
    setRunningTime(null);
    setIsLoading(false);
    setBatchGachaGoal(null);
    setInitialResource(0);
    isRunning.current = false;
    dispatch({ type: 'initialize', payload: { initialData: pickupDataPresets } });
  };

  useEffect(() => {
    const stored = localStorage.getItem('pickupDatas');
    if (stored) {
      try {
        dispatch({ type: 'initialize', payload: { initialData: JSON.parse(stored) } });
      } catch {
        console.warn('로컬스토리지 데이터 파싱 실패, 기본 데이터 사용');
      }
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem('pickupDatas', JSON.stringify(pickupDatas));
    }, 200);
    return () => clearTimeout(id);
  }, [pickupDatas]);

  const stopSimulation = async () => {
    if (workersRef.current.length > 0) {
      for (const worker of workersRef.current) {
        worker.terminate();
      }

      const { results, progressTry } = progressRef.current;
      const mergedResult = mergeGachaSimulationResults(results, progressTry);
      setResults(mergedResult);
      setIsLoading(false);
    }
  };

  const runSimulation = async () => {
    if (isLoading) return;
    const { workerCount } = getOptimalWorkerCount();
    // const { isMobile } = getOptimalWorkerCount();
    // const workerCount = 1;
    if (workerCount <= 0) return;
    setIsLoading(true);
    isRunning.current = true;

    // 베이스 시드로부터 워커 수 만큼의 시드 생성
    const uintArray = new Uint32Array(1);
    crypto.getRandomValues(uintArray);
    const baseSeed = uintArray[0];
    const seeds = deriveWorkerSeeds(baseSeed, workerCount);

    // active 상태의 배너만 추출
    const activePickupDatas = pickupDatas.filter(({ active }) => active);

    // 워커, 프로미스 배열 초기화
    workersRef.current = [];
    const promises: Promise<GachaSimulationResult>[] = [];

    // 사전 설정 준비
    const { simulationTry, probability, showBannerImage, bannerFailureAction } = options;

    // 워커에 전달할 포스트메세지 생성 함수
    const getPostMessage = (index: number): WorkerInput => {
      const inputTry = simulationTry;
      const base = Math.floor(inputTry / workerCount);
      const remainder = inputTry % workerCount;
      return {
        type: 'start',
        workerIndex: index,
        payload: {
          seed: seeds[index],
          pickupDatas: activePickupDatas,
          options: {
            isTrySim,
            isSimpleMode,
            batchGachaGoal,
            initialResource,
            simulationTry: index === 0 ? base + remainder : base,
            probability,
            showBannerImage,
            bannerFailureAction,
          },
        },
      };
    };

    const progressPerWorker: {
      progressTry: number;
      total: number;
      gachaRuns: number;
      success: number;
      data: GachaSimulationResult | null;
    }[] = Array.from({ length: workerCount }, () => ({
      progressTry: 0,
      total: 0,
      gachaRuns: 0,
      success: 0,
      data: null,
    }));

    // 워커 생성 및 워커 배열에 전달, 시뮬레이션 실행 후 사전에 생성한 프로미스 배열에 전달
    for (let index = 0; index < workerCount; index++) {
      const worker = new Worker(new URL('#/workers/simulatorWorker', import.meta.url), {
        type: 'module',
      });
      workersRef.current.push(worker);

      const promise = new Promise<GachaSimulationResult>((resolve) => {
        worker.onmessage = (
          e: MessageEvent<{
            type: 'done' | 'progress';
            workerIndex: number;
            partialResult?: {
              progressTry: number;
              total: number;
              gachaRuns: number;
              success: number;
              data: GachaSimulationResult;
            };
            result: GachaSimulationResult;
          }>,
        ) => {
          const { type, workerIndex, partialResult, result } = e.data;

          if (type === 'progress' && partialResult !== undefined) {
            const { gachaRuns, progressTry, success, data } = partialResult;

            progressPerWorker[workerIndex].gachaRuns = gachaRuns;
            progressPerWorker[workerIndex].progressTry = progressTry;
            progressPerWorker[workerIndex].success = success;
            progressPerWorker[workerIndex].data = data;

            const totalProgress = progressPerWorker.reduce<{
              gachaRuns: number;
              progressTry: number;
              success: number;
              total: number;
              results: GachaSimulationResult[];
            }>(
              (a, b, index) => {
                a.gachaRuns += b.gachaRuns;
                a.progressTry += b.progressTry;
                a.success += b.success;
                if (b.data) {
                  a.results[index] = b.data;
                }
                return a;
              },
              {
                gachaRuns: 0,
                progressTry: 0,
                success: 0,
                total: simulationTry,
                results: [],
              },
            );
            progressRef.current = totalProgress;
            // setProgress(totalProgressTry);
          } else if (type === 'done') {
            resolve(result);
            worker.terminate(); // 작업 끝나면 종료
          }
        };
        worker.postMessage(getPostMessage(index));
      });
      promises.push(promise);
    }

    const results = await Promise.all(promises);

    const mergedResult = mergeGachaSimulationResults(results);

    console.log(mergedResult);
    console.log(baseSeed);
    setResults(mergedResult);
    setIsLoading(false);
  };

  return (
    <>
      <div ref={listRef} className="mt-12 flex w-full px-4 sm:w-auto sm:space-x-6 sm:px-0">
        <div className="flex flex-col items-center space-y-6 2xl:w-[984px]">
          <div className="mb-12 flex space-x-16">
            <ResetButton
              onResetClick={async () => {
                const result = await openAlert(
                  <span>
                    시스템 설정을 제외한 모든{' '}
                    <span className="text-amber-400">시뮬레이션 설정</span>과{' '}
                    <span className="text-amber-400">가챠일정 배너의 구성</span>이{' '}
                    <span className="text-red-400">초기화</span>됩니다.
                  </span>,
                );
                if (result) {
                  resetSimulator();
                }
              }}
            />
            <PlayButton
              onPlayClick={() => {
                runSimulation();
              }}
            />
          </div>
          <OptionBar
            isTrySim={isTrySim}
            setIsGachaSim={setIsGachaSim}
            isSimpleMode={isSimpleMode}
            setIsSimpleMode={setIsSimpleMode}
            batchGachaGoal={batchGachaGoal}
            initialResource={initialResource}
            setInitialResource={setInitialResource}
            options={options}
            setOptions={setOptions}
            runningTime={runningTime}
            setBatchGachaGoal={setBatchGachaGoal}
          />
          <div className="flex flex-col gap-y-6 sm:w-full">
            <AddBannerCard isAddPrevent={pickupDatas.length >= 20} openModal={openModal} />
            <AnimatePresence>
              {pickupDatas.map((pickupData, index) => (
                <PickupBanner
                  key={pickupData.id}
                  pickupData={pickupData}
                  dispatch={dispatch}
                  index={index}
                  isSimpleMode={isSimpleMode}
                  isTrySim={isTrySim}
                  bannerCount={pickupDatas.length}
                  isImageVisible={options.showBannerImage}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
        <SummaryBanner result={results} />
      </div>
      <BannerAddModal
        isOpen={isModalOpen}
        bannerCount={pickupDatas.length}
        onClose={closeModal}
        onSave={addBanner}
        onSavePreset={addBannerUsePreset}
        pickupDataPresets={pickupDataPresets}
      />
      <ResetAlert
        isOpen={isAlertOpen}
        onCancel={cancel}
        onConfirm={confirm}
        message={alertMessage}
      />
      <LoadingSpinner
        isLoading={isLoading}
        isRunning={isRunning}
        progressRef={progressRef}
        onStopClick={stopSimulation}
        setRunningTime={setRunningTime}
      />
      <div className="fixed right-4 bottom-4">
        <ToTopButton
          handleToTop={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    </>
  );
}
