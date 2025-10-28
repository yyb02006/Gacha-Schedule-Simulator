'use client';

import ChartWrapper from '#/components/charts/ChartWrapper';
import SummaryDonutChart from '#/components/charts/SummaryDonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { truncateToTwoDecimals } from '#/libs/utils';

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
    <ChartWrapper
      title={
        <span>
          <span className="text-amber-400">시뮬레이션 </span>통계
        </span>
      }
    >
      {result ? (
        <section className="text-sm">
          <ul className="flex gap-3">
            <li className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-amber-400" /> 성공
            </li>
            <li className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-sky-500" /> 실패
            </li>
          </ul>
          <SummaryDonutChart
            simulationResultData={simulationResultData}
            fill={['#fe9a00', '#00a6f4']}
          />
          <div className="space-y-4 text-sm">
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
    </ChartWrapper>
  );
}
