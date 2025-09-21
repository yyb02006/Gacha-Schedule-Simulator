'use client';

import Modal from '#/components/Modal';
import { DeleteButton, TypeSelectionButton } from '#/components/PickupCard';
import { PickupData } from '#/components/PickupList';
import {
  cancelButtonVariants,
  fontPop,
  gachaBannerOptionCardVariants,
  insetInputVariants,
  toggleButtonVariants,
  toOpacityZero,
} from '#/constants/variants';
import { motion } from 'motion/react';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimulatorTypeButton = ({
  isGachaSim,
  onTypeClick,
}: {
  isGachaSim: boolean;
  onTypeClick: () => void;
}) => {
  return (
    <div className="flex min-w-[100px] flex-col space-y-1">
      <motion.div
        variants={insetInputVariants}
        animate="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        onClick={onTypeClick}
        className="relative flex h-[48px] cursor-pointer items-center justify-center rounded-xl px-4 pt-3 pb-2 font-bold"
      >
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative w-full text-center whitespace-nowrap"
        >
          <motion.div
            variants={fontPop}
            animate={isGachaSim ? 'inAcitve' : 'active'}
            initial={isGachaSim ? 'active' : 'inAcitve'}
            exit="exit"
            className="font-S-CoreDream-700"
          >
            가챠 확률 시뮬레이션
          </motion.div>
        </motion.div>
        <motion.div
          variants={toOpacityZero}
          animate="idle"
          initial="exit"
          exit="exit"
          className="relative w-full text-center whitespace-nowrap"
        >
          <motion.div
            variants={fontPop}
            animate={isGachaSim ? 'inAcitve' : 'active'}
            initial={isGachaSim ? 'active' : 'inAcitve'}
            exit="exit"
            className="font-S-CoreDream-700"
          >
            재화 소모 시뮬레이션
          </motion.div>
        </motion.div>
        <div
          style={{ justifyContent: isGachaSim ? 'flex-start' : 'flex-end' }}
          className="absolute top-0 flex size-full justify-end"
        >
          <motion.div
            layout
            transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.2 }}
            className="relative h-full w-1/2 p-[2px]"
          >
            <motion.div
              variants={toggleButtonVariants}
              initial="exit"
              animate={isGachaSim ? 'left' : 'right'}
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex size-full items-center justify-center rounded-lg"
            >
              <motion.span variants={toOpacityZero} initial="exit" animate="idle" exit="exit">
                {isGachaSim ? '가챠 확률 시뮬레이션' : '재화 소모 시뮬레이션'}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

interface Dummy extends PickupData {
  name: string;
  gachaMax: number | null;
  gachaMin: number;
  operators: { name: string; currentQty: number; operType: 'limited' | 'normal' }[];
}

const dummies: Dummy[] = [
  {
    id: '970b5b98-edda-4af6-ae22-49a9227e1ad4',
    name: '우리 종족',
    gachaType: 'limited',
    operators: [
      { name: '위셔델', currentQty: 0, operType: 'limited' },
      { name: '로고스', currentQty: 0, operType: 'normal' },
    ],
    pickupDetails: { pickupOpersCount: 2, targetPickupCount: 2, pickupChance: 70 },
    gachaMax: 200,
    gachaMin: 0,
  },
  {
    id: 'a1b2c3d4-e5f6-4789-b0c1-d2e3f4a5b6c7',
    name: '모래위의 각인',
    gachaType: 'limited',
    operators: [
      { name: '페페', currentQty: 0, operType: 'limited' },
      { name: '나란투야', currentQty: 0, operType: 'normal' },
    ],
    pickupDetails: { pickupOpersCount: 2, targetPickupCount: 2, pickupChance: 70 },
    gachaMax: null,
    gachaMin: 0,
  },
  {
    id: 'f8e7d6c5-b4a3-4210-9876-543210fedcba',
    name: '불타는 엘레지여',
    gachaType: 'standard',
    operators: [{ name: '네크라스', currentQty: 0, operType: 'normal' }],
    pickupDetails: { pickupOpersCount: 1, targetPickupCount: 1, pickupChance: 50 },
    gachaMax: null,
    gachaMin: 0,
  },
];

/*
가챠 확률 시뮬레이션 / 재화 소모 시뮬레이션 전환 버튼 - 결과창도 글귀 변경돼야함

올명함 / 올풀잠 / 올명함 + 한정 300천장
1열 인덱스 / 가챠 이름 / 한정, 통상태그
2열 최대 가챠 횟수, 무제한 버튼 / 최소 가챠 횟수, 300뽑 버튼 / 목표, 거르기
3열 오퍼 이름 / 한정 통상 표시 / 가챠 목표 : 인풋, 명함 or 풀잠
신오퍼 가챠, 구오퍼 가챠 표시, 드래그로 순서 바꾸기

시작재화 / 올명함 / 올풀잠 / 올명함 + 한정 300천장
1열 인덱스 / 가챠 이름 / 한정, 통상태그 / 가챠 배너까지 추가 재화
2열 최대 가챠 횟수, 무제한 버튼 / 최소 가챠 횟수, 300뽑 버튼 / 목표, 거르기
3열 오퍼 이름 / 한정 통상 표시 / 가챠 목표 : 인풋, 명함 or 풀잠
신오퍼 가챠, 구오퍼 가챠 표시, 드래그로 순서 바꾸기
*/

