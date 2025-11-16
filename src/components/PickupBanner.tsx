'use client';

import { AnimatePresence, motion } from 'motion/react';
import { insetInputVariants, toOpacityZero } from '#/constants/variants';
import {
  Dummy,
  ExtractPayloadFromAction,
  Operator,
  PickupDatasAction,
} from '#/components/PickupList';
import DeleteButton from '#/components/buttons/DeleteButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import AddButton from '#/components/buttons/AddButton';
import {
  clamp,
  cls,
  getOperatorsByRarity,
  normalizeNumberString,
  stringToNumber,
} from '#/libs/utils';
import React, {
  ActionDispatch,
  ChangeEvent,
  FocusEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { bannerBadgeProps, operatorBadgeProps } from '#/constants/ui';
import OperatorBadgeEditModal from '#/components/modals/OperatorBadgeEditModal';
import Badge from '#/components/Badge';
import BannerBadgeEditModal from '#/components/modals/BannerBadgeEditModal';
import { GachaType, OperatorRarity, OperatorRarityForString, OperatorType } from '#/types/types';
import { useSyncedState } from '#/hooks/useSyncedState';
import Image from 'next/image';
import ToggleButton from '#/components/buttons/ToggleButton';
import SmallButton from '#/components/buttons/SmallButton';
import FoldButton from '#/components/buttons/MaximizeButton';
import ChevronDown from '#/icons/ChevronDown.svg';
import ChevronUp from '#/icons/ChevronUp.svg';
import Tag from '#/icons/Tag.svg';
import { operatorLimitByBannerType, rarities } from '#/constants/variables';

const MaxAttempts = ({
  maxGachaAttempts,
  isFirstSixthTry,
  onUnlimitedClick,
  onInputBlur,
}: {
  maxGachaAttempts: string;
  isFirstSixthTry: boolean;
  onUnlimitedClick: () => void;
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
}) => {
  return (
    <InsetNumberInput
      currentValue={maxGachaAttempts.toString()}
      name="최대 시도"
      onInputBlur={onInputBlur}
      isFirstSixthTry={isFirstSixthTry}
      className="text-amber-400"
      inputWidth="w-10"
      max={9999}
      showAttemptsSign
    >
      <TypeSelectionButton
        name="무제한"
        className="px-3 text-sm"
        onTypeClick={onUnlimitedClick}
        hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
      />
    </InsetNumberInput>
  );
};

const MinAttempts = ({
  minGachaAttempts,
  isFirstSixthTry,
  onFirstSixth,
  onInputBlur,
}: {
  minGachaAttempts: string;
  isFirstSixthTry: boolean;
  onFirstSixth: () => void;
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="flex gap-x-3">
      <InsetNumberInput
        currentValue={minGachaAttempts.toString()}
        name="최소 시도"
        onInputBlur={onInputBlur}
        isFirstSixthTry={isFirstSixthTry}
        className="text-sky-500"
        inputWidth="w-10"
        max={999}
        showAttemptsSign
      >
        <TypeSelectionButton
          name="첫 6성"
          className="px-3 text-sm"
          onTypeClick={onFirstSixth}
          hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
        />
      </InsetNumberInput>
    </div>
  );
};

export const InsetNumberInput = ({
  children,
  onInputBlur,
  currentValue,
  name,
  inputWidth,
  className = '',
  max,
  maxLength,
  // immediateExit = false,
  showAttemptsSign = false,
  isFirstSixthTry,
  animate = false,
}: {
  children?: ReactNode;
  onInputBlur: (
    e: FocusEvent<HTMLInputElement>,
    syncLocalValue: React.Dispatch<React.SetStateAction<string>>,
  ) => void;
  currentValue: string;
  name: ReactNode;
  inputWidth?: string;
  className?: string;
  max?: number;
  maxLength?: number;
  immediateExit?: boolean;
  showAttemptsSign?: boolean;
  isFirstSixthTry?: boolean;
  animate?: boolean;
}) => {
  const [localValue, setLocalValue] = useSyncedState(currentValue);
  const isInfinity = currentValue === 'Infinity' && localValue === 'Infinity';
  const firstSixthTry = currentValue === '0' && localValue === '0' && isFirstSixthTry;
  /*   const isParentPresent = usePresenceData();
  const preventedTransition = { duration: 0, delay: 0 };
  const preventTransition = immediateExit && isParentPresent; */

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      {name ? (
        <motion.div
          variants={toOpacityZero}
          initial="exit"
          animate="idle"
          exit="exit"
          className={cls(className, 'flex h-full items-center')}
        >
          {name}
        </motion.div>
      ) : null}
      <motion.div
        variants={animate ? insetInputVariants : undefined}
        initial="exit"
        animate="idle"
        exit="exit"
        className="relative flex items-center rounded-lg shadow-[inset_6px_6px_13px_#101010,inset_-6px_-6px_13px_#303030]"
      >
        <motion.div
          variants={toOpacityZero}
          initial="exit"
          animate="idle"
          exit="exit"
          className="relative flex items-center px-4 py-2"
        >
          {showAttemptsSign && isInfinity && (
            <div className="absolute right-0 mr-4 text-3xl">∞</div>
          )}
          {showAttemptsSign && firstSixthTry && (
            <div className="absolute right-0 flex size-full items-center justify-center">
              첫 6성
            </div>
          )}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            onFocus={(e: FocusEvent<HTMLInputElement>) => {
              if (e.currentTarget.value === '0') {
                e.currentTarget.setSelectionRange(0, 1);
              }
            }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const { value } = e.currentTarget;
              const newValue = value.replace(/,/g, '');
              const numberString = normalizeNumberString(newValue);
              if (numberString === undefined) return;
              const normalizedString = Math.floor(
                clamp(parseFloat(numberString), 0, max),
              ).toString();
              setLocalValue(normalizedString);
            }}
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
              if (!e.currentTarget.value) return;
              onInputBlur(e, setLocalValue);
            }}
            className={cls('relative h-full min-w-0 text-right', inputWidth ?? 'w-8')}
            max={max}
            maxLength={maxLength}
            value={
              showAttemptsSign && (isInfinity || firstSixthTry)
                ? ''
                : stringToNumber(localValue.replace(/,/g, '')).toLocaleString()
            }
          />
        </motion.div>
        {children}
      </motion.div>
    </div>
  );
};

