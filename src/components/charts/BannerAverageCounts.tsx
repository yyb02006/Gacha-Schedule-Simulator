'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import BrushBarChart from '#/components/charts/base/BrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { truncateToDecimals } from '#/libs/utils';
import { CreateTooltipLiteralPorps } from '#/components/charts/BannerWinRate';

const createTooltipLiteral = ({
  title,
  textColor,
  body,
  data,
  total,
}: CreateTooltipLiteralPorps) => {
  const stringifiedValue = data?.formattedValue ?? '';
  const rawValue = data.raw as number;
  const borderColor = data.dataset.borderColor;

  return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => `<p style="color: ${textColor}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `<div key={i} class="font-S-CoreDream-400 space-y-[2px] text-sm whitespace-nowrap">
          <p>
            평균 가챠 횟수 :<span style="color: ${borderColor};">${stringifiedValue} 회</span>
          </p>
          <p>
            배너 비중 :
            <span style="color: ${borderColor};">
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
  barChartHeight,
  brushHeight,
  enableBrush = true,
}: {
  result: GachaSimulationMergedResult | null;
  barChartHeight?: `h-[${number}px]`;
  brushHeight?: `h-[${number}px]`;
  enableBrush?: boolean;
}) {
  const data = result
    ? result.perBanner.map(({ bannerGachaRuns, bannerSuccess }) =>
        truncateToDecimals(bannerGachaRuns / bannerSuccess),
      )
    : [];
  return (
    <ChartWrapper
      title={
        <span>
          <span className="text-amber-400">배너별</span> 평균 가챠횟수
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
            hoverBackgroundColor: '#a684ffCC',
            hoverBorderColor: '#a684ff',
          }}
          brushColor={{
            backgroundColor: '#a684ffCC',
            borderColor: '#a684ff',
          }}
          total={data.reduce((a, b) => a + b, 0)}
          padding={16}
          enableBrush={enableBrush}
          barChartHeight={barChartHeight}
          brushHeight={brushHeight}
          tooltipCallback={createTooltipLiteral}
        />
      ) : null}
    </ChartWrapper>
  );
}