{
  /* 재화 소모 시뮬레이션 추가, 노티? 
  페이드아웃 모션 살짝 렉걸림 
  */
}
const GachaBannerOptionCard = ({ data, index }: { data: Dummy; index: number }) => {
  const { gachaMax, gachaMin, gachaType, name, operators } = data;
  const translatedGachaType =
    gachaType === 'collab' ? '콜라보 배너' : gachaType === 'limited' ? '한정 배너' : '통상 배너';
  return (
    <motion.div
      variants={gachaBannerOptionCardVariants}
      initial="exit"
      animate="idle"
      exit="exit"
      className="flex flex-col space-y-4 rounded-xl bg-amber-500 p-4"
    >
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
      <div className="font-S-CoreDream-500 flex gap-6">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">
            최대 <span>시도</span>
          </span>
          <motion.div
            variants={insetInputVariants}
            initial="exit"
            animate="idle"
            exit="exit"
            className="relative flex items-center rounded-lg px-4 py-2"
          >
            {!!gachaMax || <div className="absolute right-0 mr-4 text-3xl">∞</div>}
            <input
              type="number"
              onChange={() => {}}
              className="relative w-10 min-w-0 text-right"
              value={gachaMax || ''}
            />
          </motion.div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sky-600">
            최소 <span>시도</span>
          </span>
          <motion.div
            variants={insetInputVariants}
            initial="exit"
            animate="idle"
            exit="exit"
            className="font-S-CoreDream-400 min-w-16 rounded-lg px-3 py-2 text-right"
          >
            {gachaMin}
          </motion.div>
        </div>
      </div>
      <div className="space-y-3">
        {operators.map(({ currentQty, name, operType }) => (
          <div key={name} className="flex items-center justify-between gap-6">
            <div className="flex gap-6">
              <motion.div
                variants={insetInputVariants}
                initial="exit"
                animate="idle"
                exit="exit"
                className="flex min-w-40 items-center rounded-lg py-2 pr-2 pl-4"
              >
                <input type="text" onChange={() => {}} value={name} />
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
            {/* 명함, 풀잠, 거르기 default설정 */}
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
              <TypeSelectionButton
                name="거르기"
                hoverBackground="linear-gradient(155deg, #1447e6, #51a2ff)"
                onTypeClick={() => {}}
                className="px-4 whitespace-nowrap"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const SimulationOptions = () => {
  return (
    <section className="flex h-0 grow flex-col space-y-2">
      <h1 className="font-S-CoreDream-700 flex h-[44px] items-center text-2xl">
        가챠&nbsp;<span className="text-amber-400">리스트</span>
      </h1>
      <div className="hide-scrollbar relative -mx-4 space-y-6 overflow-y-auto px-4 py-[10px]">
        {dummies.map((dummy, index) => (
          <GachaBannerOptionCard key={dummy.id} data={dummy} index={index} />
        ))}
      </div>
    </section>
  );
};

/*
가챠 확률 시뮬레이션 / 재화 소모 시뮬레이션 전환 버튼 - 결과창도 글귀 변경돼야함

올명함 / 올풀잠 / 올명함 + 한정 300천장
1열 인덱스 / 가챠 이름 / 한정, 통상태그
2열 최대 가챠 횟수, 무제한 버튼 / 최소 가챠 횟수, 300뽑 버튼
3열 오퍼 이름 / 한정 통상 표시 / 가챠 목표 : 인풋, 명함 or 풀잠
신오퍼 가챠, 구오퍼 가챠 표시, 드래그로 순서 바꾸기

시작재화 / 올명함 / 올풀잠 / 올명함 + 한정 300천장
1열 인덱스 / 가챠 이름 / 한정, 통상태그 / 가챠 배너까지 추가 재화
2열최대 가챠 횟수, 무제한 버튼 / 최소 가챠 횟수, 300뽑 버튼
3열 오퍼 이름 / 한정 통상 표시 / 가챠 목표 : 인풋, 명함 or 풀잠
신오퍼 가챠, 구오퍼 가챠 표시, 드래그로 순서 바꾸기
*/

/* 가챠 배너는 20개까지 */

const CancelButton = ({
  handleCancel,
  isFirstRenderOver = true,
}: {
  handleCancel: () => void;
  isFirstRenderOver?: boolean;
}) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.button
      key="cancel"
      onHoverStart={() => {
        setIsHover(true);
      }}
      onHoverEnd={() => {
        setIsHover(false);
      }}
      onClick={handleCancel}
      variants={cancelButtonVariants}
      viewport={{ once: true, amount: 0.5 }}
      custom={{ state: isFirstRenderOver ? 'normal' : 'initial' }}
      initial="exit"
      animate={isHover ? 'hover' : 'idle'}
      exit="exit"
      className="size-[44px] cursor-pointer rounded-xl p-2 text-[#ff637e]"
    >
      <motion.svg
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        exit="exit"
        className="size-full"
      >
        <use href="/icons/icons.svg#cancel" />
      </motion.svg>
    </motion.button>
  );
};

export default function SimulatorOptionModal({ isOpen, onClose }: SettingsModalProps) {
  const [isGachaSim, setIsGachaSim] = useState(true);
  const [settingA, setSettingA] = useState(false);
  const [settingB, setSettingB] = useState('option1');

  const handleSave = () => {
    console.log('설정 저장:', { settingA, settingB });
    onClose();
  };

  const changeSimType = () => {
    setIsGachaSim((p) => !p);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-S-CoreDream-700 text-2xl">
            <span className="text-amber-400">고오급</span> 옵션
          </h1>
          <CancelButton
            handleCancel={() => {
              onClose();
            }}
          />
        </div>
        <SimulatorTypeButton isGachaSim={isGachaSim} onTypeClick={changeSimType} />
      </div>
      <SimulationOptions />
    </Modal>
  );
}
