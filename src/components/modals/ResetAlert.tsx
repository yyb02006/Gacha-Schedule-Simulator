'use client';

import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import AlertModal from '#/components/modals/AlertModal';
import { ReactNode } from 'react';

export default function ResetAlert({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AlertModal isOpen={isOpen}>
      <div className="flex w-full max-w-[400px] flex-col gap-y-6 rounded-xl bg-[#202020] p-6">
        <h1 className="font-S-CoreDream-500 text-xl">
          시뮬레이션 <span className="text-red-400">초기화</span>
        </h1>
        <div className="text-standard space-y-4 leading-5">
          <div>{message}</div>
          <div className="text-sm text-red-400">알겠습니까악!</div>
        </div>
        <div className="flex justify-between">
          <TypeSelectionButton
            name="치소"
            hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
            onTypeClick={() => {
              onCancel();
            }}
            className="px-4 text-base"
          />
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
