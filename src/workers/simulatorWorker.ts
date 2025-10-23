import { Dummy, WorkerInput } from '#/components/PickupList';
import { OperatorRarity, OperatorRarityForString, OperatorType } from '#/types/types';

export default {} as typeof Worker & { new (): Worker };

const logging = false;
const testTryCount = 300000;

const pities = {
  collab: 119,
  limited: 299,
  single: 149,
  revival: [149, 299],
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
}

interface Statistics {
  totalObtained: number;
  pickupObtained: number;
}

interface SimpleBannerResult {
  id: string;
  name: string;
  success: boolean;
  operators: Record<
    OperatorRarityForString,
    { targetOperators: OperatorResult[]; statistics: Statistics }
  >;
  totalRuns: number;
}

interface SuccessCount {
  sixth: number;
  fifth: number;
  fourth: number;
}

interface SimulationMetrics {
  pityRewardObtainedCount: number;
  failedSixthAttempts: number;
  adjustedSixthRate: number;
}

// const getRollResultnormalSixths = () => {};

interface RollResult {
  obtainedOperator: OperatorResult | null;
  isSuccessOnThisTry: boolean;
  isPickupObtained: boolean;
}

const makeStatistics = (): Statistics => ({
  totalObtained: 0,
  pickupObtained: 0,
});

const makeSimpleTargetOperators = ({
  rarity,
  length,
  gachaGoalCount,
  operatorTypeCallback,
}: {
  rarity: OperatorRarity;
  length: number;
  gachaGoalCount?: number;
  operatorTypeCallback?: (index: number) => 'limited' | 'normal';
}): OperatorResult[] =>
  Array.from({ length }, (_, index) => ({
    index,
    name: '',
    id: '',
    rarity,
    currentCount: 0,
    gachaGoalCount: gachaGoalCount ?? 1,
    success: false,
    isFirstObtained: false,
    operatorType: operatorTypeCallback ? operatorTypeCallback(index) : 'normal',
  }));

// 비순수함수
const handleSimplePityRollWin = (obtainedOperator: OperatorResult, result: RollResult) => {
  obtainedOperator.currentCount++;
  obtainedOperator.isFirstObtained = true;
  if (obtainedOperator.currentCount >= obtainedOperator.gachaGoalCount)
    obtainedOperator.success = true;
  if (obtainedOperator.currentCount === obtainedOperator.gachaGoalCount)
    result.isSuccessOnThisTry = true;
  result.obtainedOperator = obtainedOperator;
};

