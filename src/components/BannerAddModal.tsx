import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import Modal from '#/components/Modal';
import { InsetNumberInput } from '#/components/PickupBanner';
import { ExtractPayloadFromAction } from '#/components/PickupList';
import { gachaTypeButtons } from '#/constants/ui';
import { toOpacityZero } from '#/constants/variants';
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
    changeTarget: 'pickupOpersCount' | 'targetPickupCount',
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
          name="픽업 인원"
          className="text-sky-500"
          onInputBlur={(e: ChangeEvent<HTMLInputElement>) => {
            onPickupCountChange(e, 'pickupOpersCount');
          }}
          currentValue={modalState.pickupOpersCount.toString()}
        />
        <InsetNumberInput
          name="목표 픽업"
          className="text-amber-400"
          onInputBlur={(e: ChangeEvent<HTMLInputElement>) => {
            onPickupCountChange(e, 'targetPickupCount');
          }}
          currentValue={modalState.targetPickupCount.toString()}
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
      payload: { pickupOpersCount?: number; targetPickupCount?: number };
    };

const reducer = (state: ModalState, action: ModalAction) => {
  let modifiedPickupCount = state.pickupOpersCount;
  let modifiedtargetPickupCount = state.targetPickupCount;
  if (action.type === 'changeType') {
    if (action.payload === 'limited') {
      modifiedPickupCount = 2;
      modifiedtargetPickupCount = 2;
    } else {
      modifiedPickupCount = 1;
      modifiedtargetPickupCount = 1;
    }
  }
  switch (action.type) {
    case 'changeType':
      return {
        gachaType: action.payload,
        pickupOpersCount: modifiedPickupCount,
        targetPickupCount: modifiedtargetPickupCount,
      };
    case 'changeCount':
      return {
        ...state,
        pickupOpersCount: action.payload.pickupOpersCount ?? state.pickupOpersCount,
        targetPickupCount: action.payload.targetPickupCount ?? state.targetPickupCount,
      };
    default:
      throw new Error();
  }
};

const initialState: ModalState = {
  gachaType: 'limited',
  pickupOpersCount: 2,
  targetPickupCount: 2,
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
  const changePickupCount = (
    e: ChangeEvent<HTMLInputElement>,
    changeTarget: 'pickupOpersCount' | 'targetPickupCount',
  ) => {
    const { value } = e.currentTarget;
    const numberValue = value === '' ? 0 : parseFloat(value);
    const maxValue = 99;
    if (!isNaN(numberValue) && numberValue <= maxValue) {
      dispatch({
        type: 'changeCount',
        payload: { [changeTarget]: numberValue },
      });
    }
  };
  const changeType = (type: GachaType) => {
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
              onTypeClick={changeType}
              onPickupCountChange={changePickupCount}
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
