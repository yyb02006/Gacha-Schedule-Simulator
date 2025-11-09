import { safeNumberOrZero } from '#/libs/utils';
import { ArcElement, Chart } from 'chart.js';

export const doughnutConnectorPlugin = () => ({
  id: 'connectorLines',
  afterDraw(chart: Chart<'doughnut'>) {
    const ctx = chart.ctx;
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((a, b) => a + b, 0);
    const totalizedValue = total
      ? total
      : (dataset.data as number[]).reduce((sum, val) => sum + val, 0);
    dataset.data.forEach((value: number, index: number) => {
      const isVisible = chart.getDataVisibility(index);
      if (!isVisible) return; // 숨겨졌다면 connector line도 숨기기
      const ratio = safeNumberOrZero(value / totalizedValue);
      if (ratio < 0.05 && ratio > 0) {
        const meta = chart.getDatasetMeta(0);
        const arc = meta.data[index] as ArcElement;
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const radius = arc.outerRadius;
        const x = arc.x + Math.cos(angle) * radius;
        const y = arc.y + Math.sin(angle) * radius;
        const labelX = arc.x + Math.cos(angle) * (radius + 8); // 라벨 위치
        const labelY = arc.y + Math.sin(angle) * (radius + 8);

        const borderColor = Array.isArray(dataset.borderColor)
          ? (dataset.borderColor[index] as string)
          : (dataset.borderColor as string);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(labelX, labelY);
        ctx.strokeStyle = borderColor || '#999';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  },
});
