'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import BrushBarChart from '#/components/charts/base/BrushBarChart';
import { BannerResult, GachaSimulationMergedResult } from '#/components/PickupList';
import { truncateToDecimals } from '#/libs/utils';
import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';

const createTooltipLiteral =
  (bannerResults: BannerResult[]) =>
  ({ title, textColor, body, data }: CreateTooltipLiteralProps<'bar'>) => {
    const stringifiedValue = data?.formattedValue ?? '';

    return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => `<p style="color: ${textColor}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `<div key={i} class="font-S-CoreDream-300 space-y-[2px] text-sm whitespace-nowrap">
          <p>
            진입 시 합성옥 : <span style="color: ${textColor};" class="font-S-CoreDream-500">${stringifiedValue} 합성옥</span>
          </p>
          <p>
            소모 합성옥 :
            <span style="color: ${textColor};" class="font-S-CoreDream-500">
              ${truncateToDecimals(bannerResults[data.dataIndex].bannerWinGachaRuns / bannerResults[data.dataIndex].bannerSuccess, 0) * 600} 합성옥
            </span>
          </p>
          <p>
            누적 소모 합성옥 :
            <span style="color: ${textColor};" class="font-S-CoreDream-500">
              ${
                truncateToDecimals(
                  bannerResults
                    .slice(0, data.dataIndex + 1)
                    .reduce((a, b) => a + b.bannerWinGachaRuns / b.bannerSuccess, 0),
                  0,
                ) * 600
              } 합성옥
            </span>
          </p>
        </div>`;
    })
    .join('')}
  </div>`;
  };

export default function BannerEntryCurrency({
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
  // 헤더 : 누적 소모 합성옥, 남은 합성옥, 툴팁: 진입시 합성옥, 소모 합성옥, 누적 소모 합성옥,
  const data = result
    ? result.perBanner.map(({ bannerStartingCurrency }) => bannerStartingCurrency)
    : [];
  return (
    <ChartWrapper
      title={
        <span>
          배너별 <span className="text-amber-400">진입 시 평균 재화</span>
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
          tooltipCallback={createTooltipLiteral(result.perBanner)}
        />
      ) : null}
    </ChartWrapper>
  );
}
