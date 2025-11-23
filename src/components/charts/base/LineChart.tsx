'use client';

import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import { TooltipCallback } from '#/components/charts/base/BarChart';
import { useIsMount } from '#/hooks/useIsMount';
import { cls, truncateToDecimals } from '#/libs/utils';
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
  TooltipModel,
  CartesianScaleOptions,
  Plugin,
  Point,
} from 'chart.js';
import { throttled } from 'chart.js/helpers';
import { RefObject, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Decimation, Filler);

const adaptiveTickSpacing: Plugin<'line'> = {
  id: 'adaptiveTickSpacing',
  beforeBuildTicks(chart) {
    const axis = chart.scales.x;
    if (!axis || axis.type !== 'category') return;

    const rotated = axis.labelRotation !== 0;
    const tickOpts = (axis.options as CartesianScaleOptions).ticks;

    const newPadding = rotated ? 0 : 4;
    const newLabelOffset = rotated ? 6 : 0;

    if (tickOpts.padding !== newPadding || tickOpts.labelOffset !== newLabelOffset) {
      tickOpts.padding = newPadding;
      tickOpts.labelOffset = newLabelOffset;
    }
  },
};

const externalTooltipHandler =
  ({
    lastChartId,
    hoveredIndexRef,
    total,
    createTooltipLiteral,
  }: {
    lastChartId: RefObject<string | null>;
    hoveredIndexRef: RefObject<number | null>;
    total: number;
    createTooltipLiteral: TooltipCallback<'line'>;
  }) =>
  (context: { chart: ChartJS; tooltip: TooltipModel<'line'> }) => {
    const { chart, tooltip } = context;
    const chartId = chart.id;
    const canvasParent = chart.canvas.parentElement;
    if (!canvasParent) return;

    let tooltipEl = canvasParent.querySelector('#custom-tooltip') as HTMLDivElement;
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'custom-tooltip';
      tooltipEl.className = 'absolute z-50 pointer-events-none';
      canvasParent.appendChild(tooltipEl);
    }

    if (tooltip.opacity === 0 || !tooltip.body) {
      tooltipEl.style.opacity = '0';
      lastChartId.current = null;
      return;
    }

    if (hoveredIndexRef.current === null && tooltip.dataPoints.length > 0) {
      hoveredIndexRef.current = tooltip.dataPoints[0].dataIndex;
    }

    const canvasRect = chart.canvas.getBoundingClientRect();
    const parentRect = canvasParent.getBoundingClientRect();
    const caretX = tooltip.caretX ?? canvasRect.width / 2;
    const caretY = tooltip.caretY ?? canvasRect.height / 2;
    const baseX = caretX + (canvasRect.left - parentRect.left);
    const baseY = caretY + (canvasRect.top - parentRect.top);

    const sameChart = lastChartId.current === chartId;
    const tooltipWidth = tooltipEl.offsetWidth || 140;
    const tooltipHeight = tooltipEl.offsetHeight || 60;
    let finalX = baseX + 6;
    let finalY = baseY + 6;

    if (caretX + tooltipWidth + 12 > canvasRect.width) finalX = canvasRect.width - tooltipWidth - 6;

    if (caretY + tooltipHeight - 80 > canvasRect.height) {
      finalY = canvasRect.height - tooltipHeight + 80;
    }

    tooltipEl.style.transition = sameChart ? 'all 0.1s ease' : 'none';
    tooltipEl.style.left = `${finalX}px`;
    tooltipEl.style.top = `${finalY}px`;
    tooltipEl.style.opacity = '1';
    lastChartId.current = chartId;

    // 내용 업데이트
    const title = tooltip.title || [];
    const body = tooltip.body;
    const dataPoints = tooltip.dataPoints;
    const textColors = dataPoints.map((dataPoint) =>
      dataPoint.dataset.borderColor === 'string' ? dataPoint.dataset.borderColor : '#ffb900',
    );

    tooltipEl.innerHTML = createTooltipLiteral({
      body,
      datasets: dataPoints,
      textColors,
      title,
      total,
    });
  };

