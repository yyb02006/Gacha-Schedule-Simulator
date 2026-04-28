import { Dispatch, ReactNode, RefObject, SetStateAction, useRef } from 'react';
import { Chart as ChartJS, Point } from 'chart.js';
import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import MultiChart, { MultiChartData } from '#/components/charts/base/MultiChart';
import MultiDataBrush from '#/components/charts/base/MultiDataBrush';
import { LegendData } from '#/components/charts/BannerEntryCurrency';
import { safeNumberOrZero } from '#/libs/utils';

interface BrushMultiChartProps<T extends 'bar' | 'line'> {
  labels: string[];
  primaryData: number[];
  fullDatas: MultiChartData;
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

export default function BrushMultiChart({
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
}: BrushMultiChartProps<'bar' | 'line'>) {
  const mainChartRef = useRef<ChartJS<
    'bar' | 'line',
    (number | [number, number] | null)[] | (number | Point | null)[],
    unknown
  > | null>(null);

  const cutoffRatio =
    cutoffIndex !== undefined ? safeNumberOrZero((cutoffIndex + 1) / primaryData.length) : 1;

  const initialSelectionEnd = primaryData.length > 300 ? cutoffRatio : 1;

  // ref에서 current 떼고 쓰지 말기 (린트에러 + 전달받을 때 Ref 객체인지 알 수 없음)
  const selectionRef = useRef({
    start: 0,
    end: initialSelectionEnd,
  });
  const selectionIndexRef = useRef({
    start: 0,
    end: Math.round((primaryData.length - 1) * initialSelectionEnd) + 1,
  });

  const sortedFullDatas = [
    ...fullDatas.line.map(({ data }) => data),
    ...fullDatas.bar.map(({ data }) => data),
  ];

  return (
    <>
      {children}
      <div className="relative space-y-1">
        <MultiChart
          labels={labels}
          primaryData={primaryData}
          fullDatas={fullDatas}
          mainChartRef={mainChartRef}
          selectionIndexRef={selectionIndexRef}
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
            fullDatas={sortedFullDatas}
            mainChartRef={mainChartRef}
            selectionIndexRef={selectionIndexRef}
            selectionRef={selectionRef}
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
