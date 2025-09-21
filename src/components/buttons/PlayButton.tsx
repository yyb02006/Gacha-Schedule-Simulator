'use client';

import DiamondButton from '#/components/buttons/DiamondButton';
import { motion, Variants } from 'motion/react';
import Image from 'next/image';
import { MouseEventHandler, useState } from 'react';

const playShadowVariants: Variants = {
  idle: {
    filter: 'drop-shadow(4px 4px 4px #101010) drop-shadow(-3px -4px 4px #404040)',
    transition: { duration: 0.3 },
  },
  hover: {
    filter: 'drop-shadow(4px -4px 4px #101010) drop-shadow(-3px 4px 4px #404040)',
    transition: { duration: 0.3 },
  },
};

const playVariants: Variants = {
  idle: { background: 'linear-gradient(135deg, #dba100, #ffd84d)' },
  hover: { background: 'linear-gradient(-45deg, #dba100, #ffd84d)' },
};

export default function PlayButton({
  onPlayClick,
}: {
  onPlayClick: MouseEventHandler<HTMLDivElement>;
}) {
  const [isHover, setIsHover] = useState(false);
  const [isFirstRenderOver, setIsFirstRenderOver] = useState(false);
  const initialDelay = 0.3;
  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onClick={onPlayClick}
      onViewportEnter={() => setIsFirstRenderOver(true)}
      className="relative flex size-18 rotate-45 items-center justify-center"
    >
      <DiamondButton isHover={isHover}>
        <motion.div
          animate={isHover ? { rotateZ: 30 } : undefined}
          className="absolute flex size-12 items-center justify-center"
        >
          <div className="absolute flex size-12 items-center justify-center overflow-hidden">
            <motion.div
              variants={playShadowVariants}
              animate={isHover ? 'hover' : 'idle'}
              transition={{ duration: 0.3, delay: isFirstRenderOver ? 0 : initialDelay }}
              initial={{
                filter: 'drop-shadow(0px 0px 0px #202020) drop-shadow(0px 0px 0px #202020)',
              }}
              className="absolute -rotate-z-45"
            >
              <Image alt="test" src={'/play.svg'} width={32} height={32} />
            </motion.div>
          </div>
          <motion.div
            variants={playVariants}
            animate={isHover ? 'hover' : 'idle'}
            transition={{ duration: 0.3, delay: isFirstRenderOver ? 0 : initialDelay }}
            initial={{
              background: 'linear-gradient(145deg, #202020, #202020)',
            }}
            className="absolute size-8 -rotate-z-45"
            style={{
              maskImage: 'url(play.svg)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
            }}
          />
        </motion.div>
      </DiamondButton>
    </motion.div>
  );
}
