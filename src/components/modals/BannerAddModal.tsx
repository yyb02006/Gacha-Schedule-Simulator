import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import Modal from '#/components/modals/Modal';
import { InsetNumberInput } from '#/components/PickupBanner';
import { Dummy, ExtractPayloadFromAction, Operator } from '#/components/PickupList';
import { BannerBadgeProps, gachaTypeButtons } from '#/constants/ui';
import {
  cardVariants,
  fontPop,
  insetInputVariants,
  toggleButtonVariants,
  toOpacityZero,
} from '#/constants/variants';
import { clamp, normalizeNumberString } from '#/libs/utils';
import { GachaType } from '#/types/types';
import { motion } from 'motion/react';
import { ChangeEvent, useReducer, useState } from 'react';
import SimpleBar from 'simplebar-react';
import pickupDatas from '#/data/pickupDatas.json';
import 'simplebar-react/dist/simplebar.min.css';
import Image from 'next/image';
import Badge from '#/components/Badge';

const CustomModalContents = ({
  modalState,
  onPickupCountChange,
  onTypeClick,
}: {
  modalState: ModalState;
  onPickupCountChange: (
    e: ChangeEvent<HTMLInputElement>,
    countType: 'pickupOpersCount' | 'targetOpersCount',
  ) => void;
  onTypeClick: (type: GachaType) => void;
}) => {
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
      <div className="flex gap-x-6">
        <InsetNumberInput
          name="픽업 6성"
          className="text-sm text-sky-500"
          onInputBlur={(e: ChangeEvent<HTMLInputElement>) => {
            onPickupCountChange(e, 'pickupOpersCount');
          }}
          currentValue={modalState.pickupOpersCount.sixth.toString()}
        />
        <InsetNumberInput
          name="목표 6성"
          className="text-sm text-amber-400"
          onInputBlur={(e: ChangeEvent<HTMLInputElement>) => {
            onPickupCountChange(e, 'targetOpersCount');
          }}
          currentValue={modalState.targetOpersCount.sixth.toString()}
        />
      </div>
    </>
  );
};

type ModalState = ExtractPayloadFromAction<'addBanner'>;

type ModalAction =
  | { type: 'initialIzation' }
  | { type: 'updateType'; payload: { gachaType: GachaType } }
  | {
      type: 'updatePickupCount';
      payload: {
        count: number;
        countType: 'pickupOpersCount' | 'targetOpersCount';
      };
    };

const initialState: ModalState = {
  gachaType: 'limited',
  pickupOpersCount: { sixth: 2, fourth: 0, fifth: 0 },
  targetOpersCount: { sixth: 2, fourth: 0, fifth: 0 },
};

const reducer = (
  state: ModalState,
  action: ModalAction,
): {
  gachaType: GachaType;
  pickupOpersCount: { sixth: number; fourth: number; fifth: number };
  targetOpersCount: { sixth: number; fourth: number; fifth: number };
} => {
  switch (action.type) {
    case 'initialIzation': {
      return initialState;
    }
    case 'updateType': {
      const { gachaType } = action.payload;
      const commonOpersCount =
        gachaType === 'limited' || gachaType === 'single'
          ? {
              pickupOpersCount: { sixth: 2, fourth: 0, fifth: 0 },
              targetOpersCount: { sixth: 2, fourth: 0, fifth: 0 },
            }
          : gachaType === 'revival' || gachaType === 'collab'
            ? {
                pickupOpersCount: { sixth: 1, fourth: 0, fifth: 0 },
                targetOpersCount: { sixth: 1, fourth: 0, fifth: 0 },
              }
            : gachaType === 'orient'
              ? {
                  pickupOpersCount: { sixth: 3, fourth: 0, fifth: 0 },
                  targetOpersCount: { sixth: 3, fourth: 0, fifth: 0 },
                }
              : {
                  pickupOpersCount: { sixth: 4, fourth: 0, fifth: 0 },
                  targetOpersCount: { sixth: 4, fourth: 0, fifth: 0 },
                };
      return {
        gachaType,
        ...commonOpersCount,
      };
    }
    case 'updatePickupCount': {
      const { count, countType } = action.payload;
      const isTargetOpersCountExceeded = count > state[countType]['sixth'];
      const isPickupOpersCountDeficit = count < state[countType]['sixth'];
      const oppositeCountType: typeof countType =
        countType === 'pickupOpersCount' ? 'targetOpersCount' : 'pickupOpersCount';
      const newOppositeCount = {
        sixth:
          countType === 'pickupOpersCount'
            ? isPickupOpersCountDeficit
              ? count
              : state.targetOpersCount.sixth
            : isTargetOpersCountExceeded
              ? count
              : state.pickupOpersCount.sixth,
      };
      return {
        ...state,
        [countType]: { ...state[countType], sixth: count },
        [oppositeCountType]: { ...state[oppositeCountType], ...newOppositeCount },
      };
    }
    default:
      throw new Error();
  }
};

