import { Dummy, WorkerInput } from '#/components/PickupList';
import { GachaType, OperatorRarityForString, OperatorType } from '#/types/types';

export default {} as typeof Worker & { new (): Worker };

interface OperatorResult {
  index: number;
  currentCount: number;
  targetCount: number;
  success: boolean;
  isFirstObtained: boolean;
  operatorType: OperatorType;
}

interface SimpleBannerResult {
  id: string;
  name: string;
  success: boolean;
  bannerResults: Record<OperatorRarityForString, OperatorResult[]>;
  statistics: {
    totalRuns: number;
    sixthObtained: number;
    sixthFailed: number;
    pickupObtained: number;
    offBannerHits: number;
  };
}

interface SuccessCount {
  sixth: number;
  fifth: number;
  fourth: number;
}

interface SimulationMetrics {
  isPityRewardFirstObtained: boolean;
  pityRewardObtainedCount: number;
  failedSixthAttempts: number;
  adjustedSixthRate: number;
}

// const getRollResultnormalSixths = () => {};

interface RollResult {
  sixth: OperatorResult | null;
  isSuccessOnThisTry: boolean;
  isOffBannerHits: boolean;
  isPityRewardFirstObtained: boolean;
}

const updateSimpleResult = ({
  simpleBannerResult,
  rollResult,
  successCount,
  simulationMetrics,
  isPityReached,
}: {
  simpleBannerResult: SimpleBannerResult;
  rollResult: RollResult;
  successCount: SuccessCount;
  simulationMetrics: SimulationMetrics;
  isPityReached?: boolean;
}) => {
  if (rollResult.sixth) {
    const { index } = rollResult.sixth;
    simpleBannerResult.bannerResults.sixth[index] = rollResult.sixth;
  }
  if (rollResult.isPityRewardFirstObtained) simulationMetrics.isPityRewardFirstObtained = true;
  if (isPityReached) simulationMetrics.pityRewardObtainedCount++;
  if (rollResult.isOffBannerHits) simpleBannerResult.statistics.offBannerHits++;
  if (!rollResult.isOffBannerHits) simpleBannerResult.statistics.pickupObtained++;
  if (rollResult.isSuccessOnThisTry) successCount.sixth++;
};

// 비순수함수
const handleSimplePityRollWin = (
  pityRewardOperator: OperatorResult,
  result: RollResult,
  gachaGoalCount: number,
) => {
  pityRewardOperator.currentCount++;
  pityRewardOperator.isFirstObtained = true;
  if (pityRewardOperator.currentCount >= gachaGoalCount) pityRewardOperator.success = true;
  if (pityRewardOperator.currentCount === gachaGoalCount) result.isSuccessOnThisTry = true;
  result.sixth = pityRewardOperator;
};

const executeSimplePityRoll = ({
  targetSixths,
  pityRewardOperators,
  isPityReached,
  isPityRewardFirstObtained,
  pickupChance,
  pickupChanceByEach,
  gachaGoalCount,
}: {
  targetSixths: OperatorResult[];
  pityRewardOperators: OperatorResult[];
  isPityReached?: boolean;
  isPityRewardFirstObtained: boolean;
  pickupChance: number;
  pickupChanceByEach: number;
  gachaGoalCount: number;
}) => {
  const result: RollResult = {
    sixth: null,
    isSuccessOnThisTry: false,
    isOffBannerHits: false,
    isPityRewardFirstObtained,
  };

  if (isPityReached) {
    // 천장일 시
    // console.log('천장');
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
        handleSimplePityRollWin(pityRewardOperator, result, gachaGoalCount);
        break;
      }
    }
  } else {
    // 천장이 아닐 시
    const nonePityRoll = Math.random() * 100;
    if (nonePityRoll < pickupChance) {
      // 픽업 당첨
      // console.log('픽업 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', nonePityRoll);
      for (const [ci, targetOperator] of targetSixths.entries()) {
        if (
          nonePityRoll < pickupChanceByEach * (ci + 1) &&
          nonePityRoll >= pickupChanceByEach * ci
        ) {
          // 픽업확률을 픽업 캐릭터 수만큼 나눈 뒤
          // 각 캐릭터가 자신의 구간에서 당첨됐을 시
          if (ci === 0 && !isPityRewardFirstObtained) result.isPityRewardFirstObtained = true;
          handleSimplePityRollWin(targetOperator, result, gachaGoalCount);
          break;
        }
      }
    } else {
      // 픽뚫 당첨
      // console.log('픽뚫 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', nonePityRoll);
      result.isOffBannerHits = true;
    }
  }
  // console.log(result.sixth, result);
  return result;
};

