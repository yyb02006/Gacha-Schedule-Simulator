'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { ChartType, TooltipItem } from 'chart.js';
import { truncateToDecimals } from '#/libs/utils';
import BrushBarLineChart from '#/components/charts/base/BrushBarLineChart';
import { BarLineChartData } from '#/components/charts/base/BarLineChart';

export interface CreateTooltipLiteralProps<T extends ChartType> {
  title: string[];
  textColors: string[];
  body: {
    before: string[];
    lines: string[];
    after: string[];
  }[];
  datasets: TooltipItem<T>[];
  total: number;
}

export type CreateTooltipLiteral<T extends ChartType> = (
  props: CreateTooltipLiteralProps<T>,
) => string;

const createTooltipLiteral = ({
  title,
  textColors,
  body,
  datasets,
  total,
}: CreateTooltipLiteralProps<'bar' | 'line'>) => {
  return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => `<p style="color: #ffb900" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `<div key={i} class="font-S-CoreDream-300 space-y-[2px] text-sm whitespace-nowrap">
          <p>
            ${datasets[i].dataset.label} 확률 :
            <span style="color: ${textColors[i]};" class="font-S-CoreDream-500">
              ${truncateToDecimals(((datasets[i].parsed.y !== null ? datasets[i].parsed.y : total) / total) * 100)}%
            </span>
          </p>
          <p>
            ${datasets[i].dataset.label} 횟수 : <span style="color: ${textColors[i]};" class="font-S-CoreDream-500">${datasets[i].parsed.y} 회</span>
          </p>
        </div>`;
    })
    .join('')}
</div>`;
};

const Legend = () => {
  return (
    <div className="font-S-CoreDream-300 flex flex-wrap gap-8 px-4 text-sm">
      <div className="flex items-center gap-x-1 text-sm">
        <div className="size-2 rounded-full bg-[#51a2ff]" />
        도달 성공 확률
      </div>
      <div className="flex items-center gap-x-1 text-sm">
        <div className="size-2 rounded-full bg-[#fe9a00]" />
        일정 중단 확률
      </div>
    </div>
  );
};

export default function GachaSurvivalProbability({
  result,
  chartHeight,
  brushHeight,
  enableBrush = true,
}: {
  result: GachaSimulationMergedResult | null;
  chartHeight?: string;
  brushHeight?: string;
  enableBrush?: boolean;
}) {
  const { labels, datas } = result
    ? result.perBanner.reduce<{
        labels: string[];
        datas: { bar: number[][]; line: number[][] };
      }>(
        (acc, { name, currencyShortageFailure, maxAttemptsFailure, bannerSuccess }) => {
          acc.labels.push(name);
          const safePush = <T,>(arr: T[][], index: number, value: T) => {
            if (arr[index]) {
              arr[index].push(value);
            } else {
              arr[index] = [value];
            }
          };
          safePush(acc.datas.line, 0, bannerSuccess);
          safePush(acc.datas.bar, 0, currencyShortageFailure);
          safePush(acc.datas.bar, 1, maxAttemptsFailure);
          return acc;
        },
        { labels: [], datas: { bar: [], line: [] } },
      )
    : { labels: [], datas: { bar: [], line: [] } };
  const fullDatas: BarLineChartData = {
    bar: [
      {
        label: '재화부족',
        data: datas.bar[0],
        color: {
          backgroundColor: '#ff5e5ecc',
          borderColor: '#ff5e5e',
          hoverBackgroundColor: '#ef4444cc',
          hoverBorderColor: '#ef4444',
        },
      },
      {
        label: '한계도달',
        data: datas.bar[1],
        color: {
          backgroundColor: '#fe9a00cc',
          borderColor: '#fe9a00',
          hoverBackgroundColor: '#e17100cc',
          hoverBorderColor: '#e17100',
        },
      },
    ],
    line: [
      {
        label: '성공',
        data: datas.line[0],
        color: {
          backgroundColor: '#51a2ffcc',
          borderColor: '#51a2ff',
          hoverBackgroundColor: '#155dfccc',
          hoverBorderColor: '#155dfc',
        },
      },
    ],
  };
  return (
    <ChartWrapper
      title={
        <span>
          가챠일정 중 <span className="text-amber-400">도착 / 중단 확률</span>
        </span>
      }
    >
      {result ? (
        <BrushBarLineChart
          labels={labels}
          primaryData={[10000, 9220, 8600, 8500, 7700, 6200, 4300, 3600, 2700, 2000, 1300]}
          fullDatas={{
            line: [
              {
                data: [10000, 9220, 8600, 8500, 7700, 6200, 4300, 3600, 2700, 2000, 1300],
                label: '도달 성공',
                color: {
                  backgroundColor: '#51a2ffcc',
                  borderColor: '#51a2ff',
                  hoverBackgroundColor: '#fe9a00ccc',
                  hoverBorderColor: '#fe9a00',
                },
              },
            ],
            bar: [
              {
                data: [780, 620, 100, 800, 1500, 1900, 700, 900, 700, 700, 0],
                label: '일정 중단',
                color: {
                  backgroundColor: '#fe9a00cc',
                  borderColor: '#fe9a00',
                  hoverBackgroundColor: '#e17100cc',
                  hoverBorderColor: '#e17100',
                },
              },
            ],
          }}
          brushColor={{
            backgroundColor: '#8e51ffCC',
            borderColor: '#8e51ff',
          }}
          total={result.total.simulationTry}
          padding={16}
          enableBrush={enableBrush}
          isPercentYAxis={true}
          chartHeight={chartHeight}
          brushHeight={brushHeight}
          tooltipCallback={createTooltipLiteral}
        >
          <Legend />
        </BrushBarLineChart>
      ) : null}
    </ChartWrapper>
  );
}
