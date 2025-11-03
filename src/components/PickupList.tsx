'use client';

import ScheduleOverview from '#/components/InfomationBanner';
import { AnimatePresence } from 'motion/react';
import { useReducer, useRef, useState } from 'react';
import PlayButton from '#/components/buttons/PlayButton';
import OptionBar from '#/components/OptionBar';
import ResetButton from '#/components/buttons/ResetButton';
import PickupBanner from '#/components/PickupBanner';
import { useModal } from '#/hooks/useModal';
import { GachaType, OperatorRarity, OperatorRarityForString, OperatorType } from '#/types/types';
import BannerAddModal from '#/components/modals/BannerAddModal';
import pickupDatas from '#/data/pickupDatas.json';
import AddBannerCard from '#/components/AddBannerCard';
import { obtainedTypes, rarities, rarityStrings } from '#/constants/variables';

export type Operator = {
  operatorId: string;
  name: string;
  currentQty: number;
  operatorType: OperatorType;
  targetCount: number;
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
  bannerSuccess: number;
  bannerGachaRuns: number;
  pityRewardObtained: number;
  bannerHistograms: number[];
  sixth: ObtainedStatistics;
  fifth: ObtainedStatistics;
  fourth: ObtainedStatistics;
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
  | 'swapIndex';

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
    };

export type ExtractPayloadFromAction<K extends ActionType> =
  Extract<PickupDatasAction, { type: K }> extends { payload: infer P } ? P : never;

