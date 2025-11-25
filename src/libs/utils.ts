import {
  Dummy,
  GachaSimulationMergedResult,
  GachaSimulationResult,
  InitialOptions,
  Operator,
} from '#/components/PickupList';
import {
  obtainedTypes,
  operatorLimitByBannerType,
  rarities,
  rarityStrings,
} from '#/constants/variables';
import { GachaType, OperatorRarity, OperatorRarityForString } from '#/types/types';
import { v4 } from 'uuid';

/**
 *
 * 주어진 클래스 이름들을 공백으로 연결하여 하나의 문자열로 반환
 *
 * @param {...string} className - 연결할 클래스 이름들
 * @returns {string} 연결된 클래스 이름 문자열
 *
 * @example
 * const classList = cls('btn', 'btn-primary', 'active');
 *
 * console.log(classList); // "btn btn-primary active"
 */
export function cls(...className: string[]) {
  return className.join(' ');
}

/**
 *
 * 주어진 문자열을 정수로 변환하여 반환하되 빈문자열일 경우 0으로 반환
 *
 * @param {string} string - 변환할 문자열
 * @returns {number} 변환된 숫자
 *
 * @example
 * const resultNumber = stringToNumber('5');
 * console.log(resultNumber); // 5
 *
 * @example
 * const resultNumber = stringToNumber('');
 * console.log(resultNumber); // 0
 *
 * @example
 * const resultNumber = stringToNumber('abc');
 * console.log(resultNumber); // NaN
 */
export function stringToNumber(string: string) {
  return string === '' ? 0 : parseInt(string);
}

/**
 * 주어진 문자열이 숫자로 이루어져 있는지 판단하고, 선행 0을 제거한 후 반환
 * 빈 문자열일 경우 '0'으로 반환하거나 빈 문자열을 반환
 *
 * @param {string} string - 변환할 문자열
 * @param {boolean} [returnEmptyForZero=true] - 빈 문자열일 경우 빈 문자열을 반환할지 여부
 * @returns {string | undefined} 변환된 문자열 또는 숫자가 아닌 경우 undefined
 *
 * @example
 * const resultNumber = normalizeNumberString('5');
 * console.log(resultNumber); // '5'
 *
 * @example
 * const resultNumber = normalizeNumberString('05');
 * console.log(resultNumber); // '5'
 *
 * @example
 * const resultNumber = normalizeNumberString('');
 * console.log(resultNumber); // '0'
 *
 * @example
 * const resultNumber = normalizeNumberString('', false);
 * console.log(resultNumber); // ''
 *
 * @example
 * const resultNumber = normalizeNumberString('abc');
 * console.log(resultNumber); // undefined
 */
export function normalizeNumberString(string: string, returnEmptyForZero: boolean = true) {
  if (isNaN(Number(string))) return undefined;
  const trimmedLeadingZero = string.replace(/^0+/, '');
  return trimmedLeadingZero === '' && returnEmptyForZero ? '0' : trimmedLeadingZero;
}

/**
 * 주어진 숫자를 최소값과 최대값 사이에 클램핑하여 반환
 *
 * @param {number} num - 클램핑할 숫자
 * @param {number} [min=0] - 최소값
 * @param {number} [max] - 최대값
 * @returns {number} 클램핑된 숫자
 *
 * @example
 * const clampedNumber = clamp(5, 1, 10);
 * console.log(clampedNumber); // 5
 *
 * @example
 * const clampedNumber = clamp(0, 1, 10);
 * console.log(clampedNumber); // 1
 *
 * @example
 * const clampedNumber = clamp(15, 1, 10);
 * console.log(clampedNumber); // 10
 *
 * @example
 * const clampedNumber = clamp(5);
 * console.log(clampedNumber); // 5
 */
export function clamp(num: number, min = 0, max?: number): number {
  if (num < min) return min;
  if (max !== undefined && num > max) return max;
  return num;
}

