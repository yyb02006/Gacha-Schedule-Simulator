'use client';

import Modal from '#/components/modals/Modal';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { InsetNumberInput } from '#/components/PickupBanner';
import { AnimatePresence, motion } from 'motion/react';
import { toOpacityZero } from '#/constants/variants';
import { SimulationOptions } from '#/components/PickupList';
import { stringToNumber } from '#/libs/utils';
import ToggleButton from '#/components/buttons/ToggleButton';
import { LOCALE_NUMBER_PATTERN } from '#/constants/regex';
import SimpleBar from 'simplebar-react';

const Help = ({ onClose }: { onClose: () => void }) => {
  const isMouseDownOnTarget = useRef<boolean>(false);
  return (
    <motion.div
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          isMouseDownOnTarget.current = true;
        } else {
          isMouseDownOnTarget.current = false;
        }
      }}
      onMouseUp={(e) => {
        if (e.target === e.currentTarget && isMouseDownOnTarget.current) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          onClose();
        }
      }}
      role="button"
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed top-0 left-0 z-1000 size-full backdrop-blur-sm"
    >
      <SimpleBar className="h-full min-h-screen">
        <div className="flex w-full justify-center">
          <div className="h-fit max-w-[400px] space-y-5 bg-[#202020] px-4 pt-6 pb-[120px] lg:rounded-lg lg:px-6 lg:py-6">
            <div className="flex items-center justify-between">
              <h1 className="font-S-CoreDream-500 text-xl">
                <span className="text-red-400">옵션 작동</span> 안내
              </h1>
              <div className="size-11" />
              <div className="fixed right-4 z-[1000] lg:relative lg:right-auto lg:z-auto">
                <CancelButton
                  handleCancel={() => {
                    onClose();
                  }}
                />
              </div>
            </div>
            <div className="text-standard font-S-CoreDream-300 space-y-6">
              <div className="space-y-2">
                <div className="font-S-CoreDream-500 flex gap-1 text-lg text-amber-400">
                  <div className="my-[4px] w-[5px] self-stretch bg-amber-400" />
                  시뮬레이션 횟수
                </div>
                <div className="space-y-2 leading-7">
                  <div>
                    <span className="text-amber-400">PC환경</span>에서의 최대값은{' '}
                    <span className="text-amber-400">500,000회</span>이며 배너 최대 갯수인 20개에서
                    실행할 경우 <span className="text-red-400">최장 1분 이상</span>
                    까지 시뮬레이션 시간이 소모될 수 있습니다.
                  </div>
                  <div>
                    <span className="font-S-CoreDream-500 text-sky-500">모바일 환경</span>의 경우
                    최대 가챠 횟수가 제한될 수 있으며, PC환경의 10% ~ 20% 성능을 기준으로 합니다.
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-S-CoreDream-500 flex gap-1 text-lg text-teal-500">
                  <div className="my-[4px] w-[5px] self-stretch bg-teal-500" />
                  배너 실패시 동작
                </div>
                <div className="space-y-2 leading-7">
                  <div>
                    <span className="text-amber-400">해당회차 중단</span> 옵션을 선택했을 시에는
                    재화부족, 최대횟수 제한의 이유로 배너가 실패했을 때, 해당 회차 시뮬레이션{' '}
                    <span className="text-amber-400">일정을 종료하고 다음 시뮬레이션을 시작</span>
                    합니다. 성공 케이스에 대한 실제 데이터를 위해 사용할 수 있습니다.
                  </div>
                  <div>
                    <span className="font-S-CoreDream-500 text-sky-500">끝까지 진행</span> 옵션을
                    선택했을 시에는 재화부족, 최대횟수 제한의 이유로{' '}
                    <span className="text-sky-500">배너가 실패했을 때도 끝까지 진행</span>합니다.
                    재화부족의 경우 이후 배너는 전부 실패할 수 있는 등 의미없는 데이터가 섞일 수
                    있으나 현실에서는 재화가 부족해도 부족한 상태로 가챠일정을 진행해야하니 실제
                    행동에 더 가까울 수 있습니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SimpleBar>
    </motion.div>
  );
};

interface SimulatorOptionModalProps {
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
}: SimulatorOptionModalProps) {
  const [localOptions, setLocalOptions] = useState<SimulationOptions>(options);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const onSaveClick = () => {
    setOptions(localOptions);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdropBlur>
      <div className="flex h-full w-full max-w-[400px] flex-1 flex-col gap-4 gap-y-8 rounded-xl bg-[#202020] p-4 lg:w-[480px] lg:p-6">
        <AnimatePresence>
          {isHelpOpen && (
            <Help
              onClose={() => {
                setIsHelpOpen(false);
              }}
            />
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between">
          <motion.h1
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="font-S-CoreDream-700 flex items-center gap-2 text-2xl"
          >
            <div>
              <span className="text-amber-400">고오급</span> 옵션
            </div>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="font-S-CoreDream-500 flex aspect-square size-[26px] cursor-pointer items-center justify-center rounded-full border border-[#606060] text-[18px] text-[#606060] hover:border-amber-400 hover:text-amber-400"
            >
              <p className="select-none">?</p>
            </button>
          </motion.h1>
          <CancelButton handleCancel={onClose} />
        </div>
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-3">
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              시뮬레이션 횟수
            </motion.div>
            <InsetNumberInput
              name=""
              pattern={LOCALE_NUMBER_PATTERN.source}
              className="text-sky-500"
              onInputBlur={(e, syncLocalValue) => {
                const { value } = e.currentTarget;
                const newValue = value.replace(/,/g, '');
                if (stringToNumber(newValue) <= 1000000) {
                  setLocalOptions((p) => ({
                    ...p,
                    simulationTry: stringToNumber(newValue),
                  }));
                } else {
                  syncLocalValue(localOptions.simulationTry.toLocaleString());
                }
              }}
              currentValue={localOptions.simulationTry.toLocaleString()}
              inputWidth="w-20"
              max={1000000}
              animate
            >
              <motion.div
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="relative top-[2px] mr-3 -ml-2 text-sm select-none"
              >
                회
              </motion.div>
            </InsetNumberInput>
          </div>
          <div className="flex flex-col gap-y-3">
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              N회차 시뮬레이션 중 배너 실패 시 동작
            </motion.div>
            <ToggleButton
              isLeft={localOptions.bannerFailureAction === 'interruption'}
              onToggle={(isLeft?: boolean) => {
                setLocalOptions((p) => ({
                  ...p,
                  bannerFailureAction:
                    isLeft === undefined
                      ? p.bannerFailureAction === 'continueExecution'
                        ? 'interruption'
                        : 'continueExecution'
                      : isLeft
                        ? 'interruption'
                        : 'continueExecution',
                }));
              }}
              labels={{ left: '해당 회차 중단', right: '끝까지 진행' }}
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
