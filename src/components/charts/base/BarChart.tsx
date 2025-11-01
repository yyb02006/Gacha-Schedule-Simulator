import {
  Chart as ChartJS,
  TooltipItem,
  ChartOptions,
  ChartData,
  CartesianScaleOptions,
  Plugin,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend);

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

export default function BarChart({
  labels,
  data,
  colors: { backgroundColor, borderColor, hoverBackgroundColor, hoverBorderColor },
  tooltipCallback,
}: BarChartProps) {
  const categoryPercentage = data.length < 50 ? 0.7 : data.length < 150 ? 0.8 : 0.9;
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const lastChartId = useRef<string | null>(null);

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
        enabled: false,
        mode: 'index', // x축 "열(column)" 단위로 hover 인식
        intersect: false, // 바 위가 아니라, 그 열 전체 hover 가능
        external: (context) => {
          const { chart, tooltip } = context;
          const chartId = chart.canvas.id;

          let tooltipEl = document.getElementById('custom-tooltip') as HTMLDivElement;
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'custom-tooltip';
            tooltipEl.className = 'absolute z-50 pointer-events-none';
            document.body.appendChild(tooltipEl);
          }

          // Tooltip 숨김 처리
          if (tooltip.opacity === 0 || !tooltip.body) {
            tooltipEl.style.opacity = '0';
            lastChartId.current = null;
            return;
          }

          const rect = chart.canvas.getBoundingClientRect();
          const x = tooltip.caretX ?? rect.width / 2;
          const y = tooltip.caretY ?? rect.height / 2;

          const sameChart = lastChartId.current === chartId;

          // 차트 이동 감지
          tooltipEl.style.transition = sameChart ? 'all 0.1s ease' : 'none';
          tooltipEl.style.left = rect.left + window.scrollX + x + 'px';
          tooltipEl.style.top = rect.top + window.scrollY + y + 'px';
          tooltipEl.style.opacity = '1';

          lastChartId.current = chartId;

          // 내용 업데이트
          const title = tooltip.title || [];
          const body = tooltip.body;

          const data = tooltip.dataPoints?.[0];
          const textColor = data.dataset.borderColor;

          const total = (data.dataset.data as number[]).reduce((a, b) => a + b, 0);

          tooltipEl.innerHTML = `
            <div class="space-y-3 rounded-xl bg-[#202020] px-4 py-3 shadow-xl shadow-[#141414]">
              ${title.map((t) => `<p style="color: ${textColor}" class="text-lg font-S-CoreDream-500">${t}번째 가챠</p>`).join('')}
              ${body
                .map((b, i) => {
                  return tooltipCallback(data, total ?? 1);
                })
                .join('')}
            </div>
          `;
        },
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
}
