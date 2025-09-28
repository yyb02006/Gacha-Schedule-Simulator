'use client';

import Badge from '#/components/badge';
import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import Modal from '#/components/modals/Modal';
import { OperatorRarity, OperatorType } from '#/components/PickupList';
import { operatorBadgeProps } from '#/constants/ui';
import { toOpacityZero } from '#/constants/variants';
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
    rarity: { fifth, sixth },
  } = operatorBadgeProps;
  const [currentBadges, setCurrentBadges] = useState<{
    operatorType: OperatorType;
    rarity: OperatorRarity;
  }>({
    operatorType,
    rarity,
  });
  const onEditConfirmClick = () => {
    onClose();
    onBadgeEdit(currentBadges.operatorType, currentBadges.rarity);
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
            태그 <span className="text-amber-400">수정</span>
          </motion.h1>
          <CancelButton handleCancel={onClose} />
        </div>
        <div className="flex gap-x-2">
          {currentBadges.operatorType === 'limited' ? (
            <Badge
              key={'normal'}
              {...normal.props}
              animation={true}
              onBadgeClick={() => {
                setCurrentBadges((p) => ({ ...p, operatorType: 'normal' }));
              }}
              isLayout
            />
          ) : (
            <Badge
              key={'limited'}
              color={
                currentBadges.rarity === 5 ? 'border-[#606060] text-[#606060]' : limited.props.color
              }
              name={limited.props.name}
              animation={currentBadges.rarity === 5 ? false : true}
              onBadgeClick={() => {
                if (currentBadges.rarity === 5) return;
                setCurrentBadges((p) => ({ ...p, operatorType: 'limited' }));
              }}
              isLayout
            />
          )}
          {currentBadges.rarity === 6 ? (
            <Badge
              key={'fifth'}
              color={
                currentBadges.operatorType === 'limited'
                  ? 'border-[#606060] text-[#606060]'
                  : fifth.props.color
              }
              name={fifth.props.name}
              animation={currentBadges.operatorType === 'limited' ? false : true}
              onBadgeClick={() => {
                if (currentBadges.operatorType === 'limited') return;
                setCurrentBadges((p) => ({ ...p, rarity: 5 }));
              }}
              isLayout
            />
          ) : (
            <Badge
              key={'sixth'}
              {...sixth.props}
              animation={true}
              onBadgeClick={() => {
                setCurrentBadges((p) => ({ ...p, rarity: 6 }));
              }}
              isLayout
            />
          )}
        </div>
        <div className="flex gap-x-2">
          {currentBadges.operatorType === 'limited' ? (
            <Badge key={'limited'} {...limited.props} isLayout />
          ) : (
            <Badge key={'normal'} {...normal.props} isLayout />
          )}
          {currentBadges.rarity === 6 ? (
            <Badge key={'sixth'} {...sixth.props} isLayout />
          ) : (
            <Badge key={'fifth'} {...fifth.props} isLayout />
          )}
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
