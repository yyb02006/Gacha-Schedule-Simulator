'use client';

import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

export default function BrushBarChart({
  totalSimulationTry,
  data,
  customTooltip,
  yAxisTickFormatter,
}: {
  totalSimulationTry: number;
  data: { name: string; value: number }[];
  customTooltip?: React.FC<TooltipContentProps<number, string> & { totalSimulationTry: number }>;
  yAxisTickFormatter?: (value: number, index: number) => string;
}) {
  const CustomTooltip = customTooltip;
  return (
    <BarChart
      style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      barCategoryGap="20%"
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="2 2" />
      <XAxis dataKey="name" className="text-xs" />
      <YAxis width="auto" className="text-xs" tickFormatter={yAxisTickFormatter} />
      <Tooltip
        content={
          CustomTooltip ? (
            <CustomTooltip
              payload={data}
              totalSimulationTry={totalSimulationTry}
              active
              coordinate={{ x: 0, y: 0 }}
              accessibilityLayer
            />
          ) : undefined
        }
        cursor={false}
      />
      <ReferenceLine y={0} stroke="#000" />
      <Brush dataKey="name" height={20} fill="#202020" travellerWidth={8} stroke="#ffb900" />
      <Bar
        dataKey="value"
        fill="#ffb900"
        activeBar={{
          fill: '#ff6900',
          radius: 6,
        }}
        minPointSize={6}
        animationEasing="ease-in-out"
      />
    </BarChart>
  );
}
