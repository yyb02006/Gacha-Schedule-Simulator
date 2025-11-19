'use client';

import Badge from '#/components/Badge';
import CancelButton from '#/components/buttons/CancelButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import Modal from '#/components/modals/Modal';
import { Operator } from '#/components/PickupList';
import { bannerBadgeProps, operatorBadgeProps } from '#/constants/ui';
import { operatorLimitByBannerType, rarities } from '#/constants/variables';
import { toOpacityZero } from '#/constants/variants';
import { useSyncedState } from '#/hooks/useSyncedState';
import { GachaType, OperatorRarity, OperatorType } from '#/types/types';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';

const Help = ({ onClose }: { onClose: () => void }) => {
  const isMouseDownOnTarget = useRef<boolean>(false);
  return (
    <motion.div
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          isMouseDownOnTarget.current = true;
        } else {
          isMouseDownOnTarget.current = false;
        }
      }}
      onMouseUp={(e) => {
        if (e.target === e.currentTarget && isMouseDownOnTarget.current) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
          onClose();
        }
      }}
      role="button"
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed top-0 left-0 z-1000 flex size-full items-center justify-center bg-transparent backdrop-blur-sm"
    >
      <div className="w-full max-w-[400px] space-y-5 rounded-lg bg-[#202020] px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-S-CoreDream-500 text-xl">
            천장 오퍼레이터 <span className="text-red-400">결정 규칙</span>
          </h1>
          <CancelButton
            handleCancel={() => {
              onClose();
            }}
          />
        </div>
        <div className="text-standard font-S-CoreDream-300 space-y-6">
          <div className="space-y-2">
            <div className="flex gap-1">
              <Badge {...bannerBadgeProps.collab.props} animation={false} />
              <Badge {...bannerBadgeProps.limited.props} animation={false} />
            </div>
            <div className="space-y-2 leading-7">
              <div>
                <span className="font-S-CoreDream-400 text-amber-400">기본옵션</span>에서는 목표
                6성이 존재하면 내부 로직으로 천장을 계산하게 됩니다.
              </div>
              <div>
                <span className="font-S-CoreDream-400 text-sky-500">세부옵션</span>에서는 한정 6성
                오퍼레이터가 있을 시 해당 오퍼레이터가 천장 보상이 됩니다.
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-1">
              <Badge {...bannerBadgeProps.single.props} animation={false} />
            </div>
            <div className="space-y-2 leading-7">
              <div>
                <span className="font-S-CoreDream-400 text-amber-400">기본옵션</span>에서는 목표
                6성이 존재하면 내부 로직으로 천장을 계산하게 됩니다.
              </div>
              <div>
                <span className="font-S-CoreDream-400 text-sky-500">세부옵션</span>에서는 6성
                오퍼레이터가 있을 시 해당 오퍼레이터가 천장 보상이 됩니다.
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex gap-1">
              <Badge {...bannerBadgeProps.rotation.props} animation={false} />
            </div>
            <div className="space-y-2.5 leading-7">
              <div>
                로테이션 배너의 천장이 150차 이상과 300차 이상에서 두 번이므로 천장은{' '}
                <span className="text-violet-400">2명</span>입니다.
              </div>
              <div>
                <span className="font-S-CoreDream-400 text-amber-400">기본옵션</span>에서는 목표
                6성이 존재하면 2명까지 내부 로직으로 천장을 계산하게 됩니다.
              </div>
              <div>
                <span className="font-S-CoreDream-400 text-sky-500">세부옵션</span>에서는 6성
                오퍼레이터가 있을 시 2명까지 해당 오퍼레이터가 천장 보상이 됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

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
  const [isHelpOpen, setIsHelpOpen] = useState(false);
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
    <Modal isOpen={isOpen} onClose={onClose} backdropBlur>
      <div className="flex w-full max-w-[400px] flex-col gap-y-6 rounded-xl bg-[#202020] p-6">
        <AnimatePresence>
          {isHelpOpen && (
            <Help
              onClose={() => {
                setIsHelpOpen(false);
              }}
            />
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between gap-x-6">
          <motion.h1
            variants={toOpacityZero}
            initial="exit"
            animate="idle"
            exit="exit"
            className="font-S-CoreDream-700 flex items-center gap-2 text-2xl"
          >
            <div>
              태그 <span className="text-amber-400">수정</span>
            </div>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="font-S-CoreDream-500 flex aspect-square size-[26px] cursor-pointer items-center justify-center rounded-full border border-[#606060] text-[18px] text-[#606060] hover:border-amber-400 hover:text-amber-400"
            >
              <p className="select-none">?</p>
            </button>
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
