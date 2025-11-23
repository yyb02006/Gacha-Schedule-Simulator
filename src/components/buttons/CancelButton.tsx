import { useState } from 'react';
import { motion } from 'motion/react';
import { cancelButtonVariants, toOpacityZero } from '#/constants/variants';
import Cancel from '#/icons/Cancel.svg';

export default function CancelButton({
  handleCancel,
  isFirstRenderOver = true,
}: {
  handleCancel: () => void;
  isFirstRenderOver?: boolean;
}) {
  const [isHover, setIsHover] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  return (
    <motion.button
      key="cancel"
      onClick={handleCancel}
      onHoverStart={() => {
        setIsHover(true);
      }}
      onHoverEnd={() => {
        setIsHover(false);
      }}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onMouseLeave={() => setIsClicked(false)}
      onTapStart={() => setIsClicked(true)}
      onTapCancel={() => setIsClicked(false)}
      variants={cancelButtonVariants}
      viewport={{ once: true, amount: 0.5 }}
      custom={{
        state: isFirstRenderOver ? 'normal' : 'initial',
        background: 'linear-gradient(135deg, #bd1b36, #ff637e)',
        color: '#eaeaea',
      }}
      initial="exit"
      animate={isClicked ? 'active' : isHover ? 'hover' : 'idle'}
      exit="exit"
      className="size-[44px] cursor-pointer rounded-xl p-2 text-[#ff637e]"
    >
      <motion.div
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        className="size-full"
      >
        <Cancel className="size-full" />
      </motion.div>
    </motion.button>
  );
}
