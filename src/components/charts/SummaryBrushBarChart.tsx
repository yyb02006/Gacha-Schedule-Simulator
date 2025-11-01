'use client';

import BarChart from '#/components/charts/BarChart';
import Brush from '#/components/charts/Brush';
import { TooltipItem } from 'chart.js';
import { useState } from 'react';

interface BrushBarChartProps {
  labels: string[];
  data: number[];
  barChartColors: Record<
    'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
    string | string[]
  >;
  brushColor: Record<'backgroundColor' | 'borderColor', string | string[]>;
  tooltipCallback: (data: TooltipItem<'bar'>, total: number) => string;
}

export default function BrushBarChart({
  labels,
  data,
  barChartColors,
  brushColor,
  tooltipCallback,
}: BrushBarChartProps) {
  const [selection, setSelection] = useState({ start: 0, end: 1 });

  const startIndex = Math.round((data.length - 1) * selection.start);
  const endIndex = Math.round((data.length - 1) * selection.end) + 1;

  const filteredLabels = labels.slice(startIndex, endIndex);
  const filteredData = data.slice(startIndex, endIndex);

  return (
    <div className="space-y-2">
      <BarChart
        labels={filteredLabels}
        data={filteredData}
        colors={barChartColors}
        tooltipCallback={tooltipCallback}
      />
      <Brush
        labels={labels}
        data={data}
        colors={brushColor}
        selection={selection}
        setSelection={setSelection}
      />
    </div>
  );
}