const prePickupDatas: Dummy[] = pickupDatas.datas.map((data) => ({
  ...data,
  operators: data.operators as Operator[],
  gachaType: data.gachaType as GachaType,
  maxGachaAttempts:
    data.maxGachaAttempts === 'Infinity' ? Infinity : parseInt(data.maxGachaAttempts),
}));

const PresetModalContents = ({ onPresetClick }: { onPresetClick: (payload: Dummy) => void }) => {
  return (
    <SimpleBar autoHide={false} className="-mx-4 h-full space-y-6 p-4" style={{ minHeight: 0 }}>
      <div className="space-y-6">
        {prePickupDatas.map((pickupData) => {
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
                {image ? (
                  <div>
                    <Image
                      src={image}
                      width={1560}
                      height={500}
                      alt="babel"
                      className="rounded-t-lg"
                    />
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-x-2 text-base">
                  {name}
                  <Badge {...BannerBadgeProps[gachaType].props} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </SimpleBar>
  );
};

const BannerAddTypeToggle = ({
  isCustomMode,
  onTypeClick,
}: {
  isCustomMode: boolean;
  onTypeClick: () => void;
}) => {
  return (
    <div className="flex min-w-[100px] flex-col space-y-1">
      <motion.div
        variants={insetInputVariants}
        animate="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        onClick={onTypeClick}
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
            className="font-S-CoreDream-700"
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
            className="font-S-CoreDream-700"
          >
            프리셋
          </motion.div>
        </motion.div>
        <div className="absolute top-0 flex size-full">
          <motion.div
            transition={{
              left: { type: 'spring', visualDuration: 0.3, bounce: 0.2 },
            }}
            animate={isCustomMode ? { left: 0 } : { left: '50%' }}
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
              <motion.span variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
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
  onClose,
  onSave,
  onSavePreset,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ExtractPayloadFromAction<'addBanner'>) => void;
  onSavePreset: (payload: Dummy) => void;
}) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [modalState, dispatch] = useReducer(reducer, initialState);
  const updatePickupCount = (
    e: ChangeEvent<HTMLInputElement>,
    countType: 'pickupOpersCount' | 'targetOpersCount',
  ) => {
    const { value } = e.currentTarget;
    const numberString = normalizeNumberString(value);
    if (numberString === undefined) return;
    const normalizedNumber = Math.floor(clamp(parseFloat(numberString), 0));
    dispatch({
      type: 'updatePickupCount',
      payload: { count: normalizedNumber, countType },
    });
  };
  const updateType = (gachaType: GachaType) => {
    dispatch({ type: 'updateType', payload: { gachaType } });
  };
  const onSaveClick = () => {
    onSave(modalState);
    dispatch({ type: 'initialIzation' });
    onClose();
  };
  const onPresetSaveClick = (payload: Dummy) => {
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
    >
      <div className="flex h-0 w-[360px] flex-1 flex-col gap-y-8 lg:w-[480px]">
        <div className="flex items-center justify-between gap-x-6">
          <motion.h1
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="font-S-CoreDream-700 text-2xl"
          >
            픽업 배너 <span className="text-amber-400">추가</span>
          </motion.h1>
          <CancelButton handleCancel={onClose} />
        </div>
        <BannerAddTypeToggle
          isCustomMode={isCustomMode}
          onTypeClick={() => {
            setIsCustomMode((p) => !p);
          }}
        />
        {isCustomMode ? (
          <>
            <CustomModalContents
              modalState={modalState}
              onTypeClick={updateType}
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
          <PresetModalContents onPresetClick={onPresetSaveClick} />
        )}
      </div>
    </Modal>
  );
}
