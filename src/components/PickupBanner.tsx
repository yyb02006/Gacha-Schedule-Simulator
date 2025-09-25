'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  gachaBannerOptionCardVariants,
  insetInputVariants,
  toOpacityZero,
} from '#/constants/variants';
import {
  Dummy,
  ExtractPayloadFromAction,
  GachaType,
  PickupDatasAction,
} from '#/components/PickupList';
import DeleteButton from '#/components/buttons/DeleteButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import AddButton from '#/components/buttons/AddButton';
import { cls } from '#/libs/utils';
import { ActionDispatch, ChangeEvent, ReactNode } from 'react';

const MaxAttempts = ({
  maxGachaAttempts,
  onUnlimitedClick,
  onInputChange,
}: {
  maxGachaAttempts: number | null;
  onUnlimitedClick: () => void;
  onInputChange: () => void;
}) => {
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
          {!!maxGachaAttempts || <div className="absolute right-0 mr-4 text-3xl">∞</div>}
          <input
            type="number"
            onChange={onInputChange}
            className="relative w-8 min-w-0 text-right"
            max={999}
            value={maxGachaAttempts || ''}
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
  onInputChange,
}: {
  minGachaAttempts: number;
  gachaType: GachaType;
  onReach300: () => void;
  onInputChange: () => void;
}) => {
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
            onChange={onInputChange}
            className="relative w-8 min-w-0 text-right"
            max={999}
            value={minGachaAttempts}
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
  onInputChange,
  value,
  className = '',
  name,
}: {
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
  className?: string;
  name: ReactNode;
}) => {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <motion.div
        variants={toOpacityZero}
        initial="exit"
        animate="idle"
        exit="exit"
        className={cls(className, 'flex h-full items-center')}
      >
        {name}
      </motion.div>
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
            onChange={onInputChange}
            className="relative h-full w-8 min-w-0 text-right"
            value={value}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

const BannerEndAdditionalRes = ({ onInputChange }: { onInputChange: () => void }) => {
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
            onChange={onInputChange}
            className="relative w-14 min-w-0 text-right"
            value={400000}
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
  const {
    maxGachaAttempts,
    minGachaAttempts,
    gachaType,
    name,
    operators,
    id,
    pickupDetails: { targetPickupCount, pickupOpersCount },
  } = pickupData;

  const translatedGachaType =
    gachaType === 'collab' ? '콜라보 배너' : gachaType === 'limited' ? '한정 배너' : '통상 배너';

  const onPickupCountChange = (
    e: ChangeEvent<HTMLInputElement>,
    targetCount: 'pickupOpersCount' | 'targetPickupCount',
  ) => {
    const { value } = e.currentTarget;
    const numberValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numberValue)) {
      dispatch({
        type: 'modifyBanner',
        payload: {
          id,
          pickupDetails: {
            ...pickupData.pickupDetails,
            [targetCount]: numberValue,
          },
        },
      });
    }
  };

  return (
    <motion.div
      variants={gachaBannerOptionCardVariants}
      whileHover={{
        scale: 1.02,
        background: 'linear-gradient(135deg, #222222, #333333)',
        transition: { type: 'spring' as const, stiffness: 170, damping: 27, mass: 1.35 },
      }}
      initial="exit"
      animate="idle"
      exit="exit"
      className="flex flex-col space-y-6 rounded-xl p-4"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full items-center gap-2">
            <motion.span
              variants={toOpacityZero}
              initial="exit"
              animate="idle"
              exit="exit"
              className="font-S-CoreDream-700 text-2xl"
            >
              {index + 1}.
            </motion.span>
            <motion.div
              variants={insetInputVariants}
              initial="exit"
              animate="idle"
              exit="exit"
              className="font-S-CoreDream-500 flex w-full grow items-center rounded-lg py-2 pr-2 pl-4 text-xl"
            >
              <motion.input
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                type="text"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const { value } = e.currentTarget;
                  dispatch({ type: 'modifyBanner', payload: { id, name: value } });
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
                  {translatedGachaType}
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
                    <use href="/icons/icons.svg#tag"></use>
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </div>
          <DeleteButton handleDelete={() => {}} className="size-[48px] shrink-0 grow" />
        </div>
        <div className="felx-wrap flex justify-between gap-x-6 gap-y-3">
          <div className="font-S-CoreDream-500 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {isSimpleMode ? (
              <>
                <InsetNumberInput
                  name="픽업 인원"
                  className="text-sky-500"
                  onInputChange={(e: ChangeEvent<HTMLInputElement>) => {
                    onPickupCountChange(e, 'pickupOpersCount');
                  }}
                  value={pickupOpersCount.toString()}
                />
                <InsetNumberInput
                  name="목표 픽업"
                  className="text-amber-400"
                  onInputChange={(e: ChangeEvent<HTMLInputElement>) => {
                    onPickupCountChange(e, 'targetPickupCount');
                  }}
                  value={targetPickupCount.toString()}
                />
              </>
            ) : (
              <>
                <MaxAttempts
                  maxGachaAttempts={maxGachaAttempts}
                  onInputChange={() => {}}
                  onUnlimitedClick={() => {}}
                />
                <MinAttempts
                  minGachaAttempts={minGachaAttempts}
                  onInputChange={() => {}}
                  onReach300={() => {}}
                  gachaType={gachaType}
                />
              </>
            )}
          </div>
          <AnimatePresence>
            {isGachaSim || <BannerEndAdditionalRes onInputChange={() => {}} />}
          </AnimatePresence>
        </div>
      </div>
      <div className="space-y-6 text-sm sm:space-y-4">
        {isSimpleMode ||
          operators.map(({ currentQty, name, operType }) => (
            <div key={name} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div className="flex grow gap-6">
                <DeleteButton handleDelete={() => {}} className="-mr-2" />
                <motion.div
                  variants={insetInputVariants}
                  initial="exit"
                  animate="idle"
                  exit="exit"
                  className="flex min-w-40 grow items-center rounded-lg py-2 pr-2 pl-4"
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
        {isSimpleMode || (
          <div className="flex w-full justify-center py-2">
            <AddButton onAddClick={() => {}} custom={{ size: 'small' }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
