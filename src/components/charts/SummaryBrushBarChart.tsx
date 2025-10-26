import { truncateToTwoDecimals } from '#/libs/utils';
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

const CustomTooltip: React.FC<
  TooltipContentProps<number, string> & { totalSimulationTry: number }
> = ({ active, payload, label, totalSimulationTry }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="space-y-3 rounded-lg bg-[#202020] px-4 py-3 shadow-lg shadow-[#202020]">
      <p className="text-lg">{label}</p>
      {payload.map((data, index) => (
        <div key={index} className="font-S-CoreDream-400 space-y-[2px] text-sm">
          <p>
            {`배너 성공 횟수 : `}
            <span className="text-amber-400">{`${data.value} 회`}</span>
          </p>
          <p>
            {`배너 성공률 : `}
            <span className="text-amber-400">{`${truncateToTwoDecimals((data.value / totalSimulationTry) * 100)}%`}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default function BrushBarChart({
  totalSimulationTry,
  data,
}: {
  totalSimulationTry: number;
  data: { name: string; value: number }[];
}) {
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
      <YAxis
        width="auto"
        className="text-xs"
        tickFormatter={(value) => `${((value / totalSimulationTry) * 100).toFixed(0)}%`}
      />
      <Tooltip
        content={
          <CustomTooltip
            payload={data}
            totalSimulationTry={totalSimulationTry}
            active
            coordinate={{ x: 0, y: 0 }}
            accessibilityLayer
          />
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
