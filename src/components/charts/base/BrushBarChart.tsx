'use client';

import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import BarChart from '#/components/charts/base/BarChart';
import Brush from '#/components/charts/base/Brush';
import { Dispatch, ReactNode, RefObject, SetStateAction, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js';
import { LegendData } from '#/components/charts/BannerEntryCurrency';
import { safeNumberOrZero } from '#/libs/utils';

interface BrushBarChartProps<T extends 'bar' | 'line'> {
  labels: string[];
  data: number[];
  barChartColors: Record<
    'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
    string | string[]
  >;
  brushColor: Record<'backgroundColor' | 'borderColor', string | string[]>;
  dispatchRef?: RefObject<Dispatch<SetStateAction<LegendData<T>>> | null>;
  total: number;
  padding: number;
  enableBrush: boolean;
  children?: ReactNode;
  cutoffIndex?: number;
  cutoffPercentage?: number;
  isPercentYAxis?: boolean;
  chartHeight?: string;
  brushHeight?: string;
  tooltipCallback: CreateTooltipLiteral<'bar'>;
}

export default function BrushBarChart({
  labels,
  data,
  barChartColors,
  brushColor,
  dispatchRef,
  total,
  padding,
  enableBrush,
  children,
  cutoffIndex,
  cutoffPercentage = 100,
  isPercentYAxis = false,
  chartHeight,
  brushHeight,
  tooltipCallback,
}: BrushBarChartProps<'bar'>) {
  const mainChartRef = useRef<ChartJS<'bar', (number | [number, number] | null)[], unknown> | null>(
    null,
  );

  const cutoffRatio =
    cutoffIndex !== undefined ? safeNumberOrZero((cutoffIndex + 1) / data.length) : 1;

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
    <>
      {children}
      <div className="relative space-y-1">
        <BarChart
          labels={labels}
          data={data}
          mainChartRef={mainChartRef}
          selectionIndex={selectionIndex}
          colors={barChartColors}
          total={total}
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
            mainChartRef={mainChartRef}
            selectionIndex={selectionIndex}
            selection={selection}
            dispatchRef={dispatchRef}
            colors={brushColor}
            cutoffRatio={cutoffRatio}
            cutoffPercentage={cutoffPercentage}
            padding={padding}
            height={brushHeight}
            isPercentYAxis={isPercentYAxis}
            total={total}
          />
        )}
      </div>
    </>
  );
}
