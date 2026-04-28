import Brush from '#/components/charts/base/Brush';
import { useRef } from 'react';
import LineChart from '#/components/charts/base/LineChart';
import { Chart as ChartJS, Point } from 'chart.js';
import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import { safeNumberOrZero } from '#/libs/utils';

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
  createTooltipLiteral: (
    selectionIndexRef: React.RefObject<{
      start: number;
      end: number;
    }>,
  ) => CreateTooltipLiteral<'line'>;
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
  createTooltipLiteral,
}: BrushLineChartProps) {
  const mainChartRef = useRef<ChartJS<'line', (number | Point | null)[], unknown> | null>(null);

  const cutoffRatio =
    cutoffIndex !== undefined ? safeNumberOrZero((cutoffIndex + 1) / data.length) : 1;

  const initialSelectionEnd = data.length > 300 ? cutoffRatio : 1;

  // ref에서 current 떼고 쓰지 말기 (린트에러 + 전달받을 때 Ref 객체인지 알 수 없음)
  const selectionRef = useRef({
    start: 0,
    end: initialSelectionEnd,
  });
  const selectionIndexRef = useRef({
    start: 0,
    end: Math.round((data.length - 1) * initialSelectionEnd) + 1,
  });

  return (
    <div className="relative space-y-1">
      <LineChart
        labels={labels}
        data={data}
        mainChartRef={mainChartRef}
        selectionIndexRef={selectionIndexRef}
        colors={barChartColors}
        total={total}
        padding={padding}
        enableBrush={enableBrush}
        cutoffIndex={cutoffIndex}
        isPercentYAxis={isPercentYAxis}
        height={chartHeight}
        // eslint-disable-next-line react-hooks/refs
        createTooltipLiteral={createTooltipLiteral(selectionIndexRef)}
      />
      {enableBrush && (
        <Brush
          labels={labels}
          data={data}
          mainChartRef={mainChartRef}
          selectionIndexRef={selectionIndexRef}
          selectionRef={selectionRef}
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
