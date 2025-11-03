'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import BrushBarChart from '#/components/charts/base/BrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { TooltipItem } from 'chart.js';
import { truncateToDecimals } from '#/libs/utils';

export interface CreateTooltipLiteralPorps {
  title: string[];
  textColor: string;
  body: {
    before: string[];
    lines: string[];
    after: string[];
  }[];
  data: TooltipItem<'bar'>;
  total: number;
}

export type CreateTooltipLiteral = ({
  title,
  textColor,
  body,
  data,
  total,
}: CreateTooltipLiteralPorps) => string;

const createTooltipLiteral = ({
  title,
  textColor,
  body,
  data,
  total,
}: CreateTooltipLiteralPorps) => {
  const stringifiedValue = data?.formattedValue ?? '';
  const parsedRawValue = typeof data.parsed === 'number' ? data.parsed : total;
  const borderColor = data.dataset.borderColor;

  return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => `<p style="color: ${textColor}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `<div key={i} class="font-S-CoreDream-400 space-y-[2px] text-sm whitespace-nowrap">
          <p>
            배너 성공률 :
            <span style="color: ${borderColor};">
              ${truncateToDecimals((parsedRawValue / total) * 100)}%
            </span>
          </p>
          <p>
            배너 성공 횟수 :<span style="color: ${borderColor};">${stringifiedValue} 회</span>
          </p>
        </div>`;
    })
    .join('')}
</div>`;
};

export default function BannerWinRate({
  result,
  barChartHeight,
  brushHeight,
  enableBrush = true,
}: {
  result: GachaSimulationMergedResult | null;
  barChartHeight?: `h-[${number}px]`;
  brushHeight?: `h-[${number}px]`;
  enableBrush?: boolean;
}) {
  return (
    <ChartWrapper
      title={
        <span>
          <span className="text-amber-400">배너별 </span>성공률
        </span>
      }
    >
      {result ? (
        <BrushBarChart
          labels={result.perBanner.map(({ name }) => name)}
          data={result.perBanner.map(({ bannerSuccess }) => bannerSuccess)}
          barChartColors={{
            backgroundColor: '#fe9a00CC',
            borderColor: '#fe9a00',
            hoverBackgroundColor: '#a684ffCC',
            hoverBorderColor: '#a684ff',
          }}
          brushColor={{
            backgroundColor: '#8e51ffCC',
            borderColor: '#8e51ff',
          }}
          total={result.total.simulationTry}
          padding={16}
          enableBrush={enableBrush}
          isPercentYAxis={true}
          barChartHeight={barChartHeight}
          brushHeight={brushHeight}
          tooltipCallback={createTooltipLiteral}
        />
      ) : null}
    </ChartWrapper>
  );
}
