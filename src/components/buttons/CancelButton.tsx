import { useState } from 'react';
import { motion } from 'motion/react';
import { cancelButtonVariants, toOpacityZero } from '#/constants/variants';

export default function CancelButton({
  handleCancel,
  isFirstRenderOver = true,
}: {
  handleCancel: () => void;
  isFirstRenderOver?: boolean;
}) {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.button
      key="cancel"
      onHoverStart={() => {
        setIsHover(true);
      }}
      onHoverEnd={() => {
        setIsHover(false);
      }}
      onClick={handleCancel}
      variants={cancelButtonVariants}
      viewport={{ once: true, amount: 0.5 }}
      custom={{ state: isFirstRenderOver ? 'normal' : 'initial' }}
      initial="exit"
      animate={isHover ? 'hover' : 'idle'}
      exit="exit"
      className="size-[44px] cursor-pointer rounded-xl p-2 text-[#ff637e]"
    >
      <motion.svg
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        className="size-full"
      >
        <use href="/icons/icons.svg#cancel" />
      </motion.svg>
    </motion.button>
  );
}
