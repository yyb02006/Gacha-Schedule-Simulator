'use client';

import AdjustmentButton from '#/components/buttons/AdjustmentButton';
import SimulatorOptionModal from '#/components/modals/SimulatorOptionModal';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { cardVariants, toOpacityZero } from '#/constants/variants';
import { AnimatePresence, motion } from 'motion/react';
import { Dispatch, SetStateAction, useState } from 'react';
import SimulatorTypeButton from '#/components/buttons/SimulatorTypeButton';
import ToggleButton from '#/components/buttons/ToggleButton';
import { SimulationOptions } from '#/components/PickupList';
import { stringToNumber, truncateToDecimals } from '#/libs/utils';
import Modal from '#/components/modals/Modal';
import CancelButton from '#/components/buttons/CancelButton';
import ChevronDown from '#/icons/ChevronDown.svg';
import ChevronUp from '#/icons/ChevronUp.svg';
import Maximize from '#/icons/Maximize.svg';
import Minimize from '#/icons/Minimize.svg';
import { InsetNumberInput, onInsetNumberInputBlur } from '#/components/PickupBanner';
import { LOCALE_NUMBER_PATTERN } from '#/constants/regex';
import { BatchGachaGoal } from '#/types/types';

const Help = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} activeToTop backdropBlur>
      <section className="relative mb-[120px] flex w-full max-w-[1280px] flex-col gap-y-5 rounded-xl bg-[#202020] pt-5 pb-8 lg:pt-6">
        <div className="flex items-start justify-between px-4 lg:items-center lg:px-6">
          <h1 className="font-S-CoreDream-500 flex-1 text-xl lg:text-2xl">
            <span className="text-amber-400">시뮬레이션 및 배너 사전설정</span>에 대한 안내
          </h1>
          <CancelButton
            handleCancel={() => {
              onClose();
            }}
          />
        </div>
        <section className="space-y-5 bg-[#303030] px-4 py-5 lg:px-6">
          <h1 className="font-S-CoreDream-500 flex items-stretch">
            <div className="my-[3px] w-[5px] self-stretch bg-teal-400" />
            <span className="ml-1.5 text-teal-400">
              <span>시뮬레이션 모드</span>
            </span>
          </h1>
          <ol className="list-decimal space-y-4 pl-4">
            <li className="space-y-2 text-amber-400">
              <h1 className="font-S-CoreDream-500">가챠 확률 시뮬레이션</h1>
              <div className="flex h-10 max-w-[400px] items-center justify-center rounded-lg bg-gradient-to-r from-[#bb4d00] to-[#ffb900]">
                <span className="text-[#eaeaea] select-none">가챠 확률 시뮬레이션</span>
              </div>
              <div className="text-standard font-S-CoreDream-300 leading-7 text-[#eaeaea]">
                기본적으로 재화의 양에 상관 없이{' '}
                <span className="font-S-CoreDream-400 text-amber-400">
                  [가챠 목표를 달성하기 위한 기대값]
                </span>
                을 알기 위한 시뮬레이션 모드입니다.
                <br />
                추가적인 옵션을 통해 가챠 최소, 최대 횟수의 제한은 가능하고, 이때 실패 / 성공 여부는
                정해질 수 있습니다.
              </div>
            </li>
            <li className="space-y-2 text-sky-500">
              <h1 className="font-S-CoreDream-500">재화 소모 시뮬레이션</h1>
              <div className="flex h-10 max-w-[400px] items-center justify-center rounded-lg bg-gradient-to-r from-[#1447e6] to-[#51a2ff]">
                <span className="text-[#eaeaea] select-none">재화 소모 시뮬레이션</span>
              </div>
              <div className="text-standard font-S-CoreDream-300 leading-7 text-[#eaeaea]">
                초기 재화와 각 배너마다 배너 종료시까지 추가 가능한 오리지늄의 값을 입력받아{' '}
                <span className="font-S-CoreDream-400 text-sky-500">
                  [한정된 재화로 주어진 가챠 일정을 소화할 수 있는지]
                </span>
                를 알기 위한 시뮬레이션 모드입니다.
                <br />
                가챠 1회에 필요한 오리지늄은 600Gay며, 가챠 진행중인 배너에서 목표 달성 이전에 잔여
                오리지늄이 600개 이하가될 시 해당회차 시뮬레이션은 실패처리 됩니다.
              </div>
            </li>
          </ol>
        </section>
        <section className="space-y-5 bg-[#303030] px-4 py-5 lg:px-6">
          <h1 className="font-S-CoreDream-500 flex items-stretch">
            <div className="my-[3px] w-[5px] self-stretch bg-teal-400" />
            <span className="ml-1.5 text-teal-400">
              <span>기본옵션과 세부옵션</span>
            </span>
          </h1>
          <ol className="list-decimal space-y-4 pl-4">
            <li className="space-y-2 text-amber-400">
              <h1 className="font-S-CoreDream-500">기본옵션</h1>
              <div className="flex w-fit items-center justify-center rounded-lg bg-gradient-to-br from-[#bb4d00] to-[#ffb900] px-3 py-1.5">
                <span className="font-S-CoreDream-500 text-sm text-[#eaeaea] select-none">
                  기본옵션
                </span>
              </div>
              <div className="text-standard font-S-CoreDream-300 leading-7 text-[#eaeaea]">
                세부적인 옵션 컨트롤 없이, 픽업 오퍼레이터 수와 목표 오퍼레이터 수만 입력받아
                시뮬레이션을 실행합니다.
                <br />
                각 희귀도별 픽업 오퍼레이터 수는 배너 종류마다 가지고 있는 한계를 넘길 수 없으며,
                목표 오퍼레이터 수는 기본적으로 픽업 오퍼레이터의 수보다 높을 수 없지만, 픽업
                오퍼레이터의 수가 배너 한계까지 늘어나지 않은 상태라면 목표 오퍼레이터의 수가 현재
                픽업 오퍼레이터의 수보다 높을 시 자동으로 픽업 오퍼레이터의 수도 증가합니다.
                <br />
                일괄 설정된 가챠 목표가 없을 시, 모든 목표{' '}
                <span className="font-S-CoreDream-400 text-amber-400">
                  오퍼레이터의 최초 획득(명함)
                </span>
                이 배너 성공의 기준이 됩니다.
                <br />
                천장 보상 오퍼레이터가 있는 배너의 경우 내부 로직에 의해 천장이 결정되고 수행됩니다.
              </div>
            </li>
            <li className="space-y-2 text-sky-500">
              <h1 className="font-S-CoreDream-500">세부옵션</h1>
              <div className="flex w-fit items-center justify-center rounded-lg bg-gradient-to-br from-[#1447e6] to-[#51a2ff] px-3 py-1.5">
                <span className="font-S-CoreDream-50 text-sm text-[#eaeaea] select-none">
                  세부옵션
                </span>
              </div>
              <div className="text-standard font-S-CoreDream-300 space-y-2 leading-7 text-[#eaeaea]">
                <div>
                  각 배너별 조건과 세부 목표를 지정할 수 있습니다. 각 옵션에 대한 설명은 아래와
                  같습니다.
                </div>
                <ol className="ml-5 list-disc space-y-2">
                  <li>
                    <span className="font-S-CoreDream-400 text-amber-400">
                      [최대 시도 / 무제한 옵션]
                    </span>{' '}
                    : 목표를 달성하지 못했더라도{' '}
                    <span className="font-S-CoreDream-400 text-amber-400">
                      최대 시도만큼 가챠를 진행했다면 가챠를 종료
                    </span>
                    합니다. 이 경우 배너의 이번 회차 가챠 결과는 실패로 처리되며, 무제한 옵션으로
                    제한을 없앨 수 있지만, 실제로는 성능 제어를 위해 시스템 내부적으로 3000번의
                    제한을 갖습니다.
                  </li>
                  <li>
                    <span className="font-S-CoreDream-400 text-sky-500">
                      [최소 시도 / 첫6성 옵션]
                    </span>{' '}
                    : 목표를 달성했더라도{' '}
                    <span className="font-S-CoreDream-400 text-sky-500">
                      최소 시도만큼 가챠를 진행하지 않았다면 가챠를 계속 진행
                    </span>
                    합니다. 첫6성 옵션을 활성화할 경우 6성 하나를 얻었다면 결과에 상관없이 배너를
                    종료합니다. 이 때 목표를 달성하지 못한 상태라면, 배너의 이번 회차 가챠 결과는
                    실패처리됩니다.
                  </li>
                  <li>
                    <span className="font-S-CoreDream-400 text-orange-400">
                      [픽업 수량 입력 필드]
                    </span>{' '}
                    : 배너에서 제공하는 확률 상승한 픽업 오퍼레이터의 수를 입력합니다. 각 희귀도별
                    픽업 오퍼레이터 수는 배너 종류마다 가지고 있는 한계를 넘길 수 없습니다.
                  </li>
                  <li>
                    <span className="font-S-CoreDream-400 text-red-400">[목표 픽업 목록]</span> : +
                    버튼을 눌러 목표 오퍼레이터를 추가할 수 있습니다. 기본적으로 픽업 오퍼레이터의
                    수보다 많이 추가할 수 없지만, 픽업 오퍼레이터의 수가 배너 한계까지 늘어나지 않은
                    상태라면, 목표 오퍼레이터의 수가 현재 픽업 오퍼레이터의 수보다 많아질 시
                    자동으로 픽업 오퍼레이터의 수가 증가합니다.
                  </li>
                  <li>
                    <span className="font-S-CoreDream-400 text-violet-400">
                      [목표 픽업목록 세부 옵션]
                    </span>{' '}
                    : 이름필드를 클릭하여{' '}
                    <span className="font-S-CoreDream-400 text-violet-400">오퍼레이터의 이름</span>
                    을 바꿀 수 있으며, 오퍼레이터의 뱃지를 클릭하여{' '}
                    <span className="font-S-CoreDream-400 text-violet-400">
                      현재 오퍼레이터의 희귀도 및 한정 여부
                    </span>
                    를 바꿀 수 있습니다. 사용 가능한 뱃지는 현재 배너의 제한 사항을 따르며, 천장이
                    있는 배너의 경우{' '}
                    <span className="font-S-CoreDream-400 text-violet-400">
                      천장 오퍼레이터는 입력받은 조건에 따라 자동
                    </span>
                    으로 정해집니다. 가챠목표는 명함(이미 있는 경우 1회 획득)만 얻을지, 풀잠재를
                    완성할지 두 가지 옵션을 선택할 수 있으며, 입력 받은 현재 잠재 수를 기반으로
                    가챠목표까지의 필요 등장 횟수를 계산합니다.
                  </li>
                </ol>
              </div>
            </li>
          </ol>
        </section>
        <section className="space-y-5 bg-[#303030] px-4 py-5 lg:px-6">
          <h1 className="font-S-CoreDream-500 flex items-stretch">
            <div className="my-[3px] w-[5px] self-stretch bg-teal-400" />
            <span className="ml-1.5 text-teal-400">
              <span>배너 헤더</span>
            </span>
          </h1>
          <ol className="list-decimal space-y-4 pl-4">
            <li className="space-y-2 text-amber-400">
              <h1 className="font-S-CoreDream-500">활성화 / 비활성화</h1>
              <div className="flex h-10 max-w-[150px] min-w-[100px] flex-col space-y-1">
                <div className="font-S-CoreDream-500 relative flex h-full items-center rounded-xl text-sm shadow-[inset_6px_6px_13px_#101010,inset_-6px_-6px_13px_#303030]">
                  <div className="relative top-[2px] left-[2px] flex h-full w-1/2 items-center justify-center px-3 text-center whitespace-nowrap text-[#a4a4a4] select-none">
                    활성화
                  </div>
                  <div className="relative top-[2px] right-[2px] flex h-full w-1/2 items-center justify-center px-3 text-center whitespace-nowrap text-[#a4a4a4] select-none">
                    비활성화
                  </div>
                  <div className="absolute top-0 flex size-full">
                    <div className="relative h-full w-1/2 p-[2px]">
                      <div className="flex size-full items-center justify-center rounded-lg bg-gradient-to-br from-[#bb4d00] to-[#ffb900] shadow-[4px_4px_12px_#202020,-5px_-4px_10px_#404040]">
                        <span className="text-[#eaeaea] select-none">활성화</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-standard font-S-CoreDream-300 leading-7 text-[#eaeaea]">
                배너를 삭제하지 않고 가챠 일정에서 제외시킬 수 있습니다.
              </div>
            </li>
            <li className="space-y-2 text-amber-400">
              <h1 className="font-S-CoreDream-500">위 / 아래 순서 변경 버튼</h1>
              <div className="flex gap-x-2">
                <div className="relative size-11 shrink-0 rounded-xl bg-gradient-to-br from-[#282828] to-[#3e3e3e] p-1 text-amber-400 shadow-[4px_4px_12px_#101010,-5px_-4px_10px_#303030]">
                  <ChevronDown className="size-full" />
                </div>
                <div className="relative size-11 shrink-0 rounded-xl bg-gradient-to-br from-[#282828] to-[#3e3e3e] p-1 text-amber-400 shadow-[4px_4px_12px_#101010,-5px_-4px_10px_#303030]">
                  <ChevronUp className="size-full" />
                </div>
              </div>
              <div className="text-standard font-S-CoreDream-300 leading-7 text-[#eaeaea]">
                시뮬레이터에서 가챠 일정의 순서는 중요하며 특히 재화 소모 모드, 세부 옵션 모드가
                켜져있다면 더욱 그렇습니다. 위 / 아래 순서 변경 버튼으로 가챠 배너 실행 시점을
                조정할 수 있습니다.
              </div>
            </li>
            <li className="space-y-2 text-amber-400">
              <h1 className="font-S-CoreDream-500">최소화 / 최대화 버튼</h1>
              <div className="flex gap-x-2">
                <div className="relative size-11 shrink-0 rounded-xl bg-gradient-to-br from-[#282828] to-[#3e3e3e] p-1 text-[#51a2ff] shadow-[4px_4px_12px_#101010,-5px_-4px_10px_#303030]">
                  <Maximize className="size-full" />
                </div>
                <div className="relative size-11 shrink-0 rounded-xl bg-gradient-to-br from-[#282828] to-[#3e3e3e] p-1 text-[#51a2ff] shadow-[4px_4px_12px_#101010,-5px_-4px_10px_#303030]">
                  <Minimize className="mt-2 size-full" />
                </div>
              </div>
              <div className="text-standard font-S-CoreDream-300 leading-7 text-[#eaeaea]">
                각 배너를 접거나 펼칩니다
              </div>
            </li>
          </ol>
        </section>
      </section>
    </Modal>
  );
};

