'use client';

import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';
import ChartWrapper from '#/components/charts/base/ChartWrapper';
import DonutChart from '#/components/charts/base/DonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { safeNumberOrZero, truncateToDecimals } from '#/libs/utils';
import { forwardRef } from 'react';

const createTooltipLiteral = ({
  title,
  textColors,
  body,
  datasets,
  total,
}: CreateTooltipLiteralProps<'doughnut'>) => {
  const dataset = datasets[0];
  const stringifiedValue = datasets[0].formattedValue ?? '';
  const { label, dataIndex, parsed } = dataset;
  const borderColor = (datasets[0].dataset.borderColor as string[])[dataIndex];

  return /*html*/ `
    <div class="space-y-3 rounded-xl bg-[#202020] px-4 py-3 opacity-90 shadow-xl shadow-[#141414]">
      ${title.map((t) => `<p style="color: ${textColors[0]}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
      ${body
        .map((b, i) => {
          return /*html*/ `
          <div class="font-S-CoreDream-300 space-y-[3px] text-sm">
            <p>
              ${label} 확률 :
              <span style="color: ${borderColor};" class="font-S-CoreDream-500">${truncateToDecimals((parsed / (total ?? 1)) * 100)}%</span>
            </p>
            <p>
              ${label}한 시뮬레이션 :
              <span style="color: ${borderColor};" class="font-S-CoreDream-500">${stringifiedValue} 회</span>
            </p>
          </div>
        `;
        })
        .join('')}
    </div>
  `;
};

const createLegendHTML = (labels: string[], colors: string[]) =>
  `<div class="flex flex-wrap gap-y-[6px] gap-x-4 text-sm">${labels
    .map((label, i) => {
      const color = colors[i];
      return `
        <div data-index="${i}" class="flex items-center gap-1 cursor-pointer group">
          <div class="size-2 rounded-full transition-transform group-hover:scale-[120%]"
            style="background:${color}"/></div>
          <span class="text-[#ccc] group-hover:text-[#eaeaea]">${label}</span>
        </div>
      `;
    })
    .join('')}</div>`;

const SimulationResult = forwardRef<
  HTMLDivElement,
  {
    result: GachaSimulationMergedResult | null;
    name: string;
    id?: string;
  }
>(({ result, name, id }, ref) => {
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
      header={
        <span>
          <span className="text-amber-400">시뮬레이션 </span>통계
        </span>
      }
      id={id}
      name={name}
      chartRef={ref}
      className="justify-start"
    >
      {result && (
        <div className="text-sm">
          <DonutChart
            data={simulationResultData}
            labels={simulationResultLabels}
            legendPosition="before"
            borderColor={['#fe9a00', '#ff6467']}
            backgroundColor={['#fe9a00CC', '#ff6467CC']}
            createLegendHTML={createLegendHTML}
            createTooltipLiteral={createTooltipLiteral}
          />
          <div className="font-S-CoreDream-300 space-y-4 px-4 pb-4 text-sm">
            <ul className="space-y-1">
              <li>시뮬레이션 횟수 : {result.total.simulationTry.toLocaleString()} 회</li>
              <li>성공한 시뮬레이션 : {result.total.simulationSuccess.toLocaleString()} 회</li>
              <li className="font-S-CoreDream-400 text-amber-400">
                일정 소화 성공률 :{' '}
                {truncateToDecimals(
                  (result.total.simulationSuccess / result.total.simulationTry) * 100,
                )}
                %
              </li>
            </ul>
            <ul className="space-y-1">
              <li>총 가챠 횟수 : {result.total.totalGachaRuns.toLocaleString()} 회</li>
              <li className="font-S-CoreDream-400 text-amber-400">
                시뮬레이션 당 평균 가챠횟수 :{' '}
                {Math.floor(
                  safeNumberOrZero(result.total.totalGachaRuns / result.total.simulationTry),
                ).toLocaleString()}{' '}
                회
              </li>
            </ul>
            <ul className="space-y-1">
              <li>천장 획득 횟수 : {result.total.pityRewardObtained.toLocaleString()} 회</li>
              <li className="font-S-CoreDream-400 text-amber-400">
                시뮬레이션 당 천장 획득 횟수 :{' '}
                {truncateToDecimals(
                  result.total.pityRewardObtained / result.total.simulationTry,
                ).toLocaleString()}{' '}
                회
              </li>
            </ul>
          </div>
        </div>
      )}
    </ChartWrapper>
  );
});

SimulationResult.displayName = 'SimulationResult';

export default SimulationResult;