/**
 * 주어진 숫자를 지정된 소수점 자릿수까지 자르고 반환
 *
 * @param {number} num - 자를 숫자
 * @param {number} decimals - 자릿수 (기본: 2)
 * @returns {number} 소수점 n자리까지 자른 숫자
 *
 * @example
 * const truncatedNumber = truncateToDecimals(1.2345);
 * console.log(truncatedNumber); // 1.23
 *
 * @example
 * const truncatedNumber = truncateToDecimals(1.2345, 3);
 * console.log(truncatedNumber); // 1.234
 *
 * @example
 * const truncatedNumber = truncateToDecimals(-1.2);
 * console.log(truncatedNumber); // -1.2
 *
 * @example
 * const truncatedNumber = truncateToDecimals(1);
 * console.log(truncatedNumber); // 1
 */
export function truncateToDecimals(num: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  const safeNum = safeNumberOrZero(num);
  return Math.round(safeNum * factor) / factor;
}

/**
 * 주어진 히스토그램에서 누적 합 기준으로 주어진 퍼센타일을 넘은 직후의 인덱스와 그 때의 누적 합을 반환
 *
 * @param {number[]} histogram - 각 구간의 값(횟수) 배열
 * @param {number} total - 히스토그램 전체 합
 * @param {number} percentile - 컷오프할 퍼센타일 (0~1 범위)
 * @returns {{ remainingCumulative: number; cutoffIndex: number }}
 *          remainingCumulative: 컷오프 지점까지의 누적 합
 *          cutoffIndex: 해당 퍼센타일을 넘는 최초 인덱스
 *
 * @throws {Error} percentile이 0~1 범위를 벗어나면 예외 발생
 *
 * @example
 * const histogram = [1, 2, 3, 4];
 * const total = histogram.reduce((a, b) => a + b, 0);
 * const result = getPercentileIndex(histogram, total, 0.25);
 * console.log(result); // { cumulative: 3, cutoffIndex: 1 }
 *
 * @example
 * const histogram = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * const total = histogram.reduce((a, b) => a + b, 0);
 * const result = getPercentileIndex(histogram, total, 0.8);
 * console.log(result); // { cumulative: 45, cutoffIndex: 8 }
 */
export function getPercentileIndex(histogram: number[], total: number, percentile: number) {
  if (percentile < 0 || percentile > 1) {
    throw new Error('percentile must be between 0 and 1');
  }

  let remainingCumulative = 0;
  let cutoffIndex = histogram.length;
  for (let i = histogram.length - 1; i >= 0; i--) {
    remainingCumulative += histogram[i];
    if (safeNumberOrZero(remainingCumulative / total) >= 1 - percentile) {
      cutoffIndex = i;
      remainingCumulative -= histogram[i];
      break;
    }
  }
  return { cumulative: total - remainingCumulative, cutoffIndex };
}

/**
 * 주어진 숫자를 안전하게 반환, NaN이면 0으로 처리
 *
 * @param {number} num - 검사할 숫자
 * @returns {number} NaN일 경우 0, 그 외는 원래 숫자
 *
 * @example
 * const safeNumber = safeNumberOrZero(5);
 * console.log(safeNumber); // 5
 *
 * @example
 * const safeNumber = safeNumberOrZero(NaN);
 * console.log(safeNumber); // 0
 *
 * @example
 * const safeNumber = safeNumberOrZero(undefined as any);
 * console.log(safeNumber); // 0
 */
export function safeNumberOrZero(num: number): number {
  return Number.isNaN(num) ? 0 : num;
}

/**
 * 배열에서 조건을 만족하는 요소를 제한 개수만큼 추출하여 새로운 배열로 반환
 *
 * @template T
 * @param {T[]} arr - 순회할 배열
 * @param {(x: T) => boolean} predicate - 요소가 조건을 만족하는지 판단하는 함수
 * @param {number} [limit=2] - 반환할 최대 요소 개수
 * @returns {T[]} 조건을 만족하는 요소로 이루어진 배열
 *
 * @example
 * const arr = [1, 2, 3, 4, 5];
 * const evens = filterLimitArray(arr, x => x % 2 === 0, 2);
 * console.log(evens); // [2, 4]
 *
 * @example
 * const arr = [1, 3, 5];
 * const evens = filterLimitArray(arr, x => x % 2 === 0, 2);
 * console.log(evens); // []
 *
 * @example
 * // limit보다 조건 만족 요소가 적으면 존재하는 것만 반환
 * const arr = [2];
 * const evens = filterLimitArray(arr, x => x % 2 === 0, 2);
 * console.log(evens); // [2]
 */
