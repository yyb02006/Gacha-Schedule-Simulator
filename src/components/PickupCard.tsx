'use client';

import { PickupData } from '#/components/PickupList';
import { motion } from 'motion/react';
import { useState } from 'react';
import {
  cancelButtonVariants,
  cardTransition,
  gachaTypeButtonVariants,
  insetInputVariants,
  cardVariants,
  toOpacityZero,
  GachaTypeButtonCustom,
  optionButtonVariants,
} from '#/constants/variants';
import { gachaTypeButtons } from '#/constants/ui';

export const TypeSelectionButton = ({
  name,
  hoverBackground,
  isFirstRenderOver = true,
}: {
  name: string;
  hoverBackground: string;
  isFirstRenderOver?: boolean;
}) => {
  const [isHover, setIsHover] = useState(false);
  const custom: GachaTypeButtonCustom = {
    hoverBackground,
    state: isFirstRenderOver ? 'normal' : 'initial',
  };
  return (
    <motion.button
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      variants={gachaTypeButtonVariants}
      viewport={{ once: true, amount: 0.5 }}
      animate={isHover ? 'hover' : 'idle'}
      custom={custom}
      initial="exit"
      exit="exit"
      className="font-S-CoreDream-500 flex w-full cursor-pointer items-center justify-center rounded-xl p-2"
    >
      <motion.div
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        className="relative top-[1px]"
      >
        {name}
      </motion.div>
    </motion.button>
  );
};

const OptionButton = ({ isFirstRenderOver }: { isFirstRenderOver: boolean }) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      variants={optionButtonVariants}
      whileInView="idle"
      whileHover="hover"
      viewport={{ once: true, amount: 0.5 }}
      custom={{ state: isFirstRenderOver ? 'normal' : 'initial' }}
      initial="exit"
      exit="exit"
      className="flex size-[44px] cursor-pointer items-center justify-between self-end rounded-xl p-2"
    >
      {[0, 0.1, 0.2].map((delay) => (
        <motion.div
          key={delay}
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
          exit="exit"
          animate={
            isHover
              ? {
                  backgroundColor: '#ffffff',
                  y: [0, -8, 0],
                  transition: {
                    y: {
                      stiffness: 200,
                      damping: 1000, // 감쇠력
                      mass: 0.5,
                      duration: 0.35,
                      delay,
                      repeat: Infinity,
                      repeatDelay: 0.5, //duration이 끝난 시점부터
                    },
                  },
                }
              : { y: 0 }
          }
          className="size-[5px] rounded-full bg-[#ffb900]"
        />
      ))}
    </motion.button>
  );
};

const CancelButton = ({
  handleDelete,
  isFirstRenderOver,
}: {
  handleDelete: () => void;
  isFirstRenderOver: boolean;
}) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.button
      onClick={handleDelete}
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      variants={cancelButtonVariants}
      whileInView="idle"
      whileHover="hover"
      viewport={{ once: true, amount: 0.5 }}
      custom={{ state: isFirstRenderOver ? 'normal' : 'initial' }}
      initial="exit"
      exit="exit"
      className="flex size-[44px] cursor-pointer self-end rounded-xl p-1 font-bold text-[#ff637e]"
    >
      <motion.svg
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        className="text-shadow-orange-200"
      >
        <motion.use
          animate={
            isHover
              ? { rotateZ: -45, transformOrigin: 'bottom left' }
              : { rotateZ: 0, transformOrigin: 'bottom left' }
          }
          href="/icons/icons.svg#delete-cap"
        />
        <use href="/icons/icons.svg#delete" />
      </motion.svg>
    </motion.button>
  );
};

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

export default function PickupCard({
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
          <CancelButton handleDelete={deleteBanner} isFirstRenderOver={isFirstRenderOver} />
        </div>
        <div className="relative flex w-full space-x-3 text-[15px]">
          {gachaTypeButtons.map(({ name, hoverBackground }) => (
            <TypeSelectionButton
              key={name}
              name={name}
              hoverBackground={hoverBackground}
              isFirstRenderOver={isFirstRenderOver}
            />
          ))}
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
        {/*         <div>lim/nor/full</div>
        <div>picked 1,2,3,4</div>
        <div>want 1,2,3,4</div>
        <div>pick limit 100~200</div>
        <div>first one pick</div>
        <div>yellow tick yes/no</div> */}
        {/* 자세히 탭에 들어갈 것 - 픽업대상 수, 목표 픽업 수, 픽업 리미트(기본은 명함), 명함 - 횟수제한픽업 - 풀잠, 노티사용 */}
      </div>
    </motion.div>
  );
}
