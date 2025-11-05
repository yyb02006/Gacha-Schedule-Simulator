'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { ChartType, TooltipItem } from 'chart.js';
import { truncateToDecimals } from '#/libs/utils';
import Brush from '#/components/charts/base/Brush';
import { useState } from 'react';
import LineChart from '#/components/charts/base/LineChart';

interface BrushLineChartProps {
  labels: string[];
  data: number[];
  barChartColors: Record<
    'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
    string | string[]
  >;
  brushColor: Record<'backgroundColor' | 'borderColor', string | string[]>;
  total: number;
  padding: number;
  enableBrush: boolean;
  cutoffIndex?: number;
  cutoffPercentage?: number;
  isPercentYAxis?: boolean;
  chartHeight?: string;
  brushHeight?: string;
  tooltipCallback: CreateTooltipLiteral<'line'>;
}

const BrushLineChart = ({
  labels,
  data,
  barChartColors,
  brushColor,
  total,
  padding,
  enableBrush,
  cutoffIndex,
  cutoffPercentage = 100,
  isPercentYAxis = false,
  chartHeight,
  brushHeight,
  tooltipCallback,
}: BrushLineChartProps) => {
  const cutoffRatio = cutoffIndex !== undefined ? (cutoffIndex + 1) / data.length : 1;
  const initialSelectionEnd = data.length > 300 ? cutoffRatio : 1;
  const [selection, setSelection] = useState({
    start: 0,
    end: initialSelectionEnd,
  });

  const startIndex = Math.round((data.length - 1) * selection.start);
  const endIndex = Math.round((data.length - 1) * selection.end) + 1;

  const filteredLabels = labels.slice(startIndex, endIndex);
  const filteredData = data.slice(startIndex, endIndex);

  return (
    <div className="relative space-y-1">
      <LineChart
        labels={filteredLabels}
        data={filteredData}
        colors={barChartColors}
        total={total}
        startIndex={startIndex}
        endIndex={endIndex}
        padding={padding}
        enableBrush={enableBrush}
        cutoffIndex={cutoffIndex}
        isPercentYAxis={isPercentYAxis}
        height={chartHeight}
        tooltipCallback={tooltipCallback}
      />
      {enableBrush && (
        <Brush
          labels={labels}
          data={data}
          colors={brushColor}
          selection={selection}
          padding={padding}
          cutoffRatio={cutoffRatio}
          cutoffPercentage={cutoffPercentage}
          isPercentYAxis={isPercentYAxis}
          total={total}
          height={brushHeight}
          setSelection={setSelection}
        />
      )}
    </div>
  );
};

export interface CreateTooltipLiteralProps<T extends ChartType> {
  title: string[];
  textColor: string;
  body: {
    before: string[];
    lines: string[];
    after: string[];
  }[];
  data: TooltipItem<T>;
  total: number;
}

export type CreateTooltipLiteral<T extends ChartType> = ({
  title,
  textColor,
  body,
  data,
  total,
}: CreateTooltipLiteralProps<T>) => string;

const createTooltipLiteral = ({
  title,
  textColor,
  body,
  data,
  total,
}: CreateTooltipLiteralProps<'line'>) => {
  const stringifiedValue = data?.formattedValue ?? '';
  const parsedRawValue = typeof data.parsed === 'number' ? data.parsed : total;

  return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => `<p style="color: ${textColor}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `<div key={i} class="font-S-CoreDream-300 space-y-[2px] text-sm whitespace-nowrap">
          <p>
            배너 성공률 :
            <span style="color: ${textColor};" class="font-S-CoreDream-400">
              ${truncateToDecimals((parsedRawValue / total) * 100)}%
            </span>
          </p>
          <p>
            배너 성공 횟수 :<span style="color: ${textColor};" class="font-S-CoreDream-400">${stringifiedValue} 회</span>
          </p>
        </div>`;
    })
    .join('')}
</div>`;
};

export default function BannerWinRate({
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
      title={
        <span>
          <span className="text-amber-400">배너별 </span>성공률 흐름
        </span>
      }
    >
      {result ? (
        <BrushLineChart
          labels={result.perBanner.map(({ name }) => name)}
          data={result.perBanner.map(({ bannerSuccess }) => bannerSuccess)}
          barChartColors={{
            backgroundColor: '#fe9a0099',
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
          isPercentYAxis={true}
          chartHeight={chartHeight}
          brushHeight={brushHeight}
          tooltipCallback={createTooltipLiteral}
        />
      ) : null}
    </ChartWrapper>
  );
}
