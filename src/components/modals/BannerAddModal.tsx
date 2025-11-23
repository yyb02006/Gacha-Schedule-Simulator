import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import Modal from '#/components/modals/Modal';
import { InsetNumberInput } from '#/components/PickupBanner';
import { Dummy, ExtractPayloadFromAction } from '#/components/PickupList';
import {
  bannerBadgeProps,
  gachaTypeButtons,
  operatorBadgeProps,
  rarityColor,
} from '#/constants/ui';
import {
  cardVariants,
  fontPop,
  insetInputVariants,
  toggleButtonVariants,
  toOpacityZero,
} from '#/constants/variants';
import { cls, stringToNumber } from '#/libs/utils';
import { GachaType, OperatorRarity } from '#/types/types';
import { AnimatePresence, motion, useMotionValue } from 'motion/react';
import { ChangeEvent, useEffect, useReducer, useRef, useState } from 'react';
import Image from 'next/image';
import Badge from '#/components/Badge';
import { useResizeDragToggle } from '#/hooks/useResizeDragToggle';
import { animate } from 'motion';
import { operatorLimitByBannerType, rarities, rarityStrings } from '#/constants/variables';
import { ResponsiveHide, ResponsiveShow } from '#/components/ResponsiveSpan';
import OverlayScrollbar from '#/components/OverlayScrollbar';

