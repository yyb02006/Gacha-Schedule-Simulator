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

const SimpleModeModalContents = ({
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
      <div className="flex gap-x-4">
        {gachaTypeButtons.map(({ type, name, hoverBackground }) => (
          <TypeSelectionButton
            key={type}
            name={name}
            isActive={modalState.gachaType === type}
            hoverBackground={hoverBackground}
            onTypeClick={() => {
              onTypeClick(type);
            }}
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

type AddActionType = 'addSimpleBanner' | 'addDetailedBanner';

type ModalState = ExtractPayloadFromAction<AddActionType>;

type ModalAction =
  | { type: 'changeType'; payload: GachaType }
  | {
      type: 'changeCount';
      payload: {
        pickupOpersCount?: { sixth: number; fourth: number; fifth: number };
        targetOpersCount?: { sixth: number; fourth: number; fifth: number };
      };
    };

const reducer = (state: ModalState, action: ModalAction) => {
  let modifiedPickupCount = state.pickupOpersCount;
  let modifiedtargetOpersCount = state.targetOpersCount;
  if (action.type === 'changeType') {
    if (action.payload === 'limited') {
      modifiedPickupCount = { sixth: 2, fourth: 0, fifth: 0 };
      modifiedtargetOpersCount = { sixth: 2, fourth: 0, fifth: 0 };
    } else {
      modifiedPickupCount = { sixth: 1, fourth: 0, fifth: 0 };
      modifiedtargetOpersCount = { sixth: 1, fourth: 0, fifth: 0 };
    }
  }
  switch (action.type) {
    case 'changeType':
      return {
        gachaType: action.payload,
        pickupOpersCount: modifiedPickupCount,
        targetOpersCount: modifiedtargetOpersCount,
      };
    case 'changeCount':
      return {
        ...state,
        pickupOpersCount: action.payload.pickupOpersCount ?? state.pickupOpersCount,
        targetOpersCount: action.payload.targetOpersCount ?? state.targetOpersCount,
      };
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
  isSimpleMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ExtractPayloadFromAction<AddActionType>) => void;
  isSimpleMode: boolean;
}) {
  const [modalState, dispatch] = useReducer(reducer, initialState);
  const updatePickupCount = (
    e: ChangeEvent<HTMLInputElement>,
    countType: 'pickupOpersCount' | 'targetOpersCount',
  ) => {
    const { value } = e.currentTarget;
    const numberString = normalizeNumberString(value);
    if (numberString === undefined) return;
    const normalizedString = Math.floor(clamp(parseFloat(numberString), 0)).toString();
    dispatch({
      type: 'changeCount',
      payload: { [countType]: { sixth: normalizedString, fifth: 0, fourth: 0 } },
    });
  };
  const updateType = (type: GachaType) => {
    dispatch({ type: 'changeType', payload: type });
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
          {isSimpleMode ? (
            <SimpleModeModalContents
              modalState={modalState}
              onTypeClick={updateType}
              onPickupCountChange={updatePickupCount}
            />
          ) : null}
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
