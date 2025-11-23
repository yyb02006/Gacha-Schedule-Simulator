import { Dispatch, ReactNode, RefObject, SetStateAction, useRef } from 'react';
import { Chart as ChartJS, Point } from 'chart.js';
import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import BarLineChart, { BarLineChartData } from '#/components/charts/base/BarLineChart';
import MultiDataBrush from '#/components/charts/base/MultiDataBrush';
import { LegendData } from '#/components/charts/BannerEntryCurrency';
import { safeNumberOrZero } from '#/libs/utils';

interface BrushBarLineChartProps<T extends 'bar' | 'line'> {
  labels: string[];
  primaryData: number[];
  fullDatas: BarLineChartData;
  brushColor: Record<'backgroundColor' | 'borderColor', string | string[]>;
  dispatchRef?: RefObject<Dispatch<SetStateAction<LegendData<T>>> | null>;
  total: number;
  padding: number;
  enableBrush: boolean;
  cutoffIndex?: number;
  cutoffPercentage?: number;
  isPercentYAxis?: boolean;
  chartHeight?: string;
  brushHeight?: string;
  children?: ReactNode;
  createTooltipLiteral: CreateTooltipLiteral<'bar' | 'line'>;
}

export default function BrushBarLineChart({
  labels,
  primaryData,
  fullDatas,
  brushColor,
  total,
  padding,
  enableBrush,
  cutoffIndex,
  cutoffPercentage = 100,
  isPercentYAxis = false,
  chartHeight,
  brushHeight,
  dispatchRef,
  children,
  createTooltipLiteral,
}: BrushBarLineChartProps<'bar' | 'line'>) {
  const mainChartRef = useRef<ChartJS<
    'bar' | 'line',
    (number | [number, number] | null)[] | (number | Point | null)[],
    unknown
  > | null>(null);

  const cutoffRatio =
    cutoffIndex !== undefined ? safeNumberOrZero((cutoffIndex + 1) / primaryData.length) : 1;

  const initialSelectionEnd = primaryData.length > 300 ? cutoffRatio : 1;

  const selection = useRef({
    start: 0,
    end: initialSelectionEnd,
  }).current;
  const selectionIndex = useRef({
    start: 0,
    end: Math.round((primaryData.length - 1) * initialSelectionEnd) + 1,
  }).current;

  return (
    <>
      {children}
      <div className="relative space-y-1">
        <BarLineChart
          labels={labels}
          primaryData={primaryData}
          fullDatas={fullDatas}
          mainChartRef={mainChartRef}
          selectionIndex={selectionIndex}
          total={total}
          padding={padding}
          enableBrush={enableBrush}
          cutoffIndex={cutoffIndex}
          isPercentYAxis={isPercentYAxis}
          height={chartHeight}
          createTooltipLiteral={createTooltipLiteral}
        />
        {enableBrush && (
          <MultiDataBrush
            labels={labels}
            primaryData={primaryData}
            fullDatas={Object.values(fullDatas).flatMap((data) => data.map(({ data }) => data))}
            mainChartRef={mainChartRef}
            selectionIndex={selectionIndex}
            selection={selection}
            colors={brushColor}
            cutoffRatio={cutoffRatio}
            cutoffPercentage={cutoffPercentage}
            padding={padding}
            height={brushHeight}
            dispatchRef={dispatchRef}
            isPercentYAxis={isPercentYAxis}
            total={total}
          />
        )}
      </div>
    </>
  );
}
