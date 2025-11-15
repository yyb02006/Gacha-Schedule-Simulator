import { BannerFailureAction, Dummy, WorkerInput } from '#/components/PickupList';
import { safeNumberOrZero } from '#/libs/utils';
import { GachaType, OperatorRarity, OperatorRarityForString, OperatorType } from '#/types/types';

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

function createRNG(seed = 0x12345678) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SimulationResult {
  total: {
    simulationTry: number;
    simulationSuccess: number;
    totalGachaRuns: number;
    pityRewardObtained: number;
    initialResource: number;
    isTrySim: boolean;
    isSimpleMode: boolean;
    bannerFailureAction: BannerFailureAction;
  };
  perBanner: {
    id: string;
    name: string;
    bannerType: GachaType;
    bannerSuccess: number;
    bannerTotalGachaRuns: number;
    bannerWinGachaRuns: number;
    bannerHistogram: number[];
    pityRewardObtained: number;
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
}

interface Statistics {
  totalObtained: number;
  pickupObtained: number;
  targetObtained: number;
}

interface BannerResult {
  id: string;
  name: string;
  success: boolean;
  operators: Record<OperatorRarityForString, OperatorResult[]>;
  statistics: Record<OperatorRarityForString, Statistics>;
  bannerGachaRuns: number;
  isPityRewardObtained: boolean;
  failure: 'currency' | 'limit' | null;
}

interface SuccessCount {
  sixth: number;
  fifth: number;
  fourth: number;
}

interface SimulationMetrics {
  pityRewardObtainedCount: number;
  limitedSixthStack: number;
  adjustedSixthRate: number;
  adjustedFifthRate: number;
}

interface RollResult {
  obtainedOperator: OperatorResult | null;
  isSuccessOnThisTry: boolean;
  isPickupObtained: boolean;
  isTargetObtained: boolean;
  isPityRewardObtained: boolean;
}

const makeStatistics = (): Statistics => ({
  totalObtained: 0,
  pickupObtained: 0,
  targetObtained: 0,
});

const makeSimpleTargetOperators = ({
  rarity,
  length,
  gachaGoalCount,
  gachaType,
  operatorTypeCallback,
}: {
  rarity: OperatorRarity;
  length: number;
  gachaGoalCount?: number;
  gachaType: GachaType;
  operatorTypeCallback?: (index: number) => 'limited' | 'normal';
}): OperatorResult[] => {
  const arr: OperatorResult[] = new Array(length);
  const isDoublePity =
    rarity === 6 && (gachaType === 'collab' || gachaType === 'limited' || gachaType === 'single');
  const isSinglePity = rarity === 6 && gachaType === 'rotation';
  for (let i = 0; i < length; i++) {
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
    };
  }
  return arr;
};

// 비순수함수
const handlePickupRollWin = (obtainedOperator: OperatorResult, rollResult: RollResult) => {
  obtainedOperator.currentCount++;
  obtainedOperator.isFirstObtained = true;
  if (obtainedOperator.currentCount >= obtainedOperator.gachaGoalCount)
    obtainedOperator.success = true;
  if (obtainedOperator.currentCount === obtainedOperator.gachaGoalCount)
    rollResult.isSuccessOnThisTry = true;
  rollResult.obtainedOperator = obtainedOperator;
  rollResult.isTargetObtained = true;
  rollResult.isPickupObtained = true;
};

