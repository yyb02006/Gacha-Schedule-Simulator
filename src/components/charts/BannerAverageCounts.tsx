'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import BrushBarChart from '#/components/charts/base/BrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { truncateToDecimals } from '#/libs/utils';
import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';

const createTooltipLiteral = ({
  title,
  textColor,
  body,
  data,
  total,
}: CreateTooltipLiteralProps<'bar'>) => {
  const stringifiedValue = data?.formattedValue ?? '';
  const rawValue = data.raw as number;

  return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => `<p style="color: ${textColor}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `<div key={i} class="font-S-CoreDream-300 space-y-[2px] text-sm whitespace-nowrap">
          <p>
            성공 시 기대값 : <span style="color: ${textColor};" class="font-S-CoreDream-500">${stringifiedValue} 회</span>
          </p>
          <p>
            배너 비중 :
            <span style="color: ${textColor};" class="font-S-CoreDream-500">
              ${truncateToDecimals((rawValue / total) * 100)}%
            </span>
          </p>
        </div>`;
    })
    .join('')}
</div>`;
};

export default function BannerAverageCounts({
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
  const data = result
    ? result.perBanner.map(({ bannerWinGachaRuns, bannerSuccess }) =>
        truncateToDecimals(bannerWinGachaRuns / bannerSuccess),
      )
    : [];
  return (
    <ChartWrapper
      title={
        <span>
          배너별 <span className="text-amber-400">성공 시 기대값</span>
        </span>
      }
    >
      {result ? (
        <BrushBarChart
          labels={result.perBanner.map(({ name }) => name)}
          data={data}
          barChartColors={{
            backgroundColor: '#fe9a00CC',
            borderColor: '#fe9a00',
            hoverBackgroundColor: '#8e51ffCC',
            hoverBorderColor: '#8e51ff',
          }}
          brushColor={{
            backgroundColor: '#8e51ffCC',
            borderColor: '#8e51ff',
          }}
          total={data.reduce((a, b) => a + b, 0)}
          padding={16}
          enableBrush={enableBrush}
          chartHeight={chartHeight}
          brushHeight={brushHeight}
          tooltipCallback={createTooltipLiteral}
        />
      ) : null}
    </ChartWrapper>
  );
}
