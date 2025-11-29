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
  Point,
  ChartDataset,
} from 'chart.js';
import { throttled } from 'chart.js/helpers';
import { RefObject, useEffect, useRef } from 'react';
import { Chart } from 'react-chartjs-2';

ChartJS.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend);

const adaptiveTickSpacing: Plugin<'bar' | 'line'> = {
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
    createTooltipLiteral: TooltipCallback<'bar' | 'line'>;
  }) =>
  (context: { chart: ChartJS; tooltip: TooltipModel<'bar' | 'line'> }) => {
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
    const caretX = tooltip.dataPoints[0].element.x ?? canvasRect.width / 2;
    const caretY = tooltip.dataPoints[0].element.y ?? canvasRect.height / 2;
    const baseX = caretX + (canvasRect.left - parentRect.left);
    const baseY = caretY + (canvasRect.top - parentRect.top);

    const sameChart = lastChartId.current === chartId;
    const tooltipWidth = tooltipEl.offsetWidth || 140;
    const tooltipHeight = tooltipEl.offsetHeight || 60;
    let finalX = baseX + 6;
    let finalY = baseY + 6;

    if (caretX + tooltipWidth + 12 > canvasRect.width) finalX = canvasRect.width - tooltipWidth - 6;

    if (caretY + tooltipHeight + 12 > canvasRect.height) {
      finalY = canvasRect.height - tooltipHeight - 6;
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
    const textColors = dataPoints.map((dataPoint) => {
      return typeof dataPoint.dataset.borderColor === 'string'
        ? dataPoint.dataset.borderColor
        : '#ffb900';
    });

    tooltipEl.innerHTML = createTooltipLiteral({
      body,
      datasets: dataPoints,
      textColors,
      title,
      total,
    });
  };

export type MultiChartData = Record<
  'line' | 'bar',
  {
    label: string;
    data: number[];
    color: Record<
      'backgroundColor' | 'borderColor' | 'hoverBackgroundColor' | 'hoverBorderColor',
      string
    >;
  }[]
>;

interface MultiChartProps {
  labels: string[];
  fullDatas: MultiChartData;
  primaryData: number[];
  mainChartRef: RefObject<ChartJS<
    'bar' | 'line',
    (number | [number, number] | null)[] | (number | Point | null)[],
    unknown
  > | null>;
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
  createTooltipLiteral: CreateTooltipLiteral<'bar' | 'line'>;
}

export default function MultiChart({
  labels,
  fullDatas,
  primaryData,
  mainChartRef,
  selectionIndex,
  total,
  padding,
  enableBrush,
  isPercentYAxis,
  cutoffIndex,
  height,
  createTooltipLiteral,
}: MultiChartProps) {
  const isMount = useIsMount();
  const categoryPercentage = primaryData.length < 50 ? 0.9 : primaryData.length < 150 ? 0.8 : 0.9;
  const chartRef = useRef<ChartJS<
    'bar' | 'line',
    (number | [number, number] | null)[] | (number | Point | null)[],
    unknown
  > | null>(null);
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

  const chartData: ChartData<'bar' | 'line'> = {
    labels,
    datasets: [
      ...fullDatas.line.map<
        ChartDataset<'bar' | 'line', (number | [number, number] | Point | null)[]>
      >(({ data, label, color }) => ({
        type: 'line',
        label,
        data,
        backgroundColor: '#00000000',
        borderColor: color.borderColor,
        hoverBorderColor: color.hoverBorderColor,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 3,
        pointBackgroundColor: color.backgroundColor,
        // pointHoverBackgroundColor, pointHoverBorderColor옵션을 명시하지 않으면
        // hoverBackgroundColor, hoverBorderColor로 대체됨
        pointHoverBorderWidth: 6,
        pointStyle: 'circle',
        fill: true,
        clip: { left: 6, right: 6, top: 50, bottom: 0 },
        tension: data.length <= 20 ? 0 : data.length < 100 ? 0.3 : data.length < 200 ? 0.65 : 1,
        animation: { duration: 200 },
      })),
      ...fullDatas.bar.map<
        ChartDataset<'bar' | 'line', (number | [number, number] | Point | null)[]>
      >(({ data, label, color }) => ({
        type: 'bar',
        label,
        data,
        backgroundColor: color.backgroundColor,
        borderColor: color.borderColor,
        hoverBackgroundColor: color.hoverBackgroundColor,
        hoverBorderColor: color.hoverBorderColor,
        borderWidth: data.length > 20 ? 0 : 2,
        hoverBorderWidth: data.length > 20 ? 0 : 2,
        categoryPercentage,
        barPercentage: 0.7,
        maxBarThickness: (chartRef.current?.canvas.width ?? 560) / 8,
        minBarLength: data.length < 50 ? 10 : data.length < 150 ? 5 : 3,
        borderRadius: (context) => {
          const chart = context.chart;
          const meta = chart.getDatasetMeta(context.datasetIndex);
          return meta.vScale ? meta.vScale.width / 10 : 4;
        },
        animation: { duration: 200 },
      })),
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
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
      active: { animation: { duration: primaryData.length > 20 ? 0 : 200 } },
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
          color: '#3c3c3c',
          lineWidth: 1,
          tickWidth: 0,
        },
        border: { color: '#3c3c3c' },
        ticks: {
          maxRotation: 25,
          crossAlign: 'center',
          align: 'center',
          autoSkip: false,
          font: { family: 'S-CoreDream-300', size: 11 },
          color: (ctx) => (ctx.index === hoveredIndexRef.current ? '#ffb900' : '#666'),
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
              return isValueSring ? value : this.getLabels()[value];
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
      const colorsArray = [
        ...fullDatas.line.map(({ color }) => color),
        ...fullDatas.bar.map(({ color }) => color),
      ];

      // console.log(hoveredIndexRef.current, newIndex);
      if (hoveredIndexRef.current === null && hoveredIndexRef.current !== newIndex) {
        // Enter
        chart.data.datasets.forEach((dataset, index) => {
          dataset.hoverBackgroundColor = colorsArray[index].hoverBackgroundColor;
          dataset.hoverBorderColor = colorsArray[index].hoverBorderColor;
          if (dataset.type === 'line') {
            dataset.pointHoverBorderWidth = 6;
          }
        });
        hoveredIndexRef.current = newIndex;
        chart.update();
      } else if (newIndex !== null && hoveredIndexRef.current !== newIndex) {
        // move부분은 ref교체 적용 외에 다른 로직은 필요 없는 거 아님?
        /* chart.data.datasets.forEach((dataset, index) => {
          dataset.hoverBackgroundColor = colorsArray[index].hoverBackgroundColor;
          dataset.hoverBorderColor = colorsArray[index].hoverBorderColor;
          if (dataset.type === 'line') {
            console.log(dataset.pointHoverBorderWidth);
          }
        }); */
        hoveredIndexRef.current = newIndex;
        if (primaryData.length > 20) {
          chartThrottledDraw();
        } else {
          chartThrottledUpdate();
        }
      } else if (newIndex === null && hoveredIndexRef.current !== newIndex) {
        // Leave
        chart.data.datasets.forEach((dataset, index) => {
          dataset.hoverBackgroundColor = colorsArray[index].backgroundColor;
          dataset.hoverBorderColor = colorsArray[index].borderColor;

          if (dataset.type === 'line') {
            dataset.pointHoverBorderWidth = 3;
          }
        });
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
  }, [chartThrottledUpdate, chartThrottledDraw, fullDatas, primaryData.length]);

  useEffect(() => {
    const colorsArray = [
      ...fullDatas.line.map(({ color }) => color),
      ...fullDatas.bar.map(({ color }) => color),
    ];
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

        chart.data.datasets.forEach((dataset, index) => {
          dataset.hoverBackgroundColor = colorsArray[index].backgroundColor;
          dataset.hoverBorderColor = colorsArray[index].borderColor;

          if (dataset.type === 'line') {
            dataset.pointHoverBorderWidth = 3;
          }
        });

        const tooltipEl = canvas.parentElement?.querySelector('#custom-tooltip') as HTMLElement;
        if (tooltipEl) tooltipEl.style.opacity = '0';

        if (chartRef.current.tooltip) {
          chartRef.current.tooltip.setActiveElements([], { x: 0, y: 0 });
          chartRef.current.update();
        }
      } else {
        // 캔버스 안 터치 감지
        chart.data.datasets.forEach((dataset, index) => {
          dataset.hoverBackgroundColor = colorsArray[index].hoverBackgroundColor;
          dataset.hoverBorderColor = colorsArray[index].hoverBorderColor;
          if (dataset.type === 'line') {
            dataset.pointHoverBorderWidth = 6;
          }
        });

        chartRef.current.update();
      }
    };

    document.addEventListener('touchstart', handleTouch);

    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [fullDatas]);

  useEffect(() => {
    mainChartRef.current = chartRef.current;
  }, [mainChartRef]);

  return (
    <div className={cls(height ?? '', 'relative overflow-hidden lg:overflow-visible')}>
      <Chart
        type="bar"
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[adaptiveTickSpacing]}
      />
    </div>
  );
}