const executePickupRoll = ({
  targetOperators,
  pickupChance,
  pickupChanceByEach,
  pityRewardOperators,
  isPityReached,
}: {
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
    isPityRewardObtained: false,
  };
  if (isPityReached && pityRewardOperators) {
    // 천장일 시
    logging && console.log('천장');
    // 이미 획득한 천장보상 제외하고 획득
    rollResult.isPityRewardObtained = true;
    if (pityRewardOperators.length > 0) {
      const pityRoll = Math.random() * 100;
      const PickupChanceByEachReward = safeNumberOrZero(100 / pityRewardOperators.length);
      for (const [ci, pityRewardOperator] of pityRewardOperators.entries()) {
        if (
          pityRoll < PickupChanceByEachReward * (ci + 1) &&
          pityRoll >= PickupChanceByEachReward * ci
        ) {
          // 천장시 확률을 픽업 캐릭터 수만큼 나눈 뒤
          // 각 캐릭터가 자신의 구간에서 당첨됐을 시
          handlePickupRollWin(pityRewardOperator, rollResult);
          break;
        }
      }
    }
  } else {
    // 천장이 아닐 시
    const nonePityRoll = Math.random() * 100;
    if (nonePityRoll < pickupChance) {
      // 픽업 당첨
      logging && console.log('픽업 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', nonePityRoll);
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
      logging && console.log('픽뚫 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', nonePityRoll);
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
  if (rollResult.isPityRewardObtained) result.isPityRewardObtained = true;
  if (rollResult.obtainedOperator) {
    const { index } = rollResult.obtainedOperator;
    currentOperators[index] = rollResult.obtainedOperator;
    if (rollResult.isSuccessOnThisTry) successCount[stringRarity]++;
  }
  if (pityContext && pityContext.isPityReached)
    pityContext.simulationMetrics.pityRewardObtainedCount++;
  if (rollResult.isPickupObtained) currentStatistics.pickupObtained++;
  if (rollResult.isTargetObtained) currentStatistics.targetObtained++;
};

const gachaRateSimulate = ({
  pickupDatas,
  gachaGoal,
  isTrySim,
  isSimpleMode,
  simulationTry,
  initialResource,
  probability,
  bannerFailureAction,
}: {
  pickupDatas: Dummy[];
  gachaGoal: 'allFirst' | 'allMax' | null;
  isSimpleMode: boolean;
  isTrySim: boolean;
  simulationTry: number;
  initialResource: number;
  probability: { limited: number; normal: number };
  bannerFailureAction: BannerFailureAction;
}) => {
  const sixthRate = 2;
  const fifthRate = 8;
  const fourthRate = 50;
  const globalGachaGoalCount = gachaGoal === 'allMax' ? 6 : gachaGoal === 'allFirst' ? 1 : null;
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
      pityRewardObtained: 0,
      initialResource,
      isTrySim,
      isSimpleMode,
      bannerFailureAction,
    },
    perBanner: pickupDatas.map(({ id, name, gachaType }, index) => ({
      id,
      name,
      bannerType: gachaType,
      bannerSuccess: 0,
      bannerTotalGachaRuns: 0,
      bannerWinGachaRuns: 0,
      bannerHistogram: [],
      pityRewardObtained: 0,
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
    let standardSixthStack = 0;
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
        pickupDetails: { pickupChance: bannerPickupChance, pickupOpersCount, simpleMode },
      } = pickupDatas[di];
      const pickupChance =
        gachaType === 'limited'
          ? probability.limited
          : gachaType === 'single' || gachaType === 'rotation'
            ? probability.normal
            : bannerPickupChance;
      // 배너 셋팅 시작 시 추가 오리지늄 계산 및 계산된 오리지늄을 배너 시작 재화에 할당
      // 이후 배너 진입 횟수만큼 나눠야 함
      // calculateOrundum(simulationConfig, additionalResource);
      if (!isTrySim) {
        if (isSimpleMode) {
          currentOrundum += additionalResource.simpleMode;
        } else {
          currentOrundum += additionalResource.simpleMode;
        }
        currentBanner.bannerStartingCurrency += currentOrundum;
      }
      const pity = pities[gachaType];
      const simulationMetrics: SimulationMetrics = {
        pityRewardObtainedCount: 0,
        limitedSixthStack: 0,
        adjustedSixthRate: sixthRate,
        adjustedFifthRate: fifthRate,
      };
      // 9천만번 기준 reduce = 2500ms~2600ms, for = 2300ms~2400ms
      // makeSimpleTargetOperators 함수도 로우레벨로 교체 50ms 정도 이득
      let targetOperators: Record<OperatorRarityForString, OperatorResult[]>;

      if (isSimpleMode) {
        targetOperators = {
          sixth: makeSimpleTargetOperators({
            rarity: 6,
            length: simpleMode.targetOpersCount.sixth,
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
            gachaType,
            operatorTypeCallback: (index) =>
              gachaType === 'collab' && index < 2 ? 'limited' : 'normal',
          }),
          fourth: makeSimpleTargetOperators({
            rarity: 4,
            gachaType,
            length: simpleMode.targetOpersCount.fourth,
          }),
        };
      } else {
        const acc: Record<OperatorRarityForString, OperatorResult[]> = {
          sixth: [],
          fifth: [],
          fourth: [],
        };

        for (let oi = 0; oi < operators.length; oi++) {
          const current = operators[oi];
          const { currentQty, name, operatorId, operatorType, rarity, targetCount, isPityReward } =
            current;
          const gachaGoalCount = globalGachaGoalCount ?? targetCount;
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
          });
        }

        targetOperators = acc;
      }
      const systemGachaLimit = 9999;
      const gachaAttemptsLimit = isSimpleMode
        ? systemGachaLimit
        : maxGachaAttempts === Infinity
          ? systemGachaLimit
          : maxGachaAttempts;
      const newPickupOpersCount = isSimpleMode ? simpleMode.pickupOpersCount : pickupOpersCount;
      /* const newTargetOpersCount = isSimpleMode
        ? simpleMode.targetOpersCount
        : {
            sixth: targetOperators.sixth.length,
            fifth: targetOperators.fifth.length,
            fourth: targetOperators.fourth.length,
          }; */
      const result: BannerResult = {
        id,
        name,
        success: false,
        operators: targetOperators,
        statistics: { sixth: makeStatistics(), fifth: makeStatistics(), fourth: makeStatistics() },
        bannerGachaRuns: 0,
        isPityRewardObtained: false,
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
        }
        // 연속 실패횟수 50번 부터 확률 2%씩 증가
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
          if (standardSixthStack >= 50) {
            simulationMetrics.adjustedSixthRate = sixthRate + sixthRate * (standardSixthStack - 49);
          } else {
            simulationMetrics.adjustedSixthRate = sixthRate;
          }
        }
        ///////////
        /////////////
        //////////////
        ////////////////
        ////////////////
        //////////////// 기타 천장 관련 요소들 전부 isPityReward 기준으로 재설정하고
        //////////////// 6성 비율이 2.89가 아니라 2.93정도로 나오고 있으니 확인해볼 것
        /////////Uncaught TypeError: Cannot read properties of undefined (reading 'isFirstObtained') : 519줄
        if (gachaType === 'limited' && i === pity) {
          // 한정 천장 달성 시 가챠와 별개로 확률업 한정 1개 증정
          // 이미 얻었는지 여부는 따지지 않음
          logging && console.log('한정 300천장');
          sixStats.pickupObtained++;
          sixStats.targetObtained++;
          sixStats.totalObtained++;
          result.isPityRewardObtained = true;
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

        const roll = Math.random() * 100;

        // 콜라보 천장이 true일 시 무조건 6성 당첨 + 6성 픽업 당첨
        if (roll < simulationMetrics.adjustedSixthRate || isCollabPityReached) {
          // 6성 당첨
          logging && console.log('6성 당첨');
          const pickupChanceByEach = safeNumberOrZero(pickupChance / newPickupOpersCount.sixth);
          const stringRarity: OperatorRarityForString = 'sixth';
          const targetOperators = result.operators.sixth;
          sixStats.totalObtained++;
          // 6성 스택 초기화
          if (gachaType === 'limited' || gachaType === 'collab') {
            simulationMetrics.limitedSixthStack = 0;
          } else {
            standardSixthStack = 0;
          }
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
                  const pityRewardOperators = targetOperators.filter(
                    ({ isFirstObtained, isPityReward }) => !isFirstObtained && isPityReward,
                  );
                  const pityObtainedCount = simulationMetrics.pityRewardObtainedCount;
                  const isRotationPityReached =
                    pityRewardOperators.length > 0 &&
                    ((i > 149 && pityObtainedCount < 1) || (i > 299 && pityObtainedCount < 2));
                  const rollResult = executePickupRoll({
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
            standardSixthStack++;
          }
          // 10회뽑까지 당첨된 5성이상 오퍼레이터가 없으면 강제 최소 5성 당첨 6성은 확률변동 없기 때문에 6성 로직 거쳐서 내려옴
          const fifthGuaranteed =
            i === 9 && sixStats.totalObtained === 0 && result.statistics.fifth.totalObtained === 0;
          // const fifthGuaranteed = false;
          if (roll < simulationMetrics.adjustedSixthRate + fifthRate || fifthGuaranteed) {
            // 5성 당첨
            logging && console.log('5성 당첨');
            const stringRarity: OperatorRarityForString = 'fifth';
            const targetOperators = result.operators.fifth;
            result.statistics.fifth.totalObtained++;
            if (newPickupOpersCount.fifth > 0) {
              switch (gachaType) {
                case 'collab':
                  {
                    const unObtainedPityRewards = [targetOperators[0], targetOperators[1]].filter(
                      ({ isFirstObtained }) => !isFirstObtained,
                    );
                    const rollResult = executePickupRoll({
                      targetOperators,
                      pickupChance: 50,
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
                      targetOperators,
                      pickupChance: 60,
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
                      targetOperators,
                      pickupChance: 50,
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
          } else if (roll < simulationMetrics.adjustedSixthRate + fifthRate + fourthRate) {
            // 4성 당첨
            logging && console.log('4성 당첨');
            const stringRarity: OperatorRarityForString = 'fourth';
            const targetOperators = result.operators.fourth;
            result.statistics.fourth.totalObtained++;
            if (newPickupOpersCount.fourth > 0) {
              const rollResult = executePickupRoll({
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
            logging && console.log('3성 당첨');
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
          (successCount.sixth >= result.operators.sixth.length &&
            successCount.fifth >= result.operators.fifth.length &&
            successCount.fourth >= result.operators.fourth.length &&
            i + 1 >= minGachaAttempts) ||
          (firstSixthTry && result.statistics.sixth.totalObtained >= 1)
        ) {
          result.bannerGachaRuns = i + 1;
          result.success = true;
          currentBanner.bannerHistogram[i]++;
          break;
        } else if (i + 1 === gachaAttemptsLimit) {
          // 조건 완료하지 못한 채 최대값 달성 시 가챠 중지
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
      } else if (result.failure === 'currency') {
        currentBanner.currencyShortageFailure++;
      } else if (result.failure === 'limit') {
        currentBanner.maxAttemptsFailure++;
      }
      if (result.isPityRewardObtained) {
        currentBanner.pityRewardObtained++;
        simulationResult.total.pityRewardObtained++;
      }
      currentBanner.bannerTotalGachaRuns += result.bannerGachaRuns;
      const rarityStrings = ['sixth', 'fifth', 'fourth'] as const;
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
  }
  /* for (let bi = 0; bi < simulationResult.perBanner.length; bi++) {
    simulationResult.total.totalGachaRuns += simulationResult.perBanner[bi].bannerGachaRuns;
    simulationResult.total.pityRewardObtained += simulationResult.perBanner[bi].pityRewardObtained;
  } */
  return simulationResult;
};

/**
 * 예상
 *
 * 6성 전부 뽑을 기대값: 288.33회
 * 5성 3/6 뽑을 기대값: 137.5회, 6/6 뽑을 기대값: 183.75회
 * 중앙값(median): 169 회
 * 표준편차(population): ≈ 102.77
 */
const contractDummy: Dummy = {
  id: 'f8e7d6c5-b4a3-4210-9876-543cvddedcba',
  name: '협약 헤드헌팅',
  image: '/images/orient-1.jpg',
  gachaType: 'contract',
  operators: [
    {
      operatorId: 'c1d2e3f4-g5h6-zz23-9k0l-1m2nvngp5q6r',
      name: '데겐블레허',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
      isPityReward: false,
    },
    {
      operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1msszzzz5q6r',
      name: '리드 더 플레임 섀도우',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
      isPityReward: false,
    },
    {
      operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2sgdfddq6r',
      name: '님프',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
      isPityReward: false,
    },
    {
      operatorId: 'c1dxxxf4-gdd6-7i8j-9k0l-1m2sdfsddq6r',
      name: '이네스',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
      isPityReward: false,
    },
  ],
  pickupDetails: {
    pickupOpersCount: { sixth: 4, fifth: 0, fourth: 0 },
    targetOpersCount: { sixth: 4, fifth: 0, fourth: 0 },
    pickupChance: 100,
    simpleMode: {
      pickupOpersCount: { sixth: 4, fifth: 6, fourth: 0 },
      targetOpersCount: { sixth: 4, fifth: 3, fourth: 0 },
    },
  },
  maxGachaAttempts: Infinity,
  minGachaAttempts: 0,
  firstSixthTry: false,
  additionalResource: { simpleMode: 0, extendedMode: 0 },
  active: true,
};

/**
 * 예상
 *
 * 6성 전부 뽑을 기대값: 190.46 회
 * 5성 3/3 뽑을 기대값: 114.58회
 * 중앙값(median): 169 회
 * 표준편차(population): ≈ 102.77
 */
const orientDummy: Dummy = {
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
      isPityReward: false,
    },
    {
      operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2zzzzz5q6r',
      name: '리드 더 플레임 섀도우',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
      isPityReward: false,
    },
    {
      operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2sdfsddq6r',
      name: '님프',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
      isPityReward: false,
    },
  ],
  pickupDetails: {
    pickupOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
    targetOpersCount: { sixth: 3, fifth: 0, fourth: 0 },
    pickupChance: 100,
    simpleMode: {
      pickupOpersCount: { sixth: 3, fifth: 3, fourth: 0 },
      targetOpersCount: { sixth: 0, fifth: 3, fourth: 0 },
    },
  },
  maxGachaAttempts: Infinity,
  minGachaAttempts: 0,
  firstSixthTry: false,
  additionalResource: { simpleMode: 0, extendedMode: 0 },
  active: true,
};

/**
 * 예상
 *
 * 6성 기대값: 60.8 회
 * 5성 전부 뽑을 기대값: 37.5회
 * 중앙값(median): 57 회
 * 표준편차(population): 37.75
 */
const collabDummy: Dummy = {
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
      isPityReward: true,
    },
    {
      operatorId: 'c1d2e3f4-xxxx-7i8j-9k0l-1m2n3oxx5q6r',
      name: '미스미 우이카',
      currentQty: 0,
      operatorType: 'limited',
      targetCount: 1,
      rarity: 5,
      isPityReward: false,
    },
    {
      operatorId: 'c1dxxxf4-g5h6-7i8j-9k0l-1m2n3oxx5q6r',
      name: '와카바 무츠미',
      currentQty: 0,
      operatorType: 'limited',
      targetCount: 1,
      rarity: 5,
      isPityReward: false,
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
  firstSixthTry: false,
  additionalResource: { simpleMode: 0, extendedMode: 0 },
  active: true,
};

/**
 * 예상
 *
 * 6성 전부 뽑을 기대값: 145 회, 천장 없을 시 148.3회
 * 5성 1/1 뽑을 기대값: 25회
 * 중앙값(median): 125 회
 * 표준편차(population): 86.86
 */
const limitedDummy: Dummy = {
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
      isPityReward: true,
    },
    {
      operatorId: 'czf2e3f4-g556-7i8j-9k0l-1m2n3o4ddd6r',
      name: '하루카',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
      isPityReward: false,
    },
  ],
  pickupDetails: {
    pickupOpersCount: { sixth: 2, fifth: 1, fourth: 0 },
    targetOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
    pickupChance: 70,
    simpleMode: {
      pickupOpersCount: { sixth: 2, fifth: 1, fourth: 0 },
      targetOpersCount: { sixth: 0, fifth: 1, fourth: 0 },
    },
  },
  maxGachaAttempts: Infinity,
  minGachaAttempts: 0,
  firstSixthTry: false,
  additionalResource: { simpleMode: 16000, extendedMode: 0 },
  active: true,
};

/**
 * 예상
 *
 * 6성 전부 뽑을 기대값: 66.1 회, 천장 없을 시 69.2회
 * 5성 2/2 뽑을 기대값: 75회
 * 중앙값(median): 57 회
 * 표준편차(population): 47.83
 */
const singleDummy: Dummy = {
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
      isPityReward: false,
    },
  ],
  pickupDetails: {
    pickupOpersCount: { sixth: 1, fifth: 2, fourth: 0 },
    targetOpersCount: { sixth: 1, fifth: 0, fourth: 0 },
    pickupChance: 50,
    simpleMode: {
      pickupOpersCount: { sixth: 1, fifth: 2, fourth: 0 },
      targetOpersCount: { sixth: 0, fifth: 2, fourth: 0 },
    },
  },
  maxGachaAttempts: Infinity,
  minGachaAttempts: 0,
  firstSixthTry: false,
  additionalResource: { simpleMode: 0, extendedMode: 0 },
  active: true,
};

// rotation => rotation
/**
 * 예상
 *
 * 6성 전부 뽑을 기대값: 149 회, 천장 없을 시 207.6회
 * 5성 3/3 뽑을 기대값: 137.5회
 * 중앙값(median): 156 회
 * 표준편차(population): 60.04
 */
const rotationDummy: Dummy = {
  id: 'a1b2c3d4-e5f6-4789-b0c1-d2e3zzzzb6c7',
  name: '로테이션-151',
  image: '/images/exusiai.jpg',
  gachaType: 'rotation',
  operators: [
    {
      operatorId: 'a1b2c3d4-e5f6-7g8h-9i0j-1k2l3ccc5o6p',
      name: '이네스',
      currentQty: 2,
      operatorType: 'normal',
      targetCount: 6,
      rarity: 6,
      isPityReward: true,
    },
    {
      operatorId: 'b1c2d3e4-f5g6-7h8i-9j0k-1ddm3n4o5p6q',
      name: '페넌스',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
      isPityReward: true,
    },
  ],
  pickupDetails: {
    pickupOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
    targetOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
    pickupChance: 50,
    simpleMode: {
      pickupOpersCount: { sixth: 2, fifth: 3, fourth: 0 },
      targetOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
    },
  },
  maxGachaAttempts: Infinity,
  minGachaAttempts: 0,
  firstSixthTry: false,
  additionalResource: { simpleMode: 0, extendedMode: 0 },
  active: true,
};

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const {
    type,
    payload: {
      pickupDatas,
      options: {
        isTrySim,
        isSimpleMode,
        gachaGoal,
        simulationTry,
        initialResource,
        probability,
        bannerFailureAction,
      },
    },
  } = e.data;
  // console.log('[Worker] 메인으로부터 데이터 수신:', pickupDatas);
  if (type !== 'start') return;
  const testArray1 = [
    contractDummy,
    orientDummy,
    collabDummy,
    limitedDummy,
    singleDummy,
    rotationDummy,
  ];
  const testArray2 = [limitedDummy, limitedDummy];
  const startTime = performance.now();
  const result = gachaRateSimulate({
    pickupDatas: [orientDummy],
    gachaGoal,
    isSimpleMode,
    isTrySim,
    simulationTry: 1000000,
    initialResource,
    probability,
    bannerFailureAction,
  });
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;

  console.log(`걸린 시간: ${elapsedTime} 밀리초`);

  const { total, perBanner } = result;
  const expectedValues = perBanner.map(({ bannerWinGachaRuns, bannerSuccess }) =>
    safeNumberOrZero(bannerWinGachaRuns / bannerSuccess),
  );

  /* console.log(
    `전체 시뮬레이션 횟수 :`,
    total.simulationTry,
    `성공한 시뮬레이션 횟수 :`,
    total.successCount,
    '개별 통계 :',
    JSON.stringify(perBanner, null, 2),
    '개별 배너 성공 기대값 :',
    expectedValues,
  ); */

  (self as unknown as Worker).postMessage({
    type: 'done',
    result,
  });
};