const gachaRateSimulate = (
  pickupDatas: Dummy[],
  isSimpleMode: boolean,
  gachaGoal: 'allFirst' | 'allMax' | null,
) => {
  const sixthRate = 2;
  const fifthRate = 8;
  const fourthRate = 50;
  return pickupDatas.map(
    ({
      id,
      additionalResource,
      firstSixthTry,
      gachaType,
      maxGachaAttempts,
      minGachaAttempts,
      name,
      operators,
      pickupDetails: { pickupChance, pickupOpersCount, targetOpersCount, simpleMode },
    }) => {
      // collab 120연차 천장
      // limited 300천장 30% 픽뚫 있음
      // single 150연차 다음 6성 천장 50% 픽뚫 있음
      // revival 150연차 다음 6성 천장 300연차 다음 안나온 6성 천장 50% 픽뚫 있음
      // contract 4중 픽뚫 없음
      // orient 지정 6성 3개 픽뚫 없음
      const pities = {
        collab: 119,
        limited: 299,
        single: 149,
        revival: [149, 299],
        contract: null,
        orient: null,
      } as const;
      const pity = pities[gachaType];
      const simulationMetrics: SimulationMetrics = {
        isPityRewardFirstObtained: false,
        pityRewardObtainedCount: 0,
        failedSixthAttempts: 0,
        adjustedSixthRate: 0 + sixthRate,
      };
      if (isSimpleMode) {
        const targetCount = gachaGoal === 'allMax' ? 6 : 1;
        const { pickupOpersCount, targetOpersCount } = simpleMode;
        const pickupChanceByEach = pickupChance / pickupOpersCount.sixth;
        const simpleBannerResult: SimpleBannerResult = {
          id,
          name,
          success: false,
          bannerResults: {
            sixth: Array.from({ length: targetOpersCount.sixth }, (_, index) => ({
              index,
              currentCount: 0,
              targetCount,
              success: false,
              isFirstObtained: false,
              operatorType:
                (gachaType === 'collab' || gachaType === 'limited') && index === 0
                  ? 'limited'
                  : 'normal',
            })),
            fifth: Array.from({ length: targetOpersCount.fifth }, (_, index) => ({
              index,
              currentCount: 0,
              targetCount: 1,
              success: false,
              isFirstObtained: false,
              operatorType: 'normal',
            })),
            fourth: Array.from({ length: targetOpersCount.fourth }, (_, index) => ({
              index,
              currentCount: 0,
              targetCount: 1,
              success: false,
              isFirstObtained: false,
              operatorType: 'normal',
            })),
          },
          statistics: {
            totalRuns: 0,
            sixthObtained: 0,
            sixthFailed: 0,
            pickupObtained: 0,
            offBannerHits: 0,
          },
        };
        const targetSixths = simpleBannerResult.bannerResults.sixth;
        const pityRewardOperator = targetSixths[0];
        const successCount: SuccessCount = { sixth: 0, fifth: 0, fourth: 0 };
        for (let i = 0; i < maxGachaAttempts; i++) {
          const { isPityRewardFirstObtained } = simulationMetrics;
          if (simulationMetrics.failedSixthAttempts >= 50) {
            // 연속 실패횟수 50번 부터 확률 2%씩 증가
            simulationMetrics.adjustedSixthRate =
              sixthRate + sixthRate * (simulationMetrics.failedSixthAttempts - 49);
          } else {
            simulationMetrics.adjustedSixthRate = sixthRate;
          }
          if (gachaType === 'limited' && i === pity) {
            // console.log('한정 천장');
            simulationMetrics.isPityRewardFirstObtained = true;
            pityRewardOperator.currentCount++;
            simpleBannerResult.statistics.pickupObtained++;
            if (pityRewardOperator.currentCount >= targetCount) pityRewardOperator.success = true;
            if (pityRewardOperator.currentCount === targetCount) successCount.sixth++;
          }
          const roll = Math.random() * 100;
          if (
            roll < simulationMetrics.adjustedSixthRate ||
            (gachaType === 'collab' && !isPityRewardFirstObtained && i === pity)
          ) {
            // 6성 당첨
            simulationMetrics.failedSixthAttempts = 0;
            simpleBannerResult.statistics.sixthObtained++;
            switch (gachaType) {
              case 'collab':
                {
                  const collabPity = pities[gachaType];
                  const rollResult = executeSimplePityRoll({
                    targetSixths,
                    isPityReached: !isPityRewardFirstObtained && i === collabPity,
                    pickupChance,
                    pickupChanceByEach,
                    gachaGoalCount: targetCount,
                    isPityRewardFirstObtained,
                    pityRewardOperators: [targetSixths[0]],
                  });
                  updateSimpleResult({
                    rollResult,
                    simpleBannerResult,
                    simulationMetrics,
                    successCount,
                  });
                }
                break;
              case 'limited':
                {
                  const rollResult = executeSimplePityRoll({
                    targetSixths,
                    pickupChance,
                    pickupChanceByEach,
                    gachaGoalCount: targetCount,
                    isPityRewardFirstObtained,
                    pityRewardOperators: [targetSixths[0]],
                  });
                  updateSimpleResult({
                    rollResult,
                    simpleBannerResult,
                    simulationMetrics,
                    successCount,
                  });
                }
                break;
              case 'single':
                {
                  const singlePity = pities[gachaType];
                  const rollResult = executeSimplePityRoll({
                    targetSixths,
                    isPityReached: !isPityRewardFirstObtained && i > singlePity,
                    pickupChance,
                    pickupChanceByEach,
                    gachaGoalCount: targetCount,
                    isPityRewardFirstObtained,
                    pityRewardOperators: [targetSixths[0]],
                  });
                  updateSimpleResult({
                    rollResult,
                    simpleBannerResult,
                    simulationMetrics,
                    successCount,
                  });
                }
                break;
              case 'revival':
                {
                  const currentPityRewards = [targetSixths[0], targetSixths[1]].filter(
                    ({ isFirstObtained }) => !isFirstObtained,
                  );
                  const pityObtainedCount = simulationMetrics.pityRewardObtainedCount;
                  const isRotationPityReached =
                    currentPityRewards.length > 0 &&
                    ((i > 149 && pityObtainedCount < 1) || (i > 299 && pityObtainedCount < 2));
                  const rollResult = executeSimplePityRoll({
                    targetSixths,
                    isPityReached: isRotationPityReached,
                    pickupChance,
                    pickupChanceByEach,
                    gachaGoalCount: targetCount,
                    isPityRewardFirstObtained,
                    pityRewardOperators: currentPityRewards,
                  });
                  updateSimpleResult({
                    rollResult,
                    simpleBannerResult,
                    simulationMetrics,
                    successCount,
                    isPityReached: isRotationPityReached,
                  });
                }
                break;
              default:
                break;
            }
          } else {
            // 6성 미당첨
            simulationMetrics.failedSixthAttempts++;
            simpleBannerResult.statistics.sixthFailed++;
            if (
              roll < simulationMetrics.adjustedSixthRate + fifthRate &&
              roll >= simulationMetrics.adjustedSixthRate
            ) {
              // 5성 당첨
            } else if (
              roll < simulationMetrics.adjustedSixthRate + fifthRate + fourthRate &&
              roll >= simulationMetrics.adjustedSixthRate + fifthRate
            ) {
              // 4성 당첨
            }
          }
          /*           console.log(
            '시행횟수 :',
            i + 1,
            '성공 횟수 :',
            successCount.sixth,
            '6성 확률 :',
            simulationMetrics.adjustedSixthRate,
            '픽뚫 횟수',
            simpleBannerResult.statistics.offBannerHits,
            '주사위 눈 :',
            roll,
          ); */
          if (successCount.sixth >= simpleMode.targetOpersCount.sixth) {
            simpleBannerResult.statistics.totalRuns = i + 1;
            simpleBannerResult.success = true;
            return simpleBannerResult;
          }
        }
      } else {
        for (let i = 0; i < maxGachaAttempts; i++) {
          const roll = Math.random();
          if (roll < sixthRate) {
          } else if (roll < sixthRate + fifthRate && roll >= sixthRate) {
          } else if (roll < sixthRate + fifthRate + fourthRate && roll >= sixthRate + fifthRate) {
          } else {
          }
        }
      }
      // return { id, name, success: true, gainedOperators: [], totalRuns };
    },
  );
};

