'use client';

import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import BarChart from '#/components/charts/base/BarChart';
import Brush from '#/components/charts/base/Brush';
import { useState } from 'react';

interface BrushBarChartProps {
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
  isPercentYAxis?: boolean;
  barChartHeight?: string;
  brushHeight?: string;
  tooltipCallback: CreateTooltipLiteral;
}

export default function BrushBarChart({
  labels,
  data,
  barChartColors,
  brushColor,
  total,
  padding,
  enableBrush,
  cutoffIndex,
  isPercentYAxis = false,
  barChartHeight,
  brushHeight,
  tooltipCallback,
}: BrushBarChartProps) {
  const cutoffRatio = cutoffIndex !== undefined ? cutoffIndex / data.length : 1;
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
      <BarChart
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
        height={barChartHeight}
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
          height={brushHeight}
          setSelection={setSelection}
        />
      )}
    </div>
  );
}
