import { GachaType, OperatorRarityForString } from '#/types/types';

export const rarityStrings = ['sixth', 'fifth', 'fourth'] as const;
export const obtainedTypes = ['totalObtained', 'pickupObtained', 'targetObtained'] as const;
export const rarities = {
  6: 'sixth',
  5: 'fifth',
  4: 'fourth',
  sixth: 6,
  fifth: 5,
  fourth: 4,
} as const;
export const obtainedKoreans = {
  totalObtained: '전체',
  pickupObtained: '픽업오퍼',
  targetObtained: '목표오퍼',
} as const;
export const operatorLimitByBannerType: Record<
  GachaType,
  Record<OperatorRarityForString, number>
> = {
  rotation: { sixth: 2, fifth: 3, fourth: 0 },
  single: { sixth: 1, fifth: 2, fourth: 1 },
  limited: { sixth: 2, fifth: 1, fourth: 0 },
  collab: { sixth: 1, fifth: 2, fourth: 0 },
  orient: { sixth: 3, fifth: 3, fourth: 0 },
  contract: { sixth: 4, fifth: 6, fourth: 0 },
};
