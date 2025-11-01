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
    handle: { handleColor, handlePadding, handleWidth },
  }: {
    fontSize: number;
    background: string;
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(currentStartX, top, currentEndX - currentStartX, bottom - top);
    ctx.restore();

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
  setSelection,
}: BrushProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  const selectionRef = useRef(selection);
  const brushConfigRef = useRef({
    fontSize: 12,
    background: '#3c3c3c',
    handle: { handleWidth: 6, handlePadding: 3, handleColor: '#fe9a00' },
  });

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
    layout: { padding: { top: 20, bottom: 20 } },
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
        ticks: { maxTicksLimit: 6, color: '#555' },
      },
    },
  };

  useEffect(() => {
    const canvas = chartRef.current?.canvas;
    if (!canvas) return;

    if (chartRef.current === null) return;
    const rect = canvas.getBoundingClientRect();
    const { left, right } = chartRef.current.chartArea;
    const startX = left + (right - left) * selection.start;
    const endX = left + (right - left) * selection.end;

    const handleMouseDown = (e: MouseEvent) => {
      const x = e.clientX - rect.left;

      // 핸들 근처 클릭 시
      if (Math.abs(x - endX) < 10) setDragging('end');
      else if (Math.abs(x - startX) < 10) setDragging('start');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (chartRef.current === null) return;
      const x = e.clientX - rect.left;
      const newRatio = (x - left) / (right - left);

      if (!dragging) {
        if (Math.abs(x - startX) < 10 || Math.abs(x - endX) < 10) {
          chartRef.current.canvas.style.cursor = 'ew-resize';
        } else {
          chartRef.current.canvas.style.cursor = 'default';
        }
        return; // 드래그 중이 아니면 여기서 종료
      }

      if (dragging === 'start')
        setSelection((s) => ({ ...s, start: Math.max(0, Math.min(newRatio, s.end - 0.05)) }));
      else setSelection((s) => ({ ...s, end: Math.min(1, Math.max(newRatio, s.start + 0.05)) }));
    };

    const handleMouseUp = () => setDragging(null);

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selection, dragging, setSelection]);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection, selectionRef]);

  return (
    <div className="h-[70px]">
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
