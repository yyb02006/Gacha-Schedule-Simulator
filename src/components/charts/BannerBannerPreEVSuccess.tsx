'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { ChartType } from 'chart.js';
import { safeNumberOrZero, truncateToDecimals } from '#/libs/utils';
import BrushBarChart from '#/components/charts/base/BrushBarChart';
import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';

export type CreateTooltipLiteral<T extends ChartType> = (
  props: CreateTooltipLiteralProps<T>,
) => string;

const createTooltipLiteral =
  (result: GachaSimulationMergedResult) =>
  ({ title, textColors, body, datasets, total }: CreateTooltipLiteralProps<'bar'>) => {
    const dataset = datasets[0];
    const { parsed, dataIndex } = dataset;
    const parsedRawValue = typeof parsed.y === 'number' ? parsed.y : total;

    const { bannerWinGachaRuns, bannerSuccess } = result.perBanner[dataIndex];

    return /*html*/ `
    <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
    ${title.map((t) => `<p style="color: ${textColors[0]}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
    ${body
      .map(() => {
        return /*html*/ `<div key={i} class="font-S-CoreDream-300 space-y-[3px] text-sm whitespace-nowrap">
            <p>
              기대값 도달 전 성공률 :
              <span style="color: ${textColors[0]};" class="font-S-CoreDream-500">
                ${truncateToDecimals((parsedRawValue / total) * 100)}%
              </span>
            </p>
            <p>
              배너 성공률 : <span style="color: ${textColors[0]};" class="font-S-CoreDream-500">${truncateToDecimals((bannerSuccess / total) * 100, 2)}%</span>
            </p>
            <p>
              성공 시 기대값 : <span style="color: ${textColors[0]};" class="font-S-CoreDream-500">${truncateToDecimals(bannerWinGachaRuns / bannerSuccess, 2)} 회</span>
            </p>
          </div>`;
      })
      .join('')}
    </div>`;
  };

const DataProcessor = ({
  result,
  chartHeight,
  brushHeight,
  enableBrush = true,
}: {
  result: GachaSimulationMergedResult;
  chartHeight?: string;
  brushHeight?: string;
  enableBrush?: boolean;
}) => {
  /* // 보정계수 1 (계산된 신뢰도에 보정을 위해 곱해줄 0~1사이의 값)
  // baselineTrialCount을 기준으로 0.9이며 실제 시도횟수가 작아질수록 더 급속히 낮아짐
  const baselineTrialCount = 10000; // 기준 시도횟수
  const k = -Math.log(1 - 0.9) / baselineTrialCount; // 기준 시도횟수에서 보정도 90%가 나오는 k값
  const correction = 1 - Math.exp(-k * result.total.simulationTry); // 실제 시도횟수 기반으로 사용할 보정계수. 시도횟수가 적을수록 보정도가 낮아져서 총 신뢰도가 작아짐 */

  const data = result.perBanner.map(({ bannerWinGachaRuns, bannerSuccess, bannerHistogram }) => {
    const expectedValueIndex = Math.floor(safeNumberOrZero(bannerWinGachaRuns / bannerSuccess));

    const cumulativeToEVIndex = bannerHistogram
      .slice(0, expectedValueIndex + 1)
      .reduce((a, b) => a + b, 0);

    return cumulativeToEVIndex;
  });

  return (
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
      total={result.total.simulationTry}
      padding={16}
      enableBrush={enableBrush}
      isPercentYAxis
      chartHeight={chartHeight}
      brushHeight={brushHeight}
      createTooltipLiteral={createTooltipLiteral(result)}
    />
  );
};

export default function BannerPreEVSuccess({
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
      name="배너별 기대값 도달 전 성공 확률"
      header={
        <span>
          배너별 <span className="text-amber-400">기대값 도달 전 성공 확률</span>
        </span>
      }
    >
      {result ? (
        <DataProcessor
          result={result}
          chartHeight={chartHeight}
          brushHeight={brushHeight}
          enableBrush={enableBrush}
        />
      ) : null}
    </ChartWrapper>
  );
}
