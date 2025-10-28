'use client';

import ChartWrapper from '#/components/charts/ChartWrapper';
import SummaryDonutChart from '#/components/charts/SummaryDonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { rarityColor } from '#/constants/ui';
import { obtainedTypes, rarities, rarityStrings } from '#/constants/variables';
import { cls, truncateToTwoDecimals } from '#/libs/utils';

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
    <ChartWrapper
      title={
        <span>
          <span className="text-amber-400">전체 가챠 </span>통계
        </span>
      }
    >
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
          <div className="flex flex-col flex-wrap gap-4">
            <div className="flex flex-1 flex-wrap gap-4">
              <ul className="flex-1 space-y-1 whitespace-nowrap">
                <h1 className={rarityColor['sixth'].textColor}>
                  {`${rarities['sixth']}성 결과`} (
                  {truncateToTwoDecimals(
                    (result.total.statistics['sixth'].totalObtained / result.total.totalGachaRuns) *
                      100,
                  )}
                  %)
                </h1>
                {obtainedTypes.map((obtainedType) => (
                  <li key={obtainedType}>
                    {obtainedType === 'totalObtained' ? (
                      <div>
                        {'총 등장 : '}
                        {result.total.statistics['sixth'][obtainedType].toLocaleString()} 회{' '}
                      </div>
                    ) : (
                      <div>
                        {obtainedType === 'pickupObtained' ? '픽업오퍼 등장' : '목표오퍼 등장'} :{' '}
                        {result.total.statistics['sixth'][obtainedType].toLocaleString()} 회
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <ul className="flex-1 space-y-1 whitespace-nowrap">
                <h1 className={rarityColor['fifth'].textColor}>
                  {`${rarities['fifth']}성 결과`} (
                  {truncateToTwoDecimals(
                    (result.total.statistics['fifth'].totalObtained / result.total.totalGachaRuns) *
                      100,
                  )}
                  %)
                </h1>
                {obtainedTypes.map((obtainedType) => (
                  <li key={obtainedType}>
                    {obtainedType === 'totalObtained' ? (
                      <div>
                        {'총 등장 : '}
                        {result.total.statistics['fifth'][obtainedType].toLocaleString()} 회{' '}
                      </div>
                    ) : (
                      <div>
                        {obtainedType === 'pickupObtained' ? '픽업오퍼 등장' : '목표오퍼 등장'} :{' '}
                        {result.total.statistics['fifth'][obtainedType].toLocaleString()} 회
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-1 flex-wrap gap-4">
              <ul className="flex-1 space-y-1 whitespace-nowrap">
                <h1 className={rarityColor['fourth'].textColor}>
                  {`${rarities['fourth']}성 결과`} (
                  {truncateToTwoDecimals(
                    (result.total.statistics['fourth'].totalObtained /
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
                        {result.total.statistics['fourth'][obtainedType].toLocaleString()} 회{' '}
                      </div>
                    ) : (
                      <div>
                        {obtainedType === 'pickupObtained' ? '픽업오퍼 등장' : '목표오퍼 등장'} :{' '}
                        {result.total.statistics['fourth'][obtainedType].toLocaleString()} 회
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex-1 space-y-1 whitespace-nowrap">
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
                  {(
                    result.total.totalGachaRuns -
                    result.total.statistics.sixth.totalObtained -
                    result.total.statistics.fifth.totalObtained -
                    result.total.statistics.fourth.totalObtained
                  ).toLocaleString()}{' '}
                  회{' '}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </ChartWrapper>
  );
}
