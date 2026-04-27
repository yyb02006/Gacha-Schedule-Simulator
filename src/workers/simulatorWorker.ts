/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Dummy, WorkerInput } from '#/components/PickupList';
import { rarityStrings } from '#/constants/variables';
import { createRNG, safeNumberOrZero } from '#/libs/utils';
import {
  BannerFailureAction,
  BatchGachaGoal,
  GachaType,
  OperatorRarity,
  OperatorRarityForString,
  OperatorType,
} from '#/types/types';

export default {} as typeof Worker & { new (): Worker };

const logging = false;

const pities = {
  collab: 119,
  limited: 299,
  single: 149,
  rotation: [149, 299],
  contract: null,
  orient: null,
} as const;

const rarities = {
  6: 'sixth',
  5: 'fifth',
  4: 'fourth',
  sixth: 6,
  fifth: 5,
  fourth: 4,
} as const;

interface SimulationResult {
  total: {
    simulationTry: number;
    simulationSuccess: number;
    totalGachaRuns: number;
    anyPityRewardObtained: number;
    initialResource: number;
    isTrySim: boolean;
    isSimpleMode: boolean;
    bannerFailureAction: BannerFailureAction;
    seed: number;
  };
  perBanner: {
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
    sixth: { totalObtained: number; pickupObtained: number; targetObtained: number };
    fifth: { totalObtained: number; pickupObtained: number; targetObtained: number };
    fourth: { totalObtained: number; pickupObtained: number; targetObtained: number };
  }[];
}

interface OperatorResult {
  index: number;
  id: string;
  name: string;
  rarity: OperatorRarity;
  currentCount: number;
  gachaGoalCount: number;
  success: boolean;
  isFirstObtained: boolean;
  operatorType: OperatorType;
  isPityReward: boolean;
  isFake: boolean;
}

interface Statistics {
  totalObtained: number;
  pickupObtained: number;
  targetObtained: number;
  isAnyPityRewardObtained: boolean;
}

interface BannerResult {
  id: string;
  name: string;
  success: boolean;
  operators: Record<OperatorRarityForString, OperatorResult[]>;
  statistics: Record<OperatorRarityForString, Statistics>;
  bannerGachaRuns: number;
  failure: 'currency' | 'limit' | null;
}

interface SuccessCount {
  sixth: number;
  fifth: number;
  fourth: number;
}

interface SimulationMetrics {
  rotationPityRewardObtainedCount: number;
  limitedSixthStack: number;
  fifthStack: number;
  adjustedSixthRate: number;
  adjustedFifthRate: number;
}

interface RollResult {
  obtainedOperator: OperatorResult | null;
  isSuccessOnThisTry: boolean;
  isPickupObtained: boolean;
  isTargetObtained: boolean;
  isAnyPityRewardObtained: boolean;
}

const createFakeOperator = ({
  index,
  id,
  operatorType,
  rarity,
}: {
  index: number;
  id: string;
  rarity: 6 | 5;
  operatorType: 'limited' | 'normal';
}) => ({
  index,
  id,
  name: id,
  currentCount: 0,
  gachaGoalCount: 1,
  isFirstObtained: false,
  operatorType,
  rarity,
  isPityReward: rarity === 6 ? true : false,
  success: false,
  isFake: true,
});

const makeStatistics = (): Statistics => ({
  totalObtained: 0,
  pickupObtained: 0,
  targetObtained: 0,
  isAnyPityRewardObtained: false,
});

const makeSimpleTargetOperators = ({
  rarity,
  length,
  pickupOperatorCount,
  gachaGoalCount,
  gachaType,
  operatorTypeCallback,
}: {
  rarity: OperatorRarity;
  length: number;
  pickupOperatorCount: number;
  gachaGoalCount?: number;
  gachaType: GachaType;
  operatorTypeCallback?: (index: number) => 'limited' | 'normal';
}): OperatorResult[] => {
  const arr: OperatorResult[] = new Array(length);
  const isSinglePity =
    rarity === 6 && (gachaType === 'collab' || gachaType === 'limited' || gachaType === 'single');
  const isDoublePity =
    (rarity === 6 && gachaType === 'rotation') || (rarity === 5 && gachaType === 'collab');
  const newLength = isDoublePity ? pickupOperatorCount : length;
  for (let i = 0; i < newLength; i++) {
    arr[i] = {
      index: i,
      name: '',
      id: '',
      rarity,
      currentCount: 0,
      gachaGoalCount: gachaGoalCount ?? 1,
      success: false,
      isFirstObtained: false,
      isPityReward: (isSinglePity && i < 1) || (isDoublePity && i < 2) ? true : false,
      operatorType: operatorTypeCallback ? operatorTypeCallback(i) : 'normal',
      isFake: isDoublePity && i >= length,
    };
  }
  return arr;
};

