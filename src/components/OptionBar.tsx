'use client';

import { TypeSelectionButton } from '#/components/PickupCard';
import { cardVariants, optionButtonVariants, toOpacityZero } from '#/constants/variants';
import { motion } from 'motion/react';
import { useState } from 'react';

const DetailOptionsButton = () => {
  const [isHover, setIsHover] = useState(false);
  const [isFirstRenderOver, setIsFirstRenderOver] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onViewportEnter={() => setIsFirstRenderOver(true)}
      variants={optionButtonVariants}
      whileInView="idle"
      whileHover="hover"
      viewport={{ once: true, amount: 0.5 }}
      custom={{ state: isFirstRenderOver ? 'normal' : 'initial' }}
      initial="exit"
      exit="exit"
      className="relative flex size-[44px] cursor-pointer items-center justify-between self-end rounded-xl p-2"
    >
      <div className="absolute top-0 left-0 flex size-full flex-col justify-between px-2 py-3">
        {[
          [12, 2, 17, 12],
          [5, 21, 15, 5],
          [17, 10, 1, 17],
        ].map((sequence, index) => (
          <motion.div
            key={index}
            variants={toOpacityZero}
            whileInView="idle"
            viewport={{ once: true, amount: 0.5 }}
            initial="exit"
            animate={isHover ? { background: '#ffffff' } : { background: '#ffb900' }}
            className="flex h-[2px] items-center rounded-full bg-[#ffb900]"
          >
            <motion.div
              variants={toOpacityZero}
              whileInView="idle"
              viewport={{ once: true, amount: 0.5 }}
              initial={{ ...toOpacityZero.exit, x: sequence[0] }}
              animate={
                isHover
                  ? {
                      backgroundColor: '#ffffff',
                      x: sequence,
                      transition: {
                        x: {
                          duration: 3,
                          repeat: Infinity,
                        },
                      },
                    }
                  : { x: sequence[0] }
              }
              className="size-2 rounded-full bg-amber-400"
            />
          </motion.div>
        ))}
      </div>
    </motion.button>
  );
};

export default function OptionBar() {
  return (
    <motion.div
      variants={cardVariants}
      initial="exit"
      animate="idle"
      className="w-full rounded-xl p-4"
    >
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        className="font-S-CoreDream-500 flex justify-between"
      >
        <div className="flex w-60 gap-4">
          <TypeSelectionButton
            name="올명함"
            hoverBackground="linear-gradient(155deg, #1447e6, #51a2ff)"
          />
          <TypeSelectionButton
            name="올풀잠"
            hoverBackground="linear-gradient(155deg, #ec003f, #ff637e)"
          />
        </div>
        <DetailOptionsButton />
      </motion.div>
    </motion.div>
  );
}
