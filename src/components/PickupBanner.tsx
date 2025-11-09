'use client';

import { motion } from 'motion/react';
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
import { clamp, cls, normalizeNumberString, stringToNumber } from '#/libs/utils';
import React, {
  ActionDispatch,
  ChangeEvent,
  FocusEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BannerBadgeProps, operatorBadgeProps } from '#/constants/ui';
import OperatorBadgeEditModal from '#/components/modals/OperatorBadgeEditModal';
import Badge from '#/components/Badge';
import BannerBadgeEditModal from '#/components/modals/BannerBadgeEditModal';
import { GachaType, OperatorRarity, OperatorRarityForString, OperatorType } from '#/types/types';
import { useSyncedState } from '#/hooks/useSyncedState';
import Image from 'next/image';
import ToggleButton from '#/components/buttons/ToggleButton';
import SmallButton from '#/components/buttons/SmallButton';
import FoldButton from '#/components/buttons/MaximizeButton';

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
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
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
            onFocus={(e: FocusEvent<HTMLInputElement>) => {
              if (e.currentTarget.value === '0') {
                e.currentTarget.setSelectionRange(0, 1);
              }
            }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const { value } = e.currentTarget;
              const numberString = normalizeNumberString(value);
              if (numberString === undefined) return;
              const normalizedString = Math.floor(
                clamp(parseFloat(numberString), 0, max),
              ).toString();
              console.log(value);
              setLocalValue(normalizedString);
            }}
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
              if (!e.currentTarget.value) return;
              onInputBlur(e);
            }}
            className={cls(inputWidth ?? 'w-8', 'relative h-full min-w-0 text-right')}
            max={max}
            maxLength={maxLength}
            value={showAttemptsSign && (isInfinity || firstSixthTry) ? '' : localValue}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const { value } = e.currentTarget;
              const numberString = normalizeNumberString(value);
              if (numberString === undefined) return;
              const normalizedString = Math.floor(clamp(parseFloat(numberString), 0)).toString();
              setLocalValue(normalizedString);
            }}
            onBlur={onInputBlur}
            className="relative w-14 min-w-0 text-right"
            value={localValue}
          />
        </div>
        <div>합성옥</div>
      </div>
    </div>
  );
};

const BannerBadges = ({
  gachaType,
  onBannerBadgeChange,
}: {
  gachaType: GachaType;
  onBannerBadgeChange: (gachaType: GachaType) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const currentBadgeProp = BannerBadgeProps[gachaType].props;
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
          <div className="relative top-[1px]">{currentBadgeProp.name}</div>
        </div>
        <motion.div
          animate={isHover ? { borderColor: '#ff637e' } : { borderColor: '#ffb900' }}
          transition={{ duration: 0.2 }}
          className="relative flex aspect-square h-full items-center justify-center rounded-full border border-amber-400"
        >
          <motion.svg
            animate={isHover ? { rotateZ: 45, color: '#ff637e' } : { rotateZ: 0, color: '#ffb900' }}
            transition={{ duration: 0.2 }}
            className="size-[22px] text-amber-400"
          >
            <use href="/icons/icons.svg#tag" />
          </motion.svg>
        </motion.div>
      </motion.button>
      <BannerBadgeEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        gachaType={gachaType}
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
        <DeleteButton onDelete={onBannerDelete} className="shrink-0" />
      </div>
      <div className="flex grow gap-4">
        <SmallButton
          background="linear-gradient(135deg, #bb4d00, #ffb900)"
          color="#eaeaea"
          onButtonClick={() => {
            onUpdateIndex('decrease');
          }}
          isAnimateLocked={isAnimateLocked}
          className="text-amber-400"
        >
          <svg className="relative size-full">
            <use href="/icons/icons.svg#chevron-up" />
          </svg>
        </SmallButton>
        <SmallButton
          background="linear-gradient(135deg, #bb4d00, #ffb900)"
          color="#eaeaea"
          onButtonClick={() => {
            onUpdateIndex('increase');
          }}
          isAnimateLocked={isAnimateLocked}
          className="text-amber-400"
        >
          <svg className="relative size-full">
            <use href="/icons/icons.svg#chevron-down" />
          </svg>
        </SmallButton>
        <div className="font-S-CoreDream-700 flex items-center text-2xl">
          <span key={`${id} ${index + 1}`}>{index + 1}.</span>
        </div>
        <div className="font-S-CoreDream-500 flex w-full items-center rounded-lg py-2 pr-2 pl-4 text-xl shadow-[inset_6px_6px_13px_#101010,inset_-6px_-6px_13px_#303030]">
          <input
            type="text"
            onChange={onNameChange}
            onBlur={onNameBlur}
            value={localValue}
            className="w-full"
          />
          <BannerBadges gachaType={gachaType} onBannerBadgeChange={onBannerBadgeChange} />
        </div>
      </div>
    </div>
  );
};

