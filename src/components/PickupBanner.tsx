'use client';

import {
  AnimatePresence,
  motion,
  Transition,
  useIsPresent,
  usePresenceData,
  Variant,
} from 'motion/react';
import {
  gachaBannerOptionCardVariants,
  insetInputVariants,
  secondLevelTransition,
  toOpacityZero,
} from '#/constants/variants';
import {
  Dummy,
  ExtractPayloadFromAction,
  GachaType,
  Operator,
  OperatorRarity,
  OperatorType,
  PickupDatasAction,
} from '#/components/PickupList';
import DeleteButton from '#/components/buttons/DeleteButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import AddButton from '#/components/buttons/AddButton';
import { clamp, cls, normalizeNumberString, stringToNumber } from '#/libs/utils';
import React, { ActionDispatch, ChangeEvent, FocusEvent, ReactNode, useState } from 'react';
import { useSyncedState } from '#/hooks/useSyncedState';
import Badge from '#/components/badge';
import { operatorBadgeProps } from '#/constants/ui';
import OperatorBadgeEditModal from '#/components/modals/OperatorBadgeEditModal';

const MaxAttempts = ({
  maxGachaAttempts,
  onUnlimitedClick,
  onInputBlur,
}: {
  maxGachaAttempts: string;
  onUnlimitedClick: () => void;
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
}) => {
  return (
    <InsetNumberInput
      currentValue={maxGachaAttempts.toString()}
      name="최대 시도"
      onInputBlur={onInputBlur}
      className="text-amber-400"
      max={999}
      showInfinity
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
  gachaType,
  onReach300,
  onInputBlur,
}: {
  minGachaAttempts: string;
  gachaType: GachaType;
  onReach300: () => void;
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
}) => {
  return (
    <InsetNumberInput
      currentValue={minGachaAttempts.toString()}
      name="최소 시도"
      onInputBlur={onInputBlur}
      className="text-sky-500"
      max={999}
    >
      {gachaType === 'limited' && (
        <TypeSelectionButton
          name="300정가"
          className="px-3 text-sm"
          onTypeClick={onReach300}
          hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
        />
      )}
    </InsetNumberInput>
  );
};

export const InsetNumberInput = ({
  children,
  onInputBlur,
  currentValue,
  name,
  className = '',
  max,
  maxLength,
  immediateExit = false,
  showInfinity = false,
}: {
  children?: ReactNode;
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
  currentValue: string;
  name: ReactNode;
  className?: string;
  max?: number;
  maxLength?: number;
  immediateExit?: boolean;
  showInfinity?: boolean;
}) => {
  const [localValue, setLocalValue] = useSyncedState(currentValue);
  const isInfinity = currentValue === 'Infinity' && localValue === 'Infinity';
  const isParentPresent = usePresenceData();
  const preventedTransition = { duration: 0, delay: 0 };
  const preventTransition = immediateExit && isParentPresent;
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.2 } }}
        exit={{
          opacity: 0,
          transition: preventTransition ? preventedTransition : { duration: 0.1, delay: 0.2 },
        }}
        className={cls(className, 'flex h-full items-center')}
      >
        {name}
      </motion.div>
      <motion.div
        initial={{ boxShadow: 'inset 0px 0px 0px #202020, inset 0px 0px 0px #202020' }}
        animate={{
          boxShadow: 'inset 6px 6px 13px #101010, inset -6px -6px 13px #303030',
          transition: secondLevelTransition.fadeIn,
        }}
        exit={{
          boxShadow: 'inset 0px 0px 0px #202020, inset 0px 0px 0px #202020',
          transition: preventTransition ? preventedTransition : secondLevelTransition.fadeOut,
        }}
        className="relative flex items-center rounded-lg"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.2 } }}
          exit={{
            opacity: 0,
            transition: preventTransition ? preventedTransition : { duration: 0.1, delay: 0.2 },
          }}
          className="relative flex items-center px-4 py-2"
        >
          {showInfinity && isInfinity && <div className="absolute right-0 mr-4 text-3xl">∞</div>}
          <input
            type="number"
            inputMode="numeric"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const { value } = e.currentTarget;
              const numberString = normalizeNumberString(value);
              if (numberString === undefined) return;
              const normalizedString = Math.floor(
                clamp(parseFloat(numberString), 0, max),
              ).toString();
              setLocalValue(normalizedString);
            }}
            onBlur={onInputBlur}
            className="relative h-full w-8 min-w-0 text-right"
            max={max}
            maxLength={maxLength}
            value={localValue}
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
  const [localValue, setLocalValue] = useSyncedState(additionalResource);
  return (
    <div className="flex items-center gap-x-3 text-sm">
      <motion.span
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        exit="exit"
        className="font-S-CoreDream-400 whitespace-nowrap"
      >
        배너 종료시까지 추가재화
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
        </motion.div>
        <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
          합성옥
        </motion.div>
      </motion.div>
    </div>
  );
};

