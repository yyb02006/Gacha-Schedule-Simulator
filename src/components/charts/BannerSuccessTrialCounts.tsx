'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import { BannerResult } from '#/components/PickupList';
import { safeNumberOrZero, truncateToDecimals } from '#/libs/utils';
import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import Brush from '#/components/charts/base/Brush';
import BarChart from '#/components/charts/base/BarChart';
import { Chart as ChartJS } from 'chart.js';
import { LegendData } from '#/components/charts/BannerEntryCurrency';

const createTooltipLiteral =
  (originalHistogram: number[]) =>
  ({ title, textColors, body, datasets, total }: CreateTooltipLiteralProps<'bar'>) => {
    const stringifiedValue = datasets[0].formattedValue ?? '';
    const rawValue = datasets[0].raw as number;
    const sumUpToCurrent = originalHistogram
      .slice(0, datasets[0].dataIndex + 1)
      .reduce((a, b) => a + b, 0);

    return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => /*html*/ `<p class="text-lg font-S-CoreDream-500"><span style="color: ${textColors[0]};">${t}</span>차</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `
      <div class="font-S-CoreDream-300 space-y-[2px] text-sm whitespace-nowrap">
        <p>
          현재 차수 성공 횟수 :
          <span style="color: ${textColors[0]};" class="font-S-CoreDream-400">${stringifiedValue} 회</span>
        </p>
        <p>
          현재 차수 비중 :
          <span style="color: ${textColors[0]};" class="font-S-CoreDream-400">${truncateToDecimals((rawValue / total) * 100)}%</span>
        </p>
        <p>
          누적 확률 :
          <span style="color: ${textColors[0]};" class="font-S-CoreDream-400">${truncateToDecimals((sumUpToCurrent / total) * 100)}%</span>
        </p>
      </div>
    `;
    })
    .join('')}
  </div>`;
  };

const Legend = ({
  data,
  labels,
  bannerSuccess,
  bannerWinGachaRuns,
  pityRewardObtained,
  maxIndex,
  minIndex,
  dispatchRef,
}: {
  data: number[];
  labels: string[];
  bannerSuccess: number;
  bannerWinGachaRuns: number;
  pityRewardObtained: number;
  maxIndex: number;
  minIndex: number;
  dispatchRef: RefObject<Dispatch<SetStateAction<LegendData<'bar'>>> | null>;
}) => {
  const [legendData, setLegendData] = useState<LegendData<'bar'>>({
    chart: null,
    selectionIndex: null,
  });
  const filteredData = data.slice(legendData.selectionIndex?.start, legendData.selectionIndex?.end);
  useEffect(() => {
    dispatchRef.current = setLegendData;
  }, [dispatchRef]);
  return (
    <div className="font-S-CoreDream-300 flex flex-wrap gap-8 px-4 text-[13px]">
      <div>
        구간 누적 확률 :{' '}
        <span className="font-S-CoreDream-500 text-amber-500">
          {truncateToDecimals(
            safeNumberOrZero(filteredData.reduce((a, b) => a + b, 0) / bannerSuccess) * 100,
          )}
          %
        </span>
      </div>
      {/* <div>
    성공 횟수 : <span className="font-S-CoreDream-500 text-amber-500">{bannerSuccess}회</span>
  </div> */}
      <div>
        성공 기대값 :{' '}
        <span className="font-S-CoreDream-500 text-amber-500">
          {truncateToDecimals(bannerWinGachaRuns / bannerSuccess)}회
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
  );
};

export default function BannerSuccessTrialCounts({
  bannerResult: {
    name,
    bannerWinGachaRuns,
    bannerSuccess,
    bannerHistogram,
    cumulativeUntilCutoff,
    successIndexUntilCutoff,
    maxIndex,
    minIndex,
    pityRewardObtained,
  },
  simulationTry,
  chartHeight,
  brushHeight,
  enableBrush = true,
}: {
  bannerResult: BannerResult;
  simulationTry: number;
  chartHeight?: string;
  brushHeight?: string;
  enableBrush?: boolean;
}) {
  const padding = 16;
  const { data, labels } = useRef({
    data: bannerHistogram,
    labels: Array.from({ length: bannerHistogram.length }, (_, index) => `${index + 1}`),
  }).current;
  const mainChartRef = useRef<ChartJS<'bar', (number | [number, number] | null)[], unknown> | null>(
    null,
  );
  const dispatchRef = useRef<Dispatch<SetStateAction<LegendData<'bar'>>>>(null);

  const cutoffRatio =
    successIndexUntilCutoff !== undefined
      ? safeNumberOrZero(successIndexUntilCutoff / (bannerHistogram.length - 1))
      : 1;

  const initialSelectionEnd = data.length > 300 ? cutoffRatio : 1;

  const selection = useRef({
    start: 0,
    end: initialSelectionEnd,
  }).current;
  const selectionIndex = useRef({
    start: 0,
    end: Math.round((data.length - 1) * initialSelectionEnd) + 1,
  }).current;

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
      <Legend
        data={data}
        labels={labels}
        bannerWinGachaRuns={bannerWinGachaRuns}
        bannerSuccess={bannerSuccess}
        dispatchRef={dispatchRef}
        maxIndex={maxIndex}
        minIndex={minIndex}
        pityRewardObtained={pityRewardObtained}
      />
      <div className="relative space-y-1">
        <BarChart
          labels={labels}
          data={data}
          colors={{
            backgroundColor: '#fe9a00CC',
            borderColor: '#fe9a00',
            hoverBackgroundColor: '#8e51ffCC',
            hoverBorderColor: '#8e51ff',
          }}
          selectionIndex={selectionIndex}
          total={bannerSuccess}
          padding={padding}
          enableBrush={enableBrush}
          cutoffIndex={successIndexUntilCutoff}
          height={chartHeight}
          createTooltipLiteral={createTooltipLiteral(bannerHistogram)}
          mainChartRef={mainChartRef}
        />
        {enableBrush && (
          <Brush
            labels={labels}
            data={data}
            mainChartRef={mainChartRef}
            selection={selection}
            selectionIndex={selectionIndex}
            colors={{
              backgroundColor: '#8e51ffCC',
              borderColor: '#8e51ff',
            }}
            padding={padding}
            cutoffRatio={cutoffRatio}
            cutoffPercentage={safeNumberOrZero(cumulativeUntilCutoff / bannerSuccess)}
            height={brushHeight}
            dispatchRef={dispatchRef}
          />
        )}
      </div>
    </ChartWrapper>
  );
}