const AdditionalResUntilBannerEnd = ({
  onInputBlur,
  additionalResource,
}: {
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
  additionalResource: string;
}) => {
  const [localValue, setLocalValue] = useState(additionalResource);
  return (
    <div className="flex items-center gap-x-3 text-sm">
      <span className="font-S-CoreDream-400 whitespace-nowrap">배너 종료시까지 추가재화</span>
      <div className="relative flex items-center rounded-lg px-3 shadow-[inset_6px_6px_13px_#101010,inset_-6px_-6px_13px_#303030]">
        <div className="relative flex items-center px-2 py-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            onFocus={(e: FocusEvent<HTMLInputElement>) => {
              if (e.currentTarget.value === '0') {
                e.currentTarget.setSelectionRange(0, 1);
              }
            }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const { value } = e.currentTarget;
              const newValue = value.replace(/,/g, '');
              const numberString = normalizeNumberString(newValue);
              if (numberString === undefined) return;
              const normalizedString = Math.floor(clamp(parseFloat(numberString), 0)).toString();
              setLocalValue(normalizedString);
            }}
            onBlur={onInputBlur}
            className="relative w-14 min-w-0 text-right"
            value={stringToNumber(localValue).toLocaleString()}
          />
        </div>
        <div className="select-none">합성옥</div>
      </div>
    </div>
  );
};

