/* eslint-disable prefer-const */
import {
  Dummy,
  InitialInputs,
  Operator,
  rarities,
  SimulationOptions,
  WorkerInput,
} from '#/components/PickupList';
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
  totalRuns: number;
  bannerResults: Record<OperatorRarityForString, OperatorResult[]>;
}

// const getRollResultnormalSixths = () => {};

const executeSimplePityRoll = ({
  initialTargetSixths,
  isPityReached,
  isPityRewardObtained,
  pickupChance,
  pickupChanceByEach,
  gachaGoalCount,
}: {
  initialTargetSixths: OperatorResult[];
  isPityReached: boolean;
  isPityRewardObtained: boolean;
  pickupChance: number;
  pickupChanceByEach: number;
  gachaGoalCount: number;
}) => {
  const result = {
    sixths: structuredClone(initialTargetSixths),
    isSuccessOnThisTry: false,
    isOffBannerHits: false,
    isPityRewardObtained,
  };
  if (isPityReached) {
    // 천장일 시
    console.log('천장');
    const pityRewardOperator = result.sixths[0];
    result.isPityRewardObtained = true;
    result.sixths[0].count++;
    if (pityRewardOperator.count >= gachaGoalCount) {
      pityRewardOperator.success = true;
    }
    if (pityRewardOperator.count === gachaGoalCount) {
      result.isSuccessOnThisTry = true;
    }
  } else {
    // 천장이 아닐 시
    const roll = Math.random() * 100;
    if (roll < pickupChance) {
      // 픽업 당첨
      console.log('픽업 당첨');
      for (const [ci, currentOperator] of result.sixths.entries()) {
        if (roll < pickupChanceByEach * (ci + 1) && roll >= pickupChanceByEach * ci) {
          // 픽업확률을 픽업 캐릭터 수만큼 나눈 뒤
          // 각 캐릭터가 자신의 구간에서 당첨됐을 시
          if (ci === 0) {
            result.isPityRewardObtained = true;
          }
          currentOperator.count++;
          if (currentOperator.count >= gachaGoalCount) {
            currentOperator.success = true;
          }
          if (currentOperator.count === gachaGoalCount) {
            result.isSuccessOnThisTry = true;
          }
        }
      }
    } else {
      // 픽뚫 당첨
      console.log('픽뚫 당첨');
      result.isOffBannerHits = true;
    }
  }
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
      pickupDetails,
    }) => {
      const sixthRate = 2;
      const fifthRate = 8;
      const fourthRate = 50;
      let totalRuns = 0;
      let offBannerHits = 0;
      let isPityReached = false;
      let isPityRewardObtained = false;
      let failedSixthAttempts = 0;
      let adjustedSixthRate = 0 + sixthRate;
      // collab 120연차 천장
      // limited 300천장 30% 픽뚫 있음
      // single 150연차 다음 6성 천장 50%픽뚫 있음
      // revival 50% 픽뚫 있음
      // contract 4중 픽뚫 없음
      // orient 지정 6성 3개 픽뚫 없음
      const pity: Record<GachaType, number | null> = {
        collab: 119,
        limited: 299,
        single: 150,
        contract: null,
        orient: null,
        revival: null,
      };
      if (isSimpleMode) {
        const targetCount = gachaGoal === 'allMax' ? 6 : 1;
        const { pickupOpersCount, targetOpersCount } = pickupDetails.simpleMode;
        const pickupChance = pickupDetails.pickupChance;
        const pickupChanceByEach = pickupDetails.pickupChance / pickupOpersCount.sixth;
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
          totalRuns,
        };
        const targetSixths = simpleBannerResult.bannerResults.sixth;
        // 성공 시도 따로 기록하는 게 성능적으론 좋지만 그냥 배열 메서드 돌리는 것도 고려
        const successCount = { sixth: 0, fifth: 0, fourth: 0 };
        for (let i = 0; i < maxGachaAttempts; i++) {
          const roll = Math.random() * 100;
          isPityReached =
            !isPityRewardObtained && pity[gachaType] && i >= pity[gachaType] ? true : false;
          if (roll < adjustedSixthRate || (isPityReached && gachaType !== 'single')) {
            // 6성 당첨
            console.log('6성 당첨', '확률', adjustedSixthRate);
            adjustedSixthRate = sixthRate;
            failedSixthAttempts = 0;
            switch (gachaType) {
              case 'collab':
                {
                  const rollResult = executeSimplePityRoll({
                    initialTargetSixths: targetSixths,
                    isPityReached,
                    pickupChance,
                    pickupChanceByEach,
                    gachaGoalCount: targetCount,
                    isPityRewardObtained,
                  });
                  /*                   const rollResult = getRollResultLimitedSixths({
                    i,
                    initialOffBannerHits: offBannerHits,
                    initialTargetSixths: targetSixths,
                    pickupChance,
                    pickupChanceByEach,
                    pity: 119,
                    hasGotFirstLimitedSixth: isPityRewardObtained,
                  }); */
                  isPityRewardObtained = rollResult.isPityRewardObtained;
                  simpleBannerResult.bannerResults.sixth = rollResult.sixths;
                  if (rollResult.isOffBannerHits) offBannerHits++;
                  if (rollResult.isSuccessOnThisTry) successCount.sixth++;
                }
                break;
              case 'limited':
                {
                  const rollResult = executeSimplePityRoll({
                    initialTargetSixths: targetSixths,
                    isPityReached,
                    pickupChance,
                    pickupChanceByEach,
                    gachaGoalCount: targetCount,
                    isPityRewardObtained,
                  });
                  /*                   const rollResult = getRollResultLimitedSixths({
                    i,
                    initialOffBannerHits: offBannerHits,
                    initialTargetSixths: targetSixths,
                    pickupChance: pickupDetails.pickupChance,
                    pickupChanceByEach,
                    pity: 299,
                    hasGotFirstLimitedSixth: isPityRewardObtained,
                  }); */
                  isPityRewardObtained = rollResult.isPityRewardObtained;
                  simpleBannerResult.bannerResults.sixth = rollResult.sixths;
                  if (rollResult.isOffBannerHits) offBannerHits++;
                  if (rollResult.isSuccessOnThisTry) successCount.sixth++;
                }
                break;
              case 'single':
                {
                  const rollResult = executeSimplePityRoll({
                    initialTargetSixths: targetSixths,
                    isPityReached: !isPityRewardObtained && i > 149,
                    pickupChance,
                    pickupChanceByEach,
                    gachaGoalCount: targetCount,
                    isPityRewardObtained,
                  });
                  isPityRewardObtained = rollResult.isPityRewardObtained;
                  simpleBannerResult.bannerResults.sixth = rollResult.sixths;
                  if (rollResult.isOffBannerHits) {
                    offBannerHits++;
                  }
                  if (rollResult.isSuccessOnThisTry) {
                    successCount.sixth++;
                  }
                }
                break;
              default:
                break;
            }
          } else {
            // 6성 미당첨
            failedSixthAttempts++;
            if (failedSixthAttempts > 49) {
              // 연속 실패횟수 50번 부터 다음 확률 2%씩 증가
              adjustedSixthRate += 2;
            }

            if (roll < adjustedSixthRate + fifthRate && roll >= adjustedSixthRate) {
              // 5성 당첨
            } else if (
              roll < adjustedSixthRate + fifthRate + fourthRate &&
              roll >= adjustedSixthRate + fifthRate
            ) {
              // 4성 당첨
            }
          }
          console.log(
            '시행횟수 :',
            i + 1,
            '성공 횟수 :',
            successCount.sixth,
            '다음 6성 확률 :',
            adjustedSixthRate,
            '픽뚤 횟수',
            offBannerHits,
          );

          if (successCount.sixth >= pickupDetails.simpleMode.targetOpersCount.sixth) {
            simpleBannerResult.totalRuns = i + 1;
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
      // return {id, name, success:, gainedOperators:[],totalRuns }
    },
  );
  // let result = pickupData.operators.map(({}, index) => ({ name: operator. }));
  /* const eachSixthPickupChance =
    pickupData.pickupDetails.pickupChance / 100 / pickupData.pickupDetails.pickupOpersCount.sixth;
  while (true) {
    totalRuns++;
    const roll = Math.random();
    if (roll < sixthRate) {
      sixthRate = 0.02;
      notGetSixth = 0;
      const isPickup = Math.random();
      pickupData.operators.forEach((operator, index) => {
        if (
          isPickup > eachSixthPickupChance * index &&
          isPickup < eachSixthPickupChance * (index + 1)
        ) {
        }
      });
      return { totalRuns, isPickup };
    }
    if (notGetSixth > 50) {
      sixthRate += 0.02;
    }
    notGetSixth++;
  } */
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
  console.log('[Worker] 메인으로부터 데이터 수신:', pickupDatas);
  if (type !== 'start') return;

  const result = gachaRateSimulate(
    Array.from({ length: 1000 }, () => singleDummy),
    isSimpleMode,
    gachaGoal,
  );

  console.log('평균 :', result.reduce((sum, item) => sum + item!.totalRuns, 0) / 1000);

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
