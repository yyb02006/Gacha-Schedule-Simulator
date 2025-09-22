'use client';

import { motion } from 'motion/react';
import {
  gachaBannerOptionCardVariants,
  insetInputVariants,
  toOpacityZero,
} from '#/constants/variants';
import { Dummy } from '#/components/PickupList';
import DeleteButton from '#/components/buttons/DeleteButton';
import TypeSelectionButton from '#/components/buttons/TypeSelectionButton';
import AddButton from '#/components/buttons/AddButton';

const TargetInput = ({
  name,
  initialValue,
  isFirstRenderOver,
}: {
  name: string;
  initialValue: number;
  isFirstRenderOver: boolean;
}) => {
  return (
    <div className="flex min-w-[100px] flex-col space-y-1">
      <motion.div
        variants={toOpacityZero}
        animate={isFirstRenderOver ? 'idle' : undefined}
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        className="relative self-center px-4 text-[13px]"
      >
        {name}
      </motion.div>
      <motion.div
        variants={insetInputVariants}
        animate={isFirstRenderOver ? 'idle' : undefined}
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        className="relative flex h-[44px] items-center justify-center rounded-xl px-4 pt-3 pb-2 font-bold"
      >
        <motion.div
          variants={toOpacityZero}
          animate={isFirstRenderOver ? 'idle' : undefined}
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
          exit="exit"
        >
          {initialValue}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function PickupBanner({
  data,
  index,
  isGachaSim,
}: {
  data: Dummy;
  index: number;
  isGachaSim: boolean;
}) {
  const { gachaMax, gachaMin, gachaType, name, operators } = data;
  const translatedGachaType =
    gachaType === 'collab' ? '콜라보 배너' : gachaType === 'limited' ? '한정 배너' : '통상 배너';
  return (
    <motion.div
      variants={gachaBannerOptionCardVariants}
      whileHover={{
        scale: 1.02,
        transition: { type: 'spring' as const, stiffness: 170, damping: 27, mass: 1.35 },
      }}
      initial="exit"
      animate="idle"
      exit="exit"
      className="flex flex-col space-y-6 rounded-xl bg-amber-500 p-4"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full items-center gap-2">
            <span className="font-S-CoreDream-700 text-2xl">{index + 1}.</span>
            <motion.div
              variants={insetInputVariants}
              initial="exit"
              animate="idle"
              exit="exit"
              className="font-S-CoreDream-500 flex w-full items-center rounded-lg py-2 pr-2 pl-4 text-xl"
            >
              <input type="text" onChange={() => {}} value={name} className="w-full" />
              <div>
                <div className="inline-block rounded-full border border-amber-400 px-3 py-1 text-sm whitespace-nowrap text-amber-400">
                  {translatedGachaType}
                </div>
                {gachaType === 'revival' && (
                  <div className="inline-block rounded-full border border-violet-400 px-2 py-1 text-sm text-violet-400">
                    구오퍼
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          <DeleteButton handleDelete={() => {}} className="size-[48px] grow" />
        </div>
        <div className="felx-wrap flex justify-between gap-x-6 gap-y-3">
          <div className="font-S-CoreDream-500 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-amber-400">최대 시도</span>
              <motion.div
                variants={insetInputVariants}
                initial="exit"
                animate="idle"
                exit="exit"
                className="relative flex items-center rounded-lg"
              >
                <div className="relative flex items-center px-4 py-2">
                  {!!gachaMax || <div className="absolute right-0 mr-4 text-3xl">∞</div>}
                  <input
                    type="number"
                    onChange={() => {}}
                    className="relative w-8 min-w-0 text-right"
                    max={999}
                    value={gachaMax || ''}
                  />
                </div>
                <TypeSelectionButton
                  name="무제한"
                  className="px-3 text-sm"
                  onTypeClick={() => {}}
                  hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
                />
              </motion.div>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sky-600">
                최소 <span>시도</span>
              </span>
              <motion.div
                variants={insetInputVariants}
                initial="exit"
                animate="idle"
                exit="exit"
                className="relative flex items-center rounded-lg"
              >
                <div className="relative flex items-center px-4 py-2">
                  <input
                    type="number"
                    onChange={() => {}}
                    className="relative w-8 min-w-0 text-right"
                    max={999}
                    value={gachaMin}
                  />
                </div>
                {gachaType === 'limited' && (
                  <TypeSelectionButton
                    name="300정가"
                    className="px-3 text-sm"
                    onTypeClick={() => {}}
                    hoverBackground="linear-gradient(155deg, #1447e6, #51a2ff)"
                  />
                )}
              </motion.div>
            </div>
          </div>
          {isGachaSim || (
            <div className="flex items-center gap-x-3 text-sm">
              <motion.span
                variants={toOpacityZero}
                initial="exit"
                animate="idle"
                exit="exit"
                className="font-S-CoreDream-400 whitespace-nowrap"
              >
                배너 종료시까지 추가재화
              </motion.span>
              <motion.div
                variants={insetInputVariants}
                initial="exit"
                animate="idle"
                exit="exit"
                className="relative flex items-center rounded-lg px-3"
              >
                <motion.div
                  variants={toOpacityZero}
                  initial="exit"
                  animate="idle"
                  exit="exit"
                  className="relative flex items-center px-2 py-2"
                >
                  <input
                    type="number"
                    onChange={() => {}}
                    className="relative w-14 min-w-0 text-right"
                    value={400000}
                  />
                </motion.div>
                <motion.div variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
                  합성옥
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-6 text-sm sm:space-y-4">
        {operators.map(({ currentQty, name, operType }) => (
          <div key={name} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex grow gap-6">
              <DeleteButton handleDelete={() => {}} className="-mr-2" />
              <motion.div
                variants={insetInputVariants}
                initial="exit"
                animate="idle"
                exit="exit"
                className="flex min-w-40 grow items-center rounded-lg py-2 pr-2 pl-4"
              >
                <input
                  className="w-full text-[15px]"
                  type="text"
                  onChange={() => {}}
                  value={name}
                />
                {operType === 'limited' ? (
                  <div className="inline-block rounded-full border border-amber-400 px-3 py-1 text-sm whitespace-nowrap text-amber-400">
                    한정
                  </div>
                ) : (
                  <div className="inline-block rounded-full border border-sky-600 px-3 py-1 text-sm whitespace-nowrap text-sky-600">
                    통상
                  </div>
                )}
              </motion.div>
            </div>
            <div className="flex gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap">가챠 목표</span>
                <TypeSelectionButton
                  name="명함"
                  hoverBackground="linear-gradient(155deg, #bb4d00, #ffb900)"
                  onTypeClick={() => {}}
                  className="px-4"
                />
                <TypeSelectionButton
                  name="풀잠"
                  hoverBackground="linear-gradient(155deg, #ec003f, #ff637e)"
                  onTypeClick={() => {}}
                  className="px-4"
                />
              </div>
              <div className="flex items-center gap-2">
                현재 잠재
                <motion.div
                  variants={insetInputVariants}
                  initial="exit"
                  animate="idle"
                  exit="exit"
                  className="flex items-center rounded-lg px-4 py-2"
                >
                  <input
                    type="number"
                    max={6}
                    onChange={() => {}}
                    className="w-6 min-w-0 text-right"
                    value={currentQty}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex w-full justify-center py-2">
          <AddButton onAddClick={() => {}} custom={{ size: 'small' }} />
        </div>
      </div>
    </motion.div>
  );
}

/* export default function PickupCard({
  pickupData,
  index,
  deleteBanner,
}: {
  pickupData: PickupData;
  index: number;
  deleteBanner: () => void;
}) {
  const [isHover, setIsHover] = useState(false);
  const [isFirstRenderOver, setIsFirstRenderOver] = useState(false);
  const [currentGachaType, setCurrentGachaType] = useState<GachaTypeButtonId>('limited');
  const targetInputButtons = [
    { name: '픽업오퍼 수', initialValue: pickupData.pickupDetails.pickupOpersCount },
    { name: '목표픽업 수', initialValue: pickupData.pickupDetails.targetPickupCount },
    { name: '픽업 확률', initialValue: pickupData.pickupDetails.pickupChance },
  ];
  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      onViewportEnter={() => {
        setIsFirstRenderOver(true);
      }}
      animate={isHover ? { scale: 1.02 } : undefined}
      transition={cardTransition}
      className="Card relative w-[480px] space-y-12 p-4"
    >
      <motion.div
        variants={cardVariants}
        animate={isFirstRenderOver ? 'idle' : undefined}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...cardTransition, ease: 'easeIn' }}
        initial="exit"
        exit="exit"
        className="absolute top-0 left-0 flex size-full items-center justify-center rounded-2xl to-[#2e2e2e] shadow-[12px_12px_32px_#101010,-10px_-12px_32px_#303030]"
      />
      <div className="relative space-y-6">
        <div className="flex items-center justify-between">
          <motion.div
            variants={toOpacityZero}
            animate={isFirstRenderOver ? 'idle' : undefined}
            viewport={{ once: true, amount: 0.5 }}
            initial="exit"
            exit="exit"
            className="text-lg font-bold"
          >
            <span className="text-amber-400">{index}.</span> 가챠 스케쥴 - {index}
          </motion.div>
          <DeleteButton handleDelete={deleteBanner} isFirstRenderOver={isFirstRenderOver} />
        </div>
        <div className="relative flex w-full space-x-3 text-[15px]">
          {gachaTypeButtons.map(({ id, name, hoverBackground }) => {
            console.log('map', isFirstRenderOver);
            return (
              <TypeSelectionButton
                key={id}
                name={name}
                hoverBackground={hoverBackground}
                isFirstRenderOver={isFirstRenderOver}
                isActive={currentGachaType === id ? true : false}
                onTypeClick={() => {
                  setCurrentGachaType(id);
                }}
              />
            );
          })}
        </div>
        <div className="relative flex justify-between">
          <div className="flex space-x-3">
            {targetInputButtons.map(({ name, initialValue }) => (
              <TargetInput
                key={name}
                name={name}
                initialValue={initialValue}
                isFirstRenderOver={isFirstRenderOver}
              />
            ))}
          </div>
          <OptionButton isFirstRenderOver={isFirstRenderOver} />
        </div>
        
        
      </div>
    </motion.div>
  );
}
 */

{
  /*         <div>lim/nor/full</div>
        <div>picked 1,2,3,4</div>
        <div>want 1,2,3,4</div>
        <div>pick limit 100~200</div>
        <div>first one pick</div>
        <div>yellow tick yes/no</div> */
}

{
  /* 자세히 탭에 들어갈 것 - 픽업대상 수, 목표 픽업 수, 픽업 리미트(기본은 명함), 명함 - 횟수제한픽업 - 풀잠, 노티사용 */
}
