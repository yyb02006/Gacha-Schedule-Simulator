import { cls } from '#/libs/utils';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function Badge({
  name,
  color,
  animation = false,
  onBadgeClick,
  isLayout = false,
  className = '',
}: {
  name: string;
  color: string;
  animation?: boolean;
  onBadgeClick?: () => void;
  isLayout?: boolean;
  className?: string;
}) {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.div
      layout={isLayout ? 'position' : false}
      onHoverStart={() => {
        setIsHover(true);
      }}
      onHoverEnd={() => {
        setIsHover(false);
      }}
      onClick={onBadgeClick}
      className={className}
    >
      <motion.div
        animate={
          animation && isHover
            ? {
                rotateZ: [0, 10, 0, -10, 0],
                y: -4,
                scale: 1.1,
                transition: { rotateZ: { repeat: Infinity, duration: 0.6, delay: 0.2 } },
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
