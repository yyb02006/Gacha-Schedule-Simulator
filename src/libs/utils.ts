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
  return Math.round(num * factor) / factor;
}

/**
 * 주어진 히스토그램에서 누적 합 기준으로 특정 퍼센타일(cutoff) 인덱스를 반환
 *
 * @param {number[]} histogram - 각 구간의 값(횟수) 배열
 * @param {number} total - 히스토그램 전체 합
 * @param {number} percentile - 컷오프할 퍼센타일 (0~1 범위)
 * @returns {{ cumulative: number; cutoffIndex: number }}
 *          cumulative: 컷오프 지점까지의 누적 합
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
 * // 뒤에서부터 누적합으로 10%를 초과하는 지점 찾기
 * const result = getPercentileIndex(histogram, total, 0.1);
 * console.log(result); // { cumulative: 4, cutoffIndex: 2 }
 */
export const getPercentileIndex = (histogram: number[], total: number, percentile: number) => {
  if (percentile < 0 || percentile > 1) {
    throw new Error('percentile must be between 0 and 1');
  }

  let cumulative = 0;
  let cutoffIndex = histogram.length;
  for (let i = histogram.length - 1; i >= 0; i--) {
    cumulative += histogram[i];
    if (cumulative / total >= 1 - percentile) {
      cutoffIndex = i;
      break;
    }
  }
  return { cumulative, cutoffIndex };
};