const BannerBadges = ({
  gachaType,
  isSimpleMode,
  pickupData,
  onBannerBadgeChange,
}: {
  gachaType: GachaType;
  isSimpleMode: boolean;
  pickupData: Dummy;
  onBannerBadgeChange: (gachaType: GachaType) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const currentBadgeProp = bannerBadgeProps[gachaType].props;
  return (
    <>
      <motion.button
        onHoverStart={() => {
          setIsHover(true);
        }}
        onHoverEnd={() => {
          setIsHover(false);
        }}
        onClick={() => {
          setIsModalOpen(true);
        }}
        className="flex h-full cursor-pointer gap-x-1"
      >
        <div
          className={cls(
            currentBadgeProp.color,
            'rounded-full border px-3 py-1 text-sm whitespace-nowrap',
          )}
        >
          <div className="relative top-[1px] select-none">{currentBadgeProp.name}</div>
        </div>
        <motion.div
          animate={isHover ? { borderColor: '#ff637e' } : { borderColor: '#ffb900' }}
          transition={{ duration: 0.2 }}
          className="relative flex aspect-square h-full items-center justify-center rounded-full border border-amber-400"
        >
          <motion.div
            animate={isHover ? { rotateZ: 45, color: '#ff637e' } : { rotateZ: 0, color: '#ffb900' }}
            transition={{ duration: 0.2 }}
            className="text-amber-400"
          >
            <Tag className="size-full" />
          </motion.div>
        </motion.div>
      </motion.button>
      <BannerBadgeEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        isSimpleMode={isSimpleMode}
        pickupData={pickupData}
        onEditConfirmClick={onBannerBadgeChange}
      />
    </>
  );
};

const BannerHeader = ({
  id,
  index,
  currentName,
  isAnimateLocked,
  gachaType,
  isMinimized,
  isActive,
  isSimpleMode,
  pickupData,
  dataLength,
  onNameBlur,
  onBannerDelete,
  onBannerBadgeChange,
  onUpdateIndex,
  onMinimized,
  onToggle,
}: {
  id: string;
  index: number;
  currentName: string;
  isAnimateLocked: boolean;
  gachaType: GachaType;
  isMinimized: boolean;
  isActive: boolean;
  isSimpleMode: boolean;
  pickupData: Dummy;
  dataLength: number;
  onNameBlur: (e: FocusEvent<HTMLInputElement>) => void;
  onBannerDelete: () => void;
  onBannerBadgeChange: (gachaType: GachaType) => void;
  onUpdateIndex: (direction: 'increase' | 'decrease') => void;
  onMinimized: () => void;
  onToggle: (isLeft?: boolean) => void;
}) => {
  const [localValue, setLocalValue] = useState(currentName);
  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.currentTarget.value);
  };
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex h-full gap-x-4">
          <div className="relative">
            <FoldButton
              onFold={() => {
                if (isActive) {
                  onMinimized();
                }
              }}
              isFolded={isMinimized}
            />
            {isActive || (
              <div className="absolute top-0 left-0 size-full rounded-xl bg-[#505050aa]" />
            )}
          </div>
          <ToggleButton
            isLeft={isActive}
            labels={{ left: '활성화', right: '비활성화' }}
            onToggle={() => {
              onToggle();
            }}
          />
        </div>
        <DeleteButton
          onDelete={onBannerDelete}
          isDeletePrevent={dataLength === 1}
          className="shrink-0"
        />
      </div>
      <div className="flex grow gap-4">
        <SmallButton
          background="linear-gradient(135deg, #bb4d00, #ffb900)"
          color="#eaeaea"
          onButtonClick={() => {
            onUpdateIndex('increase');
          }}
          isAnimateLocked={isAnimateLocked}
          className="text-amber-400"
          isClickPrevent={index < 1}
        >
          <ChevronUp className="size-full" />
        </SmallButton>
        <SmallButton
          background="linear-gradient(135deg, #bb4d00, #ffb900)"
          color="#eaeaea"
          onButtonClick={() => {
            onUpdateIndex('decrease');
          }}
          isAnimateLocked={isAnimateLocked}
          className="text-amber-400"
          isClickPrevent={index >= dataLength - 1}
        >
          <ChevronDown className="size-full" />
        </SmallButton>
        <div className="font-S-CoreDream-700 flex items-center text-2xl">
          <span key={`${id} ${index + 1}`} className="select-none">
            {index + 1}.
          </span>
        </div>
        <div className="font-S-CoreDream-500 flex w-full items-center rounded-lg py-2 pr-2 pl-4 text-xl shadow-[inset_6px_6px_13px_#101010,inset_-6px_-6px_13px_#303030]">
          <input
            type="text"
            onChange={onNameChange}
            onBlur={onNameBlur}
            value={localValue}
            className="w-full"
          />
          <BannerBadges
            gachaType={gachaType}
            isSimpleMode={isSimpleMode}
            pickupData={pickupData}
            onBannerBadgeChange={onBannerBadgeChange}
          />
        </div>
      </div>
    </div>
  );
};

