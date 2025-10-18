import { Dummy, WorkerInput } from '#/components/PickupList';
import { GachaType, OperatorRarityForString, OperatorType } from '#/types/types';

export default {} as typeof Worker & { new (): Worker };

interface OperatorResult {
  index: number;
  count: number;
  targetCount: number;
  success: boolean;
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

// const getRollResultnormalSixths = () => {};

interface RollResult {
  sixth: OperatorResult | null;
  isSuccessOnThisTry: boolean;
  isOffBannerHits: boolean;
  isPityRewardFirstObtained: boolean;
}

// 비순수함수
const handleSimplePityRollWin = (
  pityRewardOperator: OperatorResult,
  result: RollResult,
  gachaGoalCount: number,
) => {
  pityRewardOperator.count++;
  if (pityRewardOperator.count >= gachaGoalCount) pityRewardOperator.success = true;
  if (pityRewardOperator.count === gachaGoalCount) result.isSuccessOnThisTry = true;
  result.sixth = pityRewardOperator;
};

const executeSimplePityRoll = ({
  targetSixths,
  isPityReached,
  isPityRewardFirstObtained,
  pickupChance,
  pickupChanceByEach,
  gachaGoalCount,
}: {
  targetSixths: OperatorResult[];
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

  if (isPityReached && !isPityRewardFirstObtained) {
    // 천장일 시
    // console.log('천장');
    const pityRewardOperator = targetSixths[0];
    result.isPityRewardFirstObtained = true;
    handleSimplePityRollWin(pityRewardOperator, result, gachaGoalCount);
  } else {
    // 천장이 아닐 시
    const roll = Math.random() * 100;
    if (roll < pickupChance) {
      // 픽업 당첨
      // console.log('픽업 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', roll);
      for (const [ci, currentOperator] of targetSixths.entries()) {
        if (roll < pickupChanceByEach * (ci + 1) && roll >= pickupChanceByEach * ci) {
          // 픽업확률을 픽업 캐릭터 수만큼 나눈 뒤
          // 각 캐릭터가 자신의 구간에서 당첨됐을 시
          if (ci === 0 && !isPityRewardFirstObtained) result.isPityRewardFirstObtained = true;
          handleSimplePityRollWin(currentOperator, result, gachaGoalCount);
        }
      }
    } else {
      // 픽뚫 당첨
      // console.log('픽뚫 당첨', '/ 확률 :', pickupChance, '주사위 눈 :', roll);
      result.isOffBannerHits = true;
    }
  }
  // console.log(result.sixth, result);
  return result;
};

const getRollResultLimitedSixths = ({
  i,
  initialOffBannerHits,
  initialTargetSixths,
  pickupChance,
  pickupChanceByEach,
  pity,
  hasGotFirstLimitedSixth,
}: {
  i: number;
  initialOffBannerHits: number;
  initialTargetSixths: OperatorResult[];
  pickupChance: number;
  pickupChanceByEach: number;
  pity: number;
  hasGotFirstLimitedSixth: boolean;
}) => {
  const limitedOpersIndex = initialTargetSixths.findIndex(
    ({ operatorType }) => operatorType === 'limited',
  );
  const hasLimitedOperator = limitedOpersIndex >= 0;
  const result = {
    isThisTrySuccess: false,
    isFirstLimitedSixObtained: false,
    sixths: structuredClone(initialTargetSixths),
    offBannerHits: initialOffBannerHits,
  };
  if (i === pity && hasLimitedOperator && !hasGotFirstLimitedSixth) {
    console.log('120 천장');
    // 천장일 시
    const currentOperator = result.sixths[limitedOpersIndex];
    currentOperator.count++;
    if (currentOperator.count >= currentOperator.targetCount) {
      currentOperator.success = true;
    }
    if (currentOperator.count === currentOperator.targetCount) {
      result.isThisTrySuccess = true;
    }
  } else {
    // 천장이 아닐 시
    const collabRoll = Math.random() * 100;
    if (collabRoll < pickupChance) {
      console.log('픽업 당첨');
      // 픽업 당첨
      for (const [ci, currentOperator] of result.sixths.entries()) {
        if (collabRoll < pickupChanceByEach * (ci + 1) && collabRoll >= pickupChanceByEach * ci) {
          // 모든 목표캐릭터에 대해 당첨 여부 확인
          currentOperator.count++;
          if (currentOperator.operatorType === 'limited') {
            result.isFirstLimitedSixObtained = true;
          }
          if (currentOperator.count >= currentOperator.targetCount) {
            currentOperator.success = true;
          }
          if (currentOperator.count === currentOperator.targetCount) {
            result.isThisTrySuccess = true;
          }
        }
      }
    } else {
      console.log('픽뚫 당첨');
      // 픽뚫 당첨
      result.offBannerHits++;
    }
  }
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
      let isPityReached = false;
      let isPityRewardFirstObtained = false;
      let failedSixthAttempts = 0;
      let adjustedSixthRate = 0 + sixthRate;
      // collab 120연차 천장
      // limited 300천장 30% 픽뚫 있음
      // single 150연차 다음 6성 천장 50%픽뚫 있음
      // revival 50% 픽뚫 있음
      // contract 4중 픽뚫 없음
      // orient 지정 6성 3개 픽뚫 없음
      const pities: Record<GachaType, number | null> = {
        collab: 119,
        limited: 299,
        single: 149,
        contract: null,
        orient: null,
        revival: null,
      };
      const pity = pities[gachaType];
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
              count: 0,
              targetCount,
              success: false,
              operatorType:
                (gachaType === 'collab' || gachaType === 'limited') && index === 0
                  ? 'limited'
                  : 'normal',
            })),
            fifth: Array.from({ length: targetOpersCount.fifth }, (_, index) => ({
              index,
              count: 0,
              targetCount: 1,
              success: false,
              operatorType: 'normal',
            })),
            fourth: Array.from({ length: targetOpersCount.fourth }, (_, index) => ({
              index,
              count: 0,
              targetCount: 1,
              success: false,
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
        // 성공 시도 따로 기록하는 게 성능적으론 좋지만 그냥 배열 메서드 돌리는 것도 고려
        const successCount = { sixth: 0, fifth: 0, fourth: 0 };
        const updateBannerResult = (rollResult: RollResult) => {
          if (rollResult.sixth) {
            const { index } = rollResult.sixth;
            simpleBannerResult.bannerResults.sixth[index] = rollResult.sixth;
          }
          if (rollResult.isPityRewardFirstObtained) isPityRewardFirstObtained = true;
          if (rollResult.isOffBannerHits) simpleBannerResult.statistics.pickupObtained++;
          if (!rollResult.isOffBannerHits) simpleBannerResult.statistics.pickupObtained++;
          if (rollResult.isSuccessOnThisTry) successCount.sixth++;
        };

        for (let i = 0; i < maxGachaAttempts; i++) {
          if (failedSixthAttempts >= 50) {
            // 연속 실패횟수 50번 부터 확률 2%씩 증가
            adjustedSixthRate = sixthRate + sixthRate * (failedSixthAttempts - 49);
          } else {
            adjustedSixthRate = sixthRate;
          }
          if (gachaType === 'limited' && i === pity) {
            isPityRewardFirstObtained = true;
            pityRewardOperator.count++;
            simpleBannerResult.statistics.pickupObtained++;
            if (pityRewardOperator.count >= targetCount) pityRewardOperator.success = true;
            if (pityRewardOperator.count === targetCount) successCount.sixth++;
          }
          if (gachaType === 'collab' && !isPityRewardFirstObtained && i === pity) {
            isPityReached = true;
          }
          const roll = Math.random() * 100;
          if (roll < adjustedSixthRate || (isPityReached && gachaType !== 'single')) {
            // 6성 당첨
            failedSixthAttempts = 0;
            simpleBannerResult.statistics.sixthObtained++;
            switch (gachaType) {
              case 'collab':
                {
                  const rollResult = executeSimplePityRoll({
                    targetSixths,
                    isPityReached,
                    pickupChance,
                    pickupChanceByEach,
                    gachaGoalCount: targetCount,
                    isPityRewardFirstObtained,
                  });
                  updateBannerResult(rollResult);
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
                  });
                  updateBannerResult(rollResult);
                }
                break;
              case 'single':
                {
                  const rollResult = executeSimplePityRoll({
                    targetSixths,
                    isPityReached: !isPityRewardFirstObtained && i > 149,
                    pickupChance,
                    pickupChanceByEach,
                    gachaGoalCount: targetCount,
                    isPityRewardFirstObtained,
                  });
                  updateBannerResult(rollResult);
                }
                break;
              default:
                break;
            }
          } else {
            // 6성 미당첨
            failedSixthAttempts++;
            simpleBannerResult.statistics.sixthFailed++;
            if (roll < adjustedSixthRate + fifthRate && roll >= adjustedSixthRate) {
              // 5성 당첨
            } else if (
              roll < adjustedSixthRate + fifthRate + fourthRate &&
              roll >= adjustedSixthRate + fifthRate
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
            adjustedSixthRate,
            '픽뚫 횟수',
            offBannerHits,
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
const revivalDummy: Dummy = {
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

  const startTime = performance.now();
  const result = gachaRateSimulate(
    Array.from({ length: 300000 }, () => limitedDummy),
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
    statistics.totalRuns / 300000,
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
