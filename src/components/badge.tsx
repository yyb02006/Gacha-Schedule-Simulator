import { toOpacityZero } from '#/constants/variants';
import { cls } from '#/libs/utils';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function Badge({
  name,
  color,
  animation = false,
  onBadgeClick,
  isLayout = false,
}: {
  name: string;
  color: string;
  animation?: boolean;
  onBadgeClick?: () => void;
  isLayout?: boolean;
}) {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.div
      layout={isLayout ? 'position' : false}
      variants={toOpacityZero}
      onHoverStart={() => {
        setIsHover(true);
      }}
      onHoverEnd={() => {
        setIsHover(false);
      }}
      onClick={onBadgeClick}
      initial="exit"
      animate="idle"
      exit="exit"
    >
      <motion.div
        animate={
          animation && isHover
            ? {
                rotateZ: [0, 20, 0, -20, 0],
                y: -4,
                scale: 1.1,
                transition: { rotateZ: { repeat: Infinity, duration: 1, delay: 0.1 } },
              }
            : { rotateZ: 0 }
        }
        className={cls(
          color,
          animation ? 'cursor-pointer' : 'cursor-default',
          'inline-block w-fit rounded-full border px-3 py-1 text-sm whitespace-nowrap',
        )}
      >
        {name}
      </motion.div>
    </motion.div>
  );
}