// 비순수함수
const handlePickupRollWin = (obtainedOperator: OperatorResult, rollResult: RollResult) => {
  obtainedOperator.currentCount++;
  obtainedOperator.isFirstObtained = true;
  logging &&
    console.log(
      '현재 잠재 :',
      obtainedOperator.currentCount,
      '목표 잠재 :',
      obtainedOperator.gachaGoalCount,
    );
  if (obtainedOperator.currentCount >= obtainedOperator.gachaGoalCount)
    obtainedOperator.success = true;
  if (obtainedOperator.currentCount === obtainedOperator.gachaGoalCount && !obtainedOperator.isFake)
    rollResult.isSuccessOnThisTry = true;
  rollResult.obtainedOperator = obtainedOperator;
  if (!obtainedOperator.isFake) rollResult.isTargetObtained = true;
  rollResult.isPickupObtained = true;
};

const executePickupRoll = ({
  rng,
  targetOperators,
  pickupChance,
  pickupChanceByEach,
  pityRewardOperators,
  isPityReached,
}: {
  rng: () => number;
  targetOperators: OperatorResult[];
  pickupChance: number;
  pickupChanceByEach: number;
  pityRewardOperators?: OperatorResult[];
  isPityReached?: boolean;
}) => {
  const rollResult: RollResult = {
    obtainedOperator: null,
    isSuccessOnThisTry: false,
    isPickupObtained: false,
    isTargetObtained: false,
    isAnyPityRewardObtained: false,
  };
  if (isPityReached && pityRewardOperators) {
    // 천장일 시
    logging && console.log('🌈 천장');
    // 이미 획득한 천장보상 제외하고 획득
    rollResult.isAnyPityRewardObtained = true;
    rollResult.isPickupObtained = true;
    if (pityRewardOperators.length > 0) {
      const pickupChanceByEachReward = safeNumberOrZero(100 / pityRewardOperators.length);
      const pityRoll = rng() * 100;
      for (const [ci, pityRewardOperator] of pityRewardOperators.entries()) {
        if (
          pityRoll < pickupChanceByEachReward * (ci + 1) &&
          pityRoll >= pickupChanceByEachReward * ci
        ) {
          // 천장시 확률을 픽업 캐릭터 수만큼 나눈 뒤
          // 각 캐릭터가 자신의 구간에서 당첨됐을 시
          logging &&
            console.log('천장 목표 픽업 당첨', '/ 번호 :', ci, '/ 이름 :', pityRewardOperator.name);
          handlePickupRollWin(pityRewardOperator, rollResult);
          break;
        }
      }
    }
  } else {
    // 천장이 아닐 시
    const nonePityRoll = rng() * 100;
    if (nonePityRoll < pickupChance) {
      // 픽업 당첨
      logging &&
        console.log('🔥🔥 픽업 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', nonePityRoll);
      rollResult.isPickupObtained = true;
      for (const [ci, targetOperator] of targetOperators.entries()) {
        if (
          nonePityRoll < pickupChanceByEach * (ci + 1) &&
          nonePityRoll >= pickupChanceByEach * ci
        ) {
          // 목표 당첨
          logging && console.log('목표 픽업 당첨', '/ 번호 :', ci, '/ 이름 :', targetOperator.name);
          handlePickupRollWin(targetOperator, rollResult);
          break;
        }
      }
      if (nonePityRoll > pickupChanceByEach * targetOperators.length) {
        logging && console.log('비목표 픽업 당첨');
      }
    } else {
      // 픽뚫 당첨
      logging && console.log('💫 픽뚫 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', nonePityRoll);
    }
  }
  // logging && console.log(rollResult.sixth, rollResult);
  return rollResult;
};

