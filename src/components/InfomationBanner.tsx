import BrushBarChart from '#/components/charts/SummaryBrushBarChart';
import SummaryDonutChart from '#/components/charts/SummaryDonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { rarityColor } from '#/constants/ui';
import { obtainedTypes, rarities, rarityStrings } from '#/constants/variables';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { cls, truncateToTwoDecimals } from '#/libs/utils';
import { motion } from 'motion/react';

export default function ScheduleOverview({
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
  const rarityResultData =
    result === null
      ? []
      : [
          { name: '6성', value: result.total.statistics.sixth.totalObtained },
          { name: '5성', value: result.total.statistics.fifth.totalObtained },
          { name: '4성', value: result.total.statistics.fourth.totalObtained },
          {
            name: '3성',
            value:
              result.total.totalGachaRuns -
              result.total.statistics.sixth.totalObtained -
              result.total.statistics.fifth.totalObtained -
              result.total.statistics.fourth.totalObtained,
          },
        ];

  return (
    <div className="w-[480px] space-y-6">
      <motion.div
        variants={cardVariants}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...cardTransition, ease: 'easeIn' }}
        initial="exit"
        className="font-S-CoreDream-500 flex w-[480px] items-center rounded-xl p-4"
      >
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
        >
          명일방주 가챠 일정 <span className="text-amber-400">시뮬레이터</span>
        </motion.div>
      </motion.div>
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
                <li>성공한 가챠 일정 : {result.total.simulationSuccess.toLocaleString()} 회</li>
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
                  일정 당 평균 가챠횟수 :{' '}
                  {Math.floor(
                    result.total.totalGachaRuns / result.total.simulationTry,
                  ).toLocaleString()}{' '}
                  회
                </li>
              </ul>
            </div>
          </section>
        ) : null}
      </motion.div>
      <motion.div
        variants={cardVariants}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...cardTransition, ease: 'easeIn' }}
        initial="exit"
        className="font-S-CoreDream-500 w-full space-y-3 rounded-xl p-4"
      >
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
        >
          <span className="text-amber-400">배너별</span> 성공률
        </motion.div>
        {result ? (
          <BrushBarChart
            data={result.perBanner.map(({ name, bannerSuccess }) => ({
              name,
              value: bannerSuccess,
            }))}
            totalSimulationTry={result.total.simulationTry}
          />
        ) : null}
      </motion.div>
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
          <span className="text-amber-400">총 가챠</span> 결과
        </motion.div>
        {result ? (
          <section className="text-sm">
            <ul className="flex gap-3">
              {rarityStrings.map((rarityString) => (
                <li key={rarityString} className="flex items-center gap-1">
                  <div className={cls(rarityColor[rarityString].bgColor, 'size-2 rounded-full')} />
                  {`${rarities[rarityString]}성`}
                </li>
              ))}
              <li className="flex items-center gap-1">
                <div className="size-2 rounded-full bg-sky-500" /> 3성
              </li>
            </ul>
            <SummaryDonutChart
              simulationResultData={rarityResultData}
              fill={Object.values(rarityColor).map(({ HEX }) => HEX)}
            />
            <div className="space-y-3">
              {rarityStrings.map((rarityString) => (
                <ul key={rarityString} className="space-y-1">
                  <h1 className={rarityColor[rarityString].textColor}>
                    {`${rarities[rarityString]}성 결과`} (
                    {truncateToTwoDecimals(
                      (result.total.statistics[rarityString].totalObtained /
                        result.total.totalGachaRuns) *
                        100,
                    )}
                    %)
                  </h1>
                  {obtainedTypes.map((obtainedType) => (
                    <li key={obtainedType}>
                      {obtainedType === 'totalObtained' ? (
                        <div>
                          {'총 등장 : '}
                          {result.total.statistics[rarityString][obtainedType]} 회{' '}
                        </div>
                      ) : (
                        <div>
                          {obtainedType === 'pickupObtained' ? '픽업오퍼 등장' : '목표오퍼 등장'} :{' '}
                          {result.total.statistics[rarityString][obtainedType]} 회
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ))}
              <div className="space-y-1">
                <h1 className="text-sky-500">
                  3성 결과 (
                  {truncateToTwoDecimals(
                    ((result.total.totalGachaRuns -
                      result.total.statistics.sixth.totalObtained -
                      result.total.statistics.fifth.totalObtained -
                      result.total.statistics.fourth.totalObtained) /
                      result.total.totalGachaRuns) *
                      100,
                  )}
                  %)
                </h1>
                <div>
                  총 등장 :{' '}
                  {result.total.totalGachaRuns -
                    result.total.statistics.sixth.totalObtained -
                    result.total.statistics.fifth.totalObtained -
                    result.total.statistics.fourth.totalObtained}{' '}
                  회{' '}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </motion.div>
    </div>
  );
}
