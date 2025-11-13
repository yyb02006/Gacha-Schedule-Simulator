'use client';

import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';
import ChartWrapper from '#/components/charts/base/ChartWrapper';
import DonutChart from '#/components/charts/base/DonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { safeNumberOrZero, truncateToDecimals } from '#/libs/utils';
import { forwardRef } from 'react';

const colors = [
  [
    '#ef4444', // red-500
    '#eab308', // amber-500
    '#22c55e', // green-500
    '#00a6f4', // cyan-500
    '#6366f1', // indigo-500
  ],
  [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // amber-500
    '#22c55e', // green-500
    '#14b8a6', // teal-500
    '#00a6f4', // cyan-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
  ],
  [
    '#ef4444', // red-500
    '#fa5959', // red-400
    '#f97316', // orange-500
    '#fb923c', // orange-400
    '#22c55e', // green-500
    '#4ade80', // green-400
    '#14b8a6', // teal-500
    '#2dd4bf', // teal-400
    '#00a6f4', // cyan-500
    '#00bcff', // cyan-400
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#8b5cf6', // purple-500
    '#a78bfa', // purple-400
    '#f472b6', // pink-400
  ],
  [
    '#ef4444', // red-500
    '#fa5959', // red-400
    '#f97316', // orange-500
    '#fb923c', // orange-400
    '#eab308', // amber-500
    '#facc15', // amber-400
    '#22c55e', // green-500
    '#4ade80', // green-400
    '#14b8a6', // teal-500
    '#2dd4bf', // teal-400
    '#00a6f4', // cyan-500
    '#00bcff', // cyan-400
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#6366f1', // indigo-500
    '#818cf8', // indigo-400
    '#8b5cf6', // purple-500
    '#a78bfa', // purple-400
    '#ec4899', // pink-500
    '#f472b6', // pink-400
  ],
];

const createTooltipLiteral = ({
  title,
  body,
  datasets,
  total,
}: CreateTooltipLiteralProps<'doughnut'>) => {
  const dataset = datasets[0];
  const stringifiedValue = datasets[0].formattedValue ?? '';
  const { parsed, dataIndex } = dataset;
  const borderColor = (dataset.dataset.borderColor as string[])[dataIndex];

  return /*html*/ `
    <div class="space-y-3 rounded-xl bg-[#202020] px-4 py-3 opacity-90 shadow-xl shadow-[#141414]">
      ${title.map((t) => `<p style="color: ${borderColor}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
      ${body
        .map((b, i) => {
          return /*html*/ `
          <div class="font-S-CoreDream-300 space-y-[3px] text-sm">
            <p>
              성공 시 기대값 :
              <span style="color: ${borderColor};" class="font-S-CoreDream-500">${truncateToDecimals(Number(stringifiedValue))} 회</span>
            </p>
            <p>
              배너 비중 :
              <span style="color: ${borderColor};" class="font-S-CoreDream-500">${truncateToDecimals((parsed / (total ?? 1)) * 100)}%</span>
            </p>
          </div>
        `;
        })
        .join('')}
    </div>
  `;
};

const createLegendHTML = (labels: string[], colors: string[], values: number[]) => {
  const total = values.reduce((a, b) => a + b, 0);
  return `<div class="flex flex-wrap h-fit gap-y-3 gap-x-12 text-base">${labels
    .map((label, i) => {
      const color = colors[i];
      const percentage = truncateToDecimals((values[i] / total) * 100);
      return `
      <div data-index="${i}" class="flex items-center gap-x-1 cursor-pointer group">
        <div class="size-2 rounded-full transition-transform group-hover:scale-[120%]"
          style="background:${color}"/></div>
        <span class="text-[#ccc] font-S-CoreDream-300 group-hover:text-[#eaeaea]">${label} <span style="color: ${color};" class="font-S-CoreDream-500">(${percentage}%)</span></span>
      </div>
    `;
    })
    .join('')}</div>`;
};

const BannerEVShareRate = forwardRef<
  HTMLDivElement,
  {
    result: GachaSimulationMergedResult | null;
    name: string;
    id: string;
    isColspanTwo: boolean;
  }
>(({ result, name, id, isColspanTwo }, ref) => {
  const bannerResults =
    result !== null
      ? result.perBanner
          .map(({ bannerWinGachaRuns, bannerSuccess, name }) => ({
            data: safeNumberOrZero(bannerWinGachaRuns / bannerSuccess),
            label: name,
          }))
          .sort((a, b) => b.data - a.data)
      : [];
  const { data, labels } = bannerResults.reduce<{ data: number[]; labels: string[] }>(
    (acc, current) => {
      acc.data.push(current.data);
      acc.labels.push(current.label);
      return acc;
    },
    { data: [], labels: [] },
  );
  return (
    <ChartWrapper
      header={
        <span>
          배너별 <span className="text-amber-400">기대값 점유율</span>
        </span>
      }
      id={id}
      name={name}
      chartRef={ref}
      className={isColspanTwo ? 'col-span-2' : ''}
    >
      {result ? (
        <div className="p-4 text-sm">
          <DonutChart
            data={data}
            labels={labels}
            backgroundColor={colors[Math.ceil(result.perBanner.length / 5) - 1].map(
              (HEX) => HEX + 'CC',
            )}
            borderColor={colors[Math.ceil(result.perBanner.length / 5) - 1].map((HEX) => HEX)}
            legendPosition="after"
            createLegendHTML={createLegendHTML}
            createTooltipLiteral={createTooltipLiteral}
            containerClassName="grid grid-cols-[4fr_3fr]"
            legendClassName="flex justify-center items-center"
          />
        </div>
      ) : null}
    </ChartWrapper>
  );
});

BannerEVShareRate.displayName = 'BannerEVShareRate';

export default BannerEVShareRate;
