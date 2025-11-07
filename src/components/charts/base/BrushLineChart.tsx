import Brush from '#/components/charts/base/Brush';
import { useRef } from 'react';
import LineChart from '#/components/charts/base/LineChart';
import { Chart as ChartJS, Point } from 'chart.js';
import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';

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

export default function BrushLineChart({
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
}: BrushLineChartProps) {
  const mainChartRef = useRef<ChartJS<'line', (number | Point | null)[], unknown> | null>(null);

  const cutoffRatio = cutoffIndex !== undefined ? (cutoffIndex + 1) / data.length : 1;

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
    <div className="relative space-y-1">
      <LineChart
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
