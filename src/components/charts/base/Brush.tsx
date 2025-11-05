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
  Plugin,
} from 'chart.js';
import { throttled } from 'chart.js/helpers';
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Decimation, Filler);

const brushBackground = (brushBackground: string): Plugin<'line'> => ({
  id: 'customBackground',
  beforeDraw(chart) {
    const { ctx, chartArea } = chart;
    const { left, top, right, bottom } = chartArea;

    // 차트 내부 영역 배경색
    ctx.save();
    ctx.fillStyle = brushBackground; // 원하는 색
    ctx.fillRect(left, top, right - left, bottom - top);
    ctx.restore();
  },
});

const brushPlugin = (
  selectionRef: RefObject<{
    start: number;
    end: number;
  }>,
  {
    fontSize,
    thresholdXRatio,
    thresholdColor = '#ff5252',
    thresholdLabel = '99%',
    handle: { handleColor, handlePadding, handleWidth },
  }: {
    fontSize: number;
    background: string;
    thresholdXRatio: number;
    thresholdColor: string;
    thresholdLabel: string;
    handle: {
      handleWidth: number;
      handlePadding: number;
      handleColor: string;
    };
  },
): Plugin<'line'> => ({
  id: 'brushSelection',
  afterDraw(chart) {
    const { ctx, chartArea } = chart;
    const { left, right, top, bottom } = chartArea;
    const handleMovementArea = {
      left: left + handleWidth / 2,
      right: right - handleWidth / 2,
      top: top - handlePadding,
      bottom: bottom + handlePadding,
    };

    const { start, end } = selectionRef.current;

    // 전체 너비 (양쪽 좌표가 바 두께 절반만큼 안쪽으로 들어온 브러쉬 구간)
    const brushRangeWidth = handleMovementArea.right - handleMovementArea.left;

    // 브러쉬 선택 구간 (예시: x 20%~60%)
    const currentStartX = handleMovementArea.left + brushRangeWidth * start;
    const currentEndX = handleMovementArea.left + brushRangeWidth * end;

    // 두 핸들이 같은 인덱스를 가리키고 있는지
    const scale = chart.scales.x;
    const isSame =
      Math.floor(scale.getValueForPixel(currentStartX) ?? 0) ===
      Math.floor(scale.getValueForPixel(currentEndX) ?? 0);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(currentStartX, top, currentEndX - currentStartX, bottom - top);
    ctx.restore();

    if (thresholdXRatio !== 1) {
      const thresholdX =
        handleMovementArea.left + brushRangeWidth * Math.min(Math.max(thresholdXRatio, 0.01), 0.99);

      ctx.save();
      ctx.strokeStyle = thresholdColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(thresholdX, top);
      ctx.lineTo(thresholdX, bottom);
      ctx.stroke();

      // 라벨 표시
      ctx.fillStyle = thresholdColor;
      ctx.font = `11px S-CoreDream-400, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(thresholdLabel, thresholdX, top - 6);
      ctx.restore();
    }

    // 핸들 표시
    [currentStartX, currentEndX].forEach((x, currentIndex) => {
      const handleHeight = bottom - top + handlePadding * 2;
      const handleRadius = 3; // 둥근 정도
      const centerRadius = 8; // 가운데 원 반지름
      const centerY = top - handlePadding + handleHeight / 2;

      ctx.save();
      ctx.fillStyle = handleColor;

      ctx.shadowColor = 'rgba(0,0,0,0.4)'; // 그림자 색
      ctx.shadowBlur = 6; // 흐림 정도
      ctx.shadowOffsetX = 0; // X 방향 오프셋
      ctx.shadowOffsetY = 2;

      // Path 그리기
      ctx.beginPath();
      ctx.moveTo(x - handleWidth / 2 + handleRadius, handleMovementArea.top);
      ctx.lineTo(x + handleWidth / 2 - handleRadius, handleMovementArea.top);
      ctx.quadraticCurveTo(
        x + handleWidth / 2,
        handleMovementArea.top,
        x + handleWidth / 2,
        handleMovementArea.top + handleRadius,
      );
      ctx.lineTo(x + handleWidth / 2, handleMovementArea.top + handleHeight - handleRadius);
      ctx.quadraticCurveTo(
        x + handleWidth / 2,
        handleMovementArea.top + handleHeight,
        x + handleWidth / 2 - handleRadius,
        handleMovementArea.top + handleHeight,
      );
      ctx.lineTo(x - handleWidth / 2 + handleRadius, handleMovementArea.top + handleHeight);
      ctx.quadraticCurveTo(
        x - handleWidth / 2,
        handleMovementArea.top + handleHeight,
        x - handleWidth / 2,
        handleMovementArea.top + handleHeight - handleRadius,
      );
      ctx.lineTo(x - handleWidth / 2, handleMovementArea.top + handleRadius);
      ctx.quadraticCurveTo(
        x - handleWidth / 2,
        handleMovementArea.top,
        x - handleWidth / 2 + handleRadius,
        handleMovementArea.top,
      );
      ctx.closePath();

      // 핸들 가운데 원 Path
      ctx.moveTo(x + centerRadius, centerY);
      ctx.arc(x, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 핸들 가운데 원 Path 가운데 원 Path
      ctx.save();
      ctx.fillStyle = '#eaeaea';
      ctx.beginPath();
      ctx.arc(x, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 현재 틱 라벨 찾기
      if (chart.data.labels) {
        const totalPoints = chart.data.labels.length;
        // x 좌표 -> index 변환
        const availableRange = handleMovementArea.right - handleMovementArea.left;
        const handlePosFromLeft = x - handleMovementArea.left;
        const tickIndex = Math.round((handlePosFromLeft / availableRange) * (totalPoints - 1));
        const label = chart.data.labels[tickIndex] as string;

        ctx.save();
        ctx.font = `${fontSize}px S-CoreDream-400, sans-serif`;
        const textWidth = ctx.measureText(label).width;
        const textPadding = 4;

        let textX = x;
        const textY =
          currentIndex === 0 ? handleMovementArea.bottom + fontSize : handleMovementArea.top;

        // 텍스트가 서로 같은 인덱스일 때 (첫 번째 핸들에만 적용)
        if (isSame) {
          textX = currentStartX + (currentEndX - currentStartX) / 2;
        }

        // 텍스트가 오른쪽 경계를 벗어나면 왼쪽으로 이동
        if (textX + textWidth / 2 > right - textPadding) {
          textX = right - textWidth / 2 - textPadding;
        }

        // 텍스트가 왼쪽 경계를 벗어나면 오른쪽으로 이동
        if (textX - textWidth / 2 < left + textPadding) {
          textX = left + textWidth / 2 + textPadding;
        }

        ctx.fillStyle = '#ffb900';
        ctx.textAlign = 'center';
        ctx.textBaseline = currentIndex === 0 ? 'alphabetic' : 'bottom';
        ctx.fillText(label, textX, textY);
        ctx.restore();
      }
    });
  },
});

interface BrushProps {
  labels: string[];
  data: number[];
  colors: Record<'backgroundColor' | 'borderColor', string | string[]>;
  selection: { start: number; end: number };
  padding: number;
  cutoffRatio: number;
  cutoffPercentage: number;
  total?: number;
  isPercentYAxis?: boolean;
  height?: string;
  setSelection: Dispatch<
    SetStateAction<{
      start: number;
      end: number;
    }>
  >;
}

export default function Brush({
  labels,
  data,
  colors: { backgroundColor, borderColor },
  selection,
  padding,
  cutoffRatio,
  cutoffPercentage,
  total,
  isPercentYAxis,
  height,
  setSelection,
}: BrushProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  const BRUSH_MIN_WIDTH_RATIO = 0.05;
  const brushConfigRef = useRef({
    fontSize: 12,
    background: '#333333',
    thresholdXRatio: cutoffRatio,
    thresholdColor: '#ff5252',
    thresholdLabel: `${truncateToDecimals(cutoffPercentage * 100)}%`,
    handle: { handleWidth: 6, handlePadding: 3, handleColor: '#fe9a00' },
  });
  const selectionRef = useRef({
    start: 0,
    end: data.length > 300 && selection.end !== undefined ? selection.end : 1,
  });
  const brushThrottledUpdate = useRef(
    throttled((newRatio: number, dragging: 'start' | 'end') => {
      if (selectionRef.current.end <= cutoffRatio || data.length < 400) {
        const updateSelection =
          dragging === 'start'
            ? (s: { start: number; end: number }) => ({
                ...s,
                start: Math.max(0, Math.min(newRatio, s.end - BRUSH_MIN_WIDTH_RATIO)),
              })
            : (s: { start: number; end: number }) => ({
                ...s,
                end: Math.min(1, Math.max(newRatio, s.start + BRUSH_MIN_WIDTH_RATIO)),
              });
        setSelection(updateSelection);
      }
    }, 100),
  ).current;

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: '배너 데이터',
        data,
        backgroundColor,
        borderColor,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        clip: { left: 0, right: 0, top: 50, bottom: 0 },
        fill: true,
        tension: data.length < 100 ? 0.3 : data.length < 200 ? 0.65 : 1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 20, bottom: 20 + padding, right: padding, left: padding } },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: { display: false },
      decimation: { enabled: true, algorithm: 'lttb', samples: 100 },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: '#535353',
          drawTicks: false,
        },
        ticks: {
          display: false,
          maxTicksLimit: data.length > 20 ? Math.ceil(data.length / 10) : undefined,
        },
      },
      y: {
        grid: {
          display: false,
          color: '#3c3c3c',
        },
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 6,
          color: '#555',
          callback: (value) => {
            return typeof value === 'number' && isPercentYAxis && total
              ? `${truncateToDecimals((value / total) * 100, 1)}%`
              : value;
          },
        },
      },
    },
  };

  useEffect(() => {
    const canvas = chartRef.current?.canvas;
    if (!canvas || chartRef.current === null) return;

    const { left, right, top, bottom } = chartRef.current.chartArea;
    const startX = left + (right - left) * selectionRef.current.start;
    const endX = left + (right - left) * selectionRef.current.end;

    const handleMouseDown = (e: PointerEvent) => {
      // 포인터 아이디를 캡쳐해서 릴리즈하기 전까지 전역으로 추적
      if (chartRef.current === null) return;
      const rect = canvas.getBoundingClientRect();
      canvas.setPointerCapture(e.pointerId);
      const x = e.clientX - rect.left;
      const newRatio = (x - left) / (right - left);
      const distanceFromStart = Math.abs(newRatio - selectionRef.current.start);
      const distanceFromEnd = Math.abs(newRatio - selectionRef.current.end);
      const isCloserToStart = distanceFromStart < distanceFromEnd;

      if (isCloserToStart) {
        selectionRef.current.start = Math.max(
          0,
          Math.min(newRatio, selectionRef.current.end - BRUSH_MIN_WIDTH_RATIO),
        );
      } else {
        selectionRef.current.end = Math.min(
          1,
          Math.max(newRatio, selectionRef.current.start + BRUSH_MIN_WIDTH_RATIO),
        );
      }
      const updateSelection = isCloserToStart
        ? (s: { start: number; end: number }) => ({
            ...s,
            start: Math.max(0, Math.min(newRatio, s.end - BRUSH_MIN_WIDTH_RATIO)),
          })
        : (s: { start: number; end: number }) => ({
            ...s,
            end: Math.min(1, Math.max(newRatio, s.start + BRUSH_MIN_WIDTH_RATIO)),
          });

      // 핸들 근처 클릭 시
      if (!isCloserToStart) setDragging('end');
      else if (isCloserToStart) setDragging('start');
      setSelection(updateSelection);
    };

    const handleMouseMove = (e: PointerEvent) => {
      if (chartRef.current === null) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRatio = (x - left) / (right - left);
      const isInChartArea = x > left && x < right && y < bottom && y > top;

      if (!dragging) {
        if (Math.abs(x - startX) < 10 || Math.abs(x - endX) < 10) {
          chartRef.current.canvas.style.cursor = 'ew-resize';
        } else if (isInChartArea) {
          chartRef.current.canvas.style.cursor = 'pointer';
        } else {
          chartRef.current.canvas.style.cursor = 'default';
        }
        return; // 드래그 중이 아니면 여기서 종료
      } else {
        if (dragging === 'start') {
          selectionRef.current.start = Math.max(
            0,
            Math.min(newRatio, selectionRef.current.end - BRUSH_MIN_WIDTH_RATIO),
          );
        } else if (dragging === 'end') {
          selectionRef.current.end = Math.min(
            1,
            Math.max(newRatio, selectionRef.current.start + BRUSH_MIN_WIDTH_RATIO),
          );
        }
        chartRef.current.draw();

        // 누적값이 99% 아래인 구간에서는 실시간 업데이트, 99% 위인 구간에서는 배치업데이트
        brushThrottledUpdate(newRatio, dragging);
      }
    };

    const handleMouseUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      if (dragging !== null) {
        setSelection((p) => ({ ...p, [dragging]: selectionRef.current[dragging] }));
        setDragging(null);
      }
    };

    canvas.addEventListener('pointerdown', handleMouseDown);
    canvas.addEventListener('pointermove', handleMouseMove);
    canvas.addEventListener('pointerup', handleMouseUp);

    return () => {
      canvas.removeEventListener('pointerdown', handleMouseDown);
      canvas.removeEventListener('pointermove', handleMouseMove);
      canvas.removeEventListener('pointerup', handleMouseUp);
    };
  }, [selection, dragging, setSelection, brushThrottledUpdate]);

  return (
    <div className={height || 'h-[86px]'}>
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[
          brushBackground(brushConfigRef.current.background),
          brushPlugin(selectionRef, brushConfigRef.current),
        ]}
      />
    </div>
  );
}
