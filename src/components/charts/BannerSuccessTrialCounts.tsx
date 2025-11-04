'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import BrushBarChart from '#/components/charts/base/BrushBarChart';
import { BannerResult } from '#/components/PickupList';
import { stringToNumber, truncateToDecimals } from '#/libs/utils';
import { CreateTooltipLiteralPorps } from '#/components/charts/BannerWinRate';

const createTooltipLiteralClosure =
  (originalHistogram: number[]) =>
  ({ title, textColor, body, data, total }: CreateTooltipLiteralPorps) => {
    const stringifiedValue = data?.formattedValue ?? '';
    const label = data.label;
    const borderColor = data.dataset.borderColor;
    const sumUpToCurrent = originalHistogram
      .slice(0, stringToNumber(data.label))
      .reduce((a, b) => a + b, 0);

    return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => /*html*/ `<p style="color: ${textColor}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `
      <div class="font-S-CoreDream-400 space-y-[2px] text-sm whitespace-nowrap">
        <p>
          ${label}회차 성공 횟수 :
          <span style="color: ${borderColor};">${stringifiedValue} 회</span>
        </p>
        <p>
          누적 성공 비율 :
          <span style="color: ${borderColor};">${truncateToDecimals((sumUpToCurrent / total) * 100)}%</span>
        </p>
      </div>
    `;
    })
    .join('')}
  </div>`;
  };

export default function BannerSuccessTrialCounts({
  bannerResult,
  barChartHeight,
  brushHeight,
  enableBrush = true,
}: {
  bannerResult: BannerResult | null;
  barChartHeight?: string;
  brushHeight?: string;
  enableBrush?: boolean;
}) {
  return (
    <ChartWrapper title={<span className="text-amber-400">{bannerResult?.name}</span>}>
      {bannerResult ? (
        <BrushBarChart
          labels={Array.from(
            { length: bannerResult.bannerHistogram.length },
            (_, index) => `${index + 1}`,
          )}
          data={bannerResult.bannerHistogram.map((value) => value)}
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
          total={bannerResult.bannerSuccess}
          padding={16}
          enableBrush={enableBrush}
          cutoffIndex={bannerResult.successIndexUntilCutoff}
          barChartHeight={barChartHeight}
          brushHeight={brushHeight}
          tooltipCallback={createTooltipLiteralClosure(bannerResult.bannerHistogram)}
        />
      ) : null}
    </ChartWrapper>
  );
}
