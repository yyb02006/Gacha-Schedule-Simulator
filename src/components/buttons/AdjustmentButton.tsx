import { useState } from 'react';
import { motion } from 'motion/react';
import { optionButtonVariants, toOpacityZero } from '#/constants/variants';

export default function AdjustmentButton({ onClick }: { onClick: () => void }) {
  const [isHover, setIsHover] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isFirstRenderOver, setIsFirstRenderOver] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
      onTapStart={() => setIsMouseDown(true)}
      onTapCancel={() => setIsMouseDown(false)}
      onClick={onClick}
      className="rounded-xl"
    >
      <motion.div
        onViewportEnter={() => setIsFirstRenderOver(true)}
        variants={optionButtonVariants}
        viewport={{ once: true, amount: 0.5 }}
        custom={{
          background: 'linear-gradient(135deg, #bb4d00, #ffb900)',
          state: isFirstRenderOver ? 'normal' : 'initial',
          color: '#eaeaea',
        }}
        animate={isMouseDown ? 'active' : isHover ? 'hover' : 'idle'}
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
      </motion.div>
    </motion.button>
  );
}
