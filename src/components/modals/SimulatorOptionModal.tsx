'use client';

import Modal from '#/components/modals/Modal';
import { useState } from 'react';
import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { InsetNumberInput } from '#/components/PickupBanner';
import { motion } from 'motion/react';
import {
  fontPop,
  insetInputVariants,
  toggleButtonVariants,
  toOpacityZero,
} from '#/constants/variants';

/* 가챠 배너는 20개까지 */

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PresetPhotoToggle = ({
  isLeft,
  onTypeClick,
  leftName,
  rightName,
}: {
  isLeft: boolean;
  onTypeClick: () => void;
  leftName: string;
  rightName: string;
}) => {
  return (
    <div className="flex min-w-[100px] flex-col space-y-1 text-sm">
      <motion.div
        variants={insetInputVariants}
        animate="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        onClick={onTypeClick}
        className="relative flex h-[36px] cursor-pointer items-center justify-center rounded-xl px-4 pt-3 pb-2 font-bold"
      >
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative w-full text-center whitespace-nowrap"
        >
          <motion.div
            variants={fontPop}
            animate={isLeft ? 'inAcitve' : 'active'}
            initial={isLeft ? 'active' : 'inAcitve'}
            exit="exit"
            className="font-S-CoreDream-700"
          >
            {leftName}
          </motion.div>
        </motion.div>
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative w-full text-center whitespace-nowrap"
        >
          <motion.div
            variants={fontPop}
            animate={isLeft ? 'inAcitve' : 'active'}
            initial={isLeft ? 'active' : 'inAcitve'}
            exit="exit"
            className="font-S-CoreDream-700"
          >
            {rightName}
          </motion.div>
        </motion.div>
        <div className="absolute top-0 flex size-full">
          <motion.div
            transition={{
              left: { type: 'spring', visualDuration: 0.3, bounce: 0.2 },
            }}
            animate={isLeft ? { left: 0 } : { left: '50%' }}
            className="relative h-full w-1/2 p-[2px]"
          >
            <motion.div
              variants={toggleButtonVariants}
              initial="exit"
              animate={isLeft ? 'left' : 'right'}
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex size-full items-center justify-center rounded-lg"
            >
              <motion.span variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
                {isLeft ? leftName : rightName}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default function SimulatorOptionModal({ isOpen, onClose }: SettingsModalProps) {
  const [settingA, setSettingA] = useState(false);
  const [settingB, setSettingB] = useState('option1');

  const handleSave = () => {
    console.log('설정 저장:', { settingA, settingB });
    onClose();
  };

  const onSaveClick = () => {};

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex h-0 w-[360px] flex-1 flex-col gap-4 gap-y-8 lg:w-[480px]">
        <div className="flex items-center justify-between">
          <motion.h1
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="font-S-CoreDream-700 text-2xl"
          >
            <motion.span className="text-amber-400">고오급</motion.span> 옵션
          </motion.h1>
          <CancelButton handleCancel={onClose} />
        </div>
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-3">
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              가챠확률 수정
            </motion.div>
            <div className="flex gap-x-3">
              <InsetNumberInput
                name="한정 확률"
                className="text-sm text-orange-400"
                onInputBlur={(e) => {
                  // updatePickupCount(stringToNumber(e.currentTarget.value), 'sixth');
                }}
                currentValue={'70'}
                max={100}
                animate
              />
              <InsetNumberInput
                name="통상 확률"
                className="text-sm text-sky-500"
                onInputBlur={(e) => {
                  // updatePickupCount(stringToNumber(e.currentTarget.value), 'sixth');
                }}
                currentValue={'50'}
                max={100}
                animate
              />
            </div>
          </div>
          <div className="flex flex-col gap-y-3">
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              시뮬레이션 횟수 제한
            </motion.div>
            <InsetNumberInput
              name=""
              className="text-sky-500"
              onInputBlur={(e) => {
                // updatePickupCount(stringToNumber(e.currentTarget.value), 'sixth');
              }}
              currentValue={'300'}
              max={300}
              animate
            >
              <motion.div
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="mr-3 text-sm"
              >
                합성옥
              </motion.div>
            </InsetNumberInput>
          </div>
          <div className="flex flex-col gap-y-3">
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              재화 소모 시뮬레이션 실패/성공 기준
            </motion.div>
            <PresetPhotoToggle
              isLeft={true}
              onTypeClick={() => {}}
              leftName="모든 배너 성공시"
              rightName="일정 소화 완료시"
            />
          </div>
          <div className="flex flex-col gap-y-3">
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              프리셋 배너 사진 표시 여부
            </motion.div>
            <PresetPhotoToggle isLeft={true} onTypeClick={() => {}} leftName="켬" rightName="끔" />
          </div>
        </div>
        <TypeSelectionButton
          name="추가하기"
          hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
          onTypeClick={() => {
            onSaveClick();
          }}
        />
      </div>
    </Modal>
  );
}
