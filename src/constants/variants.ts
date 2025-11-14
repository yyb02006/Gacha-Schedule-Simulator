import { GachaTypeButtonCustom } from '#/types/types';
import { Transition, Variant, Variants } from 'motion';

type CardState = 'initial' | 'normal';

export const secondLevelTransition: Record<'fadeIn' | 'fadeOut', Transition> = {
  fadeIn: { boxShadow: { duration: 0.3, delay: 0.2 }, background: { duration: 0.3, delay: 0.3 } },
  fadeOut: { boxShadow: { duration: 0.3, delay: 0.2 }, background: { duration: 0.2 } },
};

const cardIdle: Variant = {
  boxShadow: '6px 6px 16px #141414, -6px -6px 16px #2e2e2e',
  background: 'linear-gradient(135deg, #1c1c1c, #2a2a2a)',
};

const cardExit: Variant = {
  boxShadow: '0px 0px 0px #202020, 0px 0px 0px #202020',
  background: 'linear-gradient(135deg, #202020, #202020)',
};

export const cardVariants: Variants = {
  idle: (custom?: { boxShadow?: string; background?: string }) => ({
    boxShadow: custom?.boxShadow || cardIdle.boxShadow,
    background: custom?.background || cardIdle.background,
    transition: {
      boxShadow: { duration: 0.3, delay: 0.2 },
    },
  }),
  exit: {
    ...cardExit,
    transition: {
      boxShadow: { duration: 0.2, delay: 0.2 },
      background: { duration: 0.1, delay: 0.2 },
    },
  },
};

export const smallButtonVariants: Variants = {
  idle: (custom: { state: CardState }) => ({
    boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030',
    background: 'linear-gradient(135deg, #181818, #2e2e2e)',
    transition:
      custom.state === 'initial'
        ? secondLevelTransition.fadeIn
        : { background: { duration: 0.3 }, boxShadow: { duration: 0.3 } },
  }),
  exit: {
    boxShadow: '0px 0px 0px #202020, 0px 0px 0px #202020',
    background: 'linear-gradient(135deg, #202020, #202020)',
    transition: {
      boxShadow: { duration: 0.3 },
      background: { duration: 0.2 },
    },
  },
  hover: (custom: { background?: string; color?: string }) => ({
    boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030',
    background: custom.background || undefined,
    color: custom.color || undefined,
  }),
  active: (custom: { background?: string; color?: string }) => ({
    boxShadow: 'inset 3px 3px 6px #101010, inset -3px -3px 6px #303030',
    background: custom.background,
    color: custom.color || undefined,
    transition: {
      background: { duration: 0.3, delay: 0 },
      boxShadow: { duration: 0.3, delay: 0 },
    },
  }),
};

export const gachaTypeButtonVariants: Variants = {
  idle: (custom: GachaTypeButtonCustom) => ({
    boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030',
    background: 'linear-gradient(155deg, #181818, #2e2e2e)',
    transition:
      custom.state === 'initial'
        ? secondLevelTransition.fadeIn
        : { background: { duration: 0.3 }, boxShadow: { duration: 0.3 } },
  }),
  exit: (custom: GachaTypeButtonCustom) => ({
    boxShadow: '0px 0px 0px #202020, 0px 0px 0px #202020',
    background: 'linear-gradient(155deg, #202020, #202020)',
    transition: custom.isActive
      ? { background: { duration: 0 }, boxShadow: { duration: 0.3, delay: 0.1 } }
      : secondLevelTransition.fadeOut,
  }),
  hover: (custom: GachaTypeButtonCustom) => ({
    boxShadow: '4px 4px 12px #101010, -5px -4px 12px #404040',
    background: custom.hoverBackground,
    transition: { duration: 0.3 },
  }),
  active: (custom: GachaTypeButtonCustom) => ({
    boxShadow: 'inset 3px 3px 6px #101010, inset -3px -3px 6px #303030',
    background: custom.hoverBackground,
    transition:
      custom.state === 'initial'
        ? { background: { duration: 0.3, delay: 0.3 }, boxShadow: { duration: 0.3, delay: 0.1 } }
        : { background: { duration: 0.3 }, boxShadow: { duration: 0, delay: 0 } },
  }),
};