interface LineChartProps {
  labels: string[];
  data: number[];
  colors: Record<
    'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
    string | string[]
  >;
  mainChartRef: RefObject<ChartJS<'line', (number | Point | null)[], unknown> | null>;
  selectionIndex: {
    start: number;
    end: number;
  };
  total: number;
  padding: number;
  enableBrush: boolean;
  isPercentYAxis: boolean;
  cutoffIndex?: number;
  height?: string;
  createTooltipLiteral: CreateTooltipLiteral<'line'>;
}

export default function LineChart({
  labels,
  data,
  colors: { backgroundColor, borderColor, hoverBackgroundColor, hoverBorderColor },
  mainChartRef,
  selectionIndex,
  total,
  padding,
  enableBrush,
  isPercentYAxis,
  cutoffIndex,
  height,
  createTooltipLiteral,
}: LineChartProps) {
  const isMount = useIsMount();
  const chartRef = useRef<ChartJS<'line'>>(null);
  const lastChartId = useRef<string | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const {
    current: { stepGap },
  } = useRef({ stepGap: 10 });
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
        type: 'line',
        label: '배너 데이터',
        data,
        backgroundColor,
        borderColor,
        hoverBackgroundColor,
        hoverBorderColor,
        borderWidth: 3,
        pointHoverBorderWidth: 6,
        pointRadius: 3,
        pointHoverRadius: 3,
        pointBackgroundColor: borderColor,
        pointStyle: 'circle',
        clip: { left: 6, right: 6, top: 50, bottom: 0 },
        fill: true,
        tension: data.length <= 20 ? 0.2 : data.length < 100 ? 0.3 : data.length < 200 ? 0.65 : 1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: !height,
    animation: isMount ? { duration: 200 } : false,
    animations: {
      x: {
        duration: (ctx) => {
          const isOverLength =
            cutoffIndex && ctx.dataset.data.length >= 500 && ctx.dataset.data.length > cutoffIndex;
          return isOverLength ? 400 : 200;
        },
      },
    },
    transitions: {
      active: { animation: { duration: data.length > 20 ? 0 : 200 } },
    },
    layout: {
      padding: { top: padding, left: padding, bottom: enableBrush ? 0 : padding, right: padding },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        mode: 'index', // x축 "열(column)" 단위로 hover 인식
        intersect: false, // 바 위가 아니라, 그 열 전체 hover 가능
        external: externalTooltipHandler({
          hoveredIndexRef,
          lastChartId,
          total,
          createTooltipLiteral,
        }),
      },
      datalabels: { display: false },
      decimation: { enabled: true, algorithm: 'lttb', samples: 100 },
    },
    scales: {
      x: {
        grid: {
          color: '#3c3c3c',
          lineWidth: 1,
          tickWidth: 0,
        },
        border: { color: '#3c3c3c' },
        ticks: {
          maxRotation: 25,
          crossAlign: 'center',
          align: 'inner',
          autoSkip: false,
          font: { family: 'S-CoreDream-300', size: 11 },
          color: (ctx) => (ctx.index === hoveredIndexRef.current ? '#ffb900' : '#666'),
          callback: (value, index) => {
            const isValueSring = typeof value === 'string';
            const gapMultiplier = Math.min(Math.ceil(data.length / 199), 10);
            if (data.length > 20) {
              return selectionIndex.start === 0 && index === 0
                ? 1
                : index === 0 || index % (stepGap * gapMultiplier) === stepGap * gapMultiplier - 1
                  ? selectionIndex.start + index + 1
                  : '';
            } else {
              return isValueSring ? value : labels[value];
            }
          },
        },
        afterFit: (scale) => {
          // 축 박스 높이를 줄여서 -padding 보전
          if (!scale || scale.type !== 'category') return;

          const rotated = scale.labelRotation !== 0;

          const compensatedHeight = rotated ? 0 : -4;
          scale.height = scale.height + compensatedHeight;
        },
      },
      y: {
        grid: {
          color: '#3c3c3c',
        },
        border: { color: '#3c3c3c', dash: [4, 4] },
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 6,
          font: { family: 'S-CoreDream-300', size: 12 },
          callback: (value) => {
            return typeof value === 'number' && isPercentYAxis
              ? `${truncateToDecimals((value / total) * 100, 1)}%`
              : value;
          },
        },
      },
    },
    interaction: { mode: 'index', intersect: false },
  };

  useEffect(() => {
    const canvas = chartRef.current?.canvas;
    const chart = chartRef.current;
    if (!canvas || !chart) return;
    const dataset = chart.data.datasets[0];

    const handlePointerMove = (e: PointerEvent | TouchEvent) => {
      const elements = chart.getElementsAtEventForMode(e, 'index', { intersect: false }, false);
      const newIndex = elements.length > 0 ? elements[0].index : null;
      if (hoveredIndexRef.current === null && hoveredIndexRef.current !== newIndex) {
        // Enter
        dataset.hoverBackgroundColor = hoverBackgroundColor;
        dataset.hoverBorderColor = hoverBorderColor;
        if (dataset.type === 'line') {
          dataset.pointHoverBorderWidth = 6;
        }
        hoveredIndexRef.current = newIndex;
        chart.update();
      } else if (newIndex !== null && hoveredIndexRef.current !== newIndex) {
        // Move
        hoveredIndexRef.current = newIndex;
        if (data.length > 20) {
          chartThrottledDraw();
        } else {
          chartThrottledUpdate();
        }
        hoveredIndexRef.current = newIndex;
      } else if (newIndex === null && hoveredIndexRef.current !== newIndex) {
        // Leave
        dataset.hoverBackgroundColor = backgroundColor;
        dataset.hoverBorderColor = borderColor;
        if (dataset.type === 'line') {
          dataset.pointHoverBorderWidth = 3;
        }
        hoveredIndexRef.current = newIndex;
        chart.tooltip?.setActiveElements(elements, {
          x: null,
          y: null,
        });
        chart.update();
      }
    };

    const handlePointerLeave = () => {
      if (hoveredIndexRef.current !== null) {
        hoveredIndexRef.current = null;
        chart.update(); // <- 즉시 리렌더 (ticks.color 재평가)
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('touchmove', handlePointerMove);
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('touchmove', handlePointerMove);
    };
  }, [
    chartThrottledUpdate,
    chartThrottledDraw,
    backgroundColor,
    borderColor,
    hoverBackgroundColor,
    hoverBorderColor,
    data.length,
  ]);

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      if (!chartRef.current) return;
      const canvas = chartRef.current.canvas;
      const chart = chartRef.current;

      const canvasRect = canvas.getBoundingClientRect();

      const { chartArea } = chart;

      const rect = {
        top: canvasRect.top + chartArea.top,
        bottom: canvasRect.top + chartArea.bottom,
        left: canvasRect.left + chartArea.left,
        right: canvasRect.right + chartArea.right,
      };

      if (canvasRect.width === 0 || canvasRect.height === 0) return;

      const touch = e.touches[0];

      const touchX = touch.clientX;
      const touchY = touch.clientY;

      const isInsideCanvas =
        touchX >= rect.left && touchX <= rect.right && touchY >= rect.top && touchY <= rect.bottom;

      if (!isInsideCanvas) {
        // 캔버스 밖 터치 감지
        hoveredIndexRef.current = null;

        chart.data.datasets[0].hoverBackgroundColor = backgroundColor;
        chart.data.datasets[0].hoverBorderColor = borderColor;

        const tooltipEl = canvas.parentElement?.querySelector('#custom-tooltip') as HTMLElement;
        if (tooltipEl) tooltipEl.style.opacity = '0';

        if (chartRef.current.tooltip) {
          chartRef.current.tooltip.setActiveElements([], { x: 0, y: 0 });
          chartRef.current.update();
        }
      } else {
        // 캔버스 안 터치 감지
        chart.data.datasets[0].hoverBackgroundColor = hoverBackgroundColor;
        chart.data.datasets[0].hoverBorderColor = hoverBorderColor;
        chartRef.current.update();
      }
    };

    document.addEventListener('touchstart', handleTouch);

    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [backgroundColor, borderColor, hoverBackgroundColor, hoverBorderColor]);

  useEffect(() => {
    mainChartRef.current = chartRef.current;
  }, [mainChartRef]);

  return (
    <div className={cls(height ?? '', 'relative overflow-hidden lg:overflow-visible')}>
      <Line ref={chartRef} data={chartData} options={options} plugins={[adaptiveTickSpacing]} />
    </div>
  );
}
