'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import BrushBarChart from '#/components/charts/base/BrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { TooltipItem } from 'chart.js';
import { truncateToDecimals } from '#/libs/utils';

const tooltip = (data: TooltipItem<'bar'>, total: number) => {
  const stringifiedValue = data?.formattedValue ?? '';
  const label = data.label;
  const borderColor = data.dataset.borderColor;
  const sumUpToCurrent = (data.dataset.data as number[])
    .slice(0, data.dataIndex + 1)
    .reduce((a, b) => a + b, 0);

  return /*html*/ `
    <div class="font-S-CoreDream-400 space-y-[2px] text-sm">
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
          <span className="text-amber-500">배너별</span> 평균 가챠횟수
        </span>
      }
    >
      {/* 여기는 상위 컴포넌트에서 미리 result가 존재하는지 보고 보내는 게 맞을듯? */}
      {result && result.perBanner[0] ? (
        <BrushBarChart
          labels={Array.from(
            { length: result.perBanner[0].bannerHistograms.length },
            (_, index) => `${index}`,
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
          totalSuccesses={result.perBanner[0].bannerSuccess}
          tooltipCallback={tooltip}
        />
      ) : null}
    </ChartWrapper>
  );
}
