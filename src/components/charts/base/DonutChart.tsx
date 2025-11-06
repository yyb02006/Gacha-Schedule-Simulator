'use client';

import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';
import { cls, truncateToDecimals } from '#/libs/utils';
import { doughnutConnectorPlugin } from '#/plugins/chartJsPlugin';
import { Chart as ChartJS, ArcElement, Tooltip, ChartData, ChartOptions } from 'chart.js';
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

export default function DonutChart({
  labels,
  data,
  backgroundColor,
  borderColor,
  legendPosition = 'top',
  createLegendHTML,
  tooltipCallback,
}: {
  labels: string[];
  data: number[];
  backgroundColor: string | string[];
  borderColor: string | string[];
  legendPosition?: 'top' | 'bottom';
  createLegendHTML: (labels: string[], colors: string[], values: number[]) => string;
  tooltipCallback: (data: CreateTooltipLiteralProps<'doughnut'>) => string;
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

    // 데이터 비율 재계산
    const recalcData = () => {
      dataset.data = rawDataRef.current.map((v, i) => {
        return chart.getDataVisibility(i) ? v : 0;
      });
    };

    const labels = chart.data.labels as string[];

    if (labels) {
      // 커스텀 범례 HTML 생성
      const legendHTML = createLegendHTML(labels, colors, dataset.data);
      legendEl.innerHTML = legendHTML;
    }

    // 커스텀 범례 HTML 업데이트
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

    updateLegendState(); // init

    legendEl.querySelectorAll('[data-index]').forEach((el) => {
      el.addEventListener('click', () => {
        const index = Number(el.getAttribute('data-index'));
        const isCurrentDataVisible = chart.getDataVisibility(index);
        const total = dataset.data.reduce((a, b) => a + b, 0);
        const currentData = dataset.data[index];

        if (currentData === total && isCurrentDataVisible) return;

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
  }, [createLegendHTML]);

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
          const chartId = chart.id;

          const canvasParent = chart.canvas.parentElement;
          if (!canvasParent) return;

          let tooltipEl = canvasParent?.querySelector('#custom-tooltip') as HTMLDivElement;
          if (!tooltipEl && canvasParent) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'custom-tooltip';
            tooltipEl.className = 'absolute z-50 pointer-events-none';
            canvasParent.appendChild(tooltipEl);
          }

          // Tooltip 숨김 처리
          if (tooltip.opacity === 0 || !tooltip.body) {
            tooltipEl.style.opacity = '0';
            lastChartId.current = null;
            return;
          }

          const canvasRect = chart.canvas.getBoundingClientRect();
          const parentRect = canvasParent.getBoundingClientRect();

          // parent 내부 좌표로 변환
          const caretX = tooltip.caretX ?? canvasRect.width / 2;
          const caretY = tooltip.caretY ?? canvasRect.height / 2;
          const baseX = caretX + (canvasRect.left - parentRect.left);
          const baseY = caretY + (canvasRect.top - parentRect.top);

          const sameChart = lastChartId.current === chartId;

          // ----- 위치 계산 -----
          const tooltipWidth = tooltipEl.offsetWidth || 140; // 대략 기본 너비
          const tooltipHeight = tooltipEl.offsetHeight || 60;

          const chartWidth = canvasRect.width;
          const chartHeight = canvasRect.height;

          let finalX = baseX + 6; // 기본: 오른쪽
          let finalY = baseY;

          // 오른쪽 공간이 부족하면 왼쪽으로 렌더링
          if (caretX + tooltipWidth + 12 > chartWidth) {
            finalX = baseX - tooltipWidth - 6;
          }

          // 아래쪽 공간이 부족하면 위로 렌더링
          if (caretY + tooltipHeight + 12 > chartHeight) {
            finalY = baseY - tooltipHeight - 6;
          }

          tooltipEl.style.transition = sameChart ? 'all 0.1s ease' : 'none';
          tooltipEl.style.left = `${finalX}px`;
          tooltipEl.style.top = `${finalY}px`;
          tooltipEl.style.opacity = '1';

          lastChartId.current = chartId;

          // 내용 업데이트
          const title = tooltip.title || [];
          const body = tooltip.body;
          const data = tooltip.dataPoints?.[0];
          const textColor = (data.dataset.borderColor as string[])[data.dataIndex];
          const total = data.dataset.data.reduce((a, b) => a + b, 0);

          tooltipEl.innerHTML = tooltipCallback({
            title,
            textColor,
            body,
            data,
            total: total ?? 1,
          });
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
    <div className="relative flex size-full flex-col">
      <div ref={legendRef} className={cls(legendPosition === 'bottom' ? 'order-2' : '')} />
      <div className="-mt-5">
        <Doughnut
          ref={chartRef}
          data={chartData}
          options={options}
          plugins={[doughnutConnectorPlugin()]}
        />
      </div>
    </div>
  );
}
