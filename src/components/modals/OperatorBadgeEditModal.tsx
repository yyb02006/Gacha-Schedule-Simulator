'use client';

import Badge from '#/components/Badge';
import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import Modal from '#/components/modals/Modal';
import { rarities } from '#/components/PickupList';
import { operatorBadgeProps } from '#/constants/ui';
import { toOpacityZero } from '#/constants/variants';
import { OperatorRarity, OperatorType } from '#/types/types';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function OperatorBadgeEditModal({
  isOpen,
  onClose,
  operatorType,
  rarity,
  onBadgeEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  operatorType: OperatorType;
  rarity: OperatorRarity;
  onBadgeEdit: (operatorType: OperatorType, rarity: OperatorRarity) => void;
}) {
  const {
    operatorType: { limited, normal },
  } = operatorBadgeProps;
  const [currentState, setCurrentState] = useState<{
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
  const isLimited = currentState.operatorType === 'limited';
  const onEditConfirmClick = () => {
    onClose();
    onBadgeEdit(currentState.operatorType, currentState.rarity);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex w-[360px] flex-col gap-y-6">
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
            {currentState.operatorType === 'limited' ? (
              <Badge
                key={'normal'}
                {...normal.props}
                animation={true}
                onBadgeClick={() => {
                  setCurrentState((p) => ({ ...p, operatorType: 'normal' }));
                }}
                isLayout
              />
            ) : (
              <Badge
                key={'limited'}
                color={
                  currentState.rarity !== 6
                    ? 'border-[#606060] text-[#606060]'
                    : limited.props.color
                }
                name={limited.props.name}
                animation={currentState.rarity === 6 ? true : false}
                onBadgeClick={() => {
                  if (currentState.rarity !== 6) return;
                  setCurrentState((p) => ({ ...p, operatorType: 'limited' }));
                }}
                isLayout
              />
            )}
            {unSelectedRarityBadges.map((filteredBadgeProp) => {
              const isSixth = filteredBadgeProp.id === 6;
              return (
                <Badge
                  key={rarities[filteredBadgeProp.id]}
                  color={
                    isLimited && !isSixth
                      ? 'border-[#606060] text-[#606060]'
                      : filteredBadgeProp.props.color
                  }
                  name={filteredBadgeProp.props.name}
                  animation={isLimited && !isSixth ? false : true}
                  onBadgeClick={() => {
                    if (isLimited && !isSixth) return;
                    setCurrentState((p) => ({ ...p, rarity: filteredBadgeProp.id }));
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
