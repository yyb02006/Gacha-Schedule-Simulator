import Modal from '#/components/modals/Modal';
import { GachaType } from '#/types/types';
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CancelButton from '#/components/buttons/CancelButton';
import { cardVariants, toOpacityZero } from '#/constants/variants';
import Badge from '#/components/Badge';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import { bannerBadgeProps, operatorBadgeProps, rarityColor } from '#/constants/ui';
import { Dummy } from '#/components/PickupList';
import { operatorLimitByBannerType, rarities, rarityStrings } from '#/constants/variables';
import { cls, getOperatorsByRarity } from '#/libs/utils';

const Help = ({ onClose }: { onClose: () => void }) => {
  const badgeKeys = Object.keys(bannerBadgeProps) as (keyof typeof bannerBadgeProps)[];
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
      className="fixed top-0 left-0 z-1000 flex size-full cursor-pointer items-center justify-center bg-transparent backdrop-blur-sm"
    >
      <div className="w-full max-w-[400px] cursor-default space-y-5 rounded-lg bg-[#202020] px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-S-CoreDream-500 text-lg">
            배너 종류별 <span className="text-red-400">오퍼레이터 제한</span>
          </h1>
          <CancelButton
            handleCancel={() => {
              onClose();
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
          {badgeKeys.map((badgeKey) => (
            <motion.div
              key={badgeKey}
              variants={cardVariants}
              initial="exit"
              animate="idle"
              exit="exit"
              style={{ boxShadow: '4px 4px 12px #101010, -5px -4px 10px #303030' }}
              className="rounded-xl p-2"
            >
              <motion.div
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="space-y-2"
              >
                <Badge {...bannerBadgeProps[badgeKey].props} animation={false} />
                <div className="flex gap-3">
                  {rarityStrings.map((rarityString) => (
                    <div key={`${rarityString}${badgeKey}`}>
                      <span className="font-S-CoreDream-300">{`${rarities[rarityString]}성`}</span>:{' '}
                      <span
                        className={cls(
                          operatorBadgeProps.rarity[rarityString].props.color,
                          'font-S-CoreDream-500',
                        )}
                      >
                        {operatorLimitByBannerType[badgeKey][rarityString]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="font-S-CoreDream-300 text-sm">
          모든 배너에는 <span className="text-red-400">최소 한 명이상</span>의 오퍼레이터가
          필요합니다.
        </div>
      </div>
    </motion.div>
  );
};

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
    >
      <div className="relative flex w-[360px] flex-col gap-y-6 rounded-xl bg-[#202020] p-6">
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
              className="font-S-CoreDream-400 flex aspect-square size-[26px] cursor-pointer items-center justify-center rounded-full border border-[#606060] text-[16px] text-[#606060] hover:border-amber-400 hover:text-amber-400"
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
        <div className="space-y-3 text-sm">
          <div>
            뱃지 선택 시 <span className="text-amber-400">오퍼 목록 변화</span>
          </div>
          <div className="space-y-2">
            {(['sixth', 'fifth', 'fourth'] as const).flatMap((rarity, index) => {
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
