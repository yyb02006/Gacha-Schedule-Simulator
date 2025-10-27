import SummaryDonutChart from '#/components/charts/SummaryDonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { rarityColor } from '#/constants/ui';
import { obtainedTypes, rarities, rarityStrings } from '#/constants/variables';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { cls, truncateToTwoDecimals } from '#/libs/utils';
import { motion } from 'motion/react';

export default function TotalGachaResult({
  result,
}: {
  result: GachaSimulationMergedResult | null;
}) {
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
    <motion.div
      variants={cardVariants}
      transition={{ ...cardTransition, ease: 'easeIn' }}
      initial="exit"
      animate="idle"
      exit="exit"
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
  );
}
