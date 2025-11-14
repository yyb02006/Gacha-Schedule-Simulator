import { GachaTypeButton } from '#/types/types';

export const gachaTypeButtons: GachaTypeButton[] = [
  {
    name: '한정',
    type: 'limited',
    hoverBackground: 'linear-gradient(155deg, #bb4d00, #ffb900)',
  },
  {
    name: '단일 통상',
    type: 'single',
    hoverBackground: 'linear-gradient(155deg, #1447e6, #51a2ff)',
  },
  {
    name: '일반',
    type: 'rotation',
    hoverBackground: 'linear-gradient(155deg, #7008e7, #a684ff)',
  },
  {
    name: '4중 가챠',
    type: 'contract',
    hoverBackground: 'linear-gradient(155deg, #00786f, #00bba7)',
  },
  {
    name: '콜라보',
    type: 'collab',
    hoverBackground: 'linear-gradient(155deg, #c70036, #ff637e)',
  },
  {
    name: '지향',
    type: 'orient',
    hoverBackground: 'linear-gradient(155deg, #c70036, #ff637e)',
  },
];

export const operatorBadgeProps = {
  operatorType: {
    limited: { id: 'limited', props: { name: '한정', color: 'border-amber-400 text-amber-400' } },
    normal: { id: 'normal', props: { name: '통상', color: 'border-sky-500 text-sky-500' } },
  },
  rarity: {
    sixth: { id: 6, props: { name: '6성', color: 'border-orange-400 text-orange-400' } },
    fifth: { id: 5, props: { name: '5성', color: 'border-yellow-400 text-yellow-400' } },
    fourth: { id: 4, props: { name: '4성', color: 'border-purple-400 text-purple-400' } },
  },
} as const;

export const BannerBadgeProps = {
  limited: {
    id: 'limited',
    props: { name: '한정 배너', color: 'border-amber-400 text-amber-400' },
  },
  single: {
    id: 'single',
    props: { name: '단일 통상 배너', color: 'border-sky-500 text-sky-500' },
  },
  collab: {
    id: 'collab',
    props: { name: '콜라보 배너', color: 'border-rose-400 text-rose-400' },
  },
  rotation: {
    id: 'rotation',
    props: { name: '로테이션 배너', color: 'border-violet-400 text-violet-400' },
  },
  contract: {
    id: 'contract',
    props: { name: '4중 배너', color: 'border-teal-500 text-teal-500' },
  },
  orient: {
    id: 'orient',
    props: { name: '3중 선택 배너', color: 'border-orange-500 text-orange-500' },
  },
} as const;

export const rarityColor = {
  sixth: { HEX: '#ff8904', bgColor: 'bg-orange-400', textColor: 'text-orange-400' },
  fifth: { HEX: '#ffb900', bgColor: 'bg-amber-400', textColor: 'text-amber-400' },
  fourth: { HEX: '#a684ff', bgColor: 'bg-violet-400', textColor: 'text-violet-400' },
  third: { HEX: '#00a6f4', bgColor: 'bg-sky-500', textColor: 'text-sky-500' },
} as const;
