'use client';

import Modal from '#/components/modals/Modal';
import { Dispatch, SetStateAction, useState } from 'react';
import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { InsetNumberInput } from '#/components/PickupBanner';
import { motion } from 'motion/react';
import { toOpacityZero } from '#/constants/variants';
import { SimulationOptions } from '#/components/PickupList';
import { stringToNumber } from '#/libs/utils';
import ToggleButton from '#/components/buttons/ToggleButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: SimulationOptions;
  setOptions: Dispatch<SetStateAction<SimulationOptions>>;
}

export default function SimulatorOptionModal({
  isOpen,
  onClose,
  options,
  setOptions,
}: SettingsModalProps) {
  const [localOptions, setLocalOptions] = useState<SimulationOptions>(options);

  const onSaveClick = () => {
    setOptions(localOptions);
    onClose();
  };

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
                  const { value } = e.currentTarget;
                  if (!value) return;
                  setLocalOptions((p) => ({
                    ...p,
                    probability: {
                      ...p.probability,
                      limited: stringToNumber(value),
                    },
                  }));
                }}
                currentValue={localOptions.probability.limited.toString()}
                max={100}
                animate
              >
                <motion.div
                  variants={toOpacityZero}
                  initial="exit"
                  animate="idle"
                  exit="exit"
                  className="relative top-[2px] mr-3 -ml-2 text-sm"
                >
                  %
                </motion.div>
              </InsetNumberInput>
              <InsetNumberInput
                name="통상 확률"
                className="text-sm text-sky-500"
                onInputBlur={(e) => {
                  const { value } = e.currentTarget;
                  if (!value) return;
                  setLocalOptions((p) => ({
                    ...p,
                    probability: {
                      ...p.probability,
                      normal: stringToNumber(value),
                    },
                  }));
                }}
                currentValue={localOptions.probability.normal.toString()}
                max={100}
                animate
              >
                {' '}
                <motion.div
                  variants={toOpacityZero}
                  initial="exit"
                  animate="idle"
                  exit="exit"
                  className="relative top-[2px] mr-3 -ml-2 text-sm"
                >
                  %
                </motion.div>
              </InsetNumberInput>
            </div>
          </div>
          <div className="flex flex-col gap-y-3">
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              시뮬레이션 횟수
            </motion.div>
            <InsetNumberInput
              name=""
              className="text-sky-500"
              onInputBlur={(e) => {
                const { value } = e.currentTarget;
                if (!value) return;
                setLocalOptions((p) => ({
                  ...p,
                  simulationTry: stringToNumber(value),
                }));
              }}
              currentValue={localOptions.simulationTry.toString()}
              inputWidth="w-20"
              max={100000}
              animate
            >
              <motion.div
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="relative top-[2px] mr-3 -ml-2 text-sm"
              >
                회
              </motion.div>
            </InsetNumberInput>
          </div>
          <div className="flex flex-col gap-y-3">
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              재화 소모 시뮬레이션 실패/성공 기준
            </motion.div>
            <ToggleButton
              isLeft={localOptions.winCondition === 'scheduleComplete'}
              onToggle={(isLeft?: boolean) => {
                setLocalOptions((p) => ({
                  ...p,
                  winCondition:
                    isLeft === undefined
                      ? p.winCondition === 'scheduleComplete'
                        ? 'allSuccess'
                        : 'scheduleComplete'
                      : isLeft
                        ? 'scheduleComplete'
                        : 'allSuccess',
                }));
              }}
              labels={{ left: '일정 소화 완료시', right: '모든 배너 성공시' }}
              className="h-[36px]"
            />
          </div>
          <div className="flex flex-col gap-y-3">
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              프리셋 배너 사진 표시 여부
            </motion.div>
            <ToggleButton
              isLeft={localOptions.showBannerImage}
              onToggle={(isLeft?: boolean) => {
                setLocalOptions((p) => ({
                  ...p,
                  showBannerImage: isLeft === undefined ? !p.showBannerImage : isLeft,
                }));
              }}
              labels={{ left: '켬', right: '끔' }}
              className="h-[36px]"
            />
          </div>
        </div>
        <TypeSelectionButton
          name="설정완료"
          hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
          onTypeClick={() => {
            onSaveClick();
          }}
        />
      </div>
    </Modal>
  );
}
