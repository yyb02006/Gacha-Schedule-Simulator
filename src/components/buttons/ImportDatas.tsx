'use client';

import { motion } from 'motion/react';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { validatePickupDatas } from '#/libs/utils';
import { ChangeEvent, useRef } from 'react';
import { DTO, DTOOptions } from '#/types/types';
import Import from '#/icons/Import.svg';

const validateOptions = (initialOptions: DTOOptions): DTOOptions => {
  const { batchGachaGoal, initialResource, isSimpleMode, isTrySim } = initialOptions;
  const validatedInitialResource =
    typeof initialResource === 'number' ? Math.max(Math.min(initialResource, 9999999), 0) : 0;
  const validatedBatchGachaGoal = ['allFirst', 'allMax', null].includes(batchGachaGoal)
    ? batchGachaGoal
    : null;
  const validatedIsTrySim = typeof isTrySim === 'boolean' ? isTrySim : true;
  const validatedIsSimpleMode = typeof isSimpleMode === 'boolean' ? isSimpleMode : true;
  return {
    batchGachaGoal: validatedBatchGachaGoal,
    initialResource: validatedInitialResource,
    isSimpleMode: validatedIsSimpleMode,
    isTrySim: validatedIsTrySim,
  };
};

export async function importPickupData(file: File): Promise<DTO> {
  const text = await file.text();
  const { pickupDatas, optionDatas }: DTO = JSON.parse(text);
  const result: DTO = {
    pickupDatas: validatePickupDatas(pickupDatas),
    optionDatas: validateOptions(optionDatas),
  };

  return result;
}

export default function ImportDatas({
  isImportLoading,
  onImport,
}: {
  isImportLoading: boolean;
  onImport: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoverAnimation = !isImportLoading
    ? {
        scale: 1.02,
        background: 'linear-gradient(155deg, #1447e6, #51a2ff)',
      }
    : undefined;
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={onImport}
      />
      <motion.div
        variants={cardVariants}
        whileHover={hoverAnimation}
        whileTap={hoverAnimation}
        initial="exit"
        animate="idle"
        transition={cardTransition}
        onClick={() => {
          fileInputRef.current?.click();
        }}
        className="flex cursor-pointer items-center justify-center rounded-xl py-2"
      >
        {isImportLoading ? (
          <motion.div
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="font-S-CoreDream-500 text-lg select-none"
          >
            가져오는 중...
          </motion.div>
        ) : (
          <motion.div
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="font-S-CoreDream-400 text-standard flex items-center gap-x-1.5 select-none"
          >
            일정 가져오기 <Import className="size-[20px] text-[#eaeaea]" />
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