const CustomModalContents = ({
  modalState,
  onPickupCountChange,
  onTypeClick,
}: {
  modalState: ModalState;
  onPickupCountChange: (payload: {
    count: number;
    countType: 'pickupOpersCount' | 'targetOpersCount';
    rarity: OperatorRarity;
  }) => void;
  onTypeClick: (type: GachaType) => void;
}) => {
  const targetLimit = operatorLimitByBannerType[modalState.gachaType];
  return (
    <>
      <div className="flex flex-wrap gap-4">
        {gachaTypeButtons.map(({ type, name, hoverBackground }) => (
          <TypeSelectionButton
            key={type}
            name={name}
            isActive={modalState.gachaType === type}
            hoverBackground={hoverBackground}
            onTypeClick={() => {
              onTypeClick(type);
            }}
            className="px-4 text-sm"
          />
        ))}
      </div>
      <div className="flex flex-col gap-y-8">
        {([6, 5, 4] as const).map((rarity, index) => (
          <div key={`${rarity}${index}`} className="flex gap-6">
            {(['pickupOpersCount', 'targetOpersCount'] as const).map((countType) => (
              <InsetNumberInput
                key={`${rarity}${countType}`}
                name={`${countType === 'pickupOpersCount' ? '픽업' : '목표'} ${rarity}성`}
                className={cls(rarityColor[rarities[rarity]].textColor, 'text-sm')}
                onInputBlur={(e: ChangeEvent<HTMLInputElement>, syncLocalValue) => {
                  const value = stringToNumber(e.currentTarget.value);
                  const { targetOpersCount } = modalState;
                  const otherRarities = Object.entries(targetOpersCount)
                    .filter(([key]) => key !== rarities[rarity])
                    .map(([_, value]) => value) as OperatorRarity[];
                  const hasNoTargetOperators =
                    value === 0 &&
                    targetOpersCount[rarities[otherRarities[0]]] === 0 &&
                    targetOpersCount[rarities[otherRarities[1]]] === 0;
                  const count = hasNoTargetOperators ? 1 : value;
                  onPickupCountChange({ count, countType, rarity });
                  syncLocalValue(hasNoTargetOperators ? '1' : count.toString());
                }}
                max={targetLimit[rarities[rarity]]}
                currentValue={modalState[countType][rarities[rarity]].toString()}
                inputWidth="w-full min-w-8"
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

type ModalState = ExtractPayloadFromAction<'addBanner'>;

type ModalAction =
  | { type: 'initialIzation' }
  | { type: 'updateGachaType'; payload: { gachaType: GachaType } }
  | {
      type: 'updatePickupCount';
      payload: {
        count: number;
        countType: 'pickupOpersCount' | 'targetOpersCount';
        rarity: OperatorRarity;
      };
    };

const initialGachaType: GachaType = 'limited';

const initialState: ModalState = {
  gachaType: initialGachaType,
  pickupOpersCount: operatorLimitByBannerType[initialGachaType],
  targetOpersCount: {
    sixth: operatorLimitByBannerType[initialGachaType].sixth,
    fourth: 0,
    fifth: 0,
  },
  expiration: null,
};

const reducer = (
  state: ModalState,
  action: ModalAction,
): {
  gachaType: GachaType;
  pickupOpersCount: { sixth: number; fourth: number; fifth: number };
  targetOpersCount: { sixth: number; fourth: number; fifth: number };
  expiration: string | null;
} => {
  switch (action.type) {
    case 'initialIzation': {
      return initialState;
    }
    case 'updateGachaType': {
      const { gachaType } = action.payload;
      const baseOperCount = {
        pickupOpersCount: operatorLimitByBannerType[gachaType],
        targetOpersCount: {
          sixth: operatorLimitByBannerType[gachaType].sixth,
          fourth: 0,
          fifth: 0,
        },
      };
      return {
        gachaType,
        ...baseOperCount,
        expiration: state.expiration,
      };
    }
    case 'updatePickupCount': {
      const { count, countType, rarity } = action.payload;
      const isTargetOpersCountExceeded = count > state.pickupOpersCount[rarities[rarity]];
      const isPickupOpersCountDeficit = count < state.targetOpersCount[rarities[rarity]];
      const oppositeCountType: typeof countType =
        countType === 'pickupOpersCount' ? 'targetOpersCount' : 'pickupOpersCount';
      const newOppositeCount = {
        [rarities[rarity]]:
          countType === 'pickupOpersCount'
            ? isPickupOpersCountDeficit
              ? count
              : state.targetOpersCount[rarities[rarity]]
            : isTargetOpersCountExceeded
              ? count
              : state.pickupOpersCount[rarities[rarity]],
      };
      return {
        ...state,
        [countType]: { ...state[countType], [rarities[rarity]]: count },
        [oppositeCountType]: { ...state[oppositeCountType], ...newOppositeCount },
      };
    }
    default:
      throw new Error();
  }
};

export const Help = ({ onClose }: { onClose: () => void }) => {
  const badgeKeys = Object.keys(bannerBadgeProps) as (keyof typeof bannerBadgeProps)[];
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
      className="fixed top-0 left-0 z-1000 flex size-full cursor-pointer items-center justify-center bg-transparent p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-[400px] cursor-default space-y-5 rounded-lg bg-[#202020] px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <h1 className="font-S-CoreDream-500 text-xl">
            배너 종류별 <span className="text-red-400">오퍼레이터 제한</span>
          </h1>
          <CancelButton
            handleCancel={() => {
              onClose();
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
          {badgeKeys.map((badgeKey) => (
            <motion.div
              key={badgeKey}
              variants={cardVariants}
              initial="exit"
              animate="idle"
              exit="exit"
              style={{ boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030' }}
              className="rounded-xl p-2"
            >
              <motion.div
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="space-y-2"
              >
                <Badge {...bannerBadgeProps[badgeKey].props} animation={false} />
                <div className="flex gap-3">
                  {rarityStrings.map((rarityString) => (
                    <div
                      key={`${rarityString}${badgeKey}`}
                      className="flex w-full flex-col items-center lg:block"
                    >
                      <>
                        <ResponsiveShow
                          above="sm"
                          className="font-S-CoreDream-300"
                        >{`${rarities[rarityString]}성: `}</ResponsiveShow>
                        <ResponsiveShow
                          above="sm"
                          className={cls(
                            operatorBadgeProps.rarity[rarityString].props.color,
                            'font-S-CoreDream-500',
                          )}
                        >
                          {operatorLimitByBannerType[badgeKey][rarityString]}
                        </ResponsiveShow>
                      </>
                      <>
                        <ResponsiveHide
                          above="sm"
                          className="font-S-CoreDream-300"
                        >{`${rarities[rarityString]}성`}</ResponsiveHide>
                        <ResponsiveHide
                          above="sm"
                          className={cls(
                            operatorBadgeProps.rarity[rarityString].props.color,
                            'font-S-CoreDream-500',
                          )}
                        >
                          {operatorLimitByBannerType[badgeKey][rarityString]}
                        </ResponsiveHide>
                      </>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="font-S-CoreDream-300 text-sm">
          모든 배너에는 <span className="text-red-400">최소 한 명이상</span>의 오퍼레이터가
          필요합니다.
        </div>
      </div>
    </motion.div>
  );
};

const PresetImage = ({ imagePath }: { imagePath: string }) => {
  const [isImageValid, setIsImageValid] = useState(true);
  return isImageValid ? (
    <div>
      <Image
        src={`https://pub-cee3b616ec754cb4b3678740fdae72a5.r2.dev${imagePath}`}
        width={1560}
        height={500}
        alt="babel"
        className="rounded-t-lg"
        onError={() => {
          setIsImageValid(false);
        }}
      />
    </div>
  ) : null;
};

const PresetModalContents = ({
  pickupDataPresets,
  onPresetClick,
}: {
  pickupDataPresets: Dummy[];
  onPresetClick: (payload: Dummy) => void;
}) => {
  return (
    <OverlayScrollbar className="-mx-4 px-4 py-3">
      <div className="space-y-6">
        {pickupDataPresets.map((pickupData) => {
          const { id, image, name, gachaType } = pickupData;
          return (
            <motion.div
              key={id}
              variants={cardVariants}
              initial="exit"
              animate="idle"
              exit="exit"
              whileHover={{
                scale: 1.02,
              }}
              className="cursor-pointer rounded-xl"
              onClick={() => {
                onPresetClick(pickupData);
              }}
            >
              <motion.div
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="space-y-2 rounded-xl p-2 hover:ring-[2px] hover:ring-amber-400"
              >
                {image ? <PresetImage imagePath={image} /> : null}
                <div className="flex items-center justify-between gap-x-2 text-base">
                  {name}
                  <Badge {...bannerBadgeProps[gachaType].props} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </OverlayScrollbar>
  );
};

const BannerAddTypeToggle = ({
  isCustomMode,
  onTypeClick,
}: {
  isCustomMode: boolean;
  onTypeClick: (isLeft?: boolean) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragEnabled] = useResizeDragToggle(100);

  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  useEffect(() => {
    const rect = constraintsRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxX = rect.width / 2;
    animate(x, isCustomMode ? 0 : maxX, { type: 'spring', stiffness: 400, damping: 30 });
  }, [isCustomMode, x]);
  return (
    <div className="flex min-w-[100px] flex-col space-y-1">
      <motion.div
        variants={insetInputVariants}
        animate="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        onClick={() => {
          if (isDragging) return;
          onTypeClick();
        }}
        className="relative flex h-[48px] cursor-pointer items-center justify-center rounded-xl px-4 pt-3 pb-2 font-bold"
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
            animate={isCustomMode ? 'inAcitve' : 'active'}
            initial={isCustomMode ? 'active' : 'inAcitve'}
            exit="exit"
            className="font-S-CoreDream-700 select-none"
          >
            커스텀
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
            animate={isCustomMode ? 'inAcitve' : 'active'}
            initial={isCustomMode ? 'active' : 'inAcitve'}
            exit="exit"
            className="font-S-CoreDream-700 select-none"
          >
            프리셋
          </motion.div>
        </motion.div>
        <div ref={constraintsRef} className="absolute top-0 flex size-full">
          <motion.div
            drag={dragEnabled ? 'x' : false}
            dragConstraints={constraintsRef}
            dragElastic={0}
            // timeConstant = 관성 적용 시간 이며, 관성 적용 시간이 길어진다는 것은 느려지는 것이므로 관성이 약하게 나타나게 된다.
            dragTransition={{
              power: 0.2,
              timeConstant: 750,
              modifyTarget: (target) => {
                // 관성 한계값 제한
                const rect = constraintsRef.current?.getBoundingClientRect();
                if (!rect) return target;
                const padding = 160; // 160이 괜찮긴 한데 정확히 어느 수치가 좋은지는 보면서 찾아야함
                const maxX = rect.width / 2 + padding;
                const minX = 0 - padding;

                return Math.min(Math.max(target, minX), maxX);
              },
            }}
            onDragStart={() => {
              setIsDragging(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
              const rect = constraintsRef.current?.getBoundingClientRect();
              if (!rect) return;
              const maxX = rect.width / 2;
              const currentX = x.get();

              if (isCustomMode) {
                if (currentX > maxX * (1 / 4)) {
                  onTypeClick(false);
                } else {
                  animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
                }
              } else {
                if (currentX < maxX * (3 / 4)) {
                  onTypeClick(true);
                } else {
                  animate(x, maxX, { type: 'spring', stiffness: 400, damping: 30 });
                }
              }
            }}
            style={{ x }}
            /* transition={{
              left: { type: 'spring', visualDuration: 0.3, bounce: 0.2 },
            }}
            animate={isCustomMode ? { left: 0 } : { left: '50%' }} */
            className="relative h-full w-1/2 p-[2px]"
          >
            <motion.div
              variants={toggleButtonVariants}
              initial="exit"
              animate={isCustomMode ? 'left' : 'right'}
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex size-full items-center justify-center rounded-lg"
            >
              <motion.span
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="select-none"
              >
                {isCustomMode ? '커스텀' : '프리셋'}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default function BannerAddModal({
  isOpen,
  bannerCount,
  pickupDataPresets,
  onClose,
  onSave,
  onSavePreset,
}: {
  isOpen: boolean;
  bannerCount: number;
  pickupDataPresets: Dummy[];
  onClose: () => void;
  onSave: (payload: ExtractPayloadFromAction<'addBanner'>) => void;
  onSavePreset: (payload: Dummy) => void;
}) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [modalState, dispatch] = useReducer(reducer, initialState);
  const updatePickupCount = (payload: {
    count: number;
    countType: 'pickupOpersCount' | 'targetOpersCount';
    rarity: OperatorRarity;
  }) => {
    dispatch({
      type: 'updatePickupCount',
      payload,
    });
  };
  const updateGachaType = (gachaType: GachaType) => {
    dispatch({ type: 'updateGachaType', payload: { gachaType } });
  };
  const onSaveClick = () => {
    if (bannerCount >= 20) return alert('배너는 20개까지만 추가 가능합니다.');
    onSave(modalState);
    dispatch({ type: 'initialIzation' });
    onClose();
  };
  const onPresetSaveClick = (payload: Dummy) => {
    if (bannerCount >= 20) return alert('배너는 20개까지만 추가 가능합니다.');
    onSavePreset(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        dispatch({ type: 'initialIzation' });
        onClose();
      }}
      backdropBlur
    >
      <div
        className={cls(
          isCustomMode ? '' : 'h-[calc(100dvh-96px)]',
          'w-full max-w-[480px] rounded-xl bg-[#202020] px-4 py-6 lg:px-6',
        )}
      >
        <AnimatePresence>
          {isHelpOpen && (
            <Help
              onClose={() => {
                setIsHelpOpen(false);
              }}
            />
          )}
        </AnimatePresence>
        <div className="flex h-full flex-1 flex-col gap-y-8">
          <div className="flex items-center justify-between gap-x-6">
            <div className="flex items-center gap-x-2">
              <motion.h1
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="font-S-CoreDream-700 text-2xl"
              >
                픽업 배너 <span className="text-amber-400">추가</span>
              </motion.h1>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="font-S-CoreDream-500 flex aspect-square size-[26px] cursor-pointer items-center justify-center rounded-full border border-[#606060] text-[18px] text-[#606060] hover:border-amber-400 hover:text-amber-400"
              >
                <p className="select-none">?</p>
              </button>
            </div>
            <CancelButton handleCancel={onClose} />
          </div>
          <BannerAddTypeToggle
            isCustomMode={isCustomMode}
            onTypeClick={(isLeft?: boolean) => {
              if (isLeft === undefined) {
                setIsCustomMode((p) => !p);
              } else {
                setIsCustomMode(isLeft);
              }
            }}
          />
          {isCustomMode ? (
            <>
              <CustomModalContents
                modalState={modalState}
                onTypeClick={updateGachaType}
                onPickupCountChange={updatePickupCount}
              />
              <TypeSelectionButton
                name="추가하기"
                hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
                onTypeClick={() => {
                  onSaveClick();
                }}
              />
            </>
          ) : (
            <PresetModalContents
              pickupDataPresets={pickupDataPresets}
              onPresetClick={onPresetSaveClick}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
