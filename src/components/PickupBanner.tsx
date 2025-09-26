'use client';

import { AnimatePresence, motion, useIsPresent, usePresenceData } from 'motion/react';
import {
  gachaBannerOptionCardVariants,
  insetInputVariants,
  secondLevelTransition,
  toOpacityZero,
} from '#/constants/variants';
import { Dummy, GachaType, PickupDatasAction } from '#/components/PickupList';
import DeleteButton from '#/components/buttons/DeleteButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import AddButton from '#/components/buttons/AddButton';
import { cls, normalizeNumberString, stringToNumber } from '#/libs/utils';
import { ActionDispatch, ChangeEvent, FocusEvent, ReactNode } from 'react';
import { useSyncedState } from '#/hooks/useSyncedState';

const MaxAttempts = ({
  maxGachaAttempts,
  onUnlimitedClick,
  onInputBlur,
}: {
  maxGachaAttempts: string;
  onUnlimitedClick: () => void;
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
}) => {
  const [localValue, setLocalValue] = useSyncedState(maxGachaAttempts);
  const isInfinity = maxGachaAttempts === 'Infinity' && localValue === 'Infinity';
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <motion.span
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        exit="exit"
        className="text-amber-400"
      >
        최대 시도
      </motion.span>
      <motion.div
        variants={insetInputVariants}
        initial="exit"
        animate="idle"
        exit="exit"
        className="relative flex items-center rounded-lg"
      >
        <motion.div
          variants={toOpacityZero}
          initial="exit"
          animate="idle"
          exit="exit"
          className="relative flex items-center px-4 py-2"
        >
          {isInfinity && <div className="absolute right-0 mr-4 text-3xl">∞</div>}
          <input
            type="number"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const numberString = normalizeNumberString(e.currentTarget.value);
              if (numberString === undefined) return;
              setLocalValue(numberString);
            }}
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
              if (isInfinity) return;
              onInputBlur(e);
            }}
            className="relative w-8 min-w-0 text-right"
            max={999}
            value={localValue === 'Infinity' ? '' : localValue}
          />
        </motion.div>
        <TypeSelectionButton
          name="무제한"
          className="px-3 text-sm"
          onTypeClick={onUnlimitedClick}
          hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
        />
      </motion.div>
    </div>
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
  const [localValue, setLocalValue] = useSyncedState(minGachaAttempts);
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <motion.span
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        exit="exit"
        className="text-sky-600"
      >
        최소 <span>시도</span>
      </motion.span>
      <motion.div
        variants={insetInputVariants}
        initial="exit"
        animate="idle"
        exit="exit"
        className="relative flex items-center rounded-lg"
      >
        <motion.div
          variants={toOpacityZero}
          initial="exit"
          animate="idle"
          exit="exit"
          className="relative flex items-center px-4 py-2"
        >
          <input
            type="number"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const numberString = normalizeNumberString(e.currentTarget.value);
              if (numberString === undefined) return;
              setLocalValue(numberString);
            }}
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
              onInputBlur(e);
            }}
            className="relative w-8 min-w-0 text-right"
            max={999}
            value={localValue}
          />
        </motion.div>
        {gachaType === 'limited' && (
          <TypeSelectionButton
            name="300정가"
            className="px-3 text-sm"
            onTypeClick={onReach300}
            hoverBackground="linear-gradient(155deg, #1447e6, #51a2ff)"
          />
        )}
      </motion.div>
    </div>
  );
};

export const InsetNumberInput = ({
  onInputBlur,
  currentValue,
  className = '',
  name,
}: {
  onInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
  currentValue: string;
  className?: string;
  name: ReactNode;
}) => {
  const [localValue, setLocalValue] = useSyncedState(currentValue);
  const isParentPresent = usePresenceData();
  const preventTransition = { duration: 0, delay: 0 };
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.2 } }}
        exit={{
          opacity: 0,
          transition: isParentPresent ? preventTransition : { duration: 0.1, delay: 0.2 },
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
          transition: isParentPresent ? preventTransition : secondLevelTransition.fadeOut,
        }}
        className="relative flex items-center rounded-lg"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.2 } }}
          exit={{
            opacity: 0,
            transition: isParentPresent ? preventTransition : { duration: 0.1, delay: 0.2 },
          }}
          className="relative flex items-center px-4 py-2"
        >
          <input
            type="number"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const { value } = e.currentTarget;
              const numberString = normalizeNumberString(value);
              if (numberString === undefined) return;
              setLocalValue(numberString);
            }}
            onBlur={onInputBlur}
            className="relative h-full w-8 min-w-0 text-right"
            value={localValue}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

