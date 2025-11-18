import { motion } from 'motion/react';

export default function GridCellBackground({
  cellSize = 120,
  divisions = 5,
  strokeColor = '#808080',
}: {
  cellSize?: number;
  divisions?: number;
  strokeColor?: string;
}) {
  const step = cellSize / (divisions - 1); // 각 간격
  return (
    <svg width="100%" height="100%" className="absolute top-0 left-0">
      <defs>
        <pattern id="gridLines" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
          {/* 세로선 */}
          {Array.from({ length: divisions }).map((_, i) => {
            const x = i * step;

            return (
              <motion.line
                key={`v${i}`}
                x1={x}
                y1={0}
                x2={x}
                y2={cellSize}
                stroke={strokeColor}
                strokeWidth="1"
                strokeDasharray={cellSize}
                strokeDashoffset={cellSize}
                initial={{ strokeDashoffset: cellSize }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              />
            );
          })}

          {/* 가로선 */}
          {Array.from({ length: divisions }).map((_, i) => {
            const y = i * step;

            return (
              <motion.line
                key={`h${i}`}
                x1={0}
                y1={y}
                x2={cellSize}
                y2={y}
                stroke={strokeColor}
                strokeWidth="1"
                strokeDasharray={cellSize}
                strokeDashoffset={cellSize}
                initial={{ strokeDashoffset: cellSize }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              />
            );
          })}
        </pattern>
      </defs>

      {/* 전체 배경 */}
      <rect width="100%" height="100%" fill="url(#gridLines)" />
    </svg>
  );
}
