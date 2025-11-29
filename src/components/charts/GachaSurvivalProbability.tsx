'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { ChartType } from 'chart.js';
import { truncateToDecimals } from '#/libs/utils';
import BrushMultiChart from '#/components/charts/base/BrushMultiChart';
import { MultiChartData } from '#/components/charts/base/MultiChart';
import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';
import { forwardRef } from 'react';

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
    .map((_, i) => {
      return /*html*/ `<div key={i} class="font-S-CoreDream-300 space-y-[3px] text-sm whitespace-nowrap">
        <p>
          ${datasets[i].dataset.label === '중단' ? '이 배너에서 중단될' : datasets[i].dataset.label} 확률 :
          <span style="color: ${textColors[i]};" class="font-S-CoreDream-500">
            ${truncateToDecimals(((datasets[i].parsed.y !== null ? datasets[i].parsed.y : total) / total) * 100)}%
          </span>
        </p>
        <p>
          ${datasets[i].dataset.label === '중단' ? '이 배너에서 중단된' : datasets[i].dataset.label} 횟수 : <span style="color: ${textColors[i]};" class="font-S-CoreDream-500">${datasets[i].parsed.y?.toLocaleString()} 회</span>
        </p>
      </div>`;
    })
    .join('')}
</div>`;
};

const Legend = () => {
  return (
    <div className="font-S-CoreDream-300 flex flex-wrap gap-4 px-4 text-sm">
      <div className="flex items-center gap-x-1 text-sm">
        <div className="size-2 rounded-full bg-[#51a2ff]" />
        도달
      </div>
      <div className="flex items-center gap-x-1 text-sm">
        <div className="size-2 rounded-full bg-[#ff6467]" />
        중단
      </div>
    </div>
  );
};

const GachaSurvivalProbability = forwardRef<
  HTMLDivElement,
  {
    result: GachaSimulationMergedResult | null;
    name?: string;
    id?: string;
    chartHeight?: string;
    brushHeight?: string;
    enableBrush?: boolean;
  }
>(({ result, name, id, chartHeight, brushHeight, enableBrush = true }, ref) => {
  const { labels, datas } = result
    ? result.perBanner.reduce<{
        labels: string[];
        datas: { failure: number[][]; success: number[][] };
      }>(
        (acc, { name, currencyShortageFailure, maxAttemptsFailure, actualEntryCount }) => {
          acc.labels.push(name);

          const safePush = <T,>(arr: T[][], index: number, value: T) => {
            if (arr[index]) {
              arr[index].push(value);
            } else {
              arr[index] = [value];
            }
          };
          safePush(acc.datas.success, 0, actualEntryCount);
          safePush(
            acc.datas.failure,
            0,
            result.total.bannerFailureAction === 'interruption'
              ? currencyShortageFailure + maxAttemptsFailure
              : 0,
          );
          return acc;
        },
        { labels: [], datas: { failure: [], success: [] } },
      )
    : { labels: [], datas: { failure: [], success: [] } };
  // bar와 line의 앞 뒤 순서는 중요하지 않지만, 성공 데이터가 가장 앞에 있어야 함
  const fullDatas: MultiChartData = {
    line: [
      {
        label: '도달 성공',
        data: datas.success[0],
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
        label: '중단',
        data: datas.failure[0],
        color: {
          backgroundColor: '#ff6467CC',
          borderColor: '#ff6467',
          hoverBackgroundColor: '#8e51ffcc',
          hoverBorderColor: '#8e51ff',
        },
      },
    ],
  };

  return (
    <ChartWrapper
      header={
        <span>
          가챠배너 <span className="text-amber-400">도달 / 중단 확률</span>
        </span>
      }
      id={id}
      name={name}
      chartRef={ref}
    >
      {result ? (
        <BrushMultiChart
          labels={labels}
          primaryData={datas.success[0]}
          fullDatas={fullDatas}
          brushColor={{
            backgroundColor: '#8e51ffCC',
            borderColor: '#8e51ff',
          }}
          total={result.total.simulationTry}
          padding={16}
          enableBrush={enableBrush}
          isPercentYAxis
          chartHeight={chartHeight}
          brushHeight={brushHeight}
          createTooltipLiteral={createTooltipLiteral}
        >
          <Legend />
        </BrushMultiChart>
      ) : null}
    </ChartWrapper>
  );
});

GachaSurvivalProbability.displayName = 'GachaSurvivalProbability';

export default GachaSurvivalProbability;
