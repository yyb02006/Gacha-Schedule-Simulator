import Modal from '#/components/modals/Modal';
import { GachaType } from '#/types/types';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CancelButton from '#/components/buttons/CancelButton';
import { toOpacityZero } from '#/constants/variants';
import Badge from '#/components/Badge';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { bannerBadgeProps, rarityColor } from '#/constants/ui';
import { Dummy } from '#/components/PickupList';
import { operatorLimitByBannerType, rarities, rarityStrings } from '#/constants/variables';
import { cls, getOperatorsByRarity } from '#/libs/utils';
import { Help } from '#/components/modals/BannerAddModal';

export default function BannerBadgeEditModal({
  isOpen,
  onClose,
  isSimpleMode,
  pickupData,
  onEditConfirmClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  isSimpleMode: boolean;
  pickupData: Dummy;
  onEditConfirmClick: (selectedGachaType: GachaType) => void;
}) {
  const { operators, pickupDetails, gachaType } = pickupData;
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentGachaType, setCurrentGachaType] = useState<GachaType>(gachaType);
  const { selected, unSelected } = Object.values(bannerBadgeProps).reduce<{
    selected: (typeof bannerBadgeProps)[keyof typeof bannerBadgeProps];
    unSelected: (typeof bannerBadgeProps)[keyof typeof bannerBadgeProps][];
  }>(
    (acc, current) => {
      if (current.id === currentGachaType) {
        return { ...acc, selected: current };
      } else {
        return { ...acc, unSelected: [...acc.unSelected, current] };
      }
    },
    {
      selected: bannerBadgeProps[currentGachaType],
      unSelected: [],
    },
  );
  const { simpleMode } = pickupDetails;

  const targetLimit = operatorLimitByBannerType[currentGachaType];
  const operatorsByRarity = getOperatorsByRarity(operators);
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setCurrentGachaType(gachaType);
        onClose();
      }}
      backdropBlur
    >
      <div className="relative flex w-full max-w-[400px] flex-col gap-y-6 rounded-xl bg-[#202020] p-4 lg:p-6">
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
              뱃지 <span className="text-amber-400">수정</span>
            </div>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="font-S-CoreDream-500 flex aspect-square size-[26px] cursor-pointer items-center justify-center rounded-full border border-[#606060] text-[18px] text-[#606060] hover:border-amber-400 hover:text-amber-400"
            >
              <p className="select-none">?</p>
            </button>
          </motion.h1>
          <CancelButton
            handleCancel={() => {
              setCurrentGachaType(gachaType);
              onClose();
            }}
          />
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
                animation
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
        <div className="space-y-3 text-sm">
          <div>
            뱃지 선택 시 <span className="text-amber-400">오퍼 목록 변화</span>
          </div>
          <div className="space-y-2">
            {rarityStrings.flatMap((rarity, index) => {
              const rarityNumber = rarities[rarity];
              if (isSimpleMode) {
                return (
                  <div key={`${rarity}${index}`} className="flex gap-3">
                    {(['pickupOpersCount', 'targetOpersCount'] as const).map((countType) => {
                      const finalCount = {
                        pickupOpersCount: targetLimit[rarity],
                        targetOpersCount: Math.min(
                          simpleMode.targetOpersCount[rarity],
                          targetLimit[rarity],
                        ),
                      };
                      return (
                        <div
                          key={`${rarity}${countType}`}
                          className={cls(
                            rarityColor[rarity].textColor,
                            'font-S-CoreDream-300 text-[13px]',
                          )}
                        >
                          {`${countType === 'pickupOpersCount' ? '픽업' : '목표'} ${rarityNumber}성`}{' '}
                          <span
                            className={cls(
                              ['text-green-500', rarityColor[rarity].textColor, 'text-red-400'][
                                Math.sign(simpleMode[countType][rarity] - finalCount[countType]) + 1
                              ],
                              'font-S-CoreDream-500',
                            )}
                          >{`${simpleMode[countType][rarity]} ➜ ${finalCount[countType]}`}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                const excludedOperators = operatorsByRarity[rarity].filter(
                  (_, index) => index >= targetLimit[rarity],
                );
                return (
                  <div key={`${rarity}`} className="space-y-1 text-[13px]">
                    <div className={cls(rarityColor[rarity].textColor, 'font-S-CoreDream-300')}>
                      {`픽업 ${rarityNumber}성`}{' '}
                      <span
                        className={cls(
                          ['text-green-500', rarityColor[rarity].textColor, 'text-red-400'][
                            Math.sign(simpleMode.pickupOpersCount[rarity] - targetLimit[rarity]) + 1
                          ],
                          'font-S-CoreDream-500',
                        )}
                      >{`${simpleMode.pickupOpersCount[rarity]} ➜ ${targetLimit[rarity]}`}</span>
                    </div>
                    {excludedOperators.map(({ name, operatorId }) => (
                      <div
                        key={operatorId}
                        className={cls(rarityColor[rarity].textColor, 'font-S-CoreDream-400')}
                      >
                        {`${name} `}
                        <span className="text-red-400">제외됨</span>
                      </div>
                    ))}
                  </div>
                );
              }
            })}
          </div>
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