const executeSimplePityRoll = ({
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
  const result: RollResult = {
    obtainedOperator: null,
    isSuccessOnThisTry: false,
    isPickupObtained: false,
  };
  if (isPityReached && pityRewardOperators) {
    // 천장일 시
    if (logging) console.log('천장');
    // ㅇㅇㅇㅇㅇㅇㅇ여기 로직 이미 있는 거 제외하고 애초에 굴려야함
    const pityRoll = Math.random() * 100;
    const PickupChanceByEachReward = 100 / pityRewardOperators.length;
    for (const [ci, pityRewardOperator] of pityRewardOperators.entries()) {
      if (
        pityRoll < PickupChanceByEachReward * (ci + 1) &&
        pityRoll >= PickupChanceByEachReward * ci
      ) {
        // 천장시 확률을 픽업 캐릭터 수만큼 나눈 뒤
        // 각 캐릭터가 자신의 구간에서 당첨됐을 시
        handleSimplePityRollWin(pityRewardOperator, result);
        break;
      }
    }
  } else {
    // 천장이 아닐 시
    const nonePityRoll = Math.random() * 100;
    if (nonePityRoll < pickupChance) {
      // 픽업 당첨
      result.isPickupObtained = true;
      if (logging) console.log('픽업 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', nonePityRoll);
      for (const [ci, targetOperator] of targetOperators.entries()) {
        if (
          nonePityRoll < pickupChanceByEach * (ci + 1) &&
          nonePityRoll >= pickupChanceByEach * ci
        ) {
          // 픽업확률을 픽업 캐릭터 수만큼 나눈 뒤
          // 각 캐릭터가 자신의 구간에서 당첨됐을 시
          if (logging)
            console.log('목표 픽업 당첨', '/ 번호 :', ci, '/ 이름 :', targetOperator.name);
          handleSimplePityRollWin(targetOperator, result);
          break;
        }
      }
      if (nonePityRoll > pickupChanceByEach * targetOperators.length) {
        if (logging) console.log('비목표 픽업 당첨');
      }
    } else {
      // 픽뚫 당첨
      if (logging) console.log('픽뚫 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', nonePityRoll);
    }
  }
  // if (logging) console.log(result.sixth, result);
  return result;
};

const updateSimpleResult = ({
  result,
  rollResult,
  successCount,
  stringRarity,
  pityContext,
}: {
  result: SimpleBannerResult;
  rollResult: RollResult;
  successCount: SuccessCount;
  stringRarity: OperatorRarityForString;
  pityContext?: { isPityReached: boolean; simulationMetrics: SimulationMetrics };
}) => {
  const currentOperators = result.operators[stringRarity];
  if (rollResult.obtainedOperator) {
    const { index } = rollResult.obtainedOperator;
    currentOperators.targetOperators[index] = rollResult.obtainedOperator;
    if (rollResult.isSuccessOnThisTry) successCount[stringRarity]++;
  }
  if (pityContext && pityContext.isPityReached)
    pityContext.simulationMetrics.pityRewardObtainedCount++;
  if (rollResult.isPickupObtained) currentOperators.statistics.pickupObtained++;
};

const calculateOrundum = (
  simulationConfig: {
    orundum: number;
    isSimpleMode: boolean;
    isGachaSim: boolean;
  },
  additionalResource: {
    simpleMode: number;
    extendedMode: number;
  },
) => {
  const { isGachaSim, isSimpleMode } = simulationConfig;
  if (!isGachaSim) {
    const additionalOrundum = isSimpleMode
      ? additionalResource.simpleMode
      : additionalResource.extendedMode;
    simulationConfig.orundum += additionalOrundum;
  }
};

// 재화 소모 시뮬레이션에 필요한 로직은 합성옥 더하기 뺴기일 뿐이니
// 아무래도 시뮬레이션 종류보다는 기본-세부옵션 차이로 나누는 게 좋을 것 같음
const gachaRateSimulate = ({
  pickupDatas,
  gachaGoal,
  isGachaSim,
  isSimpleMode,
  simulationRuns,
}: {
  pickupDatas: Dummy[];
  gachaGoal: 'allFirst' | 'allMax' | null;
  isSimpleMode: boolean;
  isGachaSim: boolean;
  simulationRuns: number;
}) => {
  const sixthRate = 2;
  const fifthRate = 8;
  const fourthRate = 50;
  const globalGachaGoalCount = gachaGoal === 'allMax' ? 6 : gachaGoal === 'allFirst' ? 1 : null;
  const simulationConfig = { orundum: 100000, isSimpleMode, isGachaSim };
  // gachasim에서만 쓰이는 result 재화소모 시뮬레이션에서는 어디서 실패했는지 같은 정보가 더 필요
  // 여기에 재화 소모 시뮬레이션 버전까지 합친 뒤에 가챠 확률 시뮬레이션에서는 해당 프로퍼티를 안쓰는 걸로?
  // 최소 경우 최대 경우 식으로 툭 튀는 기록들 보관할지?
  // 그래프로도 만들 수 있게?
  // maxAttempts 2000 제한
  // 천장 보상은 무조건 0번 6성

  // 디테일 가챠에서 최소값 제한이나 첫 6성 같은 옵션도 구현되게 만들어야 함
  // 성능 문제도 살짝 더 생각해보자
  console.log(
    '전체 가챠 목표 :',
    gachaGoal,
    '가챠 시뮬레이션 :',
    isGachaSim,
    '심플 모드 :',
    isSimpleMode,
  );

  const simulationResult = {
    total: {
      simulationRuns,
      successCount: 0,
    },
    perBanner: pickupDatas.map(({ id, name, active }) => ({
      id,
      name,
      active,
      successCount: 0,
      totalRuns: 0,
      sixth: { totalObtained: 0, pickupObtained: 0, targetObtained: 0 },
      fifth: { totalObtained: 0, pickupObtained: 0, targetObtained: 0 },
      fourth: { totalObtained: 0, pickupObtained: 0, targetObtained: 0 },
    })),
  };
  for (let ti = 0; ti < simulationRuns; ti++) {
    let singleSimulationSuccessCount = 0;
    for (let di = 0; di < pickupDatas.length; di++) {
      const {
        id,
        additionalResource,
        gachaType,
        maxGachaAttempts,
        name,
        operators,
        pickupDetails: { pickupChance, pickupOpersCount, targetOpersCount, simpleMode },
      } = pickupDatas[di];
      calculateOrundum(simulationConfig, additionalResource);
      const pity = pities[gachaType];
      const simulationMetrics: SimulationMetrics = {
        pityRewardObtainedCount: 0,
        failedSixthAttempts: 0,
        adjustedSixthRate: 0 + sixthRate,
      };
      const gachaAttemptsLimit = isSimpleMode ? 2000 : maxGachaAttempts;
      const newPickupOpersCount = isSimpleMode ? simpleMode.pickupOpersCount : pickupOpersCount;
      const newTargetOpersCount = isSimpleMode ? simpleMode.targetOpersCount : targetOpersCount;
      // 비용 줄일 수 있나?
      const targetOperators = isSimpleMode
        ? {
            sixth: makeSimpleTargetOperators({
              rarity: 6,
              length: newTargetOpersCount.sixth,
              gachaGoalCount: globalGachaGoalCount ?? 1,
              operatorTypeCallback: (index) =>
                (gachaType === 'collab' || gachaType === 'limited') && index === 0
                  ? 'limited'
                  : 'normal',
            }),
            fifth: makeSimpleTargetOperators({
              rarity: 5,
              length: newTargetOpersCount.fifth,
              operatorTypeCallback: (index) =>
                gachaType === 'collab' && index < 2 ? 'limited' : 'normal',
            }),
            fourth: makeSimpleTargetOperators({
              rarity: 4,
              length: newTargetOpersCount.fourth,
            }),
          }
        : operators.reduce<Record<OperatorRarityForString, OperatorResult[]>>(
            (acc, current) => {
              const { currentQty, name, operatorId, operatorType, rarity, targetCount } = current;
              const gachaGoalCount = globalGachaGoalCount ?? targetCount;
              const stringRarity = rarities[rarity];
              const newOperator = {
                index: acc[stringRarity].length,
                id: operatorId,
                name,
                currentCount: currentQty,
                gachaGoalCount,
                isFirstObtained: false,
                operatorType,
                rarity,
                success: currentQty >= gachaGoalCount ? true : false,
              };
              return { ...acc, [stringRarity]: [...acc[stringRarity], newOperator] };
            },
            { sixth: [], fifth: [], fourth: [] },
          );
      const result: SimpleBannerResult = {
        id,
        name,
        success: false,
        operators: {
          sixth: {
            targetOperators: targetOperators.sixth,
            statistics: makeStatistics(),
          },
          fifth: {
            targetOperators: targetOperators.fifth,
            statistics: makeStatistics(),
          },
          fourth: {
            targetOperators: targetOperators.fourth,
            statistics: makeStatistics(),
          },
        },
        totalRuns: 0,
      };
      const { sixth, fifth, fourth } = result.operators;
      const pityRewardOperator = sixth.targetOperators[0];
      const successCount: SuccessCount = { sixth: 0, fifth: 0, fourth: 0 };
      for (let i = 0; i < gachaAttemptsLimit; i++) {
        if (!isGachaSim) {
          if (simulationConfig.orundum < 600) break;
          result.totalRuns = i + 1;
          simulationConfig.orundum -= 600;
        }
        if (simulationMetrics.failedSixthAttempts >= 50) {
          // 연속 실패횟수 50번 부터 확률 2%씩 증가
          simulationMetrics.adjustedSixthRate =
            sixthRate + sixthRate * (simulationMetrics.failedSixthAttempts - 49);
        } else {
          simulationMetrics.adjustedSixthRate = sixthRate;
        }
        if (gachaType === 'limited' && i === pity) {
          // 한정 천장 달성 시 가챠와 별개로 확률업 한정 1개 증정
          if (logging) console.log('한정 300천장');
          pityRewardOperator.currentCount++;
          sixth.statistics.pickupObtained++;
          sixth.statistics.totalObtained++;
          if (pityRewardOperator.currentCount >= pityRewardOperator.gachaGoalCount)
            pityRewardOperator.success = true;
          if (pityRewardOperator.currentCount === pityRewardOperator.gachaGoalCount)
            successCount.sixth++;
        }
        const isCollabPityReached =
          gachaType === 'collab' && !sixth.targetOperators[0].isFirstObtained && i === pity;
        const roll = Math.random() * 100;
        if (
          sixth.targetOperators.length > 0 &&
          (roll < simulationMetrics.adjustedSixthRate || isCollabPityReached)
        ) {
          // 6성 당첨
          if (logging) console.log('6성 당첨');
          const pickupChanceByEach = pickupChance / newPickupOpersCount.sixth;
          const stringRarity: OperatorRarityForString = 'sixth';
          const { targetOperators } = sixth;
          sixth.statistics.totalObtained++;
          simulationMetrics.failedSixthAttempts = 0;
          if (newTargetOpersCount.sixth > 0) {
            switch (gachaType) {
              case 'collab':
                {
                  const collabPity = pities[gachaType];
                  const pityRewardOperator = sixth.targetOperators[0];
                  const rollResult = executeSimplePityRoll({
                    targetOperators,
                    isPityReached: !pityRewardOperator.isFirstObtained && i === collabPity,
                    pickupChance,
                    pickupChanceByEach,
                    pityRewardOperators: [pityRewardOperator],
                  });
                  updateSimpleResult({
                    rollResult,
                    result,
                    successCount,
                    stringRarity,
                  });
                }
                break;
              case 'limited':
                {
                  const rollResult = executeSimplePityRoll({
                    targetOperators,
                    pickupChance,
                    pickupChanceByEach,
                    pityRewardOperators: [sixth.targetOperators[0]],
                  });
                  updateSimpleResult({
                    rollResult,
                    result,
                    successCount,
                    stringRarity,
                  });
                }
                break;
              case 'single':
                {
                  const singlePity = pities[gachaType];
                  const pityRewardOperator = sixth.targetOperators[0];
                  const rollResult = executeSimplePityRoll({
                    targetOperators,
                    isPityReached: !pityRewardOperator.isFirstObtained && i > singlePity,
                    pickupChance,
                    pickupChanceByEach,
                    pityRewardOperators: [pityRewardOperator],
                  });
                  updateSimpleResult({
                    rollResult,
                    result,
                    successCount,
                    stringRarity,
                  });
                }
                break;
              case 'revival':
                {
                  const pityRewardOperators = [
                    sixth.targetOperators[0],
                    sixth.targetOperators[1],
                  ].filter(({ isFirstObtained }) => !isFirstObtained);
                  const pityObtainedCount = simulationMetrics.pityRewardObtainedCount;
                  const isRotationPityReached =
                    pityRewardOperators.length > 0 &&
                    ((i > 149 && pityObtainedCount < 1) || (i > 299 && pityObtainedCount < 2));
                  const rollResult = executeSimplePityRoll({
                    targetOperators,
                    isPityReached: isRotationPityReached,
                    pickupChance,
                    pickupChanceByEach,
                    pityRewardOperators,
                  });
                  updateSimpleResult({
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
                  const rollResult = executeSimplePityRoll({
                    targetOperators,
                    pickupChance,
                    pickupChanceByEach,
                  });
                  updateSimpleResult({
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
          // 6성 미당첨
          simulationMetrics.failedSixthAttempts++;
          if (
            roll < simulationMetrics.adjustedSixthRate + fifthRate &&
            roll >= simulationMetrics.adjustedSixthRate
          ) {
            // 5성 당첨
            if (logging) console.log('5성 당첨');
            const stringRarity: OperatorRarityForString = 'fifth';
            const { targetOperators } = fifth;
            fifth.statistics.totalObtained++;
            if (newTargetOpersCount.fifth > 0) {
              switch (gachaType) {
                case 'collab':
                  {
                    const unObtainedPityRewards = [
                      fifth.targetOperators[0],
                      fifth.targetOperators[1],
                    ].filter(({ isFirstObtained }) => !isFirstObtained);
                    const rollResult = executeSimplePityRoll({
                      targetOperators,
                      pickupChance: 50,
                      pickupChanceByEach: 50 / newPickupOpersCount.fifth,
                      isPityReached: unObtainedPityRewards.length === 1,
                      pityRewardOperators: unObtainedPityRewards,
                    });
                    updateSimpleResult({
                      rollResult,
                      result,
                      successCount,
                      stringRarity,
                    });
                  }
                  break;
                case 'contract':
                  {
                    const rollResult = executeSimplePityRoll({
                      targetOperators,
                      pickupChance: 100,
                      pickupChanceByEach: 100 / newPickupOpersCount.fifth,
                    });
                    updateSimpleResult({
                      rollResult,
                      result,
                      successCount,
                      stringRarity,
                    });
                  }
                  break;
                case 'orient':
                  {
                    const rollResult = executeSimplePityRoll({
                      targetOperators,
                      pickupChance: 60,
                      pickupChanceByEach: 60 / newPickupOpersCount.fifth,
                    });
                    updateSimpleResult({
                      rollResult,
                      result,
                      successCount,
                      stringRarity,
                    });
                  }
                  break;
                default:
                  {
                    const rollResult = executeSimplePityRoll({
                      targetOperators,
                      pickupChance: 50,
                      pickupChanceByEach: 50 / newPickupOpersCount.fifth,
                    });
                    updateSimpleResult({
                      rollResult,
                      result,
                      successCount,
                      stringRarity,
                    });
                  }
                  break;
              }
            }
          } else if (
            roll < simulationMetrics.adjustedSixthRate + fifthRate + fourthRate &&
            roll >= simulationMetrics.adjustedSixthRate + fifthRate
          ) {
            // 4성 당첨
            if (logging) console.log('4성 당첨');
            const stringRarity: OperatorRarityForString = 'fourth';
            const { targetOperators } = fourth;
            fourth.statistics.totalObtained++;
            if (newTargetOpersCount.fourth > 0) {
              const rollResult = executeSimplePityRoll({
                targetOperators,
                pickupChance: 20,
                pickupChanceByEach: 20 / newPickupOpersCount.fourth,
              });
              updateSimpleResult({
                rollResult,
                result,
                successCount,
                stringRarity,
              });
            }
          } else {
            // 3성 당첨
            if (logging) console.log('3성 당첨');
          }
        }
        if (logging)
          console.log(
            '시행횟수 :',
            i + 1,
            '성공 횟수 :',
            successCount.sixth,
            '6성 확률 :',
            simulationMetrics.adjustedSixthRate,
            '픽뚫 횟수',
            result.operators.sixth.statistics.totalObtained -
              result.operators.sixth.statistics.pickupObtained,
            '주사위 눈 :',
            roll,
          );
        if (
          successCount.sixth >= newTargetOpersCount.sixth &&
          successCount.fifth >= newTargetOpersCount.fifth &&
          successCount.fourth >= newTargetOpersCount.fourth
        ) {
          result.totalRuns = i + 1;
          result.success = true;
          break;
        }
      }
      // 가챠 배너 완료시 데이터 정리 부분
      if (logging) console.log('가챠 1회 종료');
      if (result.success) {
        simulationResult.perBanner[di].successCount++;
        singleSimulationSuccessCount++;
      }
      simulationResult.perBanner[di].totalRuns += result.totalRuns;
      const rarityStrings = ['sixth', 'fifth', 'fourth'] as const;
      for (const rarityString of rarityStrings) {
        simulationResult.perBanner[di][rarityString].totalObtained +=
          result.operators.sixth.statistics.totalObtained;
        simulationResult.perBanner[di][rarityString].pickupObtained +=
          result.operators.sixth.statistics.pickupObtained;
        simulationResult.perBanner[di][rarityString].targetObtained += successCount.sixth;
        // 여여여여여여영기 아마도 successCount.sixth 쓰면 안됨 타겟 여러번 획득해도 1임
      }
    }
    // 배너 전부 성공시 총 성공카운트 1증가
    if (singleSimulationSuccessCount === pickupDatas.length) simulationResult.total.successCount++;
  }
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
    },
    {
      operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1msszzzz5q6r',
      name: '리드 더 플레임 섀도우',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
    },
    {
      operatorId: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2sgdfddq6r',
      name: '님프',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
    },
    {
      operatorId: 'c1dxxxf4-gdd6-7i8j-9k0l-1m2sdfsddq6r',
      name: '이네스',
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
      pickupOpersCount: { sixth: 3, fifth: 3, fourth: 0 },
      targetOpersCount: { sixth: 3, fifth: 3, fourth: 0 },
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
    },
    {
      operatorId: 'c1d2e3f4-xxxx-7i8j-9k0l-1m2n3oxx5q6r',
      name: '미스미 우이카',
      currentQty: 0,
      operatorType: 'limited',
      targetCount: 1,
      rarity: 5,
    },
    {
      operatorId: 'c1dxxxf4-g5h6-7i8j-9k0l-1m2n3oxx5q6r',
      name: '와카바 무츠미',
      currentQty: 0,
      operatorType: 'limited',
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
      pickupOpersCount: { sixth: 2, fifth: 1, fourth: 0 },
      targetOpersCount: { sixth: 2, fifth: 1, fourth: 0 },
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
    },
  ],
  pickupDetails: {
    pickupOpersCount: { sixth: 1, fifth: 0, fourth: 0 },
    targetOpersCount: { sixth: 1, fifth: 0, fourth: 0 },
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

// revival => rotation
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
  gachaType: 'revival',
  operators: [
    {
      operatorId: 'a1b2c3d4-e5f6-7g8h-9i0j-1k2l3ccc5o6p',
      name: '이네스',
      currentQty: 2,
      operatorType: 'normal',
      targetCount: 6,
      rarity: 6,
    },
    {
      operatorId: 'b1c2d3e4-f5g6-7h8i-9j0k-1ddm3n4o5p6q',
      name: '페넌스',
      currentQty: 0,
      operatorType: 'normal',
      targetCount: 1,
      rarity: 6,
    },
  ],
  pickupDetails: {
    pickupOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
    targetOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
    pickupChance: 50,
    simpleMode: {
      pickupOpersCount: { sixth: 2, fifth: 3, fourth: 0 },
      targetOpersCount: { sixth: 2, fifth: 3, fourth: 0 },
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
        isGachaSim,
        isSimpleMode,
        gachaGoal,
        initialResource,
        maxSimulation,
        probability,
        showBannerImage,
        threshold,
      },
    },
  } = e.data;
  // console.log('[Worker] 메인으로부터 데이터 수신:', pickupDatas);
  if (type !== 'start') return;
  console.log('시뮬레이션 시작');
  const testArray1 = [
    contractDummy,
    orientDummy,
    collabDummy,
    limitedDummy,
    singleDummy,
    rotationDummy,
  ];
  const testArray2 = [limitedDummy];
  const startTime = performance.now();
  const result = gachaRateSimulate({
    pickupDatas: testArray2,
    gachaGoal,
    isSimpleMode,
    isGachaSim,
    simulationRuns: testTryCount,
  });
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;

  console.log(`걸린 시간: ${elapsedTime} 밀리초`);

  const { total, perBanner } = result;
  const expectedValues = perBanner.map(({ totalRuns, successCount }) => totalRuns / successCount);

  console.log(
    `전체 시뮬레이션 횟수 :`,
    total.simulationRuns,
    `성공한 시뮬레이션 횟수 :`,
    total.successCount,
    '개별 통계 :',
    JSON.stringify(perBanner, null, 2),
    '개별 배너 성공 기대값 :',
    expectedValues,
  );

  (self as unknown as Worker).postMessage({
    type: 'done',
    result,
  });
};
