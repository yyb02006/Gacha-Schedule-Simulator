'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { ChartType } from 'chart.js';
import { truncateToDecimals } from '#/libs/utils';
import BrushLineChart from '#/components/charts/base/BrushLineChart';
import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';

export type CreateTooltipLiteral<T extends ChartType> = (
  props: CreateTooltipLiteralProps<T>,
) => string;

const createTooltipLiteral =
  (result: GachaSimulationMergedResult) =>
  ({ title, textColors, body, datasets }: CreateTooltipLiteralProps<'line'>) => {
    const stringifiedValue = datasets[0].formattedValue ?? '';

    const expectedVaule = truncateToDecimals(
      Math.ceil(
        result.perBanner[datasets[0].dataIndex].bannerWinGachaRuns /
          result.perBanner[datasets[0].dataIndex].bannerSuccess,
      ) * 600,
      0,
    );

    return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => `<p style="color: ${textColors[0]}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `<div key={i} class="font-S-CoreDream-300 space-y-[2px] text-sm whitespace-nowrap">
          <p>
            누적 소모 : <span style="color: ${textColors[0]};" class="font-S-CoreDream-500">${stringifiedValue} 합성옥</span>
          </p>
          <p>
            이번 배너 소모 :
            <span style="color: ${textColors[0]};" class="font-S-CoreDream-500">
              ${expectedVaule.toLocaleString()} 합성옥
            </span>
          </p>
        </div>`;
    })
    .join('')}
</div>`;
  };

export default function ExpectedCumulativeConsumption({
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
  return (
    <ChartWrapper
      title={
        <span>
          평균 <span className="text-red-400">누적 소모 합성옥</span>
        </span>
      }
    >
      {result ? (
        <BrushLineChart
          labels={result.perBanner.map(({ name }) => name)}
          data={
            result.perBanner.reduce<{ data: number[]; acc: number }>(
              (acc, current) => {
                const expectedCurrency = truncateToDecimals(
                  Math.ceil(current.bannerWinGachaRuns / current.bannerSuccess) * 600,
                  0,
                );
                acc.acc += expectedCurrency;
                acc.data.push(acc.acc);
                return acc;
              },
              { data: [], acc: 0 },
            ).data
          }
          barChartColors={{
            backgroundColor: '#ff646799',
            borderColor: '#ff6467',
            hoverBackgroundColor: '#fe9a00CC',
            hoverBorderColor: '#fe9a00',
          }}
          brushColor={{
            backgroundColor: '#8e51ffCC',
            borderColor: '#8e51ff',
          }}
          total={result.total.simulationTry}
          padding={16}
          enableBrush={enableBrush}
          chartHeight={chartHeight}
          brushHeight={brushHeight}
          tooltipCallback={createTooltipLiteral(result)}
        />
      ) : null}
    </ChartWrapper>
  );
}
