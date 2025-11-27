'use client';

import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import AlertModal from '#/components/modals/AlertModal';
import { cls } from '#/libs/utils';
import { ReactNode } from 'react';

export default function CustomAlert({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: ReactNode;
  message: ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  return (
    <AlertModal isOpen={isOpen}>
      <div className="flex flex-col gap-y-6 rounded-xl bg-[#202020] p-4 lg:p-6">
        <h1 className="font-S-CoreDream-500 text-xl">{title}</h1>
        <div className="text-standard space-y-4 leading-5">{message}</div>
        <div className={cls('flex', onCancel ? 'justify-between' : 'justify-end')}>
          {onCancel && (
            <TypeSelectionButton
              name="치소"
              hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
              onTypeClick={() => {
                onCancel();
              }}
              className="px-4 text-base"
            />
          )}
          <TypeSelectionButton
            name="화긴"
            hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
            onTypeClick={() => {
              onConfirm();
            }}
            className="px-4 text-base"
          />
        </div>
      </div>
    </AlertModal>
  );
}