const SimplePreInfoField = ({
  isTrySim,
  pickupData,
  updateSimplePickupCount,
  updateAdditionalResource,
}: {
  isTrySim: boolean;
  pickupData: Dummy;
  updateSimplePickupCount: UpdateSimplePickupCount;
  updateAdditionalResource: (
    mode: 'simpleMode' | 'extendedMode',
    additionalResource: number,
  ) => void;
}) => {
  const {
    pickupDetails: { simpleMode },
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
              onInputBlur={(e) => {
                updateSimplePickupCount({
                  count: stringToNumber(e.currentTarget.value),
                  countType: 'pickupOpersCount',
                  rarityType: 'sixth',
                });
              }}
              currentValue={simpleMode.pickupOpersCount.sixth.toString()}
              max={10}
            />
            <InsetNumberInput
              name="목표 6성"
              className="text-orange-400"
              onInputBlur={(e) => {
                updateSimplePickupCount({
                  count: stringToNumber(e.currentTarget.value),
                  countType: 'targetOpersCount',
                  rarityType: 'sixth',
                });
              }}
              currentValue={simpleMode.targetOpersCount.sixth.toString()}
              max={10}
            />
          </div>
          <div className="flex gap-x-3">
            <InsetNumberInput
              name="픽업 5성"
              className="text-amber-400"
              onInputBlur={(e) => {
                updateSimplePickupCount({
                  count: stringToNumber(e.currentTarget.value),
                  countType: 'pickupOpersCount',
                  rarityType: 'fifth',
                });
              }}
              currentValue={simpleMode.pickupOpersCount.fifth.toString()}
              max={10}
            />
            <InsetNumberInput
              name="목표 5성"
              className="text-amber-400"
              onInputBlur={(e) => {
                updateSimplePickupCount({
                  count: stringToNumber(e.currentTarget.value),
                  countType: 'targetOpersCount',
                  rarityType: 'fifth',
                });
              }}
              currentValue={simpleMode.targetOpersCount.fifth.toString()}
              max={10}
            />
          </div>
          <div className="flex gap-x-3">
            <InsetNumberInput
              name="픽업 4성"
              className="text-sky-500"
              onInputBlur={(e) => {
                updateSimplePickupCount({
                  count: stringToNumber(e.currentTarget.value),
                  countType: 'pickupOpersCount',
                  rarityType: 'fourth',
                });
              }}
              currentValue={simpleMode.pickupOpersCount.fourth.toString()}
              max={10}
            />
            <InsetNumberInput
              name="목표 4성"
              className="text-sky-500"
              onInputBlur={(e) => {
                updateSimplePickupCount({
                  count: stringToNumber(e.currentTarget.value),
                  countType: 'targetOpersCount',
                  rarityType: 'fourth',
                });
              }}
              currentValue={simpleMode.targetOpersCount.fourth.toString()}
              max={10}
            />
          </div>
        </div>
        <div className="mt-2 flex w-full justify-end">
          {isTrySim || (
            <AdditionalResUntilBannerEnd
              key={`res-${`${id} ${isTrySim}` ? 'hidden' : 'shown'}`}
              additionalResource={additionalResource.simpleMode.toString()}
              onInputBlur={(e) => {
                updateAdditionalResource('simpleMode', stringToNumber(e.currentTarget.value));
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
  updatePickupCount,
  updateAttempts,
  updateFirstSixthTry,
}: {
  pickupData: Dummy;
  updatePickupCount: (count: number, rarityType: OperatorRarityForString) => void;
  updateAttempts: (attempts: number, target: 'max' | 'min' | 'both') => void;
  updateFirstSixthTry: (isTry: boolean) => void;
}) => {
  const {
    pickupDetails: { pickupOpersCount },
    maxGachaAttempts,
    minGachaAttempts,
    firstSixthTry,
  } = pickupData;

  return (
    <div className="font-S-CoreDream-500 flex w-full flex-wrap justify-between gap-x-6 gap-y-3 text-sm">
      <div className="flex w-full flex-wrap justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <MaxAttempts
            maxGachaAttempts={maxGachaAttempts.toString()}
            onInputBlur={(e) => {
              updateAttempts(stringToNumber(e.currentTarget.value), 'max');
            }}
            onUnlimitedClick={() => {
              updateAttempts(Infinity, 'max');
            }}
            isFirstSixthTry={firstSixthTry}
          />
          <MinAttempts
            minGachaAttempts={minGachaAttempts.toString()}
            onInputBlur={(e) => {
              updateAttempts(stringToNumber(e.currentTarget.value), 'min');
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
            onInputBlur={(e) => {
              updatePickupCount(stringToNumber(e.currentTarget.value), 'sixth');
            }}
            currentValue={pickupOpersCount.sixth.toString()}
            max={10}
          />
          <InsetNumberInput
            name="픽업 5성"
            className="text-amber-400"
            onInputBlur={(e) => {
              updatePickupCount(stringToNumber(e.currentTarget.value), 'fifth');
            }}
            currentValue={pickupOpersCount.fifth.toString()}
            max={10}
          />
          <InsetNumberInput
            name="픽업 4성"
            className="text-purple-400"
            onInputBlur={(e) => {
              updatePickupCount(stringToNumber(e.currentTarget.value), 'fourth');
            }}
            currentValue={pickupOpersCount.fourth.toString()}
            max={10}
          />
        </div>
      </div>
    </div>
  );
};

// 콜라보의 경우 5성도 한정 가능해야함
const OperatorBadges = ({
  operator,
  onChangeOperatorDetails,
}: {
  operator: Operator;
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
          className="border-rose relative flex aspect-square h-full items-center justify-center rounded-full border"
        >
          <motion.svg
            animate={isHover ? { rotateZ: 45, color: '#ff637e' } : { rotateZ: 0, color: '#ffb900' }}
            transition={{ duration: 0.2 }}
            className="size-[18px] text-amber-400"
          >
            <use href="/icons/icons.svg#tag" />
          </motion.svg>
        </motion.div>
      </motion.button>
      <OperatorBadgeEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        operatorType={operatorType}
        rarity={rarity}
        onBadgeEdit={editBadge}
      />
    </>
  );
};

const PickupOperatorDetail = ({
  operator,
  onOperatorDelete,
  onChangeOperatorDetails,
}: {
  operator: Operator;
  onOperatorDelete: () => void;
  onChangeOperatorDetails: (payload: UpdateOperatorDetails) => void;
}) => {
  const { name, operatorId, currentQty, targetCount } = operator;
  const [localName, setLocalName] = useState(name);
  const [localQty, setLocalQty] = useState(currentQty.toString());
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex grow gap-6">
        <DeleteButton onDelete={onOperatorDelete} className="-mr-2" />
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
          <OperatorBadges onChangeOperatorDetails={onChangeOperatorDetails} operator={operator} />
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
  bannersLength: number;
  isImageVisible: boolean;
}

export default function PickupBanner({
  pickupData,
  dispatch,
  index,
  isTrySim,
  isSimpleMode,
  bannersLength,
  isImageVisible,
}: PickupBannerProps) {
  // const isPresent = useIsPresent();
  const { gachaType, name, operators, id, image, active } = pickupData;
  const ref = useRef<HTMLDivElement>(null);
  const [isView, setIsView] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAnimateLocked, setIsAnimateLocked] = useState(false);

  const isViewRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    setIsView(false);
    isViewRef.current = false;

    const rect = el.getBoundingClientRect();
    // console.log(rect.top, window.scrollY + window.innerHeight);
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
    dispatch({ type: 'updateGachaType', payload: { id, gachaType } });
  };

  const updateBannerBadge = (newGachaType: GachaType) => {
    const newCount =
      newGachaType === 'limited' || newGachaType === 'rotation'
        ? 2
        : newGachaType === 'collab' || newGachaType === 'single'
          ? 1
          : newGachaType === 'orient'
            ? 3
            : 4;
    updateGachaType(newGachaType);
    if (isSimpleMode) {
      dispatch({
        type: 'updateSimplePickupCount',
        payload: { id, count: newCount, countType: 'pickupOpersCount', rarityType: 'sixth' },
      });
    } else {
      dispatch({
        type: 'updatePickupCount',
        payload: { id, count: newCount, rarityType: 'sixth' },
      });
    }
  };

  const updateIndex = (direction: 'increase' | 'decrease') => {
    if (direction === 'increase' && index < bannersLength - 1) {
      dispatch({ type: 'swapIndex', payload: { fromIndex: index, toIndex: index + 1 } });
    } else if (direction === 'decrease' && index > 0) {
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
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
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
        'relative flex flex-col space-y-6 rounded-xl p-4 shadow-[6px_6px_16px_#141414,-6px_-6px_16px_#2e2e2e]',
      )}
    >
      <BannerHeader
        id={id}
        currentName={name}
        gachaType={gachaType}
        isAnimateLocked={isAnimateLocked}
        isMinimized={isMinimized}
        index={index}
        isActive={active}
        onBannerDelete={() => {
          deleteData({ target: 'banner' });
        }}
        onNameBlur={(e) => {
          updateBannerName({ name: e.currentTarget.value });
        }}
        onBannerBadgeChange={updateBannerBadge}
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
                      updateAdditionalResource(
                        'extendedMode',
                        stringToNumber(e.currentTarget.value),
                      );
                    }}
                  />
                )}
              </div>
              <div className="space-y-6 lg:space-y-4">
                {operators.map((operator) => (
                  <PickupOperatorDetail
                    key={operator.operatorId}
                    operator={operator}
                    onChangeOperatorDetails={updateOperatorDetails}
                    onOperatorDelete={() => {
                      deleteData({
                        target: 'operator',
                        operatorId: operator.operatorId,
                        rarity: operator.rarity,
                      });
                    }}
                  />
                ))}
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
                <AddButton onAddClick={addOperator} custom={{ size: 'small' }} />
              </motion.div>
            </div>
          </div>
        )
      ) : null}
    </motion.div>
  );
}
