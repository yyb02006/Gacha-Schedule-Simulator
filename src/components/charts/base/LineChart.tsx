'use client';

import { CreateTooltipLiteral } from '#/components/charts/BannerWinRate';
import { truncateToDecimals } from '#/libs/utils';
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
} from 'chart.js';
import { throttled } from 'chart.js/helpers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Decimation, Filler);

const adaptiveTickSpacing: Plugin<'line'> = {
  id: 'adaptiveTickSpacing',
  afterLayout(chart) {
    const axis = chart.scales.x;
    if (!axis || axis.type !== 'category') return;

    const rotated = axis.labelRotation !== 0;
    const tickOpts = (axis.options as CartesianScaleOptions).ticks;

    const newPadding = rotated ? 0 : 4;
    const newLabelOffset = rotated ? 6 : 0;

    if (tickOpts.padding !== newPadding || tickOpts.labelOffset !== newLabelOffset) {
      tickOpts.padding = newPadding;
      tickOpts.labelOffset = newLabelOffset;
      chart.update('none');
    }
  },
};

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

  const externalTooltipHandler = useCallback(
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

      if (tooltip.opacity === 0 || !tooltip.body || hoveredIndexRef.current === null) {
        tooltipEl.style.opacity = '0';
        lastChartId.current = null;
        return;
      }

      const canvasRect = chart.canvas.getBoundingClientRect();
      const parentRect = canvasParent.getBoundingClientRect();
      const caretX = tooltip.caretX ?? canvasRect.width / 2;
      const caretY = tooltip.caretY ?? canvasRect.height / 2;
      const baseX = caretX + (canvasRect.left - parentRect.left);
      const baseY = caretY + (canvasRect.top - parentRect.top);

      const sameChart = lastChartId.current === chartId;
      const tooltipWidth = tooltipEl.offsetWidth || 140;
      let finalX = baseX + 6;
      if (caretX + tooltipWidth + 12 > canvasRect.width) finalX = baseX - tooltipWidth - 6;

      tooltipEl.style.transition = sameChart ? 'all 0.1s ease' : 'none';
      tooltipEl.style.left = `${finalX}px`;
      tooltipEl.style.top = `${baseY}px`;
      tooltipEl.style.opacity = '1';
      lastChartId.current = chartId;

      // 내용 업데이트
      const title = tooltip.title || [];
      const body = tooltip.body;
      const dataPoint = tooltip.dataPoints?.[0];
      const textColor =
        typeof dataPoint.dataset.borderColor === 'string'
          ? dataPoint.dataset.borderColor
          : '#ffb900';

      tooltipEl.innerHTML = tooltipCallback({
        body,
        data: dataPoint,
        textColor,
        title,
        total,
      });
    },
    [tooltipCallback, total],
  );

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
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 3,
        pointBackgroundColor: borderColor,
        pointStyle: 'circle',
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
      tooltip: {
        enabled: false,
        mode: 'index', // x축 "열(column)" 단위로 hover 인식
        intersect: false, // 바 위가 아니라, 그 열 전체 hover 가능
        external: externalTooltipHandler,
      },
      datalabels: { display: false },
      decimation: { enabled: true, algorithm: 'lttb', samples: 100 },
    },
    scales: {
      x: {
        grid: {
          color: '#3c3c3c',
          lineWidth: 2,
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
              return startIndex === 0 && index === 0
                ? 1
                : index === 0 || index % (stepGap * gapMultiplier) === stepGap * gapMultiplier - 1
                  ? startIndex + index + 1
                  : '';
            } else {
              return isValueSring ? value : labels[value];
            }
          },
        },
        afterFit: (axis) => {
          // 축 박스 높이를 줄여서 -padding 보전
          if (!axis || axis.type !== 'category') return;

          const rotated = axis.labelRotation !== 0;

          const compensatedHeight = rotated ? 0 : -4;
          axis.height = axis.height + compensatedHeight;
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

    const handleMouseMove = (e: MouseEvent) => {
      const elements = chart.getElementsAtEventForMode(e, 'index', { intersect: false }, false);
      const newIndex = elements.length > 0 ? elements[0].index : null;
      if (hoveredIndexRef.current === null && hoveredIndexRef.current !== newIndex) {
        // Enter
        chart.data.datasets[0].hoverBackgroundColor = hoverBackgroundColor;
        chart.data.datasets[0].hoverBorderColor = hoverBorderColor;
        hoveredIndexRef.current = newIndex;
        chart.update();
      } else if (newIndex !== null && hoveredIndexRef.current !== newIndex) {
        // Move
        chart.data.datasets[0].hoverBackgroundColor = hoverBackgroundColor;
        chart.data.datasets[0].hoverBorderColor = hoverBorderColor;
        hoveredIndexRef.current = newIndex;
        if (data.length > 20) {
          chartThrottledDraw();
        } else {
          chartThrottledUpdate();
        }
      } else if (newIndex === null && hoveredIndexRef.current !== newIndex) {
        // Leave
        chart.data.datasets[0].hoverBackgroundColor = backgroundColor;
        chart.data.datasets[0].hoverBorderColor = borderColor;
        hoveredIndexRef.current = newIndex;
        chart.tooltip?.setActiveElements(elements, {
          x: null,
          y: null,
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

    canvas.addEventListener('pointermove', handleMouseMove);
    canvas.addEventListener('pointerleave', handleMouseLeave);
    return () => {
      canvas.removeEventListener('pointermove', handleMouseMove);
      canvas.removeEventListener('pointerleave', handleMouseLeave);
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
    if (chartRef.current) {
      requestAnimationFrame(() => setHasRendered(true));
    }
  }, []);

  return (
    <div className={height}>
      <Line ref={chartRef} data={chartData} options={options} plugins={[adaptiveTickSpacing]} />
    </div>
  );
}
