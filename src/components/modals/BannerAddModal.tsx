import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import Modal from '#/components/modals/Modal';
import { InsetNumberInput } from '#/components/PickupBanner';
import { ExtractPayloadFromAction } from '#/components/PickupList';
import { gachaTypeButtons } from '#/constants/ui';
import { toOpacityZero } from '#/constants/variants';
import { clamp, normalizeNumberString } from '#/libs/utils';
import { GachaType } from '#/types/types';
import { motion } from 'motion/react';
import { ChangeEvent, useReducer } from 'react';

const ModalContents = ({
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
            className="px-4"
          />
        ))}
      </div>
      <div className="flex gap-x-6">
        <InsetNumberInput
          name="픽업 6성"
          className="text-sky-500"
          onInputBlur={(e: ChangeEvent<HTMLInputElement>) => {
            onPickupCountChange(e, 'pickupOpersCount');
          }}
          currentValue={modalState.pickupOpersCount.sixth.toString()}
        />
        <InsetNumberInput
          name="목표 6성"
          className="text-amber-400"
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
  | { type: 'updateType'; payload: { gachaType: GachaType } }
  | {
      type: 'updatePickupCount';
      payload: {
        count: number;
        countType: 'pickupOpersCount' | 'targetOpersCount';
      };
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
    case 'updateType': {
      const { gachaType } = action.payload;
      const commonOpersCount =
        gachaType === 'limited' || gachaType === 'standard'
          ? {
              pickupOpersCount: { sixth: 2, fourth: 0, fifth: 0 },
              targetOpersCount: { sixth: 2, fourth: 0, fifth: 0 },
            }
          : gachaType === 'revival' || gachaType === 'collab'
            ? {
                pickupOpersCount: { sixth: 1, fourth: 0, fifth: 0 },
                targetOpersCount: { sixth: 1, fourth: 0, fifth: 0 },
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

const initialState: ModalState = {
  gachaType: 'limited',
  pickupOpersCount: { sixth: 2, fourth: 0, fifth: 0 },
  targetOpersCount: { sixth: 2, fourth: 0, fifth: 0 },
};

export default function BannerAddModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ExtractPayloadFromAction<'addBanner'>) => void;
}) {
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
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex w-[360px] flex-col gap-y-8">
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
        <div className="flex flex-col gap-y-6">
          <ModalContents
            modalState={modalState}
            onTypeClick={updateType}
            onPickupCountChange={updatePickupCount}
          />
        </div>
        <TypeSelectionButton
          name="추가하기"
          hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
          onTypeClick={() => {
            onSaveClick();
          }}
        />
      </div>
    </Modal>
  );
}