const updateResult = ({
  result,
  rollResult,
  successCount,
  stringRarity,
  pityContext,
}: {
  result: BannerResult;
  rollResult: RollResult;
  successCount: SuccessCount;
  stringRarity: OperatorRarityForString;
  pityContext?: { isPityReached: boolean; simulationMetrics: SimulationMetrics };
}) => {
  const currentOperators = result.operators[stringRarity];
  const currentStatistics = result.statistics[stringRarity];
  if (rollResult.obtainedOperator) {
    const { index, isFake } = rollResult.obtainedOperator;
    currentOperators[index] = rollResult.obtainedOperator;
    if (rollResult.isSuccessOnThisTry && !isFake) successCount[stringRarity]++;
  }
  if (pityContext && pityContext.isPityReached)
    pityContext.simulationMetrics.rotationPityRewardObtainedCount++;
  if (rollResult.isAnyPityRewardObtained) currentStatistics.isAnyPityRewardObtained = true;
  if (rollResult.isPickupObtained) currentStatistics.pickupObtained++;
  if (rollResult.isTargetObtained) currentStatistics.targetObtained++;
};

const gachaRateSimulate = ({
  workerIndex,
  seed,
  pickupDatas,
  batchGachaGoal,
  isTrySim,
  isSimpleMode,
  simulationTry,
  initialResource,
  probability,
  bannerFailureAction,
}: {
  workerIndex: number;
  seed: number;
  pickupDatas: Dummy[];
  batchGachaGoal: BatchGachaGoal;
  isSimpleMode: boolean;
  isTrySim: boolean;
  simulationTry: number;
  initialResource: number;
  probability: { limited: number; normal: number };
  bannerFailureAction: BannerFailureAction;
}) => {
  const rng = createRNG(seed);
  const batchSize = Math.min(5000, (Math.floor(simulationTry / 100000) + 1) * 1000);
  const sixthRate = 2;
  const fifthRate = 8;
  const fourthRate = 50;
  const globalGachaGoalCount =
    batchGachaGoal === 'allMax' ? 6 : batchGachaGoal === 'allFirst' ? 1 : null;
  // const simulationConfig = { initialOrundum: initialResource, isSimpleMode, isTrySim };
  // gachasim에서만 쓰이는 result 재화소모 시뮬레이션에서는 어디서 실패했는지 같은 정보가 더 필요
  // 최소 경우 최대 경우 식으로 툭 튀는 기록들 보관할지?
  // 천장 보상은 무조건 0번 6성

  // 성능 문제도 살짝 더 생각해보자
  // 천장 뱃지 추가로 명시적 천장보상 정의?
  const simulationResult: SimulationResult = {
    total: {
      simulationTry,
      simulationSuccess: 0,
      totalGachaRuns: 0,
      anyPityRewardObtained: 0,
      initialResource,
      isTrySim,
      isSimpleMode,
      bannerFailureAction,
      seed,
    },
    perBanner: pickupDatas.map(({ id, name, gachaType }, index) => ({
      id,
      name,
      bannerType: gachaType,
      bannerSuccess: 0,
      bannerTotalGachaRuns: 0,
      bannerWinGachaRuns: 0,
      bannerHistogram: [],
      pityHistogram: [],
      anyPityRewardObtained: 0,
      winPityRewardObtained: 0,
      actualEntryCount: 0,
      bannerStartingCurrency: 0,
      currencyShortageFailure: 0,
      maxAttemptsFailure: 0,
      additionalResource:
        pickupDatas[index].additionalResource[isSimpleMode ? 'simpleMode' : 'extendedMode'],
      sixth: { totalObtained: 0, pickupObtained: 0, targetObtained: 0 },
      fifth: { totalObtained: 0, pickupObtained: 0, targetObtained: 0 },
      fourth: { totalObtained: 0, pickupObtained: 0, targetObtained: 0 },
    })),
  };
  // 시뮬레이션 반복
  for (let ti = 0; ti < simulationTry; ti++) {
    let singleSimulationSuccessCount = 0;
    let globalStandardSixthStack = 0;
    let currentOrundum = initialResource;
    // 1회 시뮬레이션 내의 배너 반복 시작
    for (let di = 0; di < pickupDatas.length; di++) {
      const currentBanner = simulationResult.perBanner[di];
      // 일단 입장 카운트 박고 시작
      currentBanner.actualEntryCount++;
      const {
        id,
        additionalResource,
        gachaType,
        maxGachaAttempts,
        minGachaAttempts,
        firstSixthTry,
        name,
        operators,
        pickupDetails: { pickupOpersCount, simpleMode },
      } = pickupDatas[di];
      const pickupChance =
        gachaType === 'limited'
          ? 70
          : gachaType === 'single' || gachaType === 'rotation' || gachaType === 'collab'
            ? 50
            : 100;
      // 배너 셋팅 시작 시 추가 오리지늄 계산 및 계산된 오리지늄을 배너 시작 재화에 할당
      // 이후 배너 진입 횟수만큼 나눠야 함
      // calculateOrundum(simulationConfig, additionalResource);
      if (!isTrySim) {
        if (isSimpleMode) {
          currentOrundum += additionalResource.simpleMode;
        } else {
          currentOrundum += additionalResource.extendedMode;
        }
        currentBanner.bannerStartingCurrency += currentOrundum;
      }
      const pity = pities[gachaType];
      const simulationMetrics: SimulationMetrics = {
        rotationPityRewardObtainedCount: 0,
        limitedSixthStack: 0,
        fifthStack: 0,
        adjustedSixthRate: sixthRate,
        adjustedFifthRate: fifthRate,
      };
      // 9천만번 기준 reduce = 2500ms~2600ms, for = 2300ms~2400ms
      // makeSimpleTargetOperators 함수도 로우레벨로 교체 50ms 정도 이득
      let rotationFakeCount = 0;
      let collabFakeCount = 0;

      let targetOperators: Record<OperatorRarityForString, OperatorResult[]>;

      if (isSimpleMode) {
        targetOperators = {
          sixth: makeSimpleTargetOperators({
            rarity: 6,
            length: simpleMode.targetOpersCount.sixth,
            pickupOperatorCount: pickupOpersCount.sixth,
            gachaGoalCount: globalGachaGoalCount ?? 1,
            gachaType,
            operatorTypeCallback: (index) =>
              (gachaType === 'collab' || gachaType === 'limited') && index === 0
                ? 'limited'
                : 'normal',
          }),
          fifth: makeSimpleTargetOperators({
            rarity: 5,
            length: simpleMode.targetOpersCount.fifth,
            pickupOperatorCount: pickupOpersCount.fifth,
            gachaType,
            operatorTypeCallback: (index) =>
              gachaType === 'collab' && index < 2 ? 'limited' : 'normal',
          }),
          fourth: makeSimpleTargetOperators({
            rarity: 4,
            gachaType,
            length: simpleMode.targetOpersCount.fourth,
            pickupOperatorCount: pickupOpersCount.fourth,
          }),
        };

        // makeSimpleTargetOperators 내부에서 pickupOpersCount가 아닌 2를 쓰고 있기 때문에 여기서도 2로 계산
        rotationFakeCount =
          gachaType === 'rotation'
            ? simpleMode.pickupOpersCount.sixth - simpleMode.targetOpersCount.sixth
            : 0;
        collabFakeCount =
          gachaType === 'collab'
            ? simpleMode.pickupOpersCount.fifth - simpleMode.targetOpersCount.fifth
            : 0;
      } else {
        const acc: Record<OperatorRarityForString, OperatorResult[]> = {
          sixth: [],
          fifth: [],
          fourth: [],
        };

        let rotationPityRewardCount = 0;
        let collabFifthLimitCount = 0;

        for (let oi = 0; oi < operators.length; oi++) {
          const current = operators[oi];
          const { currentQty, name, operatorId, operatorType, rarity, targetCount, isPityReward } =
            current;
          const gachaGoalCount =
            globalGachaGoalCount !== null && rarity === 6 ? globalGachaGoalCount : targetCount;

          if (gachaType === 'rotation' && rarity === 6 && isPityReward) {
            rotationPityRewardCount++;
          } else if (gachaType === 'collab' && rarity === 5 && operatorType === 'limited') {
            collabFifthLimitCount++;
          }
          const stringRarity = rarities[rarity];
          const arr = acc[stringRarity];
          arr.push({
            index: arr.length,
            id: operatorId,
            name,
            currentCount: currentQty,
            gachaGoalCount,
            isFirstObtained: false,
            operatorType,
            rarity,
            isPityReward,
            success: currentQty >= gachaGoalCount,
            isFake: false,
          });
        }

        if (gachaType === 'rotation' && rotationPityRewardCount < pickupOpersCount.sixth) {
          rotationFakeCount = pickupOpersCount.sixth - rotationPityRewardCount;
          for (let i = 0; i < rotationFakeCount; i++) {
            acc.sixth.push(
              createFakeOperator({
                id: `fake-rotation-${i}`,
                index: acc.sixth.length,
                operatorType: 'normal',
                rarity: 6,
              }),
            );
          }
        }

        if (gachaType === 'collab' && collabFifthLimitCount < pickupOpersCount.fifth) {
          collabFakeCount = pickupOpersCount.fifth - collabFifthLimitCount;
          for (let i = 0; i < collabFakeCount; i++) {
            acc.fifth.push(
              createFakeOperator({
                id: `fake-collab-${i}`,
                index: acc.fifth.length,
                operatorType: 'limited',
                rarity: 5,
              }),
            );
          }
        }

        targetOperators = acc;
      }
      const systemGachaLimit = 3000;
      const gachaAttemptsLimit = isSimpleMode
        ? systemGachaLimit
        : maxGachaAttempts === 9999
          ? systemGachaLimit
          : maxGachaAttempts;
      const newPickupOpersCount = isSimpleMode ? simpleMode.pickupOpersCount : pickupOpersCount;
      const result: BannerResult = {
        id,
        name,
        success: false,
        operators: targetOperators,
        statistics: { sixth: makeStatistics(), fifth: makeStatistics(), fourth: makeStatistics() },
        bannerGachaRuns: 0,
        failure: null,
      };
      const pityRewardOperator = result.operators.sixth.find(({ isPityReward }) => isPityReward);
      const successCount: SuccessCount = { sixth: 0, fifth: 0, fourth: 0 };
      const sixStats = result.statistics.sixth;

      // 최대 가챠 시도횟수가 0일 때 예외처리 simpleMode에서는 애초에 maxGachaAttempts를 0으로 조정할 수 없기 때문에 isSimpleMode는 명시할 필요 없음
      if (gachaAttemptsLimit === 0 && !isSimpleMode) result.failure = 'limit';

      // 주사위 롤링 시작
      for (let i = 0; i < gachaAttemptsLimit; i++) {
        if (!isTrySim) {
          // 재화 다 떨어지면 가챠 중지
          if (currentOrundum < 600) {
            result.failure = 'currency';
            break;
          }
          // result.bannerGachaRuns = i + 1;
          currentOrundum -= 600;
        }
        if (currentBanner.bannerHistogram[i] === undefined) {
          // 히스토그램의 현재 가챠횟수가 undefined라면 0 삽입
          currentBanner.bannerHistogram[i] = 0;
          currentBanner.pityHistogram[i] = 0;
        }

        // 연속 실패횟수 50번 부터 6성 확률 2%씩 증가
        if (gachaType === 'limited' || gachaType === 'collab') {
          // 한정 헤드헌팅 배너일 경우
          if (simulationMetrics.limitedSixthStack >= 50) {
            simulationMetrics.adjustedSixthRate =
              sixthRate + sixthRate * (simulationMetrics.limitedSixthStack - 49);
          } else {
            simulationMetrics.adjustedSixthRate = sixthRate;
          }
        } else {
          // 표준 헤드헌팅 배너일 경우
          if (globalStandardSixthStack >= 50) {
            simulationMetrics.adjustedSixthRate =
              sixthRate + sixthRate * (globalStandardSixthStack - 49);
          } else {
            simulationMetrics.adjustedSixthRate = sixthRate;
          }
        }

        // 연속 실패횟수 15번, 20번부터 5성 확률 증가
        if (simulationMetrics.fifthStack >= 15 && simulationMetrics.fifthStack < 20) {
          simulationMetrics.adjustedFifthRate = fifthRate + 2 * (simulationMetrics.fifthStack - 14);
        } else if (simulationMetrics.fifthStack >= 20) {
          simulationMetrics.adjustedFifthRate = fifthRate + 4 * (simulationMetrics.fifthStack - 19);
        } else {
          simulationMetrics.adjustedFifthRate = fifthRate;
        }

        logging && console.log('🎁 현재 5성 스택', simulationMetrics.fifthStack);

        if (gachaType === 'limited' && i === pity) {
          // 한정 천장 달성 시 가챠와 별개로 확률업 한정 1개 증정
          // 이미 얻었는지 여부는 따지지 않음
          logging && console.log('🌈 한정 300천장');
          sixStats.pickupObtained++;
          sixStats.targetObtained++;
          sixStats.totalObtained++;
          sixStats.isAnyPityRewardObtained = true;
          if (pityRewardOperator) {
            pityRewardOperator.isFirstObtained = true;
            pityRewardOperator.currentCount++;
            if (pityRewardOperator.currentCount >= pityRewardOperator.gachaGoalCount)
              pityRewardOperator.success = true;
            if (pityRewardOperator.currentCount === pityRewardOperator.gachaGoalCount)
              successCount.sixth++;
          }
        }

        // 콜라보 천장은 이미 얻었을 시 사라짐
        const isCollabPityReached =
          gachaType === 'collab' && !pityRewardOperator?.isFirstObtained && i === pity;

        const roll = rng() * 100;

        // 콜라보 천장이 true일 시 무조건 6성 당첨 + 6성 픽업 당첨
        if (roll < simulationMetrics.adjustedSixthRate || isCollabPityReached) {
          // 6성 당첨
          logging && console.log('🔥 6성 당첨');
          const pickupChanceByEach = safeNumberOrZero(pickupChance / newPickupOpersCount.sixth);
          const stringRarity: OperatorRarityForString = 'sixth';
          const targetOperators = result.operators.sixth;
          sixStats.totalObtained++;
          // 6성 스택 초기화
          if (gachaType === 'limited' || gachaType === 'collab') {
            simulationMetrics.limitedSixthStack = 0;
          } else {
            globalStandardSixthStack = 0;
          }
          // 5성 스택 초기화
          simulationMetrics.fifthStack = 0;
          if (newPickupOpersCount.sixth > 0) {
            switch (gachaType) {
              case 'collab':
              case 'single':
                {
                  const pityRewardOperator = targetOperators.find(
                    ({ isPityReward }) => isPityReward,
                  );
                  const isPityCountReached =
                    typeof pity === 'number' && (gachaType === 'collab' ? i === pity : i > pity);
                  const rollResult = executePickupRoll({
                    rng,
                    targetOperators,
                    // 내가 얻고자 입력한 pityRewardOperator가 없어도 시스템에는 여전히 천장이 돌아가기 때문에
                    // 정해놓은 천장 보상(pityRewardOperator)이 있으면서 그 오퍼를 획득한 적 있는 게 아니라면 천장 작동
                    isPityReached: !pityRewardOperator?.isFirstObtained && isPityCountReached,
                    pickupChance,
                    pickupChanceByEach,
                    pityRewardOperators: pityRewardOperator ? [pityRewardOperator] : [],
                  });
                  updateResult({
                    rollResult,
                    result,
                    successCount,
                    stringRarity,
                  });
                }
                break;
              case 'rotation':
                {
                  const rotationPityObtainedCount =
                    simulationMetrics.rotationPityRewardObtainedCount;
                  const pityRewardOperators = targetOperators.filter(
                    ({ isPityReward, isFirstObtained }) => isPityReward && !isFirstObtained,
                  );
                  // 150회 ~ 300회 구간에서 한 번 천장보상을 얻었으면 300회 까지는 천장 없음
                  const isRotationPityReached =
                    ((i > 149 && rotationPityObtainedCount < 1) ||
                      (i > 299 && rotationPityObtainedCount < 2)) &&
                    pityRewardOperators.length > 0;
                  const rollResult = executePickupRoll({
                    rng,
                    targetOperators,
                    isPityReached: isRotationPityReached,
                    pickupChance,
                    pickupChanceByEach,
                    pityRewardOperators,
                  });
                  updateResult({
                    rollResult,
                    result,
                    successCount,
                    stringRarity,
                    pityContext: { isPityReached: isRotationPityReached, simulationMetrics },
                  });
                }
                break;
              default:
                {
                  const rollResult = executePickupRoll({
                    rng,
                    targetOperators,
                    pickupChance,
                    pickupChanceByEach,
                  });
                  updateResult({
                    rollResult,
                    result,
                    successCount,
                    stringRarity,
                  });
                }
                break;
            }
          }
        } else {
          // 6성 미당첨 조건문 중 아래 범위는 이미 선행 if에서 삭제되니 조건으로 추가할 필요 없음
          // 6성 스택 증가
          if (gachaType === 'limited' || gachaType === 'collab') {
            simulationMetrics.limitedSixthStack++;
          } else {
            globalStandardSixthStack++;
          }
          // 10회뽑까지 당첨된 5성이상 오퍼레이터가 없으면 강제 최소 5성 당첨 6성은 확률변동 없기 때문에 6성 로직 거쳐서 내려옴
          const fifthGuaranteed =
            i === 9 && sixStats.totalObtained === 0 && result.statistics.fifth.totalObtained === 0;
          // const fifthGuaranteed = false;
          if (
            roll < simulationMetrics.adjustedSixthRate + simulationMetrics.adjustedFifthRate ||
            fifthGuaranteed
          ) {
            logging && console.log('🎇 현재 5성 확률', simulationMetrics.adjustedFifthRate);
            // 5성 당첨
            logging && console.log('⭐️ 5성 당첨');
            const isFifthPickupGuranteed = i > 100 && result.statistics.fifth.pickupObtained < 1;
            const stringRarity: OperatorRarityForString = 'fifth';
            const targetOperators = result.operators.fifth;
            result.statistics.fifth.totalObtained++;
            // 5성 스택 초기화
            simulationMetrics.fifthStack = 0;
            if (newPickupOpersCount.fifth > 0) {
              switch (gachaType) {
                case 'collab':
                  {
                    const unObtainedPityRewards = targetOperators.filter(
                      ({ operatorType, rarity, isFirstObtained }) =>
                        operatorType === 'limited' && rarity === 5 && !isFirstObtained,
                    );
                    const rollResult = executePickupRoll({
                      rng,
                      targetOperators,
                      pickupChance: isFifthPickupGuranteed ? 100 : 50,
                      pickupChanceByEach: safeNumberOrZero(50 / newPickupOpersCount.fifth),
                      isPityReached: unObtainedPityRewards.length === 1,
                      pityRewardOperators: unObtainedPityRewards,
                    });
                    updateResult({
                      rollResult,
                      result,
                      successCount,
                      stringRarity,
                    });
                  }
                  break;
                case 'contract':
                  {
                    const rollResult = executePickupRoll({
                      rng,
                      targetOperators,
                      pickupChance: 100,
                      pickupChanceByEach: safeNumberOrZero(100 / newPickupOpersCount.fifth),
                    });
                    updateResult({
                      rollResult,
                      result,
                      successCount,
                      stringRarity,
                    });
                  }
                  break;
                case 'orient':
                  {
                    const rollResult = executePickupRoll({
                      rng,
                      targetOperators,
                      pickupChance: isFifthPickupGuranteed ? 100 : 60,
                      pickupChanceByEach: safeNumberOrZero(60 / newPickupOpersCount.fifth),
                    });
                    updateResult({
                      rollResult,
                      result,
                      successCount,
                      stringRarity,
                    });
                  }
                  break;
                default:
                  {
                    const rollResult = executePickupRoll({
                      rng,
                      targetOperators,
                      pickupChance: isFifthPickupGuranteed ? 100 : 50,
                      pickupChanceByEach: safeNumberOrZero(50 / newPickupOpersCount.fifth),
                    });
                    updateResult({
                      rollResult,
                      result,
                      successCount,
                      stringRarity,
                    });
                  }
                  break;
              }
            }
          } else {
            // 5성 스택 증가
            simulationMetrics.fifthStack++;
            if (roll < simulationMetrics.adjustedSixthRate + fifthRate + fourthRate) {
              // 4성 당첨
              logging && console.log('🟣 4성 당첨');
              const stringRarity: OperatorRarityForString = 'fourth';
              const targetOperators = result.operators.fourth;
              result.statistics.fourth.totalObtained++;
              if (newPickupOpersCount.fourth > 0) {
                const rollResult = executePickupRoll({
                  rng,
                  targetOperators,
                  pickupChance: 20,
                  pickupChanceByEach: safeNumberOrZero(20 / newPickupOpersCount.fourth),
                });
                updateResult({
                  rollResult,
                  result,
                  successCount,
                  stringRarity,
                });
              }
            } else {
              // 3성 당첨
              logging && console.log('🔹 3성 당첨');
            }
          }
        }
        logging &&
          console.log(
            '시행횟수 :',
            i + 1,
            '성공 횟수 :',
            successCount.sixth,
            '6성 확률 :',
            simulationMetrics.adjustedSixthRate,
            '픽뚫 횟수',
            result.statistics.sixth.totalObtained - result.statistics.sixth.pickupObtained,
            '주사위 눈 :',
            roll,
          );
        // 조건 완료 and 최솟값 이상 달성 시 가챠 중지
        if (
          successCount.sixth >= result.operators.sixth.length - rotationFakeCount &&
          successCount.fifth >= result.operators.fifth.length - collabFakeCount &&
          successCount.fourth >= result.operators.fourth.length &&
          i + 1 >= minGachaAttempts
        ) {
          result.bannerGachaRuns = i + 1;
          result.success = true;
          currentBanner.bannerHistogram[i]++;
          if (sixStats.isAnyPityRewardObtained) {
            currentBanner.pityHistogram[i]++;
          }
          break;
        } else if (i + 1 === gachaAttemptsLimit) {
          // 조건 완료하지 못한 채 최대값 달성 시 가챠 중지
          result.bannerGachaRuns = i + 1;
          result.failure = 'limit';
          break;
        } else if (firstSixthTry && result.statistics.sixth.totalObtained >= 1) {
          // 첫 6성 옵션이 활성화된 상태로 6성 하나를 얻었으나 위쪽의 성공 조건을 못채웠으면 가챠 중지
          // 이해를 쉽게 하기 위해 첫 번째 실패 조건과 분기
          result.bannerGachaRuns = i + 1;
          result.failure = 'limit';
          break;
        }
      }
      // 가챠 배너 완료시 데이터 정리 부분
      logging && console.log('배너 종료');

      if (result.success) {
        currentBanner.bannerSuccess++;
        currentBanner.bannerWinGachaRuns += result.bannerGachaRuns;
        singleSimulationSuccessCount++;
        if (sixStats.isAnyPityRewardObtained) currentBanner.winPityRewardObtained++;
      } else if (result.failure === 'currency') {
        currentBanner.currencyShortageFailure++;
      } else if (result.failure === 'limit') {
        currentBanner.maxAttemptsFailure++;
      }
      if (sixStats.isAnyPityRewardObtained) {
        currentBanner.anyPityRewardObtained++;
        simulationResult.total.anyPityRewardObtained++;
      }
      currentBanner.bannerTotalGachaRuns += result.bannerGachaRuns;
      simulationResult.total.totalGachaRuns += result.bannerGachaRuns;
      for (const rarityString of rarityStrings) {
        const obtainedTypes = ['totalObtained', 'pickupObtained', 'targetObtained'] as const;
        for (const obtainedType of obtainedTypes) {
          currentBanner[rarityString][obtainedType] +=
            result.statistics[rarityString][obtainedType];
        }
      }
      // 중단 옵션 활성화 : 배너 실패시 이번 회차 시뮬레이션 종료
      if (!result.success && bannerFailureAction === 'interruption') {
        break;
      }
    }
    // 배너 전부 성공시 총 성공카운트 1증가
    if (singleSimulationSuccessCount === pickupDatas.length)
      simulationResult.total.simulationSuccess++;

    if ((ti + 1) % batchSize === 0) {
      (self as unknown as Worker).postMessage({
        type: 'progress',
        workerIndex,
        partialResult: {
          progressTry: ti + 1,
          total: simulationTry,
          gachaRuns: simulationResult.total.totalGachaRuns,
          success: simulationResult.total.simulationSuccess,
          data: simulationResult,
        },
      });
    }
  }

  (self as unknown as Worker).postMessage({
    type: 'progress',
    workerIndex,
    partialResult: {
      progressTry: simulationTry,
      total: simulationTry,
      gachaRuns: simulationResult.total.totalGachaRuns,
      success: simulationResult.total.simulationSuccess,
      data: simulationResult,
    },
  });
  return simulationResult;
};

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const {
    type,
    workerIndex,
    payload: {
      seed,
      pickupDatas,
      options: {
        isTrySim,
        isSimpleMode,
        batchGachaGoal,
        simulationTry,
        initialResource,
        probability,
        bannerFailureAction,
      },
    },
  } = e.data;
  if (type !== 'start') return;
  const result = gachaRateSimulate({
    workerIndex,
    pickupDatas,
    batchGachaGoal,
    seed,
    isSimpleMode,
    isTrySim,
    simulationTry,
    initialResource,
    probability,
    bannerFailureAction,
  });

  (self as unknown as Worker).postMessage({
    type: 'done',
    workerIndex,
    result,
  });
};
