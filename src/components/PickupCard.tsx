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
  smallButtonVariants,
  toOpacityZero,
} from '#/constants/variants';

const shadowVariants = {
  idle: {
    boxShadow: '12px 12px 32px #101010, -10px -12px 32px #303030',
    background: 'linear-gradient(135deg, #191919, #2a2a2a)',
  },
  hover: {
    boxShadow: '16px 16px 40px #0a0a0a, -13px -16px 40px #333333',
    background: 'linear-gradient(135deg, #1b1b1b, #303030)',
  },
};

const GachaTypeButton = ({ name }: { name: string }) => {
  return (
    <motion.div
      variants={gachaTypeButtonVariants}
      whileInView="idle"
      viewport={{ once: true, amount: 0.5 }}
      initial="exit"
      className="flex w-full items-center justify-center rounded-xl p-2 font-bold"
    >
      <motion.div
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        className="relative top-[2px]"
      >
        {name}
      </motion.div>
    </motion.div>
  );
};

const OptionButton = () => {
  return (
    <motion.button
      variants={smallButtonVariants}
      whileInView="idle"
      viewport={{ once: true, amount: 0.5 }}
      initial="exit"
      className="flex size-[44px] self-end rounded-xl p-2 font-bold text-amber-400"
    >
      <motion.svg
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
      >
        <use href="/icons/icons.svg#option" />
      </motion.svg>
    </motion.button>
  );
};

const CancelButton = () => {
  return (
    <motion.button
      variants={cancelButtonVariants}
      whileInView="idle"
      whileHover="hover"
      viewport={{ once: true, amount: 0.5 }}
      initial="exit"
      className="flex size-[44px] cursor-pointer self-end rounded-xl p-2 font-bold text-rose-400"
    >
      <motion.svg
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        className="text-shadow-orange-200"
      >
        <use href="/icons/icons.svg#delete-cap" />
        <use href="/icons/icons.svg#delete" />
      </motion.svg>
    </motion.button>
  );
};

const TargetInput = ({ name }: { name: string }) => {
  return (
    <div className="flex min-w-[100px] flex-col space-y-1">
      <motion.div
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        className="relative self-center px-4 text-[13px]"
      >
        {name}
      </motion.div>
      <motion.div
        variants={insetInputVariants}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        className="relative flex h-[44px] items-center justify-center rounded-xl px-4 pt-3 pb-2 font-bold"
      >
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
        >
          2
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function PickupCard({ pickupData }: { pickupData: PickupData }) {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      animate={isHover ? { scale: 1.05 } : undefined}
      transition={cardTransition}
      className="Card relative w-[480px] space-y-12 p-4"
    >
      <motion.div
        variants={cardVariants}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...cardTransition, ease: 'easeIn' }}
        initial="exit"
        className="absolute top-0 left-0 flex size-full items-center justify-center rounded-3xl to-[#2e2e2e] shadow-[12px_12px_32px_#101010,-10px_-12px_32px_#303030]"
      />
      <div className="relative space-y-6">
        <div className="flex items-center justify-between">
          <motion.div
            variants={toOpacityZero}
            whileInView="idle"
            viewport={{ once: true, amount: 0.5 }}
            initial="exit"
            className="text-lg font-bold"
          >
            {pickupData.index}. 가챠 스케쥴 - {pickupData.index}
          </motion.div>
          <CancelButton />
        </div>
        <div className="relative flex w-full space-x-3 text-[15px]">
          {['한정', '일반', '콜라보'].map((name) => (
            <GachaTypeButton key={name} name={name} />
          ))}
        </div>
        <div className="relative flex justify-between">
          <div className="flex space-x-3">
            {['픽업오퍼 수', '목표픽업 수', '픽업확률'].map((name) => (
              <TargetInput key={name} name={name} />
            ))}
          </div>
          <OptionButton />
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
