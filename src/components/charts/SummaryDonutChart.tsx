'use client';

import { truncateToDecimals } from '#/libs/utils';
import { doughnutConnectorPlugin } from '#/plugins/chartJsPlugin';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  ChartData,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import { useEffect, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

const getLabelPosition = (context: Context, total: number | undefined) => {
  const dataset = context.chart.data.datasets[0].data as number[];
  const data = (context.dataset?.data as (number | null)[]) ?? [];
  const currentValue = data[context.dataIndex] ?? 0;
  const totalizedVaule = total ? total : dataset.reduce((a, b) => a + b, 0);
  const percentage = truncateToDecimals((currentValue / totalizedVaule) * 100);
  return percentage < 5 ? 'end' : 'center';
};

export default function DoughnutChart({
  labels,
  data,
  backgroundColor,
  borderColor,
  tooltipCallback,
}: {
  labels: string[];
  data: number[];
  backgroundColor: string | string[];
  borderColor: string | string[];
  tooltipCallback: (data: TooltipItem<'doughnut'>, total: number) => string;
}) {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const lastChartId = useRef<string | null>(null);
  const rawDataRef = useRef<number[]>([]);
  const chartData: ChartData<'doughnut'> = {
    labels,
    datasets: [
      {
        label: '시뮬레이션 통계',
        data,
        backgroundColor: backgroundColor || [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: borderColor || [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    const chart = chartRef.current;
    const legendEl = legendRef.current;
    if (!chart || !legendEl) return;

    const dataset = chart.data.datasets[0];
    const bg = dataset.borderColor;

    let colors: string[] = [];

    if (Array.isArray(bg)) {
      colors = bg;
    } else if (typeof bg === 'string') {
      colors = [bg];
    } else {
      colors = [];
    }

    // 원본 데이터 저장 (비율 재계산용)
    if (!rawDataRef.current.length) {
      rawDataRef.current = [...(dataset.data as number[])];
    }

    // 커스텀 범례 HTML 생성
    const legendHTML = colors
      .map((color, i) => {
        const label = chart.data.labels?.[i];
        return `
          <div data-index="${i}" class="flex items-center gap-1 cursor-pointer group">
            <div class="size-2 rounded-full transition-transform group-hover:scale-[120%]"
              style="background:${color}"/></div>
            <span class="text-[#ccc] group-hover:text-[#eaeaea]">${label}</span>
          </div>
        `;
      })
      .join('');

    legendEl.innerHTML = legendHTML;

    // 커스텀 범례 HTML 생성
    const updateLegendState = () => {
      legendEl.querySelectorAll('[data-index]').forEach((el) => {
        const index = Number(el.getAttribute('data-index'));
        const visible = chart.getDataVisibility(index);

        if (visible) {
          el.classList.remove('opacity-40');
        } else {
          el.classList.add('opacity-40'); // 비활성화 시 흐리게
        }
      });
    };

    // 데이터 비율 재계산
    const recalcData = () => {
      const visibleMask = rawDataRef.current.map((_, i) => chart.getDataVisibility(i));
      const visibleData = rawDataRef.current.filter((_, i) => visibleMask[i]);
      const visibleTotal = visibleData.reduce((a, b) => a + b, 0);

      dataset.data = rawDataRef.current.map((v, i) => {
        console.log(v, visibleTotal, chart.getDataVisibility(i));
        return chart.getDataVisibility(i) ? v : 0;
      });
    };

    updateLegendState(); // init

    legendEl.querySelectorAll('[data-index]').forEach((el) => {
      el.addEventListener('click', () => {
        const index = Number(el.getAttribute('data-index'));
        chart.toggleDataVisibility(index);
        recalcData();
        updateLegendState();
        chart.update();
      });
    });

    return () => {
      legendEl.querySelectorAll('[data-index]').forEach((el) => {
        el.replaceWith(el.cloneNode(true));
      });
    };
  }, []);

  const options: ChartOptions<'doughnut'> = {
    rotation: 270,
    circumference: 360,
    responsive: true,
    layout: { padding: 60 },
    plugins: {
      tooltip: {
        enabled: false,
        position: 'nearest',
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
          const borderColor = (data.dataset.borderColor as string[])[data.dataIndex];
          const total = data.dataset.data.reduce((a, b) => a + b, 0);

          tooltipEl.innerHTML = `
            <div class="space-y-3 rounded-xl bg-[#202020] px-4 py-3 shadow-xl shadow-[#141414]">
              ${title.map((t) => `<p style="color: ${borderColor}" class="text-lg">${t}</p>`).join('')}
              ${body
                .map((b, i) => {
                  return tooltipCallback(data, total ?? 1);
                })
                .join('')}
            </div>
          `;
        },
      },
      datalabels: {
        color: '#eaeaea',
        font: { weight: 'bold', size: 15 },
        offset: 10,
        formatter: (value, context) => {
          const dataset = context.chart.data.datasets[0].data as number[];
          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
          const totalizedVaule = total ? total : dataset.reduce((a, b) => a + b, 0);
          const percentage = truncateToDecimals((value / totalizedVaule) * 100);
          return percentage > 0 ? `${percentage}%` : null;
        },
        align: (context) => {
          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
          return getLabelPosition(context, total);
        },
        anchor: (context) => {
          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
          return getLabelPosition(context, total);
        },
      },
      legend: {
        display: false,
      },
    },
    cutout: '30%',
  };

  return (
    <div className="relative size-full">
      <Doughnut
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[doughnutConnectorPlugin()]}
      />
      <div ref={legendRef} className="absolute top-0 left-0 flex gap-3 text-sm" />
    </div>
  );
}
