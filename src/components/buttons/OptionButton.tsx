'use client';

import { optionButtonVariants, toOpacityZero } from '#/constants/variants';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function OptionButton({ isFirstRenderOver }: { isFirstRenderOver: boolean }) {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      variants={optionButtonVariants}
      whileInView="idle"
      whileHover="hover"
      viewport={{ once: true, amount: 0.5 }}
      custom={{ state: isFirstRenderOver ? 'normal' : 'initial' }}
      initial="exit"
      exit="exit"
      className="flex size-[44px] cursor-pointer items-center justify-between self-end rounded-xl p-2"
    >
      {[0, 0.1, 0.2].map((delay) => (
        <motion.div
          key={delay}
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
          exit="exit"
          animate={
            isHover
              ? {
                  backgroundColor: '#ffffff',
                  y: [0, -8, 0],
                  transition: {
                    y: {
                      stiffness: 200,
                      damping: 1000, // 감쇠력
                      mass: 0.5,
                      duration: 0.35,
                      delay,
                      repeat: Infinity,
                      repeatDelay: 0.5, //duration이 끝난 시점부터
                    },
                  },
                }
              : { y: 0 }
          }
          className="size-[5px] rounded-full bg-[#ffb900]"
        />
      ))}
    </motion.button>
  );
}
