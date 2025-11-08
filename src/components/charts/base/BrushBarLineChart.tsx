import { useRef } from 'react';
import { Chart as ChartJS, Point } from 'chart.js';
import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import BarLineChart, { BarLineChartData } from '#/components/charts/base/BarLineChart';
import MultiDataBrush from '#/components/charts/base/MultiDataBrush';

interface BrushBarLineChartProps {
  labels: string[];
  primaryData: number[];
  fullDatas: BarLineChartData;
  brushColor: Record<'backgroundColor' | 'borderColor', string | string[]>;
  total: number;
  padding: number;
  enableBrush: boolean;
  cutoffIndex?: number;
  cutoffPercentage?: number;
  isPercentYAxis?: boolean;
  chartHeight?: string;
  brushHeight?: string;
  tooltipCallback: CreateTooltipLiteral<'bar' | 'line'>;
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
  tooltipCallback,
}: BrushBarLineChartProps) {
  const mainChartRef = useRef<ChartJS<
    'bar' | 'line',
    (number | [number, number] | null)[] | (number | Point | null)[],
    unknown
  > | null>(null);

  const cutoffRatio = cutoffIndex !== undefined ? (cutoffIndex + 1) / primaryData.length : 1;

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
        tooltipCallback={tooltipCallback}
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
          isPercentYAxis={isPercentYAxis}
          total={total}
        />
      )}
    </div>
  );
}