export function filterLimitArray<T>(arr: T[], predicate: (x: T) => boolean, limit = 2): T[] {
  const result: T[] = [];
  let count = 0;
  for (const item of arr) {
    if (predicate(item)) {
      result.push(item);
      if (++count >= limit) break;
    }
  }
  return result;
}

/**
 * 주어진 가챠 타입과 희귀도에 따라 한정(Limited) 오퍼레이터를 포함할 수 있는지를 판별
 *
 * @param {GachaType} gachaType - 가챠의 종류 (normal, limited, collab)
 * @param {OperatorRarity} rarity - 오퍼레이터 희귀도 (4, 5, 6)
 * @returns {boolean} 해당 조합이 한정 오퍼레이터를 가질 수 있다면 true, 아니면 false
 *
 * @example
 * canHaveLimited('limited', 6); // true (리미티드 6성 가능)
 *
 * @example
 * canHaveLimited('collab', 5); // true (콜라보 5성 가능)
 *
 * @example
 * canHaveLimited('normal', 5); // false (일반 가챠에는 한정 없음)
 */
export function canHaveLimited(gachaType: GachaType, rarity: OperatorRarity) {
  if (rarity === 6) {
    return gachaType === 'collab' || gachaType === 'limited';
  } else if (rarity === 5) {
    return gachaType === 'collab';
  } else {
    return false;
  }
}

/**
 * 주어진 operator 배열을 rarity 기준으로 그룹화하여 객체 형태로 반환
 *
 * @param {Operator[]} operators - 분류할 operator 배열
 * @returns {Record<OperatorRarityForString, Operator[]>}
 * rarity(sixth, fifth, fourth)별로 operator를 배열로 모은 객체
 *
 * @example
 * const operators = [
 *   { name: 'A', rarity: 6 },
 *   { name: 'B', rarity: 5 },
 *   { name: 'C', rarity: 6 },
 * ];
 *
 * const result = getOperatorsByRarity(operators);
 *
 * console.log(result.sixth); // [{ name: 'A', rarity: 6 }, { name: 'C', rarity: 6 }]
 * console.log(result.fifth); // [{ name: 'B', rarity: 5 }]
 * console.log(result.fourth); // []
 *
 * @example
 * // 빈 배열을 입력하면 모든 rarity 배열이 빈 배열로 반환
 * const result = getOperatorsByRarity([]);
 * console.log(result);
 * // { sixth: [], fifth: [], fourth: [] }
 */
export function getOperatorsByRarity(operators: Operator[]) {
  return operators.reduce<Record<OperatorRarityForString, Operator[]>>(
    (acc, current) => {
      acc[rarities[current.rarity]].push(current);
      return acc;
    },
    {
      sixth: [],
      fifth: [],
      fourth: [],
    },
  );
}

/**
 * 두 HEX 색상 사이를 보간하여 새로운 색상을 반환
 *
 * @param {string} color1 - 시작 색상(HEX). 예: "#fe9a00"
 * @param {string} color2 - 목표 색상(HEX). 예: "#00bba7"
 * @param {number} factor - 0~1 사이의 보간 비율. 0이면 color1, 1이면 color2와 동일.
 * @returns {string} 보간된 HEX 색상 문자열. 예: "#ca8f35"
 *
 * @example
 * // 중간 색상을 얻기
 * const mid = interpolateColor("#ff0000", "#0000ff", 0.5);
 * console.log(mid); // "#800080" (보라색)
 *
 * @example
 * // factor가 0이면 첫 번째 색 반환
 * console.log(interpolateColor("#fe9a00", "#00bba7", 0));
 * // "#fe9a00"
 *
 * @example
 * // factor가 1이면 두 번째 색 반환
 * console.log(interpolateColor("#fe9a00", "#00bba7", 1));
 * // "#00bba7"
 */
