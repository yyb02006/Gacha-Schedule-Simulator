import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  LineElement,
  PointElement,
  Decimation,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

interface BrushProps {
  labels: string[];
  data: number[];
  colors: Record<
    'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
    string | string[]
  >;
}

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Decimation,
  Tooltip,
  Legend,
  Filler,
);

export default function Brush({
  labels,
  data,
  colors: { backgroundColor, borderColor, hoverBackgroundColor, hoverBorderColor },
}: BrushProps) {
  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: '배너 데이터',
        data,
        backgroundColor: hoverBackgroundColor,
        borderColor: hoverBorderColor,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: true,
        tension: data.length < 100 ? 0.3 : data.length < 200 ? 0.65 : 1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: { display: false },
      decimation: { enabled: true, algorithm: 'lttb', samples: 100 },
    },
    scales: {
      x: {
        grid: {
          display: false,
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
          // 축 박스 높이를 줄여서 -padding 보전
          axis.height = axis.height > 60 ? 60 : axis.height + 2;
        },
      },
      y: {
        grid: {
          display: false,
          color: '#3c3c3c',
        },
        beginAtZero: true,
        ticks: { maxTicksLimit: 6 },
      },
    },
  };
  return (
    <div className="h-[100px]">
      <Line data={chartData} options={options} style={{ backgroundColor: '#404040' }} />
    </div>
  );
}
