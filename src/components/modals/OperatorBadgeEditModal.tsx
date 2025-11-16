'use client';

import Badge from '#/components/Badge';
import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import Modal from '#/components/modals/Modal';
import { Operator } from '#/components/PickupList';
import { operatorBadgeProps } from '#/constants/ui';
import { operatorLimitByBannerType, rarities } from '#/constants/variables';
import { toOpacityZero } from '#/constants/variants';
import { useSyncedState } from '#/hooks/useSyncedState';
import { GachaType, OperatorRarity, OperatorType } from '#/types/types';
import { motion } from 'motion/react';

export default function OperatorBadgeEditModal({
  isOpen,
  operatorType,
  rarity,
  gachaType,
  operators,
  onClose,
  onBadgeEdit,
}: {
  isOpen: boolean;
  operatorType: OperatorType;
  rarity: OperatorRarity;
  gachaType: GachaType;
  operators: Operator[];
  onClose: () => void;
  onBadgeEdit: (operatorType: OperatorType, rarity: OperatorRarity) => void;
}) {
  const {
    operatorType: { limited, normal },
  } = operatorBadgeProps;
  const [currentState, setCurrentState] = useSyncedState<{
    operatorType: OperatorType;
    rarity: OperatorRarity;
  }>({
    operatorType,
    rarity,
  });
  const selectedRarityBadge = operatorBadgeProps.rarity[rarities[currentState.rarity]];
  const unSelectedRarityBadges = Object.values(operatorBadgeProps.rarity).filter(
    (badgeProp) => badgeProp.id !== currentState.rarity,
  );
  const isOperatorLimited = currentState.operatorType === 'limited';
  // 6성일 때는 가챠 타입이 한정, 콜라보가 아니거나 이미 6성에 한정오퍼가 있을 때 막고
  // 5성일 때는 가챠 타입이 콜라보가 아니면 막고
  // 4성은 한정이 존재하지 않음
  const preventSelectLimited =
    currentState.rarity === 6
      ? !(gachaType === 'limited' || gachaType === 'collab')
      : currentState.rarity === 5
        ? gachaType !== 'collab'
        : true;
  const onEditConfirmClick = () => {
    onClose();
    onBadgeEdit(currentState.operatorType, currentState.rarity);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex w-full max-w-[400px] flex-col gap-y-6 rounded-xl bg-[#202020] p-6">
        <div className="flex items-center justify-between gap-x-6">
          <motion.h1
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="font-S-CoreDream-700 text-2xl"
          >
            태그 <span className="text-amber-400">수정</span>
          </motion.h1>
          <CancelButton handleCancel={onClose} />
        </div>
        <div className="space-y-2">
          <motion.div
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="text-sm"
          >
            <span className="text-sky-500">미선택</span> 뱃지
          </motion.div>
          <div className="flex flex-wrap gap-x-2 gap-y-3">
            {isOperatorLimited ? (
              <Badge
                key={'normal'}
                color={
                  gachaType === 'collab' ? 'border-[#606060] text-[#606060]' : normal.props.color
                }
                name={normal.props.name}
                animation={gachaType === 'collab' ? false : true}
                onBadgeClick={() => {
                  if (gachaType === 'collab') return;
                  setCurrentState((p) => ({ ...p, operatorType: 'normal' }));
                }}
                isLayout
              />
            ) : (
              <Badge
                key={'limited'}
                color={
                  preventSelectLimited ? 'border-[#606060] text-[#606060]' : limited.props.color
                }
                name={limited.props.name}
                animation={preventSelectLimited ? false : true}
                onBadgeClick={() => {
                  if (preventSelectLimited) return;
                  setCurrentState((p) => ({ ...p, operatorType: 'limited' }));
                }}
                isLayout
              />
            )}
            {unSelectedRarityBadges.map((rarityBadge) => {
              const isBadgeSixth = rarityBadge.id === 6;
              const currentOperators = {
                sixth: operators.filter(({ rarity }) => rarity === 6),
                fifth: operators.filter(({ rarity }) => rarity === 5),
                fourth: operators.filter(({ rarity }) => rarity === 4),
              };
              const active =
                currentOperators[rarities[rarityBadge.id]].length <
                  operatorLimitByBannerType[gachaType][rarities[rarityBadge.id]] &&
                !(isOperatorLimited && rarityBadge.id === 4) &&
                !(isOperatorLimited && rarityBadge.id === 5 && gachaType !== 'collab');

              return (
                <Badge
                  key={rarities[rarityBadge.id]}
                  color={active ? rarityBadge.props.color : 'border-[#606060] text-[#606060]'}
                  name={rarityBadge.props.name}
                  animation={active ? true : false}
                  onBadgeClick={() => {
                    if (isOperatorLimited && !isBadgeSixth) return;
                    setCurrentState((p) => ({ ...p, rarity: rarityBadge.id }));
                  }}
                  isLayout
                />
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <motion.div
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="text-sm"
          >
            <span className="text-amber-400">선택된</span> 뱃지
          </motion.div>
          <div className="flex flex-wrap gap-x-2 gap-y-3">
            {currentState.operatorType === 'limited' ? (
              <Badge key={'limited'} {...limited.props} isLayout />
            ) : (
              <Badge key={'normal'} {...normal.props} isLayout />
            )}
            {selectedRarityBadge ? (
              <Badge
                key={rarities[selectedRarityBadge.id]}
                color={selectedRarityBadge.props.color}
                name={selectedRarityBadge.props.name}
                isLayout
              />
            ) : null}
          </div>
        </div>
        <TypeSelectionButton
          name="수정완료"
          hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
          onTypeClick={onEditConfirmClick}
        />
      </div>
    </Modal>
  );
}
