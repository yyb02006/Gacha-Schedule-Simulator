import { Operator } from '#/components/PickupList';
import { rarities } from '#/constants/variables';
import { GachaType, OperatorRarity, OperatorRarityForString } from '#/types/types';

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
