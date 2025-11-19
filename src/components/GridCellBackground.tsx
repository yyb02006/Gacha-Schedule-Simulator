import { motion } from 'motion/react';
import { RefObject, useEffect, useRef, useState } from 'react';

export default function GridCellBackground({
  cellSize = 120,
  divisions = 5,
  strokeColor = '#808080',
  activeColor = '#bbb77b',
  progressRef,
}: {
  cellSize?: number;
  divisions?: number;
  strokeColor?: string;
  activeColor?: string;
  progressRef: RefObject<{
    progressTry: number;
    total: number;
    gachaRuns: number;
    success: number;
  } | null>;
}) {
  const step = cellSize / (divisions - 1); // 각 간격
  const [progress, setProgress] = useState(0);
  const lastUpdateRef = useRef(0);
  const throttleMs = 100;

  useEffect(() => {
    let rafId: number;
    function updateLineWithRAF() {
      rafId = requestAnimationFrame(() => {
        const now = performance.now();
        if (now - lastUpdateRef.current >= throttleMs) {
          lastUpdateRef.current = now;
          if (progressRef && progressRef.current) {
            const ratio = Math.min(progressRef.current.progressTry / progressRef.current.total, 1);
            setProgress(ratio);
          }
        }
        updateLineWithRAF();
      });
    }

    updateLineWithRAF();
    return () => cancelAnimationFrame(rafId);
  }, [progressRef]);

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
                strokeWidth="1"
                strokeDasharray={cellSize}
                initial={{ strokeDashoffset: cellSize, stroke: strokeColor }}
                animate={{
                  strokeDashoffset: 0,
                  stroke: progress * 1.1 * (divisions - 1) >= i ? activeColor : strokeColor,
                  transition: { stroke: { duration: 0.5 } },
                }}
                exit={{ strokeDashoffset: -cellSize }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
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
                strokeWidth="1"
                strokeDasharray={cellSize}
                initial={{ strokeDashoffset: cellSize, stroke: strokeColor }}
                animate={{
                  strokeDashoffset: 0,
                  stroke: progress * 1.1 * (divisions - 1) >= i ? activeColor : strokeColor,
                  transition: { stroke: { duration: 0.5 } },
                }}
                exit={{ strokeDashoffset: -cellSize }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
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
