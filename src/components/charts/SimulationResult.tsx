import SummaryDonutChart from '#/components/charts/SummaryDonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { truncateToTwoDecimals } from '#/libs/utils';
import { motion } from 'motion/react';

export default function SimulationResult({
  result,
}: {
  result: GachaSimulationMergedResult | null;
}) {
  const simulationResultData =
    result === null
      ? []
      : [
          { name: '성공', value: result.total.simulationSuccess },
          {
            name: '실패',
            value: result.total.simulationTry - result.total.simulationSuccess,
          },
        ];
  return (
    <motion.div
      variants={cardVariants}
      whileInView="idle"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ ...cardTransition, ease: 'easeIn' }}
      initial="exit"
      className="font-S-CoreDream-400 w-full space-y-3 rounded-xl p-4"
    >
      <motion.div
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
        className="font-S-CoreDream-500"
      >
        <span className="text-amber-400">시뮬레이션</span> 결과
      </motion.div>
      {result ? (
        <section>
          <SummaryDonutChart
            simulationResultData={simulationResultData}
            fill={['#fe9a00', '#00a6f4']}
          />
          <div className="space-y-3 text-sm">
            <ul className="space-y-1">
              <li>시뮬레이션 횟수 : {result.total.simulationTry.toLocaleString()} 회</li>
              <li>성공한 시뮬레이션 : {result.total.simulationSuccess.toLocaleString()} 회</li>
              <li className="text-amber-400">
                일정 소화 성공률 :{' '}
                {truncateToTwoDecimals(
                  (result.total.simulationSuccess / result.total.simulationTry) * 100,
                )}
                %
              </li>
            </ul>
            <ul className="space-y-1">
              <li>총 가챠 횟수 : {result.total.totalGachaRuns.toLocaleString()} 회</li>
              <li className="text-amber-400">
                시뮬레이션 당 평균 가챠횟수 :{' '}
                {Math.floor(
                  result.total.totalGachaRuns / result.total.simulationTry,
                ).toLocaleString()}{' '}
                회
              </li>
            </ul>
            <ul className="space-y-1">
              <li>천장 획득 횟수 : {result.total.pityRewardObtained.toLocaleString()} 회</li>
              <li className="text-amber-400">
                시뮬레이션 당 천장 획득 횟수 :{' '}
                {truncateToTwoDecimals(
                  result.total.pityRewardObtained / result.total.simulationTry,
                ).toLocaleString()}{' '}
                회
              </li>
            </ul>
          </div>
        </section>
      ) : null}
    </motion.div>
  );
}
