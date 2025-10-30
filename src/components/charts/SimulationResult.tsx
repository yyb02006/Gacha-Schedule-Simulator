'use client';

import ChartWrapper from '#/components/charts/ChartWrapper';
import SummaryDonutChart from '#/components/charts/SummaryDonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { truncateToDecimals } from '#/libs/utils';
import { TooltipItem } from 'chart.js';

const tooltip = (data: TooltipItem<'doughnut'>, total: number) => {
  const stringifiedValue = data?.formattedValue ?? '';
  const parsedRawValue = data.parsed;
  const label = data.label;
  const borderColor = (data.dataset.borderColor as string[])[data.dataIndex];

  return /*html*/ `
    <div class="font-S-CoreDream-400 space-y-[2px] text-sm">
      <p>
        ${label}한 시뮬레이션 :
        <span style="color: ${borderColor};">${stringifiedValue} 회</span>
      </p>
      <p>
        ${label} 확률 :
        <span style="color: ${borderColor};">${truncateToDecimals((parsedRawValue / (total ?? 1)) * 100)}%</span>
      </p>
    </div>
  `;
};

export default function SimulationResult({
  result,
}: {
  result: GachaSimulationMergedResult | null;
}) {
  const simulationResultData =
    result === null
      ? []
      : [
          result.total.simulationSuccess,
          result.total.simulationTry - result.total.simulationSuccess,
        ];
  const simulationResultLabels = ['성공', '실패'];
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
          <SummaryDonutChart
            data={simulationResultData}
            labels={simulationResultLabels}
            total={result.total.simulationTry}
            borderColor={['#fe9a00', '#00a6f4']}
            backgroundColor={['#fe9a00CC', '#00a6f4CC']}
            tooltipCallback={tooltip}
          />
          <div className="space-y-4 text-sm">
            <ul className="space-y-1">
              <li>시뮬레이션 횟수 : {result.total.simulationTry.toLocaleString()} 회</li>
              <li>성공한 시뮬레이션 : {result.total.simulationSuccess.toLocaleString()} 회</li>
              <li className="text-amber-400">
                일정 소화 성공률 :{' '}
                {truncateToDecimals(
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
                {truncateToDecimals(
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
