'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import AddButton from '#/components/buttons/AddButton';

export default function AddBannerCard({ openModal }: { openModal: () => void }) {
  const [isBannerAddHover, setIsBannerAddHover] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setIsBannerAddHover(true)}
      onHoverEnd={() => setIsBannerAddHover(false)}
      variants={cardVariants}
      whileHover={{ scale: 1.02, background: 'linear-gradient(155deg, #bb4d00, #ffb900)' }}
      whileTap={{ scale: 1.02, background: 'linear-gradient(155deg, #bb4d00, #ffb900)' }}
      initial="exit"
      animate="idle"
      transition={cardTransition}
      onClick={openModal}
      className="flex cursor-pointer items-center justify-center gap-x-24 overflow-hidden rounded-xl py-8"
    >
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        exit="exit"
        className="font-S-CoreDream-700 text-2xl select-none"
      >
        픽업 배너 추가
      </motion.div>
      <AddButton
        onAddClick={() => {}}
        isOtherElHover={isBannerAddHover}
        custom={{ boxShadow: '0px -7px 20px 5px #bd5b00, 0px 7px 22px 3px #ffde26' }}
      />
    </motion.div>
  );
}
