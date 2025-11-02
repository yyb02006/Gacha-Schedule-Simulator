'use client';

import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import {
  Chart as ChartJS,
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
  ScriptableScaleContext,
} from 'chart.js';
import { useEffect, useRef } from 'react';
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
  total: number;
  startIndex: number;
  padding: number;
  tooltipCallback: CreateTooltipLiteral;
}

export default function BarChart({
  labels,
  data,
  colors: { backgroundColor, borderColor, hoverBackgroundColor, hoverBorderColor },
  total,
  startIndex,
  padding,
  tooltipCallback,
}: BarChartProps) {
  const categoryPercentage = data.length < 50 ? 0.7 : data.length < 150 ? 0.8 : 0.9;
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const lastChartId = useRef<string | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);

  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: '배너 데이터',
        data,
        backgroundColor,
        borderColor,
        hoverBackgroundColor,
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
    color: (ctx: ScriptableScaleContext) => {
      return ctx.index === hoveredIndexRef.current ? '#ffb900' : '#666';
    },
  } as const;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    animation: { duration: 200 },
    layout: { padding: { top: padding, left: padding, bottom: 0, right: padding } },
    onHover: (_, elements, chart) => {
      const index = elements[0].index ?? 0;
      if (hoveredIndexRef.current === index) {
        chart.data.datasets[0].hoverBackgroundColor = hoverBackgroundColor;
        chart.data.datasets[0].hoverBorderColor = hoverBorderColor;
      } else {
        chart.data.datasets[0].hoverBackgroundColor = backgroundColor;
        chart.data.datasets[0].hoverBorderColor = borderColor;
      }
      chart.update();
    },
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove', 'mouseenter'],
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        mode: 'index', // x축 "열(column)" 단위로 hover 인식
        intersect: false, // 바 위가 아니라, 그 열 전체 hover 가능
        external: (context) => {
          const { chart, tooltip } = context;
          const chartId = chart.canvas.id;

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
          if (tooltip.opacity === 0 || !tooltip.body || hoveredIndexRef.current === null) {
            tooltipEl.style.opacity = '0';
            lastChartId.current = null;
            return;
          }

          const canvasRect = chart.canvas.getBoundingClientRect();
          const parentRect = canvasParent.getBoundingClientRect();

          // parent 내부 좌표로 변환
          const x = (tooltip.caretX ?? canvasRect.width / 2) + (canvasRect.left - parentRect.left);
          const y = (tooltip.caretY ?? canvasRect.height / 2) + (canvasRect.top - parentRect.top);

          const sameChart = lastChartId.current === chartId;

          tooltipEl.style.transition = sameChart ? 'all 0.1s ease' : 'none';
          tooltipEl.style.left = `${x + 6}px`;
          tooltipEl.style.top = `${y}px`;
          tooltipEl.style.opacity = '1';

          lastChartId.current = chartId;

          // 내용 업데이트
          const title = tooltip.title || [];
          const body = tooltip.body;
          const data = tooltip.dataPoints?.[0];
          const textColor =
            typeof data.dataset.borderColor === 'string' ? data.dataset.borderColor : '#ffb900';

          tooltipEl.innerHTML = tooltipCallback({
            body,
            data,
            textColor,
            title,
            total,
          });
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
                callback: function (_, index) {
                  const step = 10; // 원하는 간격
                  return startIndex === 0 && index === 0
                    ? 1
                    : index === 0
                      ? startIndex + index + 1
                      : index % step === 9
                        ? startIndex + index + 1
                        : '';
                },
              }
            : {
                ...baseTicksProps,
              },
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

  useEffect(() => {
    const canvas = chartRef.current?.canvas;
    const chart = chartRef.current;
    if (!canvas || !chart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const elements = chart.getElementsAtEventForMode(e, 'index', { intersect: false }, false);
      const newIndex = elements.length > 0 ? elements[0].index : null;
      if (hoveredIndexRef.current !== newIndex) {
        hoveredIndexRef.current = newIndex;

        chart.update();
      } else if (!chart.tooltip?.active) {
        chart.tooltip?.setActiveElements(elements, {
          x: e.offsetX,
          y: e.offsetY,
        });
        chart.update();
      }
    };

    const handleMouseLeave = () => {
      if (hoveredIndexRef.current !== null) {
        hoveredIndexRef.current = null;
        chart.update(); // <- 즉시 리렌더 (ticks.color 재평가)
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <Bar ref={chartRef} data={chartData} options={options} plugins={[adaptiveTickSpacing]} />;
}