/**
 * 예상
 *
 * 기대값(평균): 60.8 회
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
  firstSixthTry: false,
  additionalResource: { simpleMode: 0, extendedMode: 0 },
  active: true,
};

/**
 * 예상
 *
 * 기대값(평균): 145 회, 천장 없을 시 148.3회
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
      pickupOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
      targetOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
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
 * 기대값(평균): 66.1 회, 천장 없을 시 69.2회
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
      pickupOpersCount: { sixth: 1, fifth: 0, fourth: 0 },
      targetOpersCount: { sixth: 1, fifth: 0, fourth: 0 },
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
 * 기대값(평균): 149 회, 천장 없을 시 207.6회
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
      pickupOpersCount: { sixth: 2, fifth: 0, fourth: 0 },
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

  const testTryCount = 300000;

  const startTime = performance.now();
  const result = gachaRateSimulate(
    Array.from({ length: testTryCount }, () => limitedDummy),
    isSimpleMode,
    gachaGoal,
  );
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;

  console.log(`걸린 시간: ${elapsedTime} 밀리초`);

  const statistics = result.reduce(
    (sum, item) => ({
      totalRuns: sum.totalRuns + item!.statistics.totalRuns,
      sixthObtained: sum.sixthObtained + item!.statistics.sixthObtained,
      sixthFailed: sum.sixthFailed + item!.statistics.sixthFailed,
      pickupObtained: sum.pickupObtained + item!.statistics.pickupObtained,
      offBannerHits: sum.offBannerHits + item!.statistics.offBannerHits,
    }),
    {
      totalRuns: 0,
      sixthObtained: 0,
      sixthFailed: 0,
      pickupObtained: 0,
      offBannerHits: 0,
    },
  );

  console.log(
    '6성 등장 확률 :',
    (statistics.sixthObtained / statistics.totalRuns) * 100,
    '픽업 확률 :',
    (statistics.pickupObtained / statistics.sixthObtained) * 100,
    '평균 가챠 횟수 :',
    statistics.totalRuns / testTryCount,
  );
  console.log(statistics);

  (self as unknown as Worker).postMessage({
    type: 'done',
    result,
  });
  /*   const { isPickup, totalRuns } = GachaRateSimulate([test], true, null);

  console.log('결과:', isPickup, totalRuns);

  (self as unknown as Worker).postMessage({
    type: 'done',
    result: { totalRuns, isPickup },
  }); */
  /*   let totalDraws = 0;
  let totalSSR = 0;
  let totalSR = 0;
  let totalR = 0;

  let result = Array.from({ length: pickupDatas.length }, (_, index) => ({
    index,
    sixth,
  }));

  for (let i = 0; i < totalRuns; i++) {
    totalDraws++;

    const roll = Math.random();
    if (roll < rates.ssr) totalSSR++;
    else if (roll < rates.ssr + rates.sr) totalSR++;
    else totalR++;

    if (i % 200 === 0) {
      (self as unknown as Worker).postMessage({
        type: 'progress',
        progress: Math.floor((i / totalRuns) * 100),
      });
    }
  }

  (self as unknown as Worker).postMessage({
    type: 'done',
    result: { totalDraws, totalSSR, totalSR, totalR },
  }); */
};
