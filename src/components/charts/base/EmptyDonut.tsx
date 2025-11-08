'use client';

import { Chart as ChartJS, ArcElement, Tooltip, ChartData, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

export default function EmptyDonutChart() {
  const chartData: ChartData<'doughnut'> = {
    labels: ['Empty'],
    datasets: [
      {
        label: '시뮬레이션 통계',
        data: [1],
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    rotation: 270,
    circumference: 360,
    responsive: true,
    layout: { padding: 76 },
    cutout: '30%',
    plugins: {
      datalabels: {
        color: '#eaeaea',
        font: { weight: 'bold', size: 15 },
        offset: 10,
        formatter: () => {
          return 'Empty';
        },
        align: () => {
          return 'center';
        },
        anchor: () => {
          return 'center';
        },
      },
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return <Doughnut data={chartData} options={options} className="relative" />;
}