const ControlPanel = ({
  isTrySim,
  onSimulationModeToggle,
  isSimpleMode,
  onOptionModeToggle,
  batchGachaGoal,
  onBatchGachaGoalClick,
  initialResource,
  onInitialResourceBlur,
}: {
  isTrySim: boolean;
  onSimulationModeToggle: (isLeft?: boolean) => void;
  isSimpleMode: boolean;
  onOptionModeToggle: (isLeft?: boolean) => void;
  batchGachaGoal: BatchGachaGoal;
  onBatchGachaGoalClick: (type: 'allFirst' | 'allMax') => void;
  initialResource: number;
  onInitialResourceBlur: onInsetNumberInputBlur;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <SimulatorTypeButton isTrySim={isTrySim} onTypeClick={onSimulationModeToggle} />
      <div className="flex flex-wrap justify-between space-y-4 lg:space-y-0">
        <div className="flex w-full flex-wrap gap-x-6 gap-y-4 lg:w-auto lg:gap-y-3">
          <div className="flex w-full items-center gap-x-3 text-sm lg:w-auto">
            <div className="flex w-full gap-x-3 lg:w-fit">
              <TypeSelectionButton
                name="6성 올명함"
                hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
                onTypeClick={() => {
                  onBatchGachaGoalClick('allFirst');
                }}
                isActive={batchGachaGoal === 'allFirst'}
                className="w-full px-4 whitespace-nowrap lg:w-auto"
              />
              <TypeSelectionButton
                name="6성 올풀잠"
                hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
                onTypeClick={() => {
                  onBatchGachaGoalClick('allMax');
                }}
                isActive={batchGachaGoal === 'allMax'}
                className="w-full px-4 whitespace-nowrap lg:w-auto"
              />
            </div>
          </div>
          <AnimatePresence>
            {isTrySim || (
              <div className="flex w-full items-center gap-x-3 text-sm lg:w-auto">
                <InsetNumberInput
                  name="초기재화"
                  pattern={LOCALE_NUMBER_PATTERN.source}
                  onInputBlur={onInitialResourceBlur}
                  currentValue={initialResource.toLocaleString()}
                  max={9999999}
                  inputWidth="w-full lg:w-20"
                  fullSize="w-full lg:w-auto"
                >
                  <div className="relative top-[1px] mr-3 -ml-2">합성옥</div>
                </InsetNumberInput>
              </div>
            )}
          </AnimatePresence>
        </div>
        <ToggleButton
          isLeft={isSimpleMode}
          labels={{ left: '기본옵션', right: '세부옵션' }}
          onToggle={onOptionModeToggle}
          className="h-[40px] w-full lg:h-auto lg:w-auto"
        />
      </div>
    </div>
  );
};