export const optionButtonVariants: Variants = {
  ...smallButtonVariants,
  hover: {
    boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030',
    background: 'linear-gradient(135deg, #bb4d00, #ffb900)',
  },
};

export const cancelButtonVariants: Variants = {
  ...smallButtonVariants,
  hover: {
    boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030',
    background: 'linear-gradient(135deg, #bd1b36, #ff637e)',
    color: '#eaeaea',
  },
};

export const insetInputVariants: Variants = {
  idle: {
    boxShadow: 'inset 6px 6px 13px #101010, inset -6px -6px 13px #303030',
    transition: secondLevelTransition.fadeIn,
  },
  exit: {
    boxShadow: 'inset 0px 0px 0px #202020, inset 0px 0px 0px #202020',
    transition: secondLevelTransition.fadeOut,
  },
};

export const toOpacityZero: Variants = {
  idle: (
    { idle }: { idle?: { transition?: Transition; additional?: Variant } } = { idle: {} },
  ) => ({
    opacity: 1,
    transition: idle?.transition || { duration: 0.2, delay: 0.2 },
    ...idle?.additional,
  }),
  exit: (
    { exit }: { exit?: { transition?: Transition; additional?: Variant } } = { exit: {} },
  ) => ({
    opacity: 0,
    transition: exit?.transition === undefined ? undefined : { duration: 0.2, delay: 0.2 },
    ...exit?.additional,
  }),
};

export const cardTransition = { type: 'spring' as const, stiffness: 170, damping: 27, mass: 1.35 };

export const toggleButtonVariants: Variants = {
  left: {
    boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030',
    background: 'linear-gradient(155deg, #bb4d00, #ffb900)',
    transition: { duration: 0.3, delay: 0.2 },
  },
  right: {
    boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030',
    background: 'linear-gradient(155deg, #1447e6, #51a2ff)',
    transition: { duration: 0.3, delay: 0.2 },
  },
  exit: {
    boxShadow: '0px 0px 0px #202020, 0px 0px 0px #202020',
    background: 'linear-gradient(155deg, #202020, #202020)',
    transition: { duration: 0.3, delay: 0.2 },
  },
};

export const fontPop: Variants = {
  active: {
    filter: 'drop-shadow(6px 6px 5px #000000) drop-shadow(-6px -6px 5px #404040)',
    color: '#707070',
    transition: {
      duration: 0.3,
      delay: 0.2,
      ease: [0.25, 1, 0.5, 1],
    },
    scale: 1,
  },
  inActive: {
    filter: 'drop-shadow(0px 0px 0px #202020) drop-shadow(0px 0px 0px #202020)',
    color: '#202020',
    scale: 0.95,
    transition: {
      duration: 0.2,
      delay: 0,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    filter: 'drop-shadow(0px 0px 0px #202020) drop-shadow(0px 0px 0px #202020)',
    color: '#202020',
    scale: 0.95,
    transition: {
      duration: 0.3,
      delay: 0.2,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

export const gachaBannerOptionCardVariants: Variants = {
  idle: {
    boxShadow: '6px 6px 16px #141414, -6px -6px 16px #2e2e2e',
    background: 'linear-gradient(135deg, #1c1c1c, #2a2a2a)',
    transition: {
      boxShadow: { duration: 0.3, delay: 0.2 },
    },
  },
  exit: {
    boxShadow: '0px 0px 0px #202020, 0px 0px 0px #202020',
    background: 'linear-gradient(135deg, #202020, #202020)',
    transition: {
      boxShadow: { duration: 0.2, delay: 0.2 },
      background: { duration: 0.1, delay: 0.2 },
    },
  },
};

export const shakingVariants: Variants = {
  shake: (custom: { shakingBackground: string }) => ({
    x: [0, -5.7, 5.7, -4.2, 4.2, -2.1, 2.1, 0],
    background: custom.shakingBackground,
    color: '#eaeaea',
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      background: { duration: 0 },
      color: { duration: 0 },
    },
  }),
};
