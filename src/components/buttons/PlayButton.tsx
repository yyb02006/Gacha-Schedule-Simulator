'use client';

import DiamondButton from '#/components/buttons/DiamondButton';
import { useIsMount } from '#/hooks/useIsMount';
import { motion, Variants } from 'motion/react';
import { MouseEventHandler, useState } from 'react';
import Play from '#/icons/Play.svg';

const playShadowVariants: Variants = {
  idle: (custom: { isMount: boolean }) => ({
    filter: 'drop-shadow(4px 4px 4px #101010) drop-shadow(-3px -4px 4px #404040)',
    opacity: 1,
    transition: { duration: 0.3, delay: custom.isMount ? 0 : 0.3 },
  }),
  hover: {
    filter: 'drop-shadow(4px -4px 4px #101010) drop-shadow(-3px 4px 4px #404040)',
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

const playVariants: Variants = {
  idle: { background: 'linear-gradient(125deg, #f59e0b, #fde047)' },
  hover: { background: 'linear-gradient(15deg, #f59e0b, #fde047)' },
};

export default function PlayButton({
  onPlayClick,
}: {
  onPlayClick: MouseEventHandler<HTMLDivElement>;
}) {
  const [isHover, setIsHover] = useState(false);
  const isMount = useIsMount();
  const initialDelay = 0.2;
  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onClick={(e) => {
        setIsHover(true);
        setTimeout(() => {
          setIsHover(false);
        }, 500);
        onPlayClick(e);
      }}
      className="relative flex size-18 rotate-45 items-center justify-center"
    >
      <DiamondButton isHover={isHover} initialDelay={initialDelay} isMount={isMount}>
        <motion.div
          animate={isHover ? { rotateZ: 30 } : undefined}
          className="absolute flex size-12 items-center justify-center"
        >
          <div className="absolute flex size-12 items-center justify-center overflow-hidden select-none">
            <motion.div
              variants={playShadowVariants}
              animate={isHover ? 'hover' : 'idle'}
              initial={{
                filter: 'drop-shadow(0px 0px 0px #202020) drop-shadow(0px 0px 0px #202020)',
                opacity: 0,
              }}
              custom={{ isMount }}
              className="absolute -rotate-z-45"
            >
              <Play className="size-8 text-[#202020]" />
            </motion.div>
          </div>
          <motion.div
            variants={playVariants}
            transition={{ duration: 0.3, delay: isMount ? 0 : 0.6 }}
            initial={{
              background: 'linear-gradient(145deg, #202020, #202020)',
            }}
            animate={isHover ? 'hover' : 'idle'}
            className="absolute size-8 -rotate-z-45"
            style={{
              maskImage: 'url(icons/play.svg)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
            }}
          />
        </motion.div>
      </DiamondButton>
    </motion.div>
  );
}