export default function OptionBar({
  isTrySim,
  setIsGachaSim,
  isSimpleMode,
  setIsSimpleMode,
  options,
  setOptions,
  runningTime,
  batchGachaGoal,
  setBatchGachaGoal,
  initialResource,
  setInitialResource,
}: {
  isTrySim: boolean;
  setIsGachaSim: Dispatch<SetStateAction<boolean>>;
  isSimpleMode: boolean;
  setIsSimpleMode: Dispatch<SetStateAction<boolean>>;
  options: SimulationOptions;
  setOptions: Dispatch<SetStateAction<SimulationOptions>>;
  runningTime: number | null;
  batchGachaGoal: BatchGachaGoal;
  setBatchGachaGoal: Dispatch<SetStateAction<BatchGachaGoal>>;
  initialResource: number;
  setInitialResource: Dispatch<SetStateAction<number>>;
}) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const onOptionModeToggle = (isLeft?: boolean) => {
    setIsSimpleMode((p) => (isLeft === undefined ? !p : isLeft));
  };
  const onSimulationModeToggle = (isLeft?: boolean) => {
    if (isLeft === undefined) {
      setIsGachaSim((p) => !p);
    } else {
      setIsGachaSim(isLeft);
    }
  };

  const onInitialResourceBlur: onInsetNumberInputBlur = (e, syncLocalValue) => {
    const { value } = e.currentTarget;
    const newValue = value.replace(/,/g, '');
    const numberValue = stringToNumber(newValue);
    if (numberValue <= 9999999) {
      setInitialResource(numberValue);
    } else {
      syncLocalValue('9999999');
      setInitialResource(9999999);
    }
  };

  const onBatchGachaGoalClick: (type: 'allFirst' | 'allMax') => void = (type) => {
    if (batchGachaGoal !== type) {
      setBatchGachaGoal(type);
    } else {
      setBatchGachaGoal(null);
    }
  };
  return (
    <motion.div
      variants={cardVariants}
      initial="exit"
      animate="idle"
      className="flex w-full flex-col gap-y-4 rounded-xl p-3"
    >
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        className="font-S-CoreDream-400 lg:font-S-CoreDream-500 flex justify-between"
      >
        <div className="flex items-center gap-x-2">
          {runningTime ? (
            <span className="space-x-2.5">
              <span>
                시뮬레이션 <span className="text-amber-400">완료</span>
              </span>
              <span className="font-S-CoreDream-300 text-sm">
                ⏱ {truncateToDecimals(runningTime / 1000)}초
              </span>
            </span>
          ) : (
            <>
              <span className="lg:hidden">
                <span className="text-standard text-amber-400">▶ </span>버튼을 눌러 시뮬레이션 시작
              </span>
              <span className="hidden lg:inline">
                <span className="text-amber-400">플레이 버튼(▶)</span>을 눌러 시뮬레이션을
                시작해보세요
              </span>
            </>
          )}
          <button
            onClick={() => isSettingsModalOpen || setIsHelpOpen(true)}
            className="font-S-CoreDream-500 flex aspect-square size-[22px] cursor-pointer items-center justify-center rounded-full border border-[#606060] text-[15px] text-[#606060] hover:border-amber-400 hover:text-amber-400"
          >
            <p className="select-none">?</p>
          </button>
        </div>
        <AdjustmentButton onClick={() => isHelpOpen || setIsSettingsModalOpen(true)} />
      </motion.div>
      <ControlPanel
        isTrySim={isTrySim}
        onSimulationModeToggle={onSimulationModeToggle}
        isSimpleMode={isSimpleMode}
        onOptionModeToggle={onOptionModeToggle}
        batchGachaGoal={batchGachaGoal}
        onBatchGachaGoalClick={onBatchGachaGoalClick}
        initialResource={initialResource}
        onInitialResourceBlur={onInitialResourceBlur}
      />
      <SimulatorOptionModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        options={options}
        setOptions={setOptions}
      />
      <Help isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </motion.div>
  );
}