const SimplePreInfoField = ({
  isTrySim,
  pickupData,
  targetLimit,
  updateSimplePickupCount,
  updateAdditionalResource,
}: {
  isTrySim: boolean;
  pickupData: Dummy;
  targetLimit: Record<OperatorRarityForString, number>;
  updateSimplePickupCount: UpdateSimplePickupCount;
  updateAdditionalResource: (
    mode: 'simpleMode' | 'extendedMode',
    additionalResource: number,
  ) => void;
}) => {
  const {
    pickupDetails: {
      simpleMode: { pickupOpersCount, targetOpersCount },
    },
    id,
    additionalResource,
  } = pickupData;

  return (
    <div className="font-S-CoreDream-500 flex w-full flex-wrap justify-between gap-x-6 gap-y-3 text-sm">
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          <div className="flex gap-x-3">
            <InsetNumberInput
              name="픽업 6성"
              className="text-orange-400"
              onInputBlur={(e, syncLocalValue) => {
                const count = stringToNumber(e.currentTarget.value);
                const hasNoTargetOperators =
                  count === 0 && targetOpersCount.fifth === 0 && targetOpersCount.fourth === 0;
                updateSimplePickupCount({
                  count: hasNoTargetOperators ? 1 : count,
                  countType: 'pickupOpersCount',
                  rarityType: 'sixth',
                });
                syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
              }}
              currentValue={pickupOpersCount.sixth.toString()}
              max={targetLimit['sixth']}
            />
            <InsetNumberInput
              name="목표 6성"
              className="text-orange-400"
              onInputBlur={(e, syncLocalValue) => {
                const count = stringToNumber(e.currentTarget.value);
                const hasNoTargetOperators =
                  count === 0 && targetOpersCount.fifth === 0 && targetOpersCount.fourth === 0;
                updateSimplePickupCount({
                  count: hasNoTargetOperators ? 1 : count,
                  countType: 'targetOpersCount',
                  rarityType: 'sixth',
                });
                syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
              }}
              currentValue={targetOpersCount.sixth.toString()}
              max={targetLimit['sixth']}
            />
          </div>
          <div className="flex gap-x-3">
            <InsetNumberInput
              name="픽업 5성"
              className="text-amber-400"
              onInputBlur={(e, syncLocalValue) => {
                const count = stringToNumber(e.currentTarget.value);
                const hasNoTargetOperators =
                  count === 0 && targetOpersCount.sixth === 0 && targetOpersCount.fourth === 0;
                updateSimplePickupCount({
                  count: hasNoTargetOperators ? 1 : count,
                  countType: 'pickupOpersCount',
                  rarityType: 'fifth',
                });
                syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
              }}
              currentValue={pickupOpersCount.fifth.toString()}
              max={targetLimit['fifth']}
            />
            <InsetNumberInput
              name="목표 5성"
              className="text-amber-400"
              onInputBlur={(e, syncLocalValue) => {
                const count = stringToNumber(e.currentTarget.value);
                const hasNoTargetOperators =
                  count === 0 && targetOpersCount.sixth === 0 && targetOpersCount.fourth === 0;
                updateSimplePickupCount({
                  count: hasNoTargetOperators ? 1 : count,
                  countType: 'targetOpersCount',
                  rarityType: 'fifth',
                });
                syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
              }}
              currentValue={targetOpersCount.fifth.toString()}
              max={targetLimit['fifth']}
            />
          </div>
          <div className="flex gap-x-3">
            <InsetNumberInput
              name="픽업 4성"
              className="text-sky-500"
              onInputBlur={(e, syncLocalValue) => {
                const count = stringToNumber(e.currentTarget.value);
                const hasNoTargetOperators =
                  count === 0 && targetOpersCount.sixth === 0 && targetOpersCount.fifth === 0;
                updateSimplePickupCount({
                  count: hasNoTargetOperators ? 1 : count,
                  countType: 'pickupOpersCount',
                  rarityType: 'fourth',
                });
                syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
              }}
              currentValue={pickupOpersCount.fourth.toString()}
              max={targetLimit['fourth']}
            />
            <InsetNumberInput
              name="목표 4성"
              className="text-sky-500"
              onInputBlur={(e, syncLocalValue) => {
                const count = stringToNumber(e.currentTarget.value);
                const hasNoTargetOperators =
                  count === 0 && targetOpersCount.sixth === 0 && targetOpersCount.fifth === 0;
                updateSimplePickupCount({
                  count: hasNoTargetOperators ? 1 : count,
                  countType: 'targetOpersCount',
                  rarityType: 'fourth',
                });
                syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
              }}
              currentValue={targetOpersCount.fourth.toString()}
              max={targetLimit['fourth']}
            />
          </div>
        </div>
        <div className="mt-2 flex w-full justify-end">
          {isTrySim || (
            <AdditionalResUntilBannerEnd
              key={`res-${`${id} ${isTrySim}` ? 'hidden' : 'shown'}`}
              additionalResource={additionalResource.simpleMode.toString()}
              onInputBlur={(e) => {
                const newValue = e.currentTarget.value.replace(/,/g, '');
                updateAdditionalResource('simpleMode', stringToNumber(newValue));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const PreInfoField = ({
  pickupData,
  targetLimit,
  updatePickupCount,
  updateAttempts,
  updateFirstSixthTry,
}: {
  pickupData: Dummy;
  targetLimit: Record<OperatorRarityForString, number>;
  updatePickupCount: (count: number, rarityType: OperatorRarityForString) => void;
  updateAttempts: (attempts: number, target: 'max' | 'min' | 'both') => void;
  updateFirstSixthTry: (isTry: boolean) => void;
}) => {
  const {
    pickupDetails: { pickupOpersCount },
    maxGachaAttempts,
    minGachaAttempts,
    operators,
    firstSixthTry,
  } = pickupData;

  const operatorsByRarity = getOperatorsByRarity(operators);
  return (
    <div className="font-S-CoreDream-500 flex w-full flex-wrap justify-between gap-x-6 gap-y-3 text-sm">
      <div className="flex w-full flex-wrap justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <MaxAttempts
            maxGachaAttempts={maxGachaAttempts.toString()}
            onInputBlur={(e) => {
              const newValue = e.currentTarget.value.replace(/,/g, '');
              updateAttempts(stringToNumber(newValue), 'max');
            }}
            onUnlimitedClick={() => {
              updateAttempts(Infinity, 'max');
            }}
            isFirstSixthTry={firstSixthTry}
          />
          <MinAttempts
            minGachaAttempts={minGachaAttempts.toString()}
            onInputBlur={(e) => {
              const newValue = e.currentTarget.value.replace(/,/g, '');
              updateAttempts(stringToNumber(newValue), 'min');
            }}
            onFirstSixth={() => {
              updateFirstSixthTry(true);
            }}
            isFirstSixthTry={firstSixthTry}
          />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <InsetNumberInput
            name="픽업 6성"
            className="text-orange-400"
            onInputBlur={(e, syncLocalValue) => {
              const count = stringToNumber(e.currentTarget.value);
              const hasNoTargetOperators =
                count === 0 &&
                operatorsByRarity.fifth.length === 0 &&
                operatorsByRarity.fourth.length === 0;
              updatePickupCount(hasNoTargetOperators ? 1 : count, 'sixth');
              syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
            }}
            currentValue={pickupOpersCount.sixth.toString()}
            max={targetLimit.sixth}
          />
          <InsetNumberInput
            name="픽업 5성"
            className="text-amber-400"
            onInputBlur={(e, syncLocalValue) => {
              const count = stringToNumber(e.currentTarget.value);
              const hasNoTargetOperators =
                count === 0 &&
                operatorsByRarity.sixth.length === 0 &&
                operatorsByRarity.fourth.length === 0;
              updatePickupCount(hasNoTargetOperators ? 1 : count, 'fifth');
              syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
            }}
            currentValue={pickupOpersCount.fifth.toString()}
            max={targetLimit.fifth}
          />
          <InsetNumberInput
            name="픽업 4성"
            className="text-purple-400"
            onInputBlur={(e, syncLocalValue) => {
              const count = stringToNumber(e.currentTarget.value);
              const hasNoTargetOperators =
                count === 0 &&
                operatorsByRarity.fifth.length === 0 &&
                operatorsByRarity.sixth.length === 0;
              updatePickupCount(hasNoTargetOperators ? 1 : count, 'fourth');
              syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
            }}
            currentValue={pickupOpersCount.fourth.toString()}
            max={targetLimit.fourth}
          />
        </div>
      </div>
    </div>
  );
};

const OperatorBadges = ({
  operator,
  isPityReward,
  gachaType,
  operators,
  onChangeOperatorDetails,
}: {
  operator: Operator;
  isPityReward: boolean;
  gachaType: GachaType;
  operators: Operator[];
  onChangeOperatorDetails: (payload: UpdateOperatorDetails) => void;
}) => {
  const { operatorId, operatorType, rarity } = operator;
  const [isHover, setIsHover] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const editBadge = (newType: OperatorType, newRarity: OperatorRarity) => {
    onChangeOperatorDetails({ operatorId, operatorType: newType, rarity: newRarity });
  };
  return (
    <>
      <motion.button
        onHoverStart={() => {
          setIsHover(true);
        }}
        onHoverEnd={() => {
          setIsHover(false);
        }}
        onClick={() => {
          setIsModalOpen(true);
        }}
        className="flex h-full cursor-pointer gap-x-1 *:pointer-events-none"
      >
        {isPityReward && <Badge name="천장" color="border-teal-400 text-teal-400" />}
        {operatorType === 'limited' ? (
          <Badge {...operatorBadgeProps.operatorType.limited.props} />
        ) : (
          <Badge {...operatorBadgeProps.operatorType.normal.props} />
        )}
        {rarity === 6 ? (
          <Badge {...operatorBadgeProps.rarity.sixth.props} />
        ) : rarity === 5 ? (
          <Badge {...operatorBadgeProps.rarity.fifth.props} />
        ) : (
          <Badge {...operatorBadgeProps.rarity.fourth.props} />
        )}
        <motion.div
          animate={isHover ? { borderColor: '#ff637e' } : { borderColor: '#ffb900' }}
          className="border-rose relative flex aspect-square h-full items-center justify-center rounded-full border border-amber-400"
        >
          <motion.div
            animate={isHover ? { rotateZ: 45, color: '#ff637e' } : { rotateZ: 0, color: '#ffb900' }}
            transition={{ duration: 0.2 }}
            className="size-full p-1 text-amber-400"
          >
            <Tag className="size-full" />
          </motion.div>
        </motion.div>
      </motion.button>
      <OperatorBadgeEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        operatorType={operatorType}
        rarity={rarity}
        operators={operators}
        gachaType={gachaType}
        onBadgeEdit={editBadge}
      />
    </>
  );
};

const PickupOperatorDetail = ({
  operator,
  gachaType,
  operators,
  onOperatorDelete,
  onChangeOperatorDetails,
}: {
  operator: Operator;
  gachaType: GachaType;
  operators: Operator[];
  onOperatorDelete: () => void;
  onChangeOperatorDetails: (payload: UpdateOperatorDetails) => void;
}) => {
  const { name, operatorId, currentQty, targetCount, isPityReward } = operator;
  const [localName, setLocalName] = useState(name);
  const [localQty, setLocalQty] = useState(currentQty.toString());
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex grow gap-6">
        <DeleteButton
          onDelete={onOperatorDelete}
          isDeletePrevent={operators.length === 1}
          className="-mr-2"
        />
        <div className="flex grow items-center rounded-lg py-2 pr-2 pl-4 shadow-[inset_6px_6px_13px_#101010,inset_-6px_-6px_13px_#303030]">
          <input
            type="text"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setLocalName(e.currentTarget.value);
            }}
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
              onChangeOperatorDetails({ name: e.currentTarget.value, operatorId });
            }}
            value={localName}
            className="w-full text-[15px]"
          />
          <OperatorBadges
            isPityReward={isPityReward}
            onChangeOperatorDetails={onChangeOperatorDetails}
            operator={operator}
            gachaType={gachaType}
            operators={operators}
          />
        </div>
      </div>
      <div className="flex gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">가챠 목표</span>
          <TypeSelectionButton
            name="명함"
            hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
            onTypeClick={() => {
              onChangeOperatorDetails({ operatorId, targetCount: 1 });
            }}
            className="px-4"
            isActive={targetCount === 1}
          />
          <TypeSelectionButton
            name="풀잠"
            hoverBackground="linear-gradient(155deg, #ec003f, #ff637e)"
            onTypeClick={() => {
              onChangeOperatorDetails({ operatorId, targetCount: 6 });
            }}
            className="px-4"
            isActive={targetCount === 6}
          />
        </div>
        <div className="flex items-center gap-2">
          <span>현재 잠재</span>
          <div className="flex items-center rounded-lg px-4 py-2 shadow-[inset_6px_6px_13px_#101010,inset_-6px_-6px_13px_#303030]">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              max={6}
              onFocus={(e: FocusEvent<HTMLInputElement>) => {
                if (e.currentTarget.value === '0') {
                  e.currentTarget.setSelectionRange(0, 1);
                }
              }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const numberString = normalizeNumberString(e.currentTarget.value);
                if (numberString === undefined) return;
                const normalizedString = Math.floor(
                  clamp(parseFloat(numberString), 0, 6),
                ).toString();
                setLocalQty(normalizedString);
              }}
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                const newQty = stringToNumber(e.currentTarget.value);
                const clampQty = newQty > 6 ? 6 : newQty;
                onChangeOperatorDetails({
                  operatorId,
                  currentQty: isNaN(newQty) ? undefined : clampQty,
                });
              }}
              className="w-6 min-w-0 text-right"
              value={localQty}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type UpdateNameProps = Omit<ExtractPayloadFromAction<'updateBannerName'>, 'id'>;
