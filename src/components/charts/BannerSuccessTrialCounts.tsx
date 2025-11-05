'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import { BannerResult } from '#/components/PickupList';
import { truncateToDecimals } from '#/libs/utils';
import { CreateTooltipLiteralPorps } from '#/components/charts/BannerWinRate';
import { useState } from 'react';
import Brush from '#/components/charts/base/Brush';
import BarChart from '#/components/charts/base/BarChart';

const createTooltipLiteralClosure =
  (originalHistogram: number[]) =>
  ({ title, textColor, body, data, total }: CreateTooltipLiteralPorps) => {
    const stringifiedValue = data?.formattedValue ?? '';
    const rawValue = data.raw as number;
    const sumUpToCurrent = originalHistogram
      .slice(0, data.dataIndex + 1)
      .reduce((a, b) => a + b, 0);

    return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => /*html*/ `<p class="text-lg font-S-CoreDream-500"><span style="color: ${textColor};">${t}</span>차</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `
      <div class="font-S-CoreDream-300 space-y-[2px] text-sm whitespace-nowrap">
        <p>
          현재 차수 성공 횟수 :
          <span style="color: ${textColor};" class="font-S-CoreDream-400">${stringifiedValue} 회</span>
        </p>
        <p>
          현재 차수 비중 :
          <span style="color: ${textColor};" class="font-S-CoreDream-400">${truncateToDecimals((rawValue / total) * 100)}%</span>
        </p>
        <p>
          누적 확률 :
          <span style="color: ${textColor};" class="font-S-CoreDream-400">${truncateToDecimals((sumUpToCurrent / total) * 100)}%</span>
        </p>
      </div>
    `;
    })
    .join('')}
  </div>`;
  };

export default function BannerSuccessTrialCounts({
  bannerResult: {
    name,
    bannerGachaRuns,
    bannerSuccess,
    bannerHistogram,
    cumulativeUntilCutoff,
    successIndexUntilCutoff,
    maxIndex,
    minIndex,
    pityRewardObtained,
  },
  simulationTry,
  barChartHeight,
  brushHeight,
  enableBrush = true,
}: {
  bannerResult: BannerResult;
  simulationTry: number;
  barChartHeight?: string;
  brushHeight?: string;
  enableBrush?: boolean;
}) {
  const padding = 16;
  const cutoffRatio =
    successIndexUntilCutoff !== undefined
      ? successIndexUntilCutoff / (bannerHistogram.length - 1)
      : 1;
  const initialSelectionEnd = bannerHistogram.length > 300 ? cutoffRatio : 1;
  const [selection, setSelection] = useState({
    start: 0,
    end: initialSelectionEnd,
  });
  const labels = Array.from({ length: bannerHistogram.length }, (_, index) => `${index + 1}`);

  const startIndex = Math.round((bannerHistogram.length - 1) * selection.start);
  const endIndex = Math.round((bannerHistogram.length - 1) * selection.end) + 1;

  const filteredLabels = labels.slice(startIndex, endIndex);
  const filteredData = bannerHistogram.slice(startIndex, endIndex);
  return (
    <ChartWrapper
      title={
        <div className="flex items-end gap-3 text-amber-400">
          {name}{' '}
          <div className="font-S-CoreDream-300 text-sm text-[#eaeaea]">
            ( 성공률 :{' '}
            <span className="font-S-CoreDream-500 text-amber-500">
              {truncateToDecimals((bannerSuccess / simulationTry) * 100)}%
            </span>{' '}
            )
          </div>
        </div>
      }
    >
      <div className="font-S-CoreDream-300 flex flex-wrap gap-8 px-4 text-[13px]">
        <div>
          구간 누적 확률 :{' '}
          <span className="font-S-CoreDream-500 text-amber-500">
            {truncateToDecimals((filteredData.reduce((a, b) => a + b, 0) / bannerSuccess) * 100)}%
          </span>
        </div>
        {/* <div>
          성공 횟수 : <span className="font-S-CoreDream-500 text-amber-500">{bannerSuccess}회</span>
        </div> */}
        <div>
          성공 기대값 :{' '}
          <span className="font-S-CoreDream-500 text-amber-500">
            {truncateToDecimals(bannerGachaRuns / bannerSuccess)}회
          </span>
        </div>
        {/* <div>
          천장 도달 횟수 :{' '}
          <span className="font-S-CoreDream-500 text-amber-500">{pityRewardObtained}회</span>
        </div> */}
        <div>
          천장 도달 확률 :{' '}
          <span className="font-S-CoreDream-500 text-amber-500">
            {truncateToDecimals((pityRewardObtained / bannerSuccess) * 100)}%
          </span>
        </div>
        <div>
          최장 성공 차수 :{' '}
          <span className="font-S-CoreDream-500 text-amber-500">{maxIndex + 1}회</span>
        </div>
        <div>
          최단 성공 차수 :{' '}
          <span className="font-S-CoreDream-500 text-amber-500">{minIndex + 1}회</span>
        </div>
      </div>
      <div className="relative space-y-1">
        <BarChart
          labels={filteredLabels}
          data={filteredData}
          colors={{
            backgroundColor: '#fe9a00CC',
            borderColor: '#fe9a00',
            hoverBackgroundColor: '#8e51ffCC',
            hoverBorderColor: '#8e51ff',
          }}
          total={bannerSuccess}
          startIndex={startIndex}
          endIndex={endIndex}
          padding={padding}
          enableBrush={enableBrush}
          cutoffIndex={successIndexUntilCutoff}
          isPercentYAxis={false}
          height={barChartHeight}
          tooltipCallback={createTooltipLiteralClosure(bannerHistogram)}
        />
        {enableBrush && (
          <Brush
            labels={labels}
            data={bannerHistogram}
            colors={{
              backgroundColor: '#8e51ffCC',
              borderColor: '#8e51ff',
            }}
            selection={selection}
            padding={padding}
            cutoffRatio={cutoffRatio}
            cutoffPercentage={cumulativeUntilCutoff / bannerSuccess}
            height={brushHeight}
            setSelection={setSelection}
          />
        )}
      </div>
    </ChartWrapper>
  );
}
