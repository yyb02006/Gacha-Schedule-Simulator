'use client';

import AdjustmentButton from '#/components/buttons/AdjustmentButton';
import SimulatorOptionModal from '#/components/modals/SimulatorOptionModal';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { cardVariants, insetInputVariants, toOpacityZero } from '#/constants/variants';
import { AnimatePresence, motion } from 'motion/react';
import { ChangeEvent, Dispatch, FocusEvent, SetStateAction, useState } from 'react';
import SimulatorTypeButton from '#/components/buttons/SimulatorTypeButton';
import ToggleButton from '#/components/buttons/ToggleButton';
import { InitialInputs, SimulationOptions } from '#/components/PickupList';
import { clamp, normalizeNumberString, stringToNumber } from '#/libs/utils';

const ControlPanel = ({
  isGachaSim,
  onTypeClick,
  isSimpleMode,
  onViewModeToggle,
  initialInputs,
}: {
  isGachaSim: boolean;
  onTypeClick: (isLeft?: boolean) => void;
  isSimpleMode: boolean;
  onViewModeToggle: (isLeft?: boolean) => void;
  initialInputs: InitialInputs;
}) => {
  const [initialGachaGoal, setInitialGachaGoal] = useState<'allFirst' | 'allMax' | null>(null);
  const [initialResource, setInitialResource] = useState('0');
  return (
    <div className="flex flex-col gap-4">
      <SimulatorTypeButton isGachaSim={isGachaSim} onTypeClick={onTypeClick} />
      <div className="flex flex-wrap justify-between">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <div className="flex items-center gap-x-3 text-sm">
            <motion.span
              variants={toOpacityZero}
              initial="exit"
              animate="idle"
              exit="exit"
              className="font-S-CoreDream-400 whitespace-nowrap"
            >
              프리셋
            </motion.span>
            <div className="flex w-fit gap-x-3">
              <TypeSelectionButton
                name="6성 올명함"
                hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
                onTypeClick={() => {
                  if (initialInputs.gachaGoal !== 'allFirst') {
                    initialInputs.gachaGoal = 'allFirst';
                    setInitialGachaGoal('allFirst');
                  } else {
                    initialInputs.gachaGoal = null;
                    setInitialGachaGoal(null);
                  }
                }}
                isActive={initialGachaGoal === 'allFirst'}
                className="px-4 whitespace-nowrap"
              />
              <TypeSelectionButton
                name="6성 올풀잠"
                hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
                onTypeClick={() => {
                  if (initialInputs.gachaGoal !== 'allMax') {
                    initialInputs.gachaGoal = 'allMax';
                    setInitialGachaGoal('allMax');
                  } else {
                    initialInputs.gachaGoal = null;
                    setInitialGachaGoal(null);
                  }
                }}
                isActive={initialGachaGoal === 'allMax'}
                className="px-4 whitespace-nowrap"
              />
            </div>
          </div>
          <AnimatePresence>
            {isGachaSim || (
              <div className="flex items-center gap-x-3 text-sm">
                <motion.span
                  variants={toOpacityZero}
                  initial="exit"
                  animate="idle"
                  exit="exit"
                  className="font-S-CoreDream-400 whitespace-nowrap"
                >
                  초기재화
                </motion.span>
                <motion.div
                  variants={insetInputVariants}
                  initial="exit"
                  animate="idle"
                  exit="exit"
                  className="relative flex items-center rounded-lg px-3"
                >
                  <motion.div
                    variants={toOpacityZero}
                    initial="exit"
                    animate="idle"
                    exit="exit"
                    className="relative flex items-center px-2 py-2"
                  >
                    <input
                      type="number"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const { value } = e.currentTarget;
                        const numberString = normalizeNumberString(value);
                        if (numberString === undefined) return;
                        const normalizedString = Math.floor(
                          clamp(parseFloat(numberString), 0),
                        ).toString();
                        setInitialResource(normalizedString);
                      }}
                      onBlur={(e: FocusEvent<HTMLInputElement>) => {
                        if (!e.currentTarget.value) return;
                        initialInputs.initialResource = stringToNumber(e.currentTarget.value);
                      }}
                      className="relative w-14 min-w-0 text-right"
                      value={initialResource}
                    />
                  </motion.div>
                  <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
                    합성옥
                  </motion.div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
        <ToggleButton
          isLeft={isSimpleMode}
          labels={{ left: '기본옵션', right: '세부옵션' }}
          onToggle={onViewModeToggle}
        />
      </div>
    </div>
  );
};

export default function OptionBar({
  isGachaSim,
  setIsGachaSim,
  isSimpleMode,
  setIsSimpleMode,
  initialInputs,
  options,
  setOptions,
}: {
  isGachaSim: boolean;
  setIsGachaSim: Dispatch<SetStateAction<boolean>>;
  isSimpleMode: boolean;
  setIsSimpleMode: Dispatch<SetStateAction<boolean>>;
  initialInputs: InitialInputs;
  options: SimulationOptions;
  setOptions: Dispatch<SetStateAction<SimulationOptions>>;
}) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const onViewModeToggle = (isLeft?: boolean) => {
    setIsSimpleMode((p) => (isLeft === undefined ? !p : isLeft));
  };
  const onGachaSimToggle = (isLeft?: boolean) => {
    if (isLeft === undefined) {
      setIsGachaSim((p) => !p);
    } else {
      setIsGachaSim(isLeft);
    }
  };
  return (
    <motion.div
      variants={cardVariants}
      initial="exit"
      animate="idle"
      className="flex w-full flex-col gap-y-4 rounded-xl p-4"
    >
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        className="font-S-CoreDream-500 flex justify-between"
      >
        <div className="flex items-center">
          <span className="text-amber-400">플레이 버튼(▶)</span>을 눌러 시뮬레이션을 시작해보세요
        </div>
        <AdjustmentButton onClick={() => setIsSettingsModalOpen(true)} />
      </motion.div>
      <SimulatorOptionModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        options={options}
        setOptions={setOptions}
      />
      <ControlPanel
        isGachaSim={isGachaSim}
        onTypeClick={onGachaSimToggle}
        isSimpleMode={isSimpleMode}
        onViewModeToggle={onViewModeToggle}
        initialInputs={initialInputs}
      />
    </motion.div>
  );
}