const BannerBadges = ({ gachaType }: { gachaType: GachaType }) => {
  const translatedGachaType =
    gachaType === 'collab' ? '콜라보 배너' : gachaType === 'limited' ? '한정 배너' : '통상 배너';
  return (
    <div className="flex h-full gap-x-1">
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        exit="exit"
        className="inline-block rounded-full border border-amber-400 px-3 py-1 text-sm whitespace-nowrap text-amber-400"
      >
        <div className="relative top-[1px]">{translatedGachaType}</div>
      </motion.div>
      {gachaType === 'revival' && (
        <div className="inline-block rounded-full border border-violet-400 px-2 py-1 text-sm text-violet-400">
          구오퍼
        </div>
      )}
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        exit="exit"
        className="relative flex aspect-square h-full items-center justify-center rounded-full border border-amber-400"
      >
        <svg className="size-[22px] text-amber-400">
          <use href="/icons/icons.svg#tag" />
        </svg>
      </motion.div>
    </div>
  );
};

const BannerHeader = ({
  id,
  index,
  currentName,
  gachaType,
  onNameBlur,
  onBannerDelete,
}: {
  id: string;
  index: number;
  currentName: string;
  gachaType: GachaType;
  onNameBlur: (e: FocusEvent<HTMLInputElement>) => void;
  onBannerDelete: () => void;
}) => {
  const [localValue, setLocalValue] = useSyncedState(currentName);
  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.currentTarget.value);
  };
  return (
    <div className="flex grow gap-4">
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        exit="exit"
        className="font-S-CoreDream-700 flex items-center text-2xl"
      >
        <AnimatePresence mode="wait" propagate>
          <motion.span
            key={`${id} ${index + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {index + 1}.
          </motion.span>
        </AnimatePresence>
      </motion.div>
      <motion.div
        variants={insetInputVariants}
        initial="exit"
        animate="idle"
        exit="exit"
        className="font-S-CoreDream-500 flex w-full items-center rounded-lg py-2 pr-2 pl-4 text-xl"
      >
        <motion.input
          variants={toOpacityZero}
          initial="exit"
          animate="idle"
          exit="exit"
          type="text"
          onChange={onNameChange}
          onBlur={onNameBlur}
          value={localValue}
          className="w-full"
        />
        <BannerBadges gachaType={gachaType} />
      </motion.div>
      <DeleteButton onDelete={onBannerDelete} className="size-[48px] shrink-0 grow" />
    </div>
  );
};

const PreInfoField = ({
  isPresent,
  isSimpleMode,
  isGachaSim,
  pickupData,
  updatePickupCount,
  updateAttempts,
}: {
  isPresent: boolean;
  isSimpleMode: boolean;
  isGachaSim: boolean;
  pickupData: Dummy;
  updatePickupCount: (count: number, target: 'pickupOpersCount' | 'targetPickupCount') => void;
  updateAttempts: (attempts: number, target: 'max' | 'min' | 'both') => void;
}) => {
  const {
    pickupDetails: { pickupOpersCount, targetPickupCount },
    maxGachaAttempts,
    minGachaAttempts,
    id,
    gachaType,
    additionalResource,
  } = pickupData;
  return (
    <div className="felx-wrap font-S-CoreDream-500 flex flex-wrap justify-between gap-x-6 gap-y-3 text-sm">
      <AnimatePresence mode="wait" custom={isPresent} propagate>
        {isSimpleMode ? (
          <div
            key={String(isSimpleMode)}
            className="flex flex-wrap justify-between gap-x-6 gap-y-3"
          >
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex gap-x-4">
                <InsetNumberInput
                  name="픽업 6성"
                  className="text-orange-400"
                  onInputBlur={(e) => {
                    updatePickupCount(stringToNumber(e.currentTarget.value), 'pickupOpersCount');
                  }}
                  currentValue={pickupOpersCount.toString()}
                  max={10}
                />
                <InsetNumberInput
                  name="목표 6성"
                  className="text-orange-400"
                  onInputBlur={(e) => {
                    updatePickupCount(stringToNumber(e.currentTarget.value), 'targetPickupCount');
                  }}
                  currentValue={targetPickupCount.toString()}
                  max={10}
                />
              </div>
              <div className="flex gap-x-4">
                <InsetNumberInput
                  name="픽업 5성"
                  className="text-amber-400"
                  onInputBlur={(e) => {
                    updatePickupCount(stringToNumber(e.currentTarget.value), 'pickupOpersCount');
                  }}
                  currentValue={pickupOpersCount.toString()}
                  max={10}
                />
                <InsetNumberInput
                  name="목표 5성"
                  className="text-amber-400"
                  onInputBlur={(e) => {
                    updatePickupCount(stringToNumber(e.currentTarget.value), 'targetPickupCount');
                  }}
                  currentValue={targetPickupCount.toString()}
                  max={10}
                />
              </div>
              <div className="flex gap-x-4">
                <InsetNumberInput
                  name="픽업 4성"
                  className="text-sky-500"
                  onInputBlur={(e) => {
                    updatePickupCount(stringToNumber(e.currentTarget.value), 'pickupOpersCount');
                  }}
                  currentValue={pickupOpersCount.toString()}
                  max={10}
                />
                <InsetNumberInput
                  name="목표 4성"
                  className="text-sky-500"
                  onInputBlur={(e) => {
                    updatePickupCount(stringToNumber(e.currentTarget.value), 'targetPickupCount');
                  }}
                  currentValue={targetPickupCount.toString()}
                  max={10}
                />
              </div>
            </div>
            <div className="mt-2">
              <AdditionalResUntilBannerEnd
                key={`res-${`${id} ${isGachaSim}` ? 'hidden' : 'shown'}`}
                additionalResource={additionalResource.toString()}
                onInputBlur={() => {}}
              />
            </div>
          </div>
        ) : (
          <div className="flex w-full justify-between">
            <div className="flex gap-x-6">
              <MaxAttempts
                maxGachaAttempts={maxGachaAttempts.toString()}
                onInputBlur={(e) => {
                  updateAttempts(stringToNumber(e.currentTarget.value), 'max');
                }}
                onUnlimitedClick={() => {
                  updateAttempts(Infinity, 'max');
                }}
              />
              <MinAttempts
                minGachaAttempts={minGachaAttempts.toString()}
                onInputBlur={(e) => {
                  updateAttempts(stringToNumber(e.currentTarget.value), 'min');
                }}
                onReach300={() => {
                  updateAttempts(300, 'both');
                }}
                gachaType={gachaType}
              />
            </div>
            <div className="flex gap-x-6">
              <InsetNumberInput
                name="픽업 6성"
                className="text-orange-400"
                onInputBlur={(e) => {
                  updatePickupCount(stringToNumber(e.currentTarget.value), 'pickupOpersCount');
                }}
                currentValue={'4'}
                max={10}
              />
              <InsetNumberInput
                name="픽업 5성"
                className="text-amber-400"
                onInputBlur={(e) => {
                  updatePickupCount(stringToNumber(e.currentTarget.value), 'targetPickupCount');
                }}
                currentValue={'4'}
                max={10}
              />
              <InsetNumberInput
                name="픽업 4성"
                className="text-purple-400"
                onInputBlur={(e) => {
                  updatePickupCount(stringToNumber(e.currentTarget.value), 'targetPickupCount');
                }}
                currentValue={'4'}
                max={10}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OperatorBadges = ({
  operator,
  onChangeOperatorDetails,
}: {
  operator: Operator;
  onChangeOperatorDetails: (payload: ChangeOperatorDetails) => void;
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
        className="flex h-full cursor-pointer gap-x-1"
      >
        {operatorType === 'limited' ? (
          <Badge {...operatorBadgeProps.operatorType.limited.props} />
        ) : (
          <Badge {...operatorBadgeProps.operatorType.normal.props} />
        )}
        {rarity === 6 ? (
          <Badge {...operatorBadgeProps.rarity.sixth.props} />
        ) : (
          <Badge {...operatorBadgeProps.rarity.fifth.props} />
        )}
        <motion.div
          variants={toOpacityZero}
          initial="exit"
          animate="idle"
          exit="exit"
          custom={{
            idle: {
              transition: {
                opacity: { duration: 0.2, delay: 0.2 },
                borderColor: { duration: 0.2 },
              } satisfies Transition,
              additional: { borderColor: isHover ? '#ff521d' : '#ffb900' } satisfies Variant,
            },
          }}
          className="border-rose relative flex aspect-square h-full items-center justify-center rounded-full border"
        >
          <motion.svg
            animate={isHover ? { rotateZ: 45, color: '#ff521d' } : { rotateZ: 0, color: '#ffb900' }}
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
  onChangeOperatorDetails: (payload: ChangeOperatorDetails) => void;
}) => {
  const { name, operatorId, currentQty, targetCount } = operator;
  const [localName, setLocalName] = useSyncedState(name);
  const [localQty, setLocalQty] = useSyncedState(currentQty.toString());
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex grow gap-6">
        <DeleteButton onDelete={onOperatorDelete} className="-mr-2" />
        <motion.div
          variants={insetInputVariants}
          initial="exit"
          animate="idle"
          exit="exit"
          className="flex grow items-center rounded-lg py-2 pr-2 pl-4"
        >
          <motion.input
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
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
        </motion.div>
      </div>
      <div className="flex gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <motion.span
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="whitespace-nowrap"
          >
            가챠 목표
          </motion.span>
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
          <motion.span variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
            현재 잠재
          </motion.span>
          <motion.div
            variants={insetInputVariants}
            initial="exit"
            animate="idle"
            exit="exit"
            className="flex items-center rounded-lg px-4 py-2"
          >
            <motion.input
              variants={toOpacityZero}
              initial="exit"
              animate="idle"
              exit="exit"
              type="number"
              inputMode="numeric"
              max={6}
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

interface PickupBannerProps {
  pickupData: Dummy;
  dispatch: ActionDispatch<[action: PickupDatasAction]>;
  index: number;
  isGachaSim: boolean;
  isSimpleMode: boolean;
}

type ChangeNameProps = Omit<ExtractPayloadFromAction<'updateBannerName'>, 'id'>;
type DeleteDataProps = Omit<ExtractPayloadFromAction<'delete'>, 'id'>;
export type ChangeOperatorDetails = Omit<ExtractPayloadFromAction<'updateOperatorDetails'>, 'id'>;

export default function PickupBanner({
  pickupData,
  dispatch,
  index,
  isGachaSim,
  isSimpleMode,
}: PickupBannerProps) {
  const isPresent = useIsPresent();
  const { gachaType, name, operators, id } = pickupData;

  const deleteData = (payload: DeleteDataProps) => {
    dispatch({ type: 'delete', payload: { id, ...payload } });
  };

  const updatePickupCount = (count: number, target: 'pickupOpersCount' | 'targetPickupCount') => {
    dispatch({
      type: 'updatePickupCount',
      payload: {
        id,
        count,
        target,
      },
    });
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

  const updateBannerName = (payload: ChangeNameProps) => {
    dispatch({
      type: 'updateBannerName',
      payload: { id, ...payload },
    });
  };

  const updateOperatorDetails = (payload: ChangeOperatorDetails) => {
    dispatch({ type: 'updateOperatorDetails', payload: { id, ...payload } });
  };

  const addOperator = () => {
    dispatch({ type: 'addOperator', payload: { id } });
  };

  return (
    <motion.div
      layout="position"
      variants={gachaBannerOptionCardVariants}
      whileHover={{
        scale: 1.02,
        background: 'linear-gradient(135deg, #222222, #333333)',
        transition: { type: 'spring', stiffness: 170, damping: 27, mass: 1.35 },
      }}
      initial="exit"
      animate="idle"
      exit="exit"
      transition={{
        layout: {
          duration: 0.3,
          ease: 'easeInOut',
          type: 'spring',
          mass: 0.6,
        },
      }}
      className="flex flex-col space-y-6 rounded-xl p-4"
    >
      <div className="flex flex-col gap-4">
        <BannerHeader
          id={id}
          currentName={name}
          gachaType={gachaType}
          index={index}
          onBannerDelete={() => {
            deleteData({ target: 'banner' });
          }}
          onNameBlur={(e) => {
            updateBannerName({ name: e.currentTarget.value });
          }}
        />
        <PreInfoField
          isPresent={isPresent}
          isSimpleMode={isSimpleMode}
          isGachaSim={isGachaSim}
          pickupData={pickupData}
          updatePickupCount={updatePickupCount}
          updateAttempts={updateAttempts}
        />
      </div>
      <AnimatePresence mode="wait" propagate>
        {isSimpleMode ? (
          <div
            key={`opersAlter-${`${id} ${isSimpleMode}` ? 'hidden' : 'shown'}`}
            className="hidden"
          />
        ) : (
          <motion.div
            key={`opers-${`${id} ${isSimpleMode}` ? 'hidden' : 'shown'}`}
            className="space-y-6 text-sm sm:space-y-4"
          >
            <div className="font-S-CoreDream-500 flex justify-between text-xl">
              <motion.span variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
                <span className="text-amber-400">목표</span> 픽업 목록
              </motion.span>
              <AdditionalResUntilBannerEnd
                key={`res-${`${id} ${isGachaSim}` ? 'hidden' : 'shown'}`}
                additionalResource={pickupData.additionalResource.toString()}
                onInputBlur={() => {}}
              />
            </div>
            {operators.map((operator) => (
              <PickupOperatorDetail
                key={operator.operatorId}
                operator={operator}
                onChangeOperatorDetails={updateOperatorDetails}
                onOperatorDelete={() => {
                  deleteData({ target: 'operator', operatorId: operator.operatorId });
                }}
              />
            ))}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
