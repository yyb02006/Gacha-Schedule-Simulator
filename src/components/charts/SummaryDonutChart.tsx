import { Cell, Pie, PieChart, PieLabelRenderProps } from 'recharts';

interface MyLabelLineProps {
  percent?: number;
  points?: { x: number; y: number }[];
}

const convertToNumber = (value: string | number | undefined | unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  return 0;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  const RADIAN = Math.PI / 180;
  const _outerRadius = convertToNumber(outerRadius);
  const _innerRadius = convertToNumber(innerRadius);
  const _cx = convertToNumber(cx);
  const _cy = convertToNumber(cy);
  const _midAngle = convertToNumber(midAngle);
  const _percent = convertToNumber(percent);

  const radius =
    _percent > 0.05 ? _innerRadius + (_outerRadius - _innerRadius) * 0.5 : _outerRadius + 20;

  const x = _cx + radius * Math.cos(-_midAngle * RADIAN);
  const y = _cy + radius * Math.sin(-_midAngle * RADIAN);

  if (cx === undefined || cy === undefined) {
    return <text>{`${(_percent * 100).toFixed(0)}%`}</text>;
  }

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className={_percent < 0.05 ? 'text-sm' : 'text-base'}
    >
      {_percent * 100 > 0 ? `${(_percent * 100).toFixed(0)}%` : null}
    </text>
  );
};

const renderCustomLabelLine = (props: MyLabelLineProps) => {
  const { percent, points } = props;
  if (!percent || percent > 0.05 || !points) return <path />;

  const [start, end] = points;

  const midX = start.x + (end.x - start.x) * 0.3;
  const midY = start.y + (end.y - start.y) * 0.3;
  return (
    <path d={`M${start.x},${start.y}L${midX},${midY}`} stroke="#aaa" strokeWidth={2} fill="none" />
  );
};

export default function SummaryDonutChart({
  simulationResultData,
  fill,
}: {
  simulationResultData: {
    name: string;
    value: number;
  }[];
  fill: string[];
}) {
  return (
    <div className="font-S-CoreDream-500 flex justify-center">
      <PieChart className="aspect-square max-h-[500px] w-2/3 max-w-[500px]" responsive>
        <Pie
          data={simulationResultData}
          innerRadius="30%"
          labelLine={renderCustomLabelLine}
          label={renderCustomizedLabel}
          fill="#8884d8"
          dataKey="value"
        >
          {simulationResultData.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={fill[index % 4]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
}
