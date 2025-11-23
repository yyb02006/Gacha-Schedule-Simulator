'use client';

import { CreateTooltipLiteral, CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';
import { useIsMount } from '#/hooks/useIsMount';
import { cls, truncateToDecimals } from '#/libs/utils';
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
  TooltipModel,
  ChartType,
} from 'chart.js';
import { throttled } from 'chart.js/helpers';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend);

const adaptiveTickSpacing: Plugin<'bar'> = {
  id: 'adaptiveTickSpacing',
  beforeBuildTicks(chart) {
    const axis = chart.scales.x;
    if (!axis || axis.type !== 'category') return;

    const rotated = axis.labelRotation !== 0;
    const tickOpts = (axis.options as CartesianScaleOptions).ticks;

    const newPadding = rotated ? -2 : 4;
    const newLabelOffset = rotated ? 6 : 0;

    if (tickOpts.padding !== newPadding || tickOpts.labelOffset !== newLabelOffset) {
      tickOpts.padding = newPadding;
      tickOpts.labelOffset = newLabelOffset;
    }
  },
};

export type TooltipCallback<T extends ChartType> = (props: CreateTooltipLiteralProps<T>) => string;

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
    createTooltipLiteral: TooltipCallback<'bar'>;
  }) =>
  (context: { chart: ChartJS; tooltip: TooltipModel<'bar'> }) => {
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

interface BarChartProps {
  labels: string[];
  data: number[];
  colors: Record<
    'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
    string | string[]
  >;
  mainChartRef: RefObject<ChartJS<'bar', (number | [number, number] | null)[], unknown> | null>;
  selectionIndex: {
    start: number;
    end: number;
  };
  total: number;
  padding: number;
  enableBrush: boolean;
  isPercentYAxis?: boolean;
  cutoffIndex?: number;
  height?: string;
  lazyLoading?: boolean;
  createTooltipLiteral: CreateTooltipLiteral<'bar'>;
}

export default function BarChart({
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
  lazyLoading = false,
  createTooltipLiteral,
}: BarChartProps) {
  const isMount = useIsMount();
  const chartRef = useRef<ChartJS<'bar'>>(null);
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

  const progressIndexRef = useRef(0);
  const [loading, setLoading] = useState(lazyLoading);

  const chartData: ChartData<'bar'> = {
    labels: lazyLoading
      ? loading
        ? []
        : labels.slice(selectionIndex.start, selectionIndex.end)
      : labels,
    datasets: [
      {
        type: 'bar',
        label: '배너 데이터',
        data: lazyLoading
          ? loading
            ? []
            : data.slice(selectionIndex.start, selectionIndex.end)
          : data,
        backgroundColor,
        borderColor,
        hoverBackgroundColor,
        hoverBorderColor,
        borderWidth: data.length > 20 ? 0 : 2,
        hoverBorderWidth: data.length > 20 ? 0 : 2,
        categoryPercentage: data.length > 20 ? 0.9 : 0.7,
        maxBarThickness: (chartRef.current?.canvas.width ?? 560) / 8,
        minBarLength: data.length < 20 ? 10 : 3,
        borderRadius: (context) => {
          const chart = context.chart;
          const meta = chart.getDatasetMeta(context.datasetIndex);
          return meta.vScale ? meta.vScale.width / 10 : 4;
        },
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: !height,
    animation: isMount ? { duration: 200 } : false,
    animations: {
      x: {
        duration: (ctx) => {
          const isOverLength =
            cutoffIndex && ctx.dataset.data.length >= 500 && ctx.dataset.data.length > cutoffIndex;
          return isOverLength ? 600 : 200;
        },
      },
    },
    transitions: {
      active: {
        animation: {
          duration: (ctx) => {
            return ctx.dataset.data.length > 20 ? 0 : 200;
          },
        },
      },
    },
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
    layout: {
      padding: { top: padding, left: padding, bottom: enableBrush ? 0 : padding, right: padding },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        mode: 'index', // x축 "열(column)" 단위로 hover 인식
        intersect: false, // 바 위가 아니라, 그 열 전체 hover 가능
        external: loading
          ? undefined
          : externalTooltipHandler({
              lastChartId,
              hoveredIndexRef,
              total,
              createTooltipLiteral,
            }),
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
        ticks: {
          maxRotation: 25,
          minRotation: 0,
          crossAlign: 'center',
          align: 'center',
          autoSkip: false,
          font: { family: 'S-CoreDream-300', size: 11 },
          color: (ctx) => {
            return ctx.index === hoveredIndexRef.current ? '#ffb900' : '#666';
          },
          callback: function (this, value, index) {
            const isValueSring = typeof value === 'string';
            const gapMultiplier = Math.min(Math.ceil(this.ticks.length / 199), 10);
            if (this.ticks.length > 20) {
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

          const compensatedHeight = rotated ? 2 : -4;
          scale.height = scale.height + compensatedHeight;
        },
      },
      y: {
        grid: {
          color: '#3c3c3c',
        },
        border: { color: '#3c3c3c', dash: [4, 4] },
        beginAtZero: true,
        max: isPercentYAxis ? total : undefined,
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

    const handlePointerMove = (e: PointerEvent | TouchEvent) => {
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
        hoveredIndexRef.current = newIndex;
        if (data.length > 20) {
          chartThrottledDraw();
        } else {
          chartThrottledUpdate();
        }
        hoveredIndexRef.current = newIndex;
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

  useEffect(() => {
    if (!chartRef.current || !isMount || !lazyLoading) return;

    const CHUNK_SIZE = 50;
    const CHUNK_DELAY = 200;

    function drawChunk() {
      if (!chartRef.current?.ctx) return;

      const chart = chartRef.current;
      chart.data.datasets[0].animation = false;

      if (progressIndexRef.current >= selectionIndex.end) {
        setLoading(false);
        // animation이 관여안하게 하려면 undefined여야 함 false가 아니라
        chart.data.datasets[0].animation = undefined;
        chart.data.datasets[0].animations = {
          x: {
            duration: (ctx) => {
              const isOverLength =
                cutoffIndex &&
                ctx.dataset.data.length >= 500 &&
                ctx.dataset.data.length > cutoffIndex;
              return isOverLength ? 600 : 200;
            },
          },
        };
        chart.data.datasets[0].transitions = {
          active: {
            animation: {
              duration: 0,
            },
          },
        };

        return;
      }

      const nextIndex = Math.min(progressIndexRef.current + CHUNK_SIZE, data.length);

      const newData = data.slice(progressIndexRef.current, nextIndex);
      const newLabels = labels.slice(progressIndexRef.current, nextIndex);

      chart.data.datasets[0].data.push(...newData);
      (chart.data.labels as string[]).push(...newLabels);

      progressIndexRef.current = nextIndex;
      chart.update('none');

      setTimeout(drawChunk, CHUNK_DELAY);
    }

    drawChunk();
  }, [data, labels, isMount, selectionIndex, lazyLoading, cutoffIndex]);

  useEffect(() => {
    if (mainChartRef.current && data.length > 20 && !loading) {
      const currentLength = selectionIndex.end - selectionIndex.start;
      const dataset = mainChartRef.current?.data.datasets[0];
      if (dataset) {
        if (currentLength > 700) {
          dataset.categoryPercentage = 1;
          dataset.barPercentage = 0.95;
        } else if (currentLength > 450) {
          dataset.categoryPercentage = 1;
          dataset.barPercentage = 0.9;
        } else if (currentLength > 300) {
          dataset.categoryPercentage = 0.95;
          dataset.barPercentage = 0.85;
        } else {
          dataset.categoryPercentage = 0.9;
          dataset.barPercentage = 0.8;
        }
      }
    }
  }, [loading, data.length, mainChartRef, selectionIndex, backgroundColor]);

  return (
    <div className={cls(height ?? '', 'relative overflow-hidden lg:overflow-visible')}>
      {!loading || (
        <div className="absolute inset-0 flex items-center justify-center rounded-b-lg bg-[#00050] backdrop-blur-sm">
          <div className="relative flex size-[100px] animate-[spin_1.5s_linear_infinite]">
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              <defs>
                <mask id="innerMask" maskUnits="userSpaceOnUse">
                  <rect width="100%" height="100%" fill="white" />
                  <rect x="10%" y="10%" width="80%" height="80%" fill="black" />
                </mask>
              </defs>
            </svg>
            <svg width="100%" height="100%">
              <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="65%">
                  <stop offset="50%" stopColor="#808080" />
                  <stop offset="75%" stopColor="#c0c0c0" />
                  <stop offset="100%" stopColor="#ffffff" />
                </radialGradient>
              </defs>
              <rect
                mask="url(#innerMask)"
                x="0%"
                y="0%"
                width="100%"
                height="100%"
                fill="url(#grad1)"
              />
            </svg>
          </div>
        </div>
      )}
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[adaptiveTickSpacing]}
        className={loading ? 'opacity-0' : ''}
      />
    </div>
  );
}
