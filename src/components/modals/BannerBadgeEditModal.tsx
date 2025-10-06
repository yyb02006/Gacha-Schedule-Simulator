import Modal from '#/components/modals/Modal';
import { GachaType } from '#/types/types';
import { useState } from 'react';
import { motion } from 'motion/react';
import CancelButton from '#/components/buttons/CancelButton';
import { toOpacityZero } from '#/constants/variants';
import Badge from '#/components/Badge';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { BannerBadgeProps } from '#/constants/ui';

export default function BannerBadgeEditModal({
  isOpen,
  onClose,
  gachaType,
  onEditConfirmClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  gachaType: GachaType;
  onEditConfirmClick: (selectedGachaType: GachaType) => void;
}) {
  const [currentGachaType, setCurrentGachaType] = useState<GachaType>(gachaType);
  const { selected, unSelected } = Object.values(BannerBadgeProps).reduce<{
    selected: (typeof BannerBadgeProps)[keyof typeof BannerBadgeProps];
    unSelected: (typeof BannerBadgeProps)[keyof typeof BannerBadgeProps][];
  }>(
    (acc, current) => {
      if (current.id === currentGachaType) {
        return { ...acc, selected: current };
      } else {
        return { ...acc, unSelected: [...acc.unSelected, current] };
      }
    },
    {
      selected: BannerBadgeProps[currentGachaType],
      unSelected: [],
    },
  );
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
            {unSelected.map((filteredBadge) => (
              <Badge
                key={filteredBadge.id}
                {...filteredBadge.props}
                animation={true}
                onBadgeClick={() => {
                  setCurrentGachaType(filteredBadge.id);
                }}
                isLayout
              />
            ))}
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
          <Badge key={selected.id} {...selected.props} isLayout />
        </div>
        <TypeSelectionButton
          name="수정완료"
          hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
          onTypeClick={() => {
            onClose();
            onEditConfirmClick(currentGachaType);
          }}
        />
      </div>
    </Modal>
  );
}
