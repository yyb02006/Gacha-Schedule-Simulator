'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { ChartType, TooltipItem } from 'chart.js';
import { safeNumberOrZero, truncateToDecimals } from '#/libs/utils';
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
      return /*html*/ `<div key={i} class="font-S-CoreDream-300 space-y-[3px] text-sm whitespace-nowrap">
          <p>
            ${datasets[i].dataset.label}${datasets[i].dataset.label === '성공' ? '률' : ' 실패율'} :
            <span style="color: ${textColors[i]};" class="font-S-CoreDream-500">
              ${truncateToDecimals(safeNumberOrZero((datasets[i].parsed.y !== null ? datasets[i].parsed.y : total) / total) * 100)}%
            </span>
          </p>
          <p>
            ${datasets[i].dataset.label === '성공' ? '성공' : '실패'} 횟수 : <span style="color: ${textColors[i]};" class="font-S-CoreDream-500">${datasets[i].parsed.y?.toLocaleString()} 회</span>
          </p>
        </div>`;
    })
    .join('')}
</div>`;
};

const Legend = ({
  isCurrencyBarOff,
  isLimitBarOff,
}: {
  isCurrencyBarOff: boolean;
  isLimitBarOff: boolean;
}) => {
  return (
    <div className="font-S-CoreDream-300 flex flex-wrap gap-4 px-4 text-sm">
      <div className="flex items-center gap-x-1 text-sm">
        <div className="size-2 rounded-full bg-[#51a2ff]" />
        성공
      </div>
      {isCurrencyBarOff || (
        <div className="flex items-center gap-x-1 text-sm">
          <div className="size-2 rounded-full bg-[#ff5e5e]" />
          재화부족
        </div>
      )}
      {isLimitBarOff || (
        <div className="flex items-center gap-x-1 text-sm">
          <div className="size-2 rounded-full bg-[#fe9a00]" />
          최대 시도 횟수 도달
        </div>
      )}
    </div>
  );
};

export default function BannerWinRate({
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
        label: '성공',
        data: datas.line[0],
        color: {
          backgroundColor: '#51a2ffcc',
          borderColor: '#51a2ff',
          hoverBackgroundColor: '#2b7fffcc',
          hoverBorderColor: '#2b7fff',
        },
      },
      ...(!result?.total.isTrySim
        ? [
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
          ]
        : []),
      ...(!result?.total.isSimpleMode
        ? [
            {
              label: '횟수부족',
              data: datas.bar[1],
              color: {
                backgroundColor: '#fe9a00cc',
                borderColor: '#fe9a00',
                hoverBackgroundColor: '#e17100cc',
                hoverBorderColor: '#e17100',
              },
            },
          ]
        : []),
    ],
    line: [],
  };
  /* const dummy = {
    line: [],
    bar: [
      {
        data: [6700, 9200, 5600, 3100, 8700, 1600, 2800, 9000, 10000, 4400, 8500],
        label: '성공',
        color: {
          backgroundColor: '#51a2ffcc',
          borderColor: '#51a2ff',
          hoverBackgroundColor: '#2b7fffcc',
          hoverBorderColor: '#2b7fff',
        },
      },
      {
        data: [2000, 600, 300, 5000, 1000, 6000, 5000, 500, 0, 2600, 1000],
        label: '재화부족',
        color: {
          backgroundColor: '#ff5e5ecc',
          borderColor: '#ff5e5e',
          hoverBackgroundColor: '#ef4444cc',
          hoverBorderColor: '#ef4444',
        },
      },
      {
        data: [1300, 200, 4100, 1900, 300, 2400, 2200, 500, 0, 3000, 500],
        label: '횟수부족',
        color: {
          backgroundColor: '#fe9a00cc',
          borderColor: '#fe9a00',
          hoverBackgroundColor: '#e17100cc',
          hoverBorderColor: '#e17100',
        },
      },
    ],
  }; */
  return (
    <ChartWrapper
      title={
        <span>
          배너별 <span className="text-amber-400">성공 / 실패 비율</span>
        </span>
      }
    >
      {result ? (
        <BrushBarLineChart
          labels={labels}
          primaryData={[6700, 9200, 5600, 3100, 8700, 1600, 2800, 9000, 10000, 4400, 8500]}
          fullDatas={fullDatas}
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
          createTooltipLiteral={createTooltipLiteral}
        >
          <Legend
            isCurrencyBarOff={result?.total.isTrySim}
            isLimitBarOff={result?.total.isSimpleMode}
          />
        </BrushBarLineChart>
      ) : null}
    </ChartWrapper>
  );
}
