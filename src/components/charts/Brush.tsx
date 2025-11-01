import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
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

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Decimation,
  Tooltip,
  Legend,
  Filler,
);

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
  { handleWidth, handleColor }: { handleWidth: number; handleColor: string },
): Plugin<'line'> => ({
  id: 'brushSelection',
  afterDraw(chart) {
    const { ctx, chartArea } = chart;
    const { left, right, top, bottom } = chartArea;

    const { start, end } = selectionRef.current;

    // 왼쪽 끝 좌표 (양쪽 좌표가 바 두께 절반만큼 안쪽으로 들어온 브러쉬 구간)
    const brushRangeStartCoord = left + handleWidth / 2;

    // 전체 너비 (양쪽 좌표가 바 두께 절반만큼 안쪽으로 들어온 브러쉬 구간)
    const brushRangeWidth = right - left - handleWidth;

    // 브러쉬 선택 구간 (예시: x 20%~60%)
    const currentStartX = brushRangeStartCoord + brushRangeWidth * start;
    const currentendX = brushRangeStartCoord + brushRangeWidth * end;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(currentStartX, top, currentendX - currentStartX, bottom - top);
    ctx.restore();

    // 핸들 표시
    [currentStartX, currentendX].forEach((x) => {
      const height = bottom - top + 6;
      const handleRadius = 3; // 둥근 정도
      const centerRadius = 8; // 가운데 원 반지름
      const centerY = top - 3 + height / 2;

      ctx.save();
      ctx.fillStyle = handleColor;

      ctx.shadowColor = 'rgba(0,0,0,0.4)'; // 그림자 색
      ctx.shadowBlur = 6; // 흐림 정도
      ctx.shadowOffsetX = 0; // X 방향 오프셋
      ctx.shadowOffsetY = 2;

      // Path 그리기
      ctx.beginPath();
      ctx.moveTo(x - handleWidth / 2 + handleRadius, top - 3);
      ctx.lineTo(x + handleWidth / 2 - handleRadius, top - 3);
      ctx.quadraticCurveTo(
        x + handleWidth / 2,
        top - 3,
        x + handleWidth / 2,
        top - 3 + handleRadius,
      );
      ctx.lineTo(x + handleWidth / 2, top - 3 + height - handleRadius);
      ctx.quadraticCurveTo(
        x + handleWidth / 2,
        top - 3 + height,
        x + handleWidth / 2 - handleRadius,
        top - 3 + height,
      );
      ctx.lineTo(x - handleWidth / 2 + handleRadius, top - 3 + height);
      ctx.quadraticCurveTo(
        x - handleWidth / 2,
        top - 3 + height,
        x - handleWidth / 2,
        top - 3 + height - handleRadius,
      );
      ctx.lineTo(x - handleWidth / 2, top - 3 + handleRadius);
      ctx.quadraticCurveTo(
        x - handleWidth / 2,
        top - 3,
        x - handleWidth / 2 + handleRadius,
        top - 3,
      );
      ctx.closePath();

      // 핸들 가운데 원 Path
      ctx.moveTo(x + centerRadius, centerY);
      ctx.arc(x, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

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
        const scale = chart.scales.x;
        const index = Math.floor(scale.getValueForPixel(x) ?? 0);
        // console.log(index);
        const clampedIndex = Math.max(0, Math.min(totalPoints - 1, index));
        const label = chart.data.labels[clampedIndex];

        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label as string, x, centerY);
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
    background: '#3c3c3c',
    handle: { handleWidth: 6, handleColor: '#fe9a00' },
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
        clip: { left: 0, right: 0, top: 0, bottom: 0 },
        fill: true,
        tension: data.length < 100 ? 0.3 : data.length < 200 ? 0.65 : 1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
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
        grace: '10%',
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
      if (Math.abs(x - startX) < 10) setDragging('start');
      else if (Math.abs(x - endX) < 10) setDragging('end');
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
        setSelection((s) => ({ ...s, start: Math.max(0, Math.min(newRatio, s.end - 0.01)) }));
      else setSelection((s) => ({ ...s, end: Math.min(1, Math.max(newRatio, s.start + 0.01)) }));
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
    <div className="h-[60px]">
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[
          brushBackground(brushConfigRef.current.background),
          brushPlugin(selectionRef, brushConfigRef.current.handle),
        ]}
      />
    </div>
  );
}
