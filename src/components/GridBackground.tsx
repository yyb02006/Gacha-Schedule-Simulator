'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function GridBackground({
  gap = 80,
  strokeColor = '#999',
}: {
  gap?: number;
  strokeColor?: string;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const verticalLines = Math.ceil(size.width / gap) - 1;
  const horizontalLines = Math.ceil(size.height / gap) - 1;

  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  return (
    size.width === 0 || (
      <svg width={size.width} height={size.height} className="absolute top-0 left-0">
        {Array.from({ length: verticalLines }).map((_, i) => {
          const x = (i + 1) * gap;
          return (
            <motion.line
              key={`v${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={size.height}
              stroke={strokeColor}
              strokeWidth="1"
              strokeDasharray={size.height}
              strokeDashoffset={size.height}
              initial={{ strokeDashoffset: size.height }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: i * 0.05, duration: 0.8, ease: 'easeInOut' }}
            />
          );
        })}

        {Array.from({ length: horizontalLines }).map((_, i) => {
          const y = (i + 1) * gap;
          return (
            <motion.line
              key={`h${i}`}
              x1={0}
              y1={y}
              x2={size.width}
              y2={y}
              stroke={strokeColor}
              strokeWidth="1"
              strokeDasharray={size.width}
              strokeDashoffset={size.width}
              initial={{ strokeDashoffset: size.width }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: i * 0.05, duration: 0.8, ease: 'easeInOut' }}
            />
          );
        })}
      </svg>
    )
  );
}
