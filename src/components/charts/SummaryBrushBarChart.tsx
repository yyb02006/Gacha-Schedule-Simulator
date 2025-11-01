'use client';

import Brush from '#/components/charts/Brush';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartOptions,
  ChartData,
  LineElement,
  PointElement,
  CartesianScaleOptions,
  Plugin,
} from 'chart.js';
import { useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const adaptiveTickSpacing: Plugin<'bar'> = {
  id: 'adaptiveTickSpacing',
  afterLayout(chart) {
    const axis = chart.scales.x;
    if (!axis || axis.type !== 'category') return;

    const rotated = axis.labelRotation !== 0;
    const tickOpts = (axis.options as CartesianScaleOptions).ticks;

    const newPadding = rotated ? -2 : 4;
    const newLabelOffset = rotated ? 6 : 0;

    if (tickOpts.padding !== newPadding || tickOpts.labelOffset !== newLabelOffset) {
      tickOpts.padding = newPadding;
      tickOpts.labelOffset = newLabelOffset;
      chart.update('none');
    }
  },
};

interface BarChartProps {
  labels: string[];
  data: number[];
  colors: Record<
    'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
    string | string[]
  >;
  tooltipCallback: (data: TooltipItem<'bar'>, total: number) => string;
}

const BarChart = ({
  labels,
  data,
  colors: { backgroundColor, borderColor, hoverBackgroundColor, hoverBorderColor },
  tooltipCallback,
}: BarChartProps) => {
  const categoryPercentage = data.length < 50 ? 0.7 : data.length < 150 ? 0.8 : 0.9;
  const chartRef = useRef<ChartJS<'bar'>>(null);
  console.log((chartRef.current?.canvas.width ?? 560) / 8);

  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: '배너 데이터',
        data,
        backgroundColor,
        hoverBackgroundColor,
        borderColor,
        hoverBorderColor,
        borderWidth: data.length > 20 ? 0 : 2,
        hoverBorderWidth: 0,
        categoryPercentage,
        maxBarThickness: (chartRef.current?.canvas.width ?? 560) / 8,
        minBarLength: data.length < 50 ? 10 : data.length < 150 ? 5 : 3,
        borderRadius: (context) => {
          const chart = context.chart;
          const meta = chart.getDatasetMeta(context.datasetIndex);
          return meta.vScale ? meta.vScale.width / 6 : 4;
        },
      },
    ],
  };

  const baseTicksProps = {
    maxRotation: 25,
    crossAlign: 'center',
    align: 'center',
    padding: -2,
    labelOffset: 6,
    autoSkip: false,
  } as const;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index', // x축 "열(column)" 단위로 hover 인식
        intersect: false, // 바 위가 아니라, 그 열 전체 hover 가능
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: '#3c3c3c',
        },
        border: { color: '#3c3c3c' },
        ticks:
          data.length > 20
            ? {
                ...baseTicksProps,
                callback:
                  data.length > 20
                    ? function (_, index) {
                        const step = 10; // 원하는 간격
                        return index % step === 0 ? index : '';
                      }
                    : undefined,
              }
            : baseTicksProps,
        afterFit: (axis) => {
          // 축 박스 높이를 줄여서 -padding 보전
          if (!axis || axis.type !== 'category') return;

          const rotated = axis.labelRotation !== 0;

          const compensatedHeight = rotated ? 2 : -4;
          axis.height = axis.height + compensatedHeight;
        },
      },
      y: {
        grid: {
          color: '#3c3c3c',
        },
        border: { color: '#3c3c3c', dash: [4, 4] },
        beginAtZero: true,
        ticks: { maxTicksLimit: 6 },
      },
    },
    interaction: { mode: 'index', intersect: false },
  };

  return <Bar ref={chartRef} data={chartData} options={options} plugins={[adaptiveTickSpacing]} />;
};

export default function BrushBarChart({ labels, data, colors, tooltipCallback }: BarChartProps) {
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
        colors={colors}
        tooltipCallback={tooltipCallback}
      />
      <Brush
        labels={labels}
        data={data}
        colors={{
          backgroundColor: colors.hoverBackgroundColor,
          borderColor: colors.hoverBackgroundColor,
        }}
        selection={selection}
        setSelection={setSelection}
      />
    </div>
  );
}
