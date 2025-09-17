import { Transition, Variant, Variants } from 'motion';

export const secondLevelTransition: Record<'fadeIn' | 'fadeOut', Transition> = {
  fadeIn: { boxShadow: { duration: 0.3, delay: 0.1 }, background: { duration: 0.3, delay: 0.3 } },
  fadeOut: { boxShadow: { duration: 0.3, delay: 0.1 }, background: { duration: 0.3, delay: 0.1 } },
};

const smallButtonIdle: Variant = {
  boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030',
  background: 'linear-gradient(135deg, #181818, #2e2e2e)',
};

const smallButtonExit: Variant = {
  boxShadow: '0px 0px 0px #202020, 0px 0px 0px #202020',
  background: 'linear-gradient(135deg, #202020, #202020)',
};

const cardIdle: Variant = {
  boxShadow: '12px 12px 32px #141414, -12px -10px 32px #2e2e2e',
  background: 'linear-gradient(135deg, #1c1c1c, #2a2a2a)',
};
const cardExit: Variant = {
  boxShadow: '0px 0px 0px #202020, 0px 0px 0px #202020',
  background: 'linear-gradient(135deg, #202020, #202020)',
};

export const cardVariants: Variants = {
  idle: {
    ...cardIdle,
    transition: {
      boxShadow: { duration: 0.4, delay: 0.2 },
    },
  },
  exit: {
    ...cardExit,
    transition: {
      boxShadow: { duration: 0.4, delay: 0.2, ease: 'easeInOut' },
    },
  },
};

export const gachaTypeButtonVariants: Variants = {
  idle: {
    boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030',
    background: 'linear-gradient(155deg, #181818, #2e2e2e)',
    transition: secondLevelTransition.fadeIn,
  },
  exit: {
    boxShadow: '0px 0px 0px #202020, 0px 0px 0px #202020',
    background: 'linear-gradient(155deg, #202020, #202020)',
    transition: secondLevelTransition.fadeOut,
  },
};

export const smallButtonVariants: Variants = {
  idle: {
    ...smallButtonIdle,
    transition: secondLevelTransition.fadeIn,
  },
  exit: {
    ...smallButtonExit,
    transition: secondLevelTransition.fadeOut,
  },
};

export const insetInputVariants: Variants = {
  idle: {
    boxShadow: 'inset 6px 6px 13px #101010, inset -6px -6px 13px #303030',
    transition: secondLevelTransition.fadeOut,
  },
  exit: {
    boxShadow: 'inset 0px 0px 0px #202020, inset 0px 0px 0px #202020',
    transition: secondLevelTransition.fadeOut,
  },
};

export const cancelButtonVariants: Variants = {
  idle: smallButtonIdle,
  exit: smallButtonExit,
  hover: { background: 'linear-gradient(135deg, #ff637e, #ff637e)', color: '#eaeaea' },
};

export const toOpacityZero: Variants = {
  idle: { opacity: 1, transition: { duration: 0.2, delay: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.3, delay: 0.2 } },
};

export const cardTransition = { type: 'spring' as const, stiffness: 170, damping: 27, mass: 1.35 };
