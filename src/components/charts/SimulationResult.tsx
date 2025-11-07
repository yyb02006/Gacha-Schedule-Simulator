'use client';

import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';
import ChartWrapper from '#/components/charts/base/ChartWrapper';
import DonutChart from '#/components/charts/base/DonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { truncateToDecimals } from '#/libs/utils';

const tooltip = ({
  title,
  textColor,
  body,
  data,
  total,
}: CreateTooltipLiteralProps<'doughnut'>) => {
  const stringifiedValue = data?.formattedValue ?? '';
  const parsedRawValue = data.parsed;
  const label = data.label;
  const borderColor = (data.dataset.borderColor as string[])[data.dataIndex];

  return /*html*/ `
    <div class="space-y-3 rounded-xl bg-[#202020] px-4 py-3 opacity-90 shadow-xl shadow-[#141414]">
      ${title.map((t) => `<p style="color: ${textColor}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
      ${body
        .map((b, i) => {
          return /*html*/ `
          <div class="font-S-CoreDream-300 space-y-[2px] text-sm">
            <p>
              ${label}한 시뮬레이션 :
              <span style="color: ${borderColor};" class="font-S-CoreDream-500">${stringifiedValue} 회</span>
            </p>
            <p>
              ${label} 확률 :
              <span style="color: ${borderColor};" class="font-S-CoreDream-500">${truncateToDecimals((parsedRawValue / (total ?? 1)) * 100)}%</span>
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
        <div className="p-4 text-sm">
          <DonutChart
            data={simulationResultData}
            labels={simulationResultLabels}
            borderColor={['#fe9a00', '#00a6f4']}
            backgroundColor={['#fe9a00CC', '#00a6f4CC']}
            createLegendHTML={createLegendHTML}
            tooltipCallback={tooltip}
          />
          <div className="font-S-CoreDream-300 space-y-4 text-sm">
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
                  result.total.totalGachaRuns / result.total.simulationTry,
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
      ) : null}
    </ChartWrapper>
  );
}
