'use client';

import Badge from '#/components/Badge';
import CancelButton from '#/components/buttons/CancelButton';
import Modal from '#/components/modals/Modal';
import { bannerBadgeProps, rarityColor } from '#/constants/ui';
import { cls } from '#/libs/utils';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'motion/react';
import { toOpacityZero } from '#/constants/variants';

const GachaSystemInfoModalContent = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      backdropBlur
    >
      <div className="relative mb-[120px] flex w-full max-w-[1280px] flex-col gap-y-5 rounded-xl bg-[#202020] py-8">
        <div className="flex items-center justify-between px-6">
          <h1 className="font-S-CoreDream-500 text-2xl">
            <span className="text-amber-400">가챠 룰</span>에 대한 안내
          </h1>
          <CancelButton
            handleCancel={() => {
              onClose();
            }}
          />
        </div>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch">
            <div className="my-[3px] w-[5px] self-stretch bg-amber-500" />
            <span className="ml-1.5">
              희귀도별 <span className="text-amber-400">기본 등장 확률</span>
            </span>
          </h1>
          <div className="flex gap-x-6 gap-y-2">
            <div className={cls(rarityColor['sixth'].textColor, 'flex items-center gap-x-2')}>
              <div className="text-standard flex items-center justify-center rounded-full border border-orange-400 px-2 py-1">
                6성
              </div>
              <span className="font-S-CoreDream-500 text-xl">2%</span>
            </div>
            <div className={cls(rarityColor['fifth'].textColor, 'flex items-center gap-x-2')}>
              <div className="text-standard flex items-center justify-center rounded-full border border-amber-400 px-2 py-1">
                5성
              </div>
              <span className="font-S-CoreDream-500 text-xl">8%</span>
            </div>
            <div className={cls(rarityColor['fourth'].textColor, 'flex items-center gap-x-2')}>
              <div className="text-standard flex items-center justify-center rounded-full border border-violet-400 px-2 py-1">
                4성
              </div>
              <span className="font-S-CoreDream-500 text-xl">50%</span>
            </div>
            <div className={cls(rarityColor['third'].textColor, 'flex items-center gap-x-2')}>
              <div className="text-standard flex items-center justify-center rounded-full border border-sky-500 px-2 py-1">
                3성
              </div>
              <span className="font-S-CoreDream-500 text-xl">40%</span>
            </div>
          </div>
        </section>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch">
            <div className="my-[3px] w-[5px] self-stretch bg-amber-500" />
            <span className="ml-1.5">
              <span className="text-amber-400">첫 10회 5성 이상 등장 확정</span> 시스템
            </span>
          </h1>
          <ol className="text-standard font-S-CoreDream-300 list-disc space-y-3 pl-4">
            <li>
              9회 뽑기까지 5성 이상이 등장하지 않았다면{' '}
              <span className="font-S-CoreDream-400 text-amber-400">
                10회에서는 5성 이상의 등장이 확정
              </span>
              됩니다.
            </li>
            <li className="space-y-2">
              <p>
                10회에서 5성 이상의 등장이 확정될 때, 5성과 6성 각각의 등장 확률은 아래와 같습니다.
              </p>
              <div className="font-S-CoreDream-400 flex gap-x-6 gap-y-2">
                <div className={cls(rarityColor['sixth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-orange-400 px-2 py-1">
                    6성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">2%</span>
                </div>
                <div className={cls(rarityColor['fifth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-amber-400 px-2 py-1">
                    5성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">98%</span>
                </div>
              </div>
            </li>
          </ol>
        </section>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch">
            <div className="my-[3px] w-[5px] self-stretch bg-amber-500" />
            <span className="ml-1.5">
              <span className="text-amber-400">6성 등장 확률 누적 상승</span> 시스템
            </span>
          </h1>
          <ol className="text-standard font-S-CoreDream-300 list-disc space-y-3 pl-4">
            <li>
              6성 오퍼레이터가 n회 연속으로 등장하지 않았을 때, n회만큼의{' '}
              <span className="font-S-CoreDream-400 text-amber-400">스택</span>을 가지게 됩니다.
            </li>
            <li className="space-y-1">
              <p>
                6성 오퍼레이터가 50회 연속으로 등장하지 않아 스택이 50회 쌓인 경우,{' '}
                <span className="font-S-CoreDream-400 text-amber-400">
                  51회부터 6성 등장 확률이 2%p씩 증가
                </span>
                하여 98회 연속 실패 시 100%가 됩니다.
              </p>
              <p className="text-sm text-[#bababa]">
                70회 연속 실패 확률 = 0.0037%, 80회 연속 실패 확률 = 0.0000488%
              </p>
            </li>
            <li>
              6성 오퍼레이터 등장 시 스택은 0으로, 6성 등장 확률은 2%로{' '}
              <span className="font-S-CoreDream-400 text-amber-400">초기화</span>됩니다.
            </li>
            <li className="mb-4 space-y-2">
              <p>
                이번 배너에서 스택이 남겨진 채로 다음 배너 진입시 스택은 아래 배너종류에 한해 서로{' '}
                <span className="font-S-CoreDream-400 text-amber-400">이월</span>됩니다.
              </p>
              <div className="font-S-CoreDream-400 flex gap-x-2">
                {(['single', 'rotation', 'orient', 'contract'] as const).map((bannerType) => (
                  <Badge
                    key={bannerType}
                    {...bannerBadgeProps[bannerType].props}
                    animation={false}
                  />
                ))}
              </div>
            </li>
            <li className="space-y-2">
              <p>
                아래 한정 배너들은 서로간에도, 같은 종류의 배너 간에도 스택이{' '}
                <span className="font-S-CoreDream-400 text-red-400">이월되지 않습니다.</span>
              </p>
              <div className="font-S-CoreDream-400 flex gap-x-2">
                {(['limited', 'collab'] as const).map((bannerType) => (
                  <Badge
                    key={bannerType}
                    {...bannerBadgeProps[bannerType].props}
                    animation={false}
                  />
                ))}
              </div>
            </li>
          </ol>
        </section>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch">
            <div className="my-[3px] w-[5px] self-stretch bg-amber-500" />
            <span className="ml-1.5">
              6성 누적 확률 상승 시스템 <span className="text-amber-400">보정 등장 확률</span>
            </span>
          </h1>
          <p className="text-standard font-S-CoreDream-300">
            따라서 우리가{' '}
            <span className="font-S-CoreDream-400 text-amber-400">
              실제로 기대할 수 있는 기본적인 확률
            </span>
            은 아래와 같으며, 배너에 따라서 천장 시스템이 있을 수 있으므로 약간의 차이가 있을 수
            있습니다.
          </p>
          <div className="font-S-CoreDream-400 flex gap-x-6 gap-y-2">
            <div className={cls(rarityColor['sixth'].textColor, 'flex items-center gap-x-2')}>
              <div className="text-standard flex items-center justify-center rounded-full border border-orange-400 px-2 py-1">
                6성
              </div>
              <span className="font-S-CoreDream-500 text-xl">2.89%</span>
            </div>
            <div className={cls(rarityColor['fifth'].textColor, 'flex items-center gap-x-2')}>
              <div className="text-standard flex items-center justify-center rounded-full border border-amber-400 px-2 py-1">
                5성
              </div>
              <span className="font-S-CoreDream-500 text-xl">8%</span>
            </div>
            <div className={cls(rarityColor['fourth'].textColor, 'flex items-center gap-x-2')}>
              <div className="text-standard flex items-center justify-center rounded-full border border-violet-400 px-2 py-1">
                4성
              </div>
              <span className="font-S-CoreDream-500 text-xl">50%</span>
            </div>
            <div className={cls(rarityColor['third'].textColor, 'flex items-center gap-x-2')}>
              <div className="text-standard flex items-center justify-center rounded-full border border-sky-500 px-2 py-1">
                3성
              </div>
              <span className="font-S-CoreDream-500 text-xl">39.11%</span>
            </div>
          </div>
        </section>
        <div className="my-3 flex items-center justify-between px-6">
          <h1 className="font-S-CoreDream-500 text-2xl">
            배너 종류별 <span className="text-red-400">천장 및 픽업 확률</span>에 대한 안내
          </h1>
        </div>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch text-lg">
            <div className="my-[3px] w-[5px] self-stretch bg-sky-500" />
            <span className="ml-1.5 text-sky-500">단일 통상 배너</span>
          </h1>
          <Image
            src="/images/banner_single.jpg"
            width={1230}
            height={530}
            alt="rotation"
            className="rounded-lg"
          />
          <ol className="text-standard font-S-CoreDream-300 list-disc space-y-3 pl-4">
            <li>
              한 명의{' '}
              <span className="font-S-CoreDream-400 text-amber-400">신규 통상 6성 오퍼레이터</span>
              를 정해진 기간 동안 확률상승으로 얻을 수 있는 배너입니다.
            </li>
            <li>약 1년 뒤 한 번 복각할 수 있습니다.</li>
            <li className="mb-4 space-y-2">
              <p>
                픽업 오퍼레이터의 구성과 각 희귀도 당첨 시{' '}
                <span className="font-S-CoreDream-400 text-amber-400">픽업 등장 확률</span>은 아래와
                같으며, 4성 오퍼레이터는 구성에 포함되어있지 않을 수 있습니다.
              </p>
              <div className="font-S-CoreDream-400 flex gap-x-6 gap-y-2">
                <div className={cls(rarityColor['sixth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-orange-400 px-2 py-1">
                    6성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">1명 / 50%</span>
                </div>
                <div className={cls(rarityColor['fifth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-amber-400 px-2 py-1">
                    5성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">2명 / 50%</span>
                </div>
                <div className={cls(rarityColor['fourth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-purple-400 px-2 py-1">
                    4성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">1명 / 20%</span>
                  <span className="text-sm">(미확정)</span>
                </div>
              </div>
            </li>
            <li>본 시뮬레이터에서도 배너를 구성할 시 위의 제한 조건을 따릅니다.</li>
            <h1 className="font-S-CoreDream-500 mt-5 -ml-4 flex items-stretch space-x-1.5 text-base">
              <span className="text-teal-400">❱❱❱</span>
              <span className="text-teal-400">천장 시스템</span>
            </h1>
            <li>
              단일 통상 배너에서 단 한 번,{' '}
              <span className="font-S-CoreDream-400 text-amber-400">150회</span>까지 픽업 6성
              오퍼레이터를 획득하지 못했을 시, 이후 등장하는 6성 오퍼레이터는 해당 배너의 픽업 6성
              오퍼레이터로 확정됩니다.
            </li>
          </ol>
        </section>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch text-lg">
            <div className="my-[3px] w-[5px] self-stretch bg-violet-400" />
            <span className="ml-1.5 text-violet-400">로테이션 배너</span>
          </h1>
          <Image
            src="/images/banner_rotation.jpg"
            width={1230}
            height={530}
            alt="rotation"
            className="rounded-lg"
          />
          <ol className="text-standard font-S-CoreDream-300 list-disc space-y-3 pl-4">
            <li>
              두 명의{' '}
              <span className="font-S-CoreDream-400 text-amber-400">통상 6성 오퍼레이터</span>를
              확률상승으로 얻을 수 있는 2주동안 유지되는 배너입니다.
            </li>
            <li>
              2주마다 다른 오퍼레이터 풀로 변경되며, 출시된 지 일정 시간이 지난 오퍼레이터들로
              구성되어 있습니다.
            </li>
            <li className="mb-4 space-y-2">
              <p>
                픽업 오퍼레이터의 구성과 각 희귀도 당첨 시{' '}
                <span className="font-S-CoreDream-400 text-amber-400">픽업 등장 확률</span>은 아래와
                같습니다.
              </p>
              <div className="font-S-CoreDream-400 flex gap-x-6 gap-y-2">
                <div className={cls(rarityColor['sixth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-orange-400 px-2 py-1">
                    6성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">2명 / 50%</span>
                </div>
                <div className={cls(rarityColor['fifth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-amber-400 px-2 py-1">
                    5성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">3명 / 50%</span>
                </div>
              </div>
            </li>
            <li>본 시뮬레이터에서도 배너를 구성할 시 위의 제한 조건을 따릅니다.</li>
            <h1 className="font-S-CoreDream-500 mt-5 -ml-4 flex items-stretch space-x-1.5 text-base">
              <span className="text-teal-400">❱❱❱</span>
              <span className="text-teal-400">천장 시스템</span>
            </h1>
            <li className="leading-7">
              <p>
                로테이션 배너에서 <span className="font-S-CoreDream-400 text-amber-400">150회</span>
                까지 획득하지 못한 6성 오퍼레이터가 존재할 시, 다음으로 등장하는 6성 오퍼레이터는
                해당 배너의 픽업 6성 오퍼레이터로 확정됩니다.{' '}
                <span className="font-S-CoreDream-400 text-amber-400">300회</span> 이후에도 얻지
                못한 픽업 6성 오퍼레이터가 남아있을 시, 다음으로 등장하는 6성 오퍼레이터는 해당
                배너의 아직 얻지 못한 픽업 6성 오퍼레이터로 확정됩니다.
              </p>
              <p className="font-S-CoreDream-400 text-[13px] leading-5 text-red-400">
                ⚠ 획득하지 못한 픽업 오퍼레이터가 있을 시 해당 오퍼레이터로 확정되는 지, 획득
                여부에 상관 없이 150회 이후 둘 중 하나로 확정되는지에 대해서 확실하지 않습니다.
                그러나 본 시뮬레이션에서는 천장 시스템의 문맥상 위 내용으로 해석하고 있으며, PRTS
                웹페이지 로테이션 가챠 시뮬레이터 룰의 내용과 동일합니다.
              </p>
            </li>
          </ol>
        </section>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch text-lg">
            <div className="my-[3px] w-[5px] self-stretch bg-amber-400" />
            <span className="ml-1.5 text-amber-400">한정 배너</span>
          </h1>
          <Image
            src="/images/banner_limited.jpg"
            width={1230}
            height={530}
            alt="rotation"
            className="rounded-lg"
          />
          <ol className="text-standard font-S-CoreDream-300 list-disc space-y-3 pl-4">
            <li>
              <span className="font-S-CoreDream-400 text-amber-400">신규 한정 6성 오퍼레이터</span>
              와{' '}
              <span className="font-S-CoreDream-400 text-amber-400">신규 통상 6성 오퍼레이터</span>
              를 한 명씩 정해진 기간 동안 확률상승으로 얻을 수 있는 배너입니다.
            </li>
            <li>
              <span className="font-S-CoreDream-400 text-red-400">복각은 없으며</span> 한정 6성
              오퍼레이터의 경우, 약 1년 뒤 같은 종류의 한정 이벤트 배너(춘절, N년, 여름, N.5년)에서
              가챠 1회 실행시마다 얻을 수 있는{' '}
              <span className="font-S-CoreDream-400 text-amber-400">재화 300개로 교환</span>{' '}
              가능합니다.
            </li>
            <li className="mb-4 space-y-2">
              <p>
                픽업 오퍼레이터의 구성과 각 희귀도 당첨 시{' '}
                <span className="font-S-CoreDream-400 text-amber-400">픽업 등장 확률</span>은 아래와
                같습니다.
              </p>
              <div className="font-S-CoreDream-400 flex gap-x-6 gap-y-2">
                <div className={cls(rarityColor['sixth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-orange-400 px-2 py-1">
                    6성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">2명 / 70%</span>
                </div>
                <div className={cls(rarityColor['fifth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-amber-400 px-2 py-1">
                    5성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">1명 / 50%</span>
                </div>
              </div>
            </li>
            <li>본 시뮬레이터에서도 배너를 구성할 시 위의 제한 조건을 따릅니다.</li>
            <h1 className="font-S-CoreDream-500 mt-5 -ml-4 flex items-stretch space-x-1.5 text-base">
              <span className="text-teal-400">❱❱❱</span>
              <span className="text-teal-400">적용된 천장 시스템</span>
            </h1>
            <li>
              한정 배너에서 가챠{' '}
              <span className="font-S-CoreDream-400 text-amber-400">
                300회를 시도하면 6성 한정 오퍼레이터를 보너스
              </span>
              로 얻을 수 있습니다. 이는 가챠 1회마다 얻을 수 있는 [헤드헌팅 데이터 계약]을 모아서{' '}
              <span className="font-S-CoreDream-400 text-amber-400">
                지난 한정 오페레이터와 교환하는 것과는 별개
              </span>
              이며, 가챠에 대한 확률 확정이 아닌 추가로 주는 보상이기 때문에{' '}
              <span className="font-S-CoreDream-400 text-amber-400">300회 가챠 내용과도 별개</span>
              입니다.
            </li>
          </ol>
        </section>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch text-lg">
            <div className="my-[3px] w-[5px] self-stretch bg-rose-400" />
            <span className="ml-1.5 text-rose-400">콜라보 배너</span>
          </h1>
          <Image
            src="/images/banner_collab.jpg"
            width={1230}
            height={530}
            alt="rotation"
            className="rounded-lg"
          />
          <ol className="text-standard font-S-CoreDream-300 list-disc space-y-3 pl-4">
            <li>
              <span className="font-S-CoreDream-400 text-amber-400">신규 한정 6성 오퍼레이터</span>{' '}
              한 명과{' '}
              <span className="font-S-CoreDream-400 text-amber-400">신규 한정 5성 오퍼레이터</span>{' '}
              두 명을 정해진 기간 동안 확률상승으로 얻을 수 있는 배너입니다.
            </li>
            <li>
              <span className="font-S-CoreDream-400 text-red-400">
                일반적으로 어떤 복각도 없으며,
              </span>{' '}
              이후 다시 해당 픽업 캐릭터를 얻을 수 있는 방법도 존재하지 않지만, 같은 IP와 다시
              콜라보를 할 경우 복각 가능성이 있습니다.
            </li>
            <li className="mb-4 space-y-2">
              <p>
                픽업 오퍼레이터의 구성과 각 희귀도 당첨 시{' '}
                <span className="font-S-CoreDream-400 text-amber-400">픽업 등장 확률</span>은 아래와
                같습니다.
              </p>
              <div className="font-S-CoreDream-400 flex gap-x-6 gap-y-2">
                <div className={cls(rarityColor['sixth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-orange-400 px-2 py-1">
                    6성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">1명 / 50%</span>
                </div>
                <div className={cls(rarityColor['fifth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-amber-400 px-2 py-1">
                    5성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">2명 / 50%</span>
                </div>
              </div>
            </li>
            <li>본 시뮬레이터에서도 배너를 구성할 시 위의 제한 조건을 따릅니다.</li>
            <h1 className="font-S-CoreDream-500 mt-5 -ml-4 flex items-stretch space-x-1.5 text-base">
              <span className="text-teal-400">❱❱❱</span>
              <span className="text-teal-400">적용된 천장 시스템</span>
            </h1>
            <li>
              콜라보 배너에서 가챠{' '}
              <span className="font-S-CoreDream-400 text-amber-400">119회</span>를 시도하는 동안
              픽업 한정 6성 오퍼레이터를 얻지 못했다면,{' '}
              <span className="font-S-CoreDream-400 text-amber-400">120회 가챠 결과</span>로 픽업
              한정 6성 오퍼레이터의{' '}
              <span className="font-S-CoreDream-400 text-amber-400">등장이 확정</span>됩니다.
            </li>
            <li>
              5성 등장 시 등장한 5성 오퍼레이터가 이번 배너에서{' '}
              <span className="font-S-CoreDream-400 text-amber-400">처음으로 얻는 픽업 5성</span>
              이라면, 그 다음으로 등장하는 5성은 픽업 5성 둘 중{' '}
              <span className="font-S-CoreDream-400 text-amber-400">얻지 못한 쪽으로 확정</span>
              됩니다.
            </li>
          </ol>
        </section>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch text-lg">
            <div className="my-[3px] w-[5px] self-stretch bg-orange-500" />
            <span className="ml-1.5 text-orange-500">지향 배너(3중 배너)</span>
          </h1>
          <Image
            src="/images/banner_orient.jpg"
            width={1230}
            height={530}
            alt="rotation"
            className="rounded-lg"
          />
          <ol className="text-standard font-S-CoreDream-300 list-disc space-y-3 pl-4">
            <li>
              <span className="font-S-CoreDream-400 text-amber-400">
                주어진 통상 6성 오퍼레이터
              </span>{' '}
              6명 중 3명,{' '}
              <span className="font-S-CoreDream-400 text-amber-400">
                주어진 통상 5성 오퍼레이터
              </span>{' '}
              6명 중 3명을 선택해 정해진 기간동안 확률상승으로 얻을 수 있는 배너입니다.
            </li>
            <li>
              6성 오퍼레이터가 등장했으나, 픽업 오퍼레이터가 아닌 6성을 얻게 되는{' '}
              <span className="font-S-CoreDream-400 text-amber-400">
                6성 픽뚫이 존재하지 않습니다.
              </span>{' '}
              5성의 픽업 확률도 50%가 아닌{' '}
              <span className="font-S-CoreDream-400 text-amber-400">60%</span>로 10%p 더 높습니다.
            </li>
            <li className="mb-4 space-y-2">
              <p>
                픽업 오퍼레이터의 구성과 각 희귀도 당첨 시{' '}
                <span className="font-S-CoreDream-400 text-amber-400">픽업 등장 확률</span>은 아래와
                같습니다.
              </p>
              <div className="font-S-CoreDream-400 flex gap-x-6 gap-y-2">
                <div className={cls(rarityColor['sixth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-orange-400 px-2 py-1">
                    6성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">3명 / 100%</span>
                </div>
                <div className={cls(rarityColor['fifth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-amber-400 px-2 py-1">
                    5성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">3명 / 60%</span>
                </div>
              </div>
            </li>
            <li>본 시뮬레이터에서도 배너를 구성할 시 위의 제한 조건을 따릅니다.</li>
            <h1 className="font-S-CoreDream-500 mt-5 -ml-4 flex items-stretch space-x-1.5 text-base">
              <span className="text-teal-400">❱❱❱</span>
              <span className="text-teal-400">적용된 천장 시스템</span>
            </h1>
            <li>천장이 없는 배너입니다.</li>
          </ol>
        </section>
        <section className="space-y-5 bg-[#303030] px-6 py-5">
          <h1 className="font-S-CoreDream-500 flex items-stretch text-lg">
            <div className="my-[3px] w-[5px] self-stretch bg-teal-500" />
            <span className="ml-1.5 text-teal-500">협약 배너(4중 배너)</span>
          </h1>
          <Image
            src="/images/banner_contract.jpg"
            width={1230}
            height={530}
            alt="rotation"
            className="rounded-lg"
          />
          <ol className="text-standard font-S-CoreDream-300 list-disc space-y-3 pl-4">
            <li>
              <span className="font-S-CoreDream-400 text-amber-400">통상 6성 오퍼레이터</span> 4명,
              <span className="font-S-CoreDream-400 text-amber-400">통상 5성 오퍼레이터</span> 6명을
              정해진 기간동안 확률상승으로 얻을 수 있는 배너입니다.
            </li>
            <li>
              위기협약 이벤트 시기에 같이 진행되며, 6성 오퍼레이터와 5성 오퍼레이터 모두{' '}
              <span className="font-S-CoreDream-400 text-amber-400">픽뚫이 존재하지 않습니다.</span>
            </li>
            <li className="mb-4 space-y-2">
              <p>
                픽업 오퍼레이터의 구성과 각 희귀도 당첨 시{' '}
                <span className="font-S-CoreDream-400 text-amber-400">픽업 등장 확률</span>은 아래와
                같습니다.
              </p>
              <div className="font-S-CoreDream-400 flex gap-x-6 gap-y-2">
                <div className={cls(rarityColor['sixth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-orange-400 px-2 py-1">
                    6성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">4명 / 100%</span>
                </div>
                <div className={cls(rarityColor['fifth'].textColor, 'flex items-center gap-x-2')}>
                  <div className="text-standard flex items-center justify-center rounded-full border border-amber-400 px-2 py-1">
                    5성
                  </div>
                  <span className="font-S-CoreDream-500 text-xl">6명 / 100%</span>
                </div>
              </div>
            </li>
            <li>본 시뮬레이터에서도 배너를 구성할 시 위의 제한 조건을 따릅니다.</li>
            <h1 className="font-S-CoreDream-500 mt-5 -ml-4 flex items-stretch space-x-1.5 text-base">
              <span className="text-teal-400">❱❱❱</span>
              <span className="text-teal-400">적용된 천장 시스템</span>
            </h1>
            <li>천장이 없는 배너입니다.</li>
          </ol>
        </section>
      </div>
    </Modal>
  );
};

export default function GachaSystemInfoModal() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      variants={toOpacityZero}
      initial="exit"
      animate="idle"
      className="absolute top-4 right-6"
    >
      <button
        onClick={() => setIsOpen(true)}
        className="font-S-CoreDream-500 group flex cursor-pointer items-center justify-center gap-1.5 text-sm text-[#606060] hover:text-amber-400"
      >
        <p className="select-none">Rule</p>
        <div className="font-S-CoreDream-400 flex aspect-square size-[22px] cursor-pointer items-center justify-center rounded-full border border-[#606060] group-hover:border-amber-400">
          <p className="select-none">?</p>
        </div>
      </button>
      <GachaSystemInfoModalContent isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </motion.div>
  );
}
