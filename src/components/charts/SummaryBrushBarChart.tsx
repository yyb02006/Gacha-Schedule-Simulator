'use client';

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
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BrushBarChartProps {
  labels: string[];
  data: number[];
  colors: Record<
    'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
    string | string[]
  >;
  tooltipCallback: (data: TooltipItem<'bar'>, total: number) => string;
}

export default function BrushBarChart({
  labels,
  data,
  colors: { backgroundColor, borderColor, hoverBackgroundColor, hoverBorderColor },
  tooltipCallback,
}: BrushBarChartProps) {
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

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: { display: false },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: '#3c3c3c',
        },
        ticks: {
          maxRotation: 25,
          crossAlign: 'center',
          align: 'center',
          padding: -2,
          labelOffset: 6,
        },
        afterFit: (axis) => {
          // 축 박스 높이를 줄여서 라벨이 위로(차트 쪽으로) 붙게 함
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

  return (
    <div className="space-y-2">
      <Bar data={chartData} options={options} />
      <Bar data={chartData} options={options} />
    </div>
  );
}
