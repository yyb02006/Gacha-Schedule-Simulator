'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import BrushBarChart from '#/components/charts/base/BrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
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
  <div class="space-y-3 rounded-xl bg-[#202020] px-4 py-3 shadow-xl shadow-[#141414]">
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
  result,
}: {
  result: GachaSimulationMergedResult | null;
}) {
  return (
    <ChartWrapper
      title={
        <span>
          <span className="text-amber-500">배너별</span> 평균 가챠 성공 시점
        </span>
      }
    >
      {/* 여기는 상위 컴포넌트에서 미리 result가 존재하는지 보고 보내는 게 맞을듯? */}
      {result && result.perBanner[0] ? (
        <BrushBarChart
          labels={Array.from(
            { length: result.perBanner[0].bannerHistograms.length },
            (_, index) => `${index + 1}`,
          )}
          data={result.perBanner[0].bannerHistograms.map((value) => value)}
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
          total={result.perBanner[0].bannerSuccess}
          padding={16}
          tooltipCallback={createTooltipLiteralClosure(result.perBanner[0].bannerHistograms)}
        />
      ) : null}
    </ChartWrapper>
  );
}
