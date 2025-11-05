import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ChartOptions,
  ChartData,
  LineElement,
  PointElement,
  Decimation,
  Filler,
} from 'chart.js';
import { throttled } from 'chart.js/helpers';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Decimation, Filler);

interface LineChartProps {
  labels: string[];
  data: number[];
  colors: Record<
    'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
    string | string[]
  >;
  total: number;
  startIndex: number;
  endIndex: number;
  padding: number;
  enableBrush: boolean;
  isPercentYAxis: boolean;
  cutoffIndex?: number;
  height?: string;
  tooltipCallback: CreateTooltipLiteral<'line'>;
}

export default function LineChart({
  labels,
  data,
  colors: { backgroundColor, borderColor, hoverBackgroundColor, hoverBorderColor },
  total,
  startIndex,
  endIndex,
  padding,
  enableBrush,
  cutoffIndex,
  isPercentYAxis,
  height,
  tooltipCallback,
}: LineChartProps) {
  const [hasRendered, setHasRendered] = useState(false);
  const chartRef = useRef<ChartJS<'line'>>(null);
  const lastChartId = useRef<string | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const chartThrottledUpdate = useRef(
    throttled(() => {
      if (chartRef.current) chartRef.current.update();
    }, 100),
  ).current;
  const chartThrottledDraw = useRef(
    throttled(() => {
      if (chartRef.current) chartRef.current.draw();
    }, 200),
  ).current;

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: '배너 데이터',
        data,
        backgroundColor,
        borderColor,
        hoverBackgroundColor,
        hoverBorderColor,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 2,
        clip: { left: 0, right: 0, top: 50, bottom: 0 },
        fill: true,
        tension: data.length < 100 ? 0.3 : data.length < 200 ? 0.65 : 1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: !height,
    animation: hasRendered ? { duration: 200 } : false,
    animations: {
      x: {
        duration:
          (cutoffIndex !== undefined && endIndex <= cutoffIndex) || data.length > 500 ? 300 : 1000,
      },
    },
    transitions: {
      active: { animation: { duration: data.length > 20 ? 0 : 50 } },
    },
    layout: {
      padding: { top: padding, left: padding, bottom: enableBrush ? 0 : padding, right: padding },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: { display: false },
      decimation: { enabled: true, algorithm: 'lttb', samples: 100 },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: '#535353',
          drawTicks: false,
        },
        ticks: {
          display: false,
          maxTicksLimit: data.length > 20 ? Math.ceil(data.length / 10) : undefined,
        },
      },
      y: {
        grid: {
          display: false,
          color: '#3c3c3c',
        },
        beginAtZero: true,
        ticks: { maxTicksLimit: 6, color: '#555' },
      },
    },
  };

  return (
    <div className={height}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