export function interpolateColor(color1: string, color2: string, factor: number) {
  // factor: 0~1
  const c1 = color1.startsWith('#') ? color1.slice(1) : color1;
  const c2 = color2.startsWith('#') ? color2.slice(1) : color2;

  const r1 = parseInt(c1.slice(0, 2), 16);
  const g1 = parseInt(c1.slice(2, 4), 16);
  const b1 = parseInt(c1.slice(4, 6), 16);

  const r2 = parseInt(c2.slice(0, 2), 16);
  const g2 = parseInt(c2.slice(2, 4), 16);
  const b2 = parseInt(c2.slice(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 지정한 시드로 재현 가능한 난수 생성 함수를 반환
 *
 * @param {number} [seed=0x12345678] - 초기 시드 값. 동일한 시드로 생성하면 항상 동일한 난수 시퀀스 생성
 * @returns {() => number} 0 이상 1 미만의 난수를 반환하는 함수
 *
 * @example
 * const rng = createRNG(12345);
 * console.log(rng()); // 항상 동일한 값 출력
 * console.log(rng()); // 다음 난수 출력, 항상 동일한 순서
 *
 * @example
 * // 기본 시드 사용
 * const rngDefault = createRNG();
 * console.log(rngDefault()); // 재현 가능, 기본 시드 기반
 */
export function createRNG(seed = 0x12345678) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 기본 시드(baseSeed)로부터 재현 가능한 n개의 워커용 시드를 생성
 *
 * @param {number} baseSeed - 시드 파생의 기준이 되는 기본 시드
 * @param {number} n - 생성할 워커용 시드 개수
 * @returns {number[]} 0~0xFFFFFFFF 범위의 워커용 시드 배열
 *
 * @example
 * const workerSeeds = deriveWorkerSeeds(12345, 3);
 * console.log(workerSeeds); // [예: 305419896, 2596069104, 267242409]
 *
 * @example
 * // 동일한 baseSeed와 n으로 다시 호출하면 항상 동일한 시드 배열 반환
 * const seeds1 = deriveWorkerSeeds(42, 5);
 * const seeds2 = deriveWorkerSeeds(42, 5);
 * console.log(seeds1); // [같은 값]
 * console.log(seeds2); // [같은 값]
 */
export function deriveWorkerSeeds(baseSeed: number, n: number): number[] {
  const seeds: number[] = [];
  const tempRNG = createRNG(baseSeed);
  for (let i = 0; i < n; i++) {
    seeds.push(Math.floor(tempRNG() * 0xffffffff));
  }
  return seeds;
}

/**
 * 여러 시뮬레이션 결과를 병합하여 단일 GachaSimulationMergedResult 생성
 *
 * 각 배너별, 희귀도별, 획득 타입별 통계를 합산하고,
 * 배너 히스토그램과 피티(histogram)도 합쳐서 후처리
 *
 * @param {GachaSimulationResult[]} results - 병합할 시뮬레이션 결과 배열
 * @param {number} simulationTry - 별도로 넣을 시뮬레이션 시도 횟수
 * @returns {GachaSimulationMergedResult} 병합된 결과
 *
 * @example
 * const merged = mergeGachaSimulationResults(simulationResults);
 * console.log(merged.total.simulationTry); // 전체 시도 수
 * console.log(merged.perBanner[0].bannerHistogram); // 첫 번째 배너의 히스토그램
 *
 * @note
 * - `rarityStrings`와 `obtainedTypes`는 외부 상수 파일에 있음
 * - 내부적으로 각 배너의 cumulative, min/max index, successIndexUntilCutoff 등도 추가적으로 계산함
 */
export function mergeGachaSimulationResults(
  results: GachaSimulationResult[],
  baseSeed: number,
  simulationTry?: number,
) {
  const preMergedResult = results.reduce<GachaSimulationMergedResult>(
    (acc, current) => {
      current.perBanner.forEach((currentBanner, index) => {
        const currentAccBanner = acc.perBanner[index];
        if (currentAccBanner) {
          const {
            bannerSuccess,
            bannerTotalGachaRuns,
            bannerWinGachaRuns,
            anyPityRewardObtained,
            winPityRewardObtained,
            actualEntryCount,
            bannerStartingCurrency,
            additionalResource,
            currencyShortageFailure,
            maxAttemptsFailure,
            bannerType,
          } = currentBanner;

          currentAccBanner.bannerSuccess += bannerSuccess;
          currentAccBanner.bannerTotalGachaRuns += bannerTotalGachaRuns;
          currentAccBanner.bannerWinGachaRuns += bannerWinGachaRuns;
          currentAccBanner.anyPityRewardObtained += anyPityRewardObtained;
          currentAccBanner.winPityRewardObtained += winPityRewardObtained;
          currentAccBanner.actualEntryCount += actualEntryCount;
          currentAccBanner.bannerStartingCurrency += bannerStartingCurrency;
          currentAccBanner.currencyShortageFailure += currencyShortageFailure;
          currentAccBanner.maxAttemptsFailure += maxAttemptsFailure;
          currentAccBanner.additionalResource = additionalResource;
          currentAccBanner.bannerType = bannerType;

          for (let i = 0; i < currentBanner.bannerHistogram.length; i++) {
            const accBannerHistogram = currentAccBanner.bannerHistogram[i] ?? 0;
            const CurrentBannerHistogram = currentBanner.bannerHistogram[i] ?? 0;

            currentAccBanner.bannerHistogram[i] = accBannerHistogram + CurrentBannerHistogram;

            const accPityHistogram = currentAccBanner.pityHistogram[i] ?? 0;
            const CurrentPityHistogram = currentBanner.pityHistogram[i] ?? 0;

            currentAccBanner.pityHistogram[i] = accPityHistogram + CurrentPityHistogram;
          }
          for (const rarityString of rarityStrings) {
            for (const obtainedType of obtainedTypes) {
              currentAccBanner[rarityString][obtainedType] +=
                currentBanner[rarityString][obtainedType];
              acc.total.statistics[rarityString][obtainedType] +=
                currentBanner[rarityString][obtainedType];
            }
          }
        } else {
          // 인덱스 넣고 더하는 과정에서 acc에 존재하지 않는 배열 길이가 나오면 undefined + number이므로 NaN이 되어버림
          acc.perBanner.push(currentBanner);
          for (const rarityString of rarityStrings) {
            for (const obtainedType of obtainedTypes) {
              acc.total.statistics[rarityString][obtainedType] +=
                currentBanner[rarityString][obtainedType];
            }
          }
        }
      });

      if (simulationTry) {
        acc.total.simulationTry = simulationTry;
      } else {
        acc.total.simulationTry += current.total.simulationTry;
      }
      acc.total.simulationSuccess += current.total.simulationSuccess;
      acc.total.totalGachaRuns += current.total.totalGachaRuns;
      acc.total.anyPityRewardObtained += current.total.anyPityRewardObtained;
      acc.total.seeds.push(current.total.seed);

      return acc;
    },
    {
      total: {
        baseSeed,
        seeds: [],
        simulationTry: 0,
        simulationSuccess: 0,
        totalGachaRuns: 0,
        anyPityRewardObtained: 0,
        initialResource: results[0].total.initialResource,
        isTrySim: results[0].total.isTrySim,
        isSimpleMode: results[0].total.isSimpleMode,
        bannerFailureAction: results[0].total.bannerFailureAction,
        statistics: {
          sixth: { pickupObtained: 0, targetObtained: 0, totalObtained: 0 },
          fifth: { pickupObtained: 0, targetObtained: 0, totalObtained: 0 },
          fourth: { pickupObtained: 0, targetObtained: 0, totalObtained: 0 },
        },
      },
      perBanner: [],
    },
  );
  const mergedResult: GachaSimulationMergedResult = {
    total: preMergedResult.total,
    perBanner: preMergedResult.perBanner.map((bannerResult) => {
      const { cumulative, cutoffIndex } = getPercentileIndex(
        bannerResult.bannerHistogram,
        bannerResult.bannerSuccess,
        0.99,
      );
      return {
        ...bannerResult,
        successIndexUntilCutoff: cutoffIndex,
        cumulativeUntilCutoff: cumulative,
        minIndex: Math.max(
          0,
          Math.min(bannerResult.bannerHistogram.findIndex((value) => value > 0)),
        ),
        maxIndex: Math.max(
          0,
          Math.min(bannerResult.bannerHistogram.findLastIndex((value) => value > 0)),
        ),
        bannerStartingCurrency: truncateToDecimals(
          safeNumberOrZero(
            Math.floor(bannerResult.bannerStartingCurrency / bannerResult.actualEntryCount),
          ),
          0,
        ),
      };
    }),
  };
  return mergedResult;
}

/**
 * 모바일인지 아닌지 판단 후 불리언 반환
 *
 * @returns {boolean} 모바일 환경 여부
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent.toLowerCase();

  const isiPhone = /iphone|ipod/.test(ua);
  const isAndroidPhone = /android/.test(ua) && /mobile/.test(ua);
  const isWindowsPhone = /windows phone/.test(ua);

  // iPadOS (MacIntel + touch)
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  // 모바일로 취급되는 조건들
  if (isiPhone || isAndroidPhone || isWindowsPhone || isIPadOS) {
    return true;
  }

  return false;
}

/**
 * 주어진 오퍼레이터 수를 배너별 한도에 맞게 검증하여 반환
 *
 * @param {Record<OperatorRarityForString, number>} opertCount - 현재 배너에 설정된 오퍼레이터 수
 * @param {Record<OperatorRarityForString, number>} limit - 해당 배너 타입에서 허용되는 최대 오퍼레이터 수
 * @returns {{ sixth: number; fifth: number; fourth: number }} 검증 후 각 등급별 오퍼레이터 수
 *
 * @example
 * const counts = getValidatedOpersCount(
 *   { sixth: 3, fifth: 5, fourth: 2 },
 *   { sixth: 2, fifth: 3, fourth: 0 }
 * );
 * console.log(counts); // { sixth: 2, fifth: 3, fourth: 0 }
 */
export const getValidatedOpersCount = (
  opertCount: Record<OperatorRarityForString, number>,
  limit: Record<OperatorRarityForString, number>,
): { sixth: number; fifth: number; fourth: number } => {
  const validOpersCountEntries = (['sixth', 'fifth', 'fourth'] as const).map<
    [OperatorRarityForString, number]
  >((key) => [
    key,
    typeof opertCount[key] === 'number' && opertCount[key] <= limit[key]
      ? opertCount[key]
      : limit[key],
  ]);
  return Object.fromEntries(validOpersCountEntries) as Record<OperatorRarityForString, number>;
};

/**
 * 픽업데이터를 검증하고 정리하여, UUID 채우기, 오퍼레이터 카테고리화, 배너 타입 보정 등을 수행
 *
 * @param {Dummy[]} pickupDatas - 검증할 배너 데이터 배열
 * @returns {Dummy[]} 검증 및 보정이 완료된 배너 데이터 배열
 *
 * @example
 * const validated = validatePickupDatas(rawPickupDatas);
 * console.log(validated);
 *
 * @example
 * // 각 배너의 오퍼레이터 수, 배너 타입, 만료일, 이미지 등 검증 후 보정됨
 * validated.forEach(banner => {
 *   console.log(banner.id, banner.gachaType, banner.operators.length);
 * });
 */
export const validatePickupDatas = (pickupDatas: Dummy[]) => {
  return pickupDatas.map<Dummy>(
    (
      {
        active,
        additionalResource: { simpleMode, extendedMode },
        expiration,
        firstSixthTry,
        gachaType,
        id,
        image,
        maxGachaAttempts,
        minGachaAttempts,
        name,
        operators,
        pickupDetails: { pickupOpersCount, targetOpersCount, simpleMode: simpleOpersCount },
      },
      index,
      original,
    ) => {
      const allowedGachaTypes = Object.keys(operatorLimitByBannerType);
      const validatedGachaType = allowedGachaTypes.includes(gachaType) ? gachaType : 'limited';
      const validatedExpiration =
        expiration && !isNaN(new Date(expiration).getTime()) && expiration.trim() !== ''
          ? expiration
          : null;
      const validatedMax =
        typeof maxGachaAttempts === 'number' && maxGachaAttempts !== 9999
          ? Math.max(Math.min(maxGachaAttempts, 3000), 0)
          : 9999;
      const validatedPickupOpersCount = getValidatedOpersCount(
        pickupOpersCount,
        operatorLimitByBannerType[validatedGachaType],
      );
      const validateTargetOpersCount = getValidatedOpersCount(
        targetOpersCount,
        validatedPickupOpersCount,
      );
      const validatedSimplePickupOpersCount = getValidatedOpersCount(
        simpleOpersCount.pickupOpersCount,
        operatorLimitByBannerType[validatedGachaType],
      );
      const validatedSimpleTargetOpersCount = getValidatedOpersCount(
        simpleOpersCount.targetOpersCount,
        validatedSimplePickupOpersCount,
      );
      const categorizedOperators = operators.reduce<Record<OperatorRarityForString, Operator[]>>(
        (
          acc,
          { currentQty, isPityReward, name, operatorId, operatorType, rarity, targetCount },
          currentINdex,
        ) => {
          const isRarityValid = [4, 5, 6].includes(rarity);
          if (isRarityValid) {
            const newOperator: Operator = {
              currentQty: typeof currentQty === 'number' ? Math.max(Math.min(currentQty, 5), 0) : 0,
              name: typeof name === 'string' ? name : `${rarity}성 오퍼레이터 ${currentINdex + 1}`,
              targetCount: targetCount === 6 ? 6 : 1,
              rarity,
              operatorType,
              operatorId,
              isPityReward,
            };
            acc[rarities[rarity]].push(newOperator);
          }
          return acc;
        },
        { sixth: [], fifth: [], fourth: [] },
      );
      const validatedOperators: Operator[] = [
        ...categorizedOperators.sixth.reduce<Operator[]>((acc, current, currentIndex, original) => {
          const isUnderLimit = currentIndex < operatorLimitByBannerType[validatedGachaType].sixth;
          if (isUnderLimit && current.rarity === 6) {
            const isFirstOperInTwoOnLimited =
              validatedGachaType === 'limited' && original.length > 1 && currentIndex === 0;
            const isFirstOperOnCollab = validatedGachaType === 'collab' && currentIndex === 0;
            const isFirstOperOnSingle = validatedGachaType === 'single' && currentIndex === 0;
            const isFirstOrSecondOperOnRotation =
              validatedGachaType === 'rotation' && currentIndex < 2;
            const newOperator: Operator = {
              ...current,
              operatorType: isFirstOperInTwoOnLimited || isFirstOperOnCollab ? 'limited' : 'normal',
              operatorId:
                typeof current.operatorId === 'string' &&
                !original.some(
                  ({ operatorId }, index) =>
                    index !== currentIndex && operatorId === current.operatorId,
                )
                  ? current.operatorId
                  : v4(),
              isPityReward:
                isFirstOperInTwoOnLimited ||
                isFirstOperOnCollab ||
                isFirstOperOnSingle ||
                isFirstOrSecondOperOnRotation,
            };
            acc.push(newOperator);
          }
          return acc;
        }, []),
        ...categorizedOperators.fifth.reduce<Operator[]>((acc, current, currentIndex, original) => {
          const isUnderLimit = currentIndex < operatorLimitByBannerType[gachaType].fifth;
          if (isUnderLimit && current.rarity === 5) {
            const newOperator: Operator = {
              ...current,
              operatorType:
                validatedGachaType === 'collab' && currentIndex < 2 ? 'limited' : 'normal',
              operatorId:
                typeof current.operatorId === 'string' &&
                original.find(
                  ({ operatorId }, index) =>
                    index !== currentIndex && operatorId === current.operatorId,
                )
                  ? v4()
                  : current.operatorId,
              isPityReward: false,
            };
            acc.push(newOperator);
          }
          return acc;
        }, []),
        ...categorizedOperators.fourth.reduce<Operator[]>(
          (acc, current, currentIndex, original) => {
            const isUnderLimit = currentIndex < operatorLimitByBannerType[gachaType].fourth;
            if (isUnderLimit && current.rarity === 4) {
              const newOperator: Operator = {
                ...current,
                operatorType: 'normal',
                operatorId:
                  typeof current.operatorId === 'string' &&
                  original.find(
                    ({ operatorId }, index) =>
                      index !== currentIndex && operatorId === current.operatorId,
                  )
                    ? v4()
                    : current.operatorId,
                isPityReward: false,
              };
              acc.push(newOperator);
            }
            return acc;
          },
          [],
        ),
      ];
      return {
        active: typeof active === 'boolean' ? active : true,
        additionalResource: {
          simpleMode:
            typeof simpleMode === 'number' ? Math.max(Math.min(simpleMode, 9999999), 0) : 0,
          extendedMode:
            typeof extendedMode === 'number' ? Math.max(Math.min(extendedMode, 9999999), 0) : 0,
        },
        expiration: validatedExpiration,
        firstSixthTry: typeof firstSixthTry === 'boolean' ? firstSixthTry : false,
        id:
          typeof id === 'string' &&
          !original.some(
            (originalEl, originalIndex) => originalIndex !== index && originalEl.id === id,
          )
            ? id
            : v4(),
        gachaType: validatedGachaType,
        image:
          image &&
          /^\/images\/.*\.jpg$/.test(image) &&
          validatedExpiration &&
          Date.now() < new Date(validatedExpiration).getTime()
            ? image
            : null,
        maxGachaAttempts: validatedMax,
        minGachaAttempts:
          typeof minGachaAttempts === 'number' && minGachaAttempts <= validatedMax
            ? minGachaAttempts
            : validatedMax,
        name: typeof name === 'string' ? name : `배너 ${index + 1}`,
        pickupDetails: {
          pickupChance:
            validatedGachaType === 'contract' || validatedGachaType === 'orient'
              ? 100
              : validatedGachaType === 'limited'
                ? 70
                : 50,
          pickupOpersCount: validatedPickupOpersCount,
          targetOpersCount: validateTargetOpersCount,
          simpleMode: {
            pickupOpersCount: validatedSimplePickupOpersCount,
            targetOpersCount: validatedSimpleTargetOpersCount,
          },
        },
        operators: validatedOperators,
      };
    },
  );
};

/**
 *
 * 옵션을 검증하고 정리하여, 모바일 환경 여부에 따른 값 제한, 값 조정, 타입 보정 등을 수행
 *
 * - `initialResource`는 0 ~ 9,999,999 범위로 강제 조정
 * - `batchGachaGoal`은 허용되지 않는 값일 경우 `null`로 설정
 * - `isTrySim`, `isSimpleMode`는 불리언이 아닐 경우 기본값 `true`로 설정
 * - `options.simulationTry`는 디바이스 타입(모바일 여부)에 따라 최대값이 제한
 * - `options.bannerFailureAction`은 허용되지 않은 값이면 `'interruption'`으로 설정
 * - `probability`는 고정 값 `{ limited: 70, normal: 50 }` 로 재정의
 *
 * @param {InitialOptions} initialOptions - 검증할 초기 시뮬레이션 옵션 데이터
 * @returns {InitialOptions} 검증 및 보정이 완료된 옵션 데이터
 *
 * @example
 * const validated = validateOptionDatas(rawOptions);
 * console.log(validated.initialResource); // 보정된 초기 자원
 *
 * @example
 * // 시뮬레이션 횟수 제한이 디바이스에 따라 조정됨
 * console.log(validated.options.simulationTry);
 */
export const validateOptionDatas = (initialOptions: InitialOptions): InitialOptions => {
  const { batchGachaGoal, initialResource, isSimpleMode, isTrySim, options } = initialOptions;
  const isMobile = isMobileDevice();
  const validatedInitialResource =
    typeof initialResource === 'number' ? Math.max(Math.min(initialResource, 9999999), 0) : 0;
  const validatedBatchGachaGoal = ['allFirst', 'allMax', null].includes(batchGachaGoal)
    ? batchGachaGoal
    : null;
  const validatedIsTrySim = typeof isTrySim === 'boolean' ? isTrySim : true;
  const validatedIsSimpleMode = typeof isSimpleMode === 'boolean' ? isSimpleMode : true;
  const validatedOptions = {
    bannerFailureAction: ['continueExecution', 'interruption'].includes(options.bannerFailureAction)
      ? options.bannerFailureAction
      : 'interruption',
    showBannerImage: typeof options.showBannerImage === 'boolean' ? options.showBannerImage : true,
    simulationTry: isMobile
      ? options.simulationTry > 200000
        ? 200000
        : options.simulationTry
      : options.simulationTry > 1000000
        ? 1000000
        : options.simulationTry,
    probability: { limited: 70, normal: 50 },
    baseSeed: options.baseSeed ? Math.max(Math.min(options.baseSeed, 4294967295), 0) : null,
  };
  return {
    batchGachaGoal: validatedBatchGachaGoal,
    initialResource: validatedInitialResource,
    isSimpleMode: validatedIsSimpleMode,
    isTrySim: validatedIsTrySim,
    options: validatedOptions,
  };
};
