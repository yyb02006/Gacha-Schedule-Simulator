import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import Modal from '#/components/Modal';
import { InsetNumberInput } from '#/components/PickupBanner';
import { gachaTypeButtons } from '#/constants/ui';
import { toOpacityZero } from '#/constants/variants';
import { motion } from 'motion/react';

export default function BannerAddModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
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
            픽업 배너 <span className="text-amber-400">추가</span>
          </motion.h1>
          <CancelButton handleCancel={onClose} />
        </div>
        <div className="flex gap-x-4">
          {gachaTypeButtons.map(({ type, name, hoverBackground }) => (
            <TypeSelectionButton
              key={type}
              name={name}
              hoverBackground={hoverBackground}
              onTypeClick={() => {}}
            />
          ))}
        </div>
        <div className="flex gap-x-6">
          <InsetNumberInput
            name="픽업 인원"
            className="text-sky-500"
            onInputChange={() => {}}
            value={2}
          />
          <InsetNumberInput
            name="목표 픽업"
            className="text-amber-400"
            onInputChange={() => {}}
            value={2}
          />
        </div>
      </div>
    </Modal>
  );
}
