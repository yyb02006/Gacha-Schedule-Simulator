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
} from 'chart.js';
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
          axis.height = axis.height > 60 ? 60 : axis.height + 2;
        },
      },
      y: {
        grid: {
          color: '#3c3c3c',
        },
        beginAtZero: true,
        ticks: { maxTicksLimit: 6 },
      },
    },
  };
  return <Bar data={chartData} options={options} />;
};

export default function BrushBarChart({ labels, data, colors, tooltipCallback }: BarChartProps) {
  return (
    <div className="space-y-2">
      <BarChart labels={labels} data={data} colors={colors} tooltipCallback={tooltipCallback} />
      <Brush labels={labels} data={data} colors={colors} />
    </div>
  );
}