const AdditionalResUntilEnd = ({
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const { value } = e.currentTarget;
              const numberString = normalizeNumberString(value);
              if (numberString === undefined) return;
              setLocalValue(e.currentTarget.value);
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

interface PickupBannerProps {
  pickupData: Dummy;
  dispatch: ActionDispatch<[action: PickupDatasAction]>;
  index: number;
  isGachaSim: boolean;
  isSimpleMode: boolean;
}

export default function PickupBanner({
  pickupData,
  dispatch,
  index,
  isGachaSim,
  isSimpleMode,
}: PickupBannerProps) {
  const isPresent = useIsPresent();
  const {
    maxGachaAttempts,
    minGachaAttempts,
    gachaType,
    name,
    operators,
    id,
    pickupDetails: { targetPickupCount, pickupOpersCount },
    additionalResource,
  } = pickupData;

  const translatedGachaType =
    gachaType === 'collab' ? '콜라보 배너' : gachaType === 'limited' ? '한정 배너' : '통상 배너';

  const changePickupCount = (count: number, target: 'pickupOpersCount' | 'targetPickupCount') => {
    dispatch({
      type: 'changePickupCount',
      payload: {
        id,
        count: count,
        target: target,
      },
    });
  };

  const changeAttempts = (attempts: number, targetCount: 'max' | 'min' | 'both') => {
    if (isNaN(attempts)) return;
    switch (targetCount) {
      case 'max':
        {
          dispatch({
            type: 'modify',
            payload: {
              id,
              maxGachaAttempts: attempts,
              minGachaAttempts: attempts < minGachaAttempts ? attempts : minGachaAttempts,
            },
          });
        }
        break;
      case 'min':
        {
          dispatch({
            type: 'modify',
            payload: {
              id,
              maxGachaAttempts: attempts > maxGachaAttempts ? attempts : maxGachaAttempts,
              minGachaAttempts: attempts,
            },
          });
        }
        break;
      default:
        {
          dispatch({
            type: 'modify',
            payload: {
              id,
              maxGachaAttempts: attempts,
              minGachaAttempts: attempts,
            },
          });
        }
        break;
    }
  };

  return (
    <motion.div
      layout
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const { value } = e.currentTarget;
                dispatch({ type: 'modify', payload: { id, name: value } });
              }}
              value={name}
              className="w-full"
            />
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
          </motion.div>
          <DeleteButton
            handleDelete={() => {
              dispatch({ type: 'delete', payload: { id } });
            }}
            className="size-[48px] shrink-0 grow"
          />
        </div>
        <div className="felx-wrap flex justify-between gap-x-6 gap-y-3">
          <AnimatePresence mode="wait" custom={isPresent} propagate>
            <motion.div
              key={String(isSimpleMode)}
              className="font-S-CoreDream-500 flex flex-wrap gap-x-6 gap-y-3 text-sm"
            >
              {isSimpleMode ? (
                <>
                  <InsetNumberInput
                    name="픽업 6성"
                    className="text-sky-500"
                    onInputBlur={(e) => {
                      changePickupCount(stringToNumber(e.currentTarget.value), 'pickupOpersCount');
                    }}
                    currentValue={pickupOpersCount.toString()}
                  />
                  <InsetNumberInput
                    name="목표 6성"
                    className="text-amber-400"
                    onInputBlur={(e) => {
                      changePickupCount(stringToNumber(e.currentTarget.value), 'targetPickupCount');
                    }}
                    currentValue={targetPickupCount.toString()}
                  />
                </>
              ) : (
                <>
                  <MaxAttempts
                    maxGachaAttempts={maxGachaAttempts.toString()}
                    onInputBlur={(e) => {
                      changeAttempts(stringToNumber(e.currentTarget.value), 'max');
                    }}
                    onUnlimitedClick={() => {
                      changeAttempts(Infinity, 'max');
                    }}
                  />
                  <MinAttempts
                    minGachaAttempts={minGachaAttempts.toString()}
                    onInputBlur={(e) => {
                      changeAttempts(stringToNumber(e.currentTarget.value), 'min');
                    }}
                    onReach300={() => {
                      changeAttempts(300, 'both');
                    }}
                    gachaType={gachaType}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait" propagate>
            {isGachaSim ? (
              <div
                key={`resAlter-${`${id} ${isGachaSim}` ? 'shown' : 'hidden'}`}
                className="hidden"
              />
            ) : (
              <AdditionalResUntilEnd
                key={`res-${`${id} ${isGachaSim}` ? 'hidden' : 'shown'}`}
                additionalResource={additionalResource.toString()}
                onInputBlur={() => {}}
              />
            )}
          </AnimatePresence>
        </div>
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
            {operators.map(({ currentQty, name, operType }) => (
              <div
                key={name}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
              >
                <div className="flex grow gap-6">
                  <DeleteButton handleDelete={() => {}} className="-mr-2" />
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
                      onChange={() => {}}
                      value={name}
                      className="w-full text-[15px]"
                    />
                    <div className="flex h-full gap-x-1">
                      {operType === 'limited' ? (
                        <motion.div
                          variants={toOpacityZero}
                          initial="exit"
                          animate="idle"
                          exit="exit"
                          className="inline-block rounded-full border border-amber-400 px-3 py-1 text-sm whitespace-nowrap text-amber-400"
                        >
                          한정
                        </motion.div>
                      ) : (
                        <motion.div
                          variants={toOpacityZero}
                          initial="exit"
                          animate="idle"
                          exit="exit"
                          className="inline-block rounded-full border border-sky-600 px-3 py-1 text-sm whitespace-nowrap text-sky-600"
                        >
                          통상
                        </motion.div>
                      )}
                      <motion.div
                        variants={toOpacityZero}
                        initial="exit"
                        animate="idle"
                        exit="exit"
                        className="relative flex aspect-square h-full items-center justify-center rounded-full border border-amber-400"
                      >
                        <svg className="size-[18px] text-amber-400">
                          <use href="/icons/icons.svg#tag"></use>
                        </svg>
                      </motion.div>
                    </div>
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
                      onTypeClick={() => {}}
                      className="px-4"
                    />
                    <TypeSelectionButton
                      name="풀잠"
                      hoverBackground="linear-gradient(155deg, #ec003f, #ff637e)"
                      onTypeClick={() => {}}
                      className="px-4"
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
                        max={6}
                        onChange={() => {}}
                        className="w-6 min-w-0 text-right"
                        value={currentQty}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex w-full justify-center py-2">
              <AddButton onAddClick={() => {}} custom={{ size: 'small' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
