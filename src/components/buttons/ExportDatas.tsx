'use client';

import { motion } from 'motion/react';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import Import from '#/icons/Export.svg';
import { Dummy } from '#/components/PickupList';
import { DTOOptions } from '#/types/types';

export function exportPickupData(pickupDatas: Dummy[], optionDatas: DTOOptions) {
  const json = JSON.stringify({ pickupDatas, optionDatas }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `pickup_data_${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export default function ExportDatas({ onExport }: { onExport: () => void }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        scale: 1.02,
        background: 'linear-gradient(155deg, #bb4d00, #ffb900)',
      }}
      whileTap={{
        scale: 1.02,
        background: 'linear-gradient(155deg, #bb4d00, #ffb900)',
      }}
      initial="exit"
      animate="idle"
      transition={cardTransition}
      onClick={onExport}
      className="flex cursor-pointer items-center justify-center rounded-xl py-2"
    >
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        exit="exit"
        className="font-S-CoreDream-400 text-standard flex items-center gap-x-1.5 select-none"
      >
        일정 내보내기 <Import className="size-[20px] text-[#eaeaea]" />
      </motion.div>
    </motion.div>
  );
}
