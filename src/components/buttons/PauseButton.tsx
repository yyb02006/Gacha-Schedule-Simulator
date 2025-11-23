'use client';

import DiamondButton from '#/components/buttons/DiamondButton';
import { motion, Variants } from 'motion/react';
import { MouseEventHandler, useState } from 'react';

const pauseShadowVariants: Variants = {
  idle: {
    boxShadow: '6px 6px 13px #141414, -6px -6px 13px #2c2c2c',
    transition: { duration: 0.3 },
  },
  hover: {
    boxShadow: '-6px -6px 13px #141414, 6px 6px 13px #2c2c2c',
    transition: { duration: 0.3 },
  },
};

const pauseVariants: Variants = {
  idle: { background: 'linear-gradient(125deg, #f59e0b, #fde047)' },
  hover: { background: 'linear-gradient(15deg, #f59e0b, #fde047)' },
};

export default function PauseButton({
  onPauseClick,
}: {
  onPauseClick: MouseEventHandler<HTMLDivElement>;
}) {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onClick={onPauseClick}
      className="relative flex size-18 rotate-45 items-center justify-center"
    >
      <DiamondButton isHover={isHover}>
        <motion.div
          animate={isHover ? { rotateZ: 90 } : undefined}
          className="absolute flex size-12 items-center justify-center"
        >
          <div className="absolute flex size-12 items-center justify-center overflow-hidden">
            <div className="relative flex size-8 -rotate-45 justify-between px-[5px]">
              <motion.div
                variants={pauseShadowVariants}
                animate={isHover ? 'hover' : 'idle'}
                initial={{ boxShadow: '6px 6px 13px #141414, -6px -6px 13px #2c2c2c' }}
                className="relative h-8 w-2 rounded-full"
              />
              <motion.div
                variants={pauseShadowVariants}
                animate={isHover ? 'hover' : 'idle'}
                initial={{ boxShadow: '6px 6px 13px #141414, -6px -6px 13px #2c2c2c' }}
                className="relative h-8 w-2 rounded-full"
              />
            </div>
          </div>
          <motion.div
            variants={pauseVariants}
            transition={{ duration: 0.3 }}
            initial={{
              background: 'linear-gradient(145deg, #202020, #202020)',
            }}
            animate={isHover ? 'hover' : 'idle'}
            className="absolute size-8 -rotate-z-45"
            style={{
              maskImage: 'url(pause.svg)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
            }}
          />
        </motion.div>
      </DiamondButton>
    </motion.div>
  );
}
