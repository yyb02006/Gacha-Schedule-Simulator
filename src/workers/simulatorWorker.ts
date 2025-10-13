/* eslint-disable prefer-const */
import { Dummy } from '#/components/PickupList';

export default {} as typeof Worker & { new (): Worker };

interface WorkerInput {
  type: string;
  payload: Dummy[];
}

const test: Dummy = {
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
  firstSixthTry: false,
  additionalResource: { simpleMode: 0, extendedMode: 0 },
  active: true,
};

const collabGacha = () => {
  return;
};

const GachaRateSimulate = (pickupDatas: Dummy[], isSimpleMode: boolean) => {
  const result = pickupDatas.map(
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
      const normalPickupChance = 0.5;
      const limitedPickupChance = 0.7;
      let sixthRate = 0.02;
      let fifthRate = 0.08;
      let fourthRate = 0.5;
      let totalRuns = 0;
      const simpleResult = { id, name, success: false, bannerResults: [], totalRuns };
      // collab 120연차 천장
      // limited 300천장 30% 픽뚫 있음
      // single 150연차 다음 6성 천장 50%픽뚫 있음
      // revival 50% 픽뚫 있음
      // contract 4중 픽뚫 없음
      // orient 지정 6성 3개 픽뚫 없음
      if (isSimpleMode) {
        const { pickupOpersCount, targetOpersCount } = pickupDetails.simpleMode;
        const pickupChanceByEach = pickupDetails.pickupChance / pickupOpersCount.sixth;
        for (let i = 0; i < maxGachaAttempts; i++) {
          const roll = Math.random();
          let adjustedSixthRate = 0 + sixthRate;
          let failedSixthAttempts = 0;

          if (roll < adjustedSixthRate) {
            adjustedSixthRate = sixthRate;
            failedSixthAttempts = 0;
            switch (gachaType) {
              case 'collab':
                {
                  if (i !== 119) {
                    const collabRoll = Math.random();
                    Array.from({ length: targetOpersCount.sixth }, (_, index) => {
                      if (
                        collabRoll < pickupChanceByEach * (index + 1) &&
                        collabRoll >= pickupChanceByEach
                      ) {
                      }
                    });
                    if (collabRoll < pickupDetails.pickupChance / 100) {
                      pickupOpersCount.sixth;
                    } else {
                    }
                  } else {
                  }
                }
                break;
              default:
                break;
            }
          } else {
            failedSixthAttempts++;
            if (failedSixthAttempts > 50) {
              adjustedSixthRate += 0.02;
            }

            if (roll < adjustedSixthRate + fifthRate && roll >= adjustedSixthRate) {
            } else if (
              roll < adjustedSixthRate + fifthRate + fourthRate &&
              roll >= adjustedSixthRate + fifthRate
            ) {
            }
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

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { type, payload: pickupDatas } = e.data;
  console.log('[Worker] 메인으로부터 데이터 수신:', pickupDatas);
  if (type !== 'start') return;

  const result = { success: false, operators: [], totalRuns: 0, totalSixthCount: 0 };

  const { isPickup, totalRuns } = GachaRateSimulate([test], true);

  console.log('결과:', isPickup, totalRuns);

  (self as unknown as Worker).postMessage({
    type: 'done',
    result: { totalRuns, isPickup },
  });
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