const getOptimalWorkerCount = (): { isMobile: boolean; workerCount: number } => {
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    if (cores <= 8) return { isMobile: true, workerCount: 2 }; // 중, 저급기
    return { isMobile: true, workerCount: 3 }; // 고급기
  }

  // PC 환경
  if (cores <= 4) return { isMobile: false, workerCount: 2 };
  if (cores <= 8) return { isMobile: false, workerCount: Math.ceil(cores * 0.75) }; // 6개 정도
  if (cores <= 12) return { isMobile: false, workerCount: Math.ceil(cores * 0.6) }; // 7~8개
  return { isMobile: false, workerCount: Math.min(Math.ceil(cores * 0.5), 8) }; // 과도한 병렬 방지
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
    case 'addBanner': {
      if (pickupDatas.length >= 20) {
        return pickupDatas;
      }
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
        return pickupDatas.filter(({ id }) => id !== action.payload.id);
      } else if (target === 'operator') {
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
          return {
            maxGachaAttempts: attempts,
            minGachaAttempts: attempts < minGachaAttempts ? attempts : minGachaAttempts,
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
                  targetOpersCount: {
                    ...pickupData.pickupDetails.targetOpersCount,
                    [prevStringRarity]:
                      pickupData.pickupDetails.targetOpersCount[prevStringRarity] - 1,
                    [rarities[rarity]]:
                      pickupData.pickupDetails.targetOpersCount[rarities[rarity]] + 1,
                  },
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

const prepickupDatas: Dummy[] = pickupDatas.datas.map((data) => ({
  ...data,
  operators: data.operators as Operator[],
  gachaType: data.gachaType as GachaType,
  maxGachaAttempts:
    data.maxGachaAttempts === 'Infinity' ? Infinity : parseInt(data.maxGachaAttempts),
}));

export interface GachaSimulationMergedResult {
  total: {
    simulationTry: number;
    simulationSuccess: number;
    totalGachaRuns: number;
    pityRewardObtained: number;
    statistics: Record<OperatorRarityForString, ObtainedStatistics>;
  };
  perBanner: {
    id: string;
    name: string;
    bannerSuccess: number;
    bannerGachaRuns: number;
    pityRewardObtained: number;
    bannerHistograms: number[];
    sixth: ObtainedStatistics;
    fifth: ObtainedStatistics;
    fourth: ObtainedStatistics;
  }[];
}

export interface WorkerInput {
  type: string;
  payload: {
    pickupDatas: Dummy[];
    options: { isGachaSim: boolean; isSimpleMode: boolean } & SimulationOptions & InitialInputs;
  };
}

export interface WorkerOutput {
  type: string;
  result: GachaSimulationMergedResult;
}

export type InitialInputs = {
  gachaGoal: 'allFirst' | 'allMax' | null;
  initialResource: number;
};

export type SimulationOptions = {
  probability: { limited: number; normal: number };
  simulationTry: number;
  winCondition: 'allSuccess' | 'scheduleComplete';
  showBannerImage: boolean;
};

export default function PickupList() {
  const [pickupDatas, dispatch] = useReducer(reducer, prepickupDatas);
  const [isGachaSim, setIsGachaSim] = useState(true);
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [options, setOptions] = useState<SimulationOptions>({
    probability: { limited: 70, normal: 50 },
    simulationTry: 10000,
    winCondition: 'scheduleComplete',
    showBannerImage: true,
  });
  const initialInputs = useRef<InitialInputs>({
    gachaGoal: null,
    initialResource: 0,
  });
  const { isOpen: isModalOpen, openModal: openModal, closeModal: closeModal } = useModal();

  const addBanner = (payload: ExtractPayloadFromAction<'addBanner'>) => {
    dispatch({ type: 'addBanner', payload });
  };

  const addBannerUsePreset = (payload: Dummy) => {
    dispatch({ type: 'addBannerUsePreset', payload });
  };

  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GachaSimulationMergedResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = async () => {
    if (isRunning) return;
    const { isMobile, workerCount } = getOptimalWorkerCount();
    if (workerCount <= 0) return;
    setIsRunning(true);
    const workers: Worker[] = [];
    const promises: Promise<GachaSimulationMergedResult>[] = [];
    const { simulationTry, probability, showBannerImage, winCondition } = options;
    const {
      current: { gachaGoal, initialResource },
    } = initialInputs;
    const expectedTryBySingleCycle = pickupDatas.length * 150;
    const mobileSimulationTry = Math.floor(10000000 / expectedTryBySingleCycle);
    const getPostMessage = (index: number): WorkerInput => {
      const inputTry = isMobile ? mobileSimulationTry : simulationTry;
      const base = Math.floor(inputTry / workerCount);
      const remainder = inputTry % workerCount;
      return {
        type: 'start',
        payload: {
          pickupDatas,
          options: {
            isGachaSim,
            isSimpleMode,
            gachaGoal,
            initialResource,
            simulationTry: index === 0 ? base + remainder : base,
            probability,
            showBannerImage,
            winCondition,
          },
        },
      };
    };

    for (let index = 0; index < workerCount; index++) {
      const worker = new Worker(new URL('#/workers/simulatorWorker', import.meta.url), {
        type: 'module',
      });
      workers.push(worker);

      const promise = new Promise<GachaSimulationMergedResult>((resolve) => {
        worker.onmessage = (
          e: MessageEvent<{ type: string; result: GachaSimulationMergedResult }>,
        ) => {
          resolve(e.data.result);
          worker.terminate(); // 작업 끝나면 종료
        };
        worker.postMessage(getPostMessage(index));
      });
      promises.push(promise);
    }

    const results = await Promise.all(promises);

    // 인덱스 넣고 더하는 과정에서 acc에 존재하지 않는 배열 길이가 나오면 undefined + number이므로 NaN이 되어버림
    const mergedResult = results.reduce<GachaSimulationMergedResult>(
      (acc, current) => {
        current.perBanner.forEach((currentBanner, index) => {
          const { bannerSuccess, bannerGachaRuns, pityRewardObtained } = currentBanner;
          current.total.totalGachaRuns += bannerGachaRuns;
          if (acc.perBanner[index]) {
            acc.perBanner[index].bannerSuccess += bannerSuccess;
            acc.perBanner[index].bannerGachaRuns += bannerGachaRuns;
            acc.perBanner[index].pityRewardObtained += pityRewardObtained;
            for (let i = 0; i < currentBanner.bannerHistograms.length; i++) {
              const a = acc.perBanner[index].bannerHistograms[i] ?? 0;
              const b = currentBanner.bannerHistograms[i] ?? 0;

              acc.perBanner[index].bannerHistograms[i] = a + b;
            }
            for (const rarityString of rarityStrings) {
              for (const obtainedType of obtainedTypes) {
                acc.perBanner[index][rarityString][obtainedType] +=
                  currentBanner[rarityString][obtainedType];
                acc.total.statistics[rarityString][obtainedType] +=
                  currentBanner[rarityString][obtainedType];
              }
            }
          } else {
            acc.perBanner.push(currentBanner);
            for (const rarityString of rarityStrings) {
              for (const obtainedType of obtainedTypes) {
                acc.total.statistics[rarityString][obtainedType] +=
                  currentBanner[rarityString][obtainedType];
              }
            }
          }
        });

        acc.total.simulationTry += current.total.simulationTry;
        acc.total.simulationSuccess += current.total.simulationSuccess;
        acc.total.totalGachaRuns += current.total.totalGachaRuns;
        acc.total.pityRewardObtained += current.total.pityRewardObtained;

        return acc;
      },
      {
        total: {
          simulationTry: 0,
          simulationSuccess: 0,
          totalGachaRuns: 0,
          pityRewardObtained: 0,
          statistics: {
            sixth: { pickupObtained: 0, targetObtained: 0, totalObtained: 0 },
            fifth: { pickupObtained: 0, targetObtained: 0, totalObtained: 0 },
            fourth: { pickupObtained: 0, targetObtained: 0, totalObtained: 0 },
          },
        },
        perBanner: [],
      },
    );
    console.log(mergedResult);
    setResults(mergedResult);
    setIsRunning(false);
  };

  return (
    <div className="mt-12 flex space-x-6">
      <div className="flex w-[984px] flex-col items-center space-y-6">
        <div className="mb-12 flex space-x-16">
          <ResetButton onResetClick={() => {}} />
          <PlayButton
            onPlayClick={() => {
              runSimulation();
            }}
          />
        </div>
        <OptionBar
          isGachaSim={isGachaSim}
          setIsGachaSim={setIsGachaSim}
          isSimpleMode={isSimpleMode}
          setIsSimpleMode={setIsSimpleMode}
          initialInputs={initialInputs.current}
          options={options}
          setOptions={setOptions}
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
                bannersLength={pickupDatas.length}
                isImageVisible={options.showBannerImage}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
      <BannerAddModal
        isOpen={isModalOpen}
        bannerCount={pickupDatas.length}
        onClose={closeModal}
        onSave={addBanner}
        onSavePreset={addBannerUsePreset}
      />
      <ScheduleOverview result={results} isGachaSim={isGachaSim} />
    </div>
  );
}