type DeleteDataProps = Omit<ExtractPayloadFromAction<'delete'>, 'id'>;
export type UpdateOperatorDetails = Omit<ExtractPayloadFromAction<'updateOperatorDetails'>, 'id'>;

type UpdateSimplePickupCount = ({
  count,
  countType,
  rarityType,
}: UpdateSimplePickupCountProps) => void;

interface UpdateSimplePickupCountProps {
  count: number;
  countType: 'pickupOpersCount' | 'targetOpersCount';
  rarityType: OperatorRarityForString;
}

interface PickupBannerProps {
  pickupData: Dummy;
  dispatch: ActionDispatch<[action: PickupDatasAction]>;
  index: number;
  isTrySim: boolean;
  isSimpleMode: boolean;
  bannerCount: number;
  isImageVisible: boolean;
}

export default function PickupBanner({
  pickupData,
  dispatch,
  index,
  isTrySim,
  isSimpleMode,
  bannerCount,
  isImageVisible,
}: PickupBannerProps) {
  const { gachaType, name, operators, id, image, active } = pickupData;
  const ref = useRef<HTMLDivElement>(null);
  const [isView, setIsView] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAnimateLocked, setIsAnimateLocked] = useState(false);
  const targetLimit = operatorLimitByBannerType[gachaType];

  const isOperatorsFull =
    operators.length >=
    Object.values(operatorLimitByBannerType[gachaType]).reduce((a, b) => a + b, 0);

  const isViewRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    setIsView(false);
    isViewRef.current = false;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.scrollY + window.innerHeight && rect.top > 0) {
      setIsView(true);
      isViewRef.current = true;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isViewRef.current) {
          setIsView(entry.isIntersecting);
          isViewRef.current = true;
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isSimpleMode]);

  const deleteData = (payload: DeleteDataProps) => {
    dispatch({ type: 'delete', payload: { id, ...payload } });
  };

  const updateFirstSixthTry = (isTry: boolean) => {
    dispatch({
      type: 'updateFirstSixTry',
      payload: {
        id,
        isTry,
      },
    });
  };

  const updatePickupCount = (count: number, rarityType: OperatorRarityForString) => {
    dispatch({
      type: 'updatePickupCount',
      payload: {
        id,
        count,
        rarityType,
      },
    });
  };

  const updateSimplePickupCount = ({
    count,
    countType,
    rarityType,
  }: UpdateSimplePickupCountProps) => {
    dispatch({ type: 'updateSimplePickupCount', payload: { id, count, countType, rarityType } });
  };

  const updateAttempts = (attempts: number, target: 'max' | 'min' | 'both') => {
    dispatch({
      type: 'updateAttempts',
      payload: {
        id,
        attempts,
        target,
      },
    });
  };

  const updateBannerName = (payload: UpdateNameProps) => {
    dispatch({
      type: 'updateBannerName',
      payload: { id, ...payload },
    });
  };

  const updateOperatorDetails = (payload: UpdateOperatorDetails) => {
    dispatch({ type: 'updateOperatorDetails', payload: { id, ...payload } });
  };

  const updateAdditionalResource = (
    mode: 'simpleMode' | 'extendedMode',
    additionalResource: number,
  ) => {
    dispatch({ type: 'updateAdditionalResource', payload: { id, mode, additionalResource } });
  };

  const updateGachaType = (gachaType: GachaType) => {
    dispatch({ type: 'updateGachaType', payload: { id, gachaType, isSimpleMode } });
  };

  const updateIndex = (direction: 'increase' | 'decrease') => {
    if (direction === 'decrease' && index < bannerCount - 1) {
      dispatch({ type: 'swapIndex', payload: { fromIndex: index, toIndex: index + 1 } });
    } else if (direction === 'increase' && index > 0) {
      dispatch({ type: 'swapIndex', payload: { fromIndex: index, toIndex: index - 1 } });
    }
  };

  const toggleActive = (isLeft?: boolean) => {
    dispatch({ type: 'toggleActive', payload: { id, isLeft } });
  };

  const addOperator = () => {
    dispatch({ type: 'addOperator', payload: { id } });
  };

  return (
    <motion.div
      ref={ref}
      layout="position"
      onHoverStart={() => {
        setIsHover(true);
      }}
      onHoverEnd={() => {
        setIsHover(false);
      }}
      variants={toOpacityZero}
      viewport={{ amount: 0.4 }}
      initial="exit"
      animate={
        isHover
          ? {
              scale: 1.02,
              background: 'linear-gradient(135deg, #222222, #333333)',
              opacity: 1,
              transition: {
                scale: { type: 'spring', stiffness: 170, damping: 27, mass: 1.35, duration: 0.2 },
                background: { duration: 0.1 },
              },
            }
          : {
              opacity: 1,
              background: 'linear-gradient(135deg, #1c1c1c, #2a2a2a)',
            }
      }
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{
        layout: {
          duration: 0.3,
          ease: 'easeInOut',
          type: 'spring',
          mass: 0.5,
        },
      }}
      onLayoutAnimationStart={() => {
        setIsAnimateLocked(true);
      }}
      onLayoutAnimationComplete={() => {
        setIsAnimateLocked(false);
      }}
      className={cls(
        'relative rounded-xl p-4 shadow-[6px_6px_16px_#141414,-6px_-6px_16px_#2e2e2e]',
      )}
    >
      <AnimatePresence>
        <div key={id} className="relative flex flex-col space-y-6">
          <BannerHeader
            id={id}
            currentName={name}
            gachaType={gachaType}
            isAnimateLocked={isAnimateLocked}
            isMinimized={isMinimized}
            index={index}
            isActive={active}
            isSimpleMode={isSimpleMode}
            pickupData={pickupData}
            dataLength={bannerCount}
            onBannerDelete={() => {
              deleteData({ target: 'banner' });
            }}
            onNameBlur={(e) => {
              updateBannerName({ name: e.currentTarget.value });
            }}
            onBannerBadgeChange={updateGachaType}
            onUpdateIndex={updateIndex}
            onMinimized={() => {
              setIsMinimized((p) => !p);
            }}
            onToggle={toggleActive}
          />
          {!isMinimized && image && active && isImageVisible ? (
            <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
              <Image src={image} width={1560} height={500} alt="babel" />
            </motion.div>
          ) : null}
          {!isMinimized && isView && active ? (
            isSimpleMode ? (
              <SimplePreInfoField
                // isPresent={isPresent}
                isTrySim={isTrySim}
                pickupData={pickupData}
                targetLimit={targetLimit}
                updateSimplePickupCount={updateSimplePickupCount}
                updateAdditionalResource={updateAdditionalResource}
              />
            ) : (
              <div
                key={`opers-${`${id} ${isSimpleMode}` ? 'hidden' : 'shown'}`}
                className="space-y-6 text-sm lg:space-y-7"
              >
                <PreInfoField
                  // isPresent={isPresent}
                  pickupData={pickupData}
                  targetLimit={targetLimit}
                  updatePickupCount={updatePickupCount}
                  updateAttempts={updateAttempts}
                  updateFirstSixthTry={updateFirstSixthTry}
                />
                <div className="space-y-3">
                  <div className="font-S-CoreDream-500 flex flex-wrap justify-between gap-x-6 gap-y-4 text-xl">
                    <span className="py-1 whitespace-nowrap">
                      <span className="text-amber-400">목표</span> 픽업 목록
                    </span>
                    {isTrySim || (
                      <AdditionalResUntilBannerEnd
                        key={`res-${`${id} ${isTrySim}` ? 'hidden' : 'shown'}`}
                        additionalResource={pickupData.additionalResource.extendedMode.toString()}
                        onInputBlur={(e) => {
                          const newValue = e.currentTarget.value.replace(/,/g, '');
                          updateAdditionalResource('extendedMode', stringToNumber(newValue));
                        }}
                      />
                    )}
                  </div>
                  <div className="space-y-6 lg:space-y-4">
                    {operators.map((operator) => {
                      return (
                        <PickupOperatorDetail
                          key={operator.operatorId}
                          operator={operator}
                          operators={operators}
                          gachaType={gachaType}
                          onChangeOperatorDetails={updateOperatorDetails}
                          onOperatorDelete={() => {
                            deleteData({
                              target: 'operator',
                              operatorId: operator.operatorId,
                              rarity: operator.rarity,
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                  <motion.div
                    layout="position"
                    transition={{
                      layout: {
                        duration: 0.05,
                        type: 'spring',
                        mass: 0.3,
                      },
                    }}
                    className="flex w-full justify-center py-2"
                  >
                    <AddButton
                      onAddClick={addOperator}
                      diamondCustom={
                        isOperatorsFull
                          ? { size: 'small', from: '#bd1b36', to: '#ff637e' }
                          : { size: 'small' }
                      }
                      addCustom={isOperatorsFull ? { from: '#bd1b36', to: '#ff637e' } : undefined}
                      isAddPrevent={isOperatorsFull}
                    />
                  </motion.div>
                </div>
              </div>
            )
          ) : null}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}
