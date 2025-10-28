import ChartWrapper from '#/components/charts/ChartWrapper';
import BrushBarChart from '#/components/charts/SummaryBrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { truncateToTwoDecimals } from '#/libs/utils';
import { motion } from 'motion/react';
import { TooltipContentProps } from 'recharts';

const BannerGachaSuccessTooltip: React.FC<
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
            <span className="text-amber-400">{`${data.value.toLocaleString()} 회`}</span>
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

export default function BannerWinRate({ result }: { result: GachaSimulationMergedResult | null }) {
  return (
    <ChartWrapper
      title={
        <span>
          <span className="text-amber-400">배너별 </span>성공률
        </span>
      }
    >
      {result ? (
        <BrushBarChart
          data={result.perBanner.map(({ name, bannerSuccess }) => ({
            name,
            value: bannerSuccess,
          }))}
          totalSimulationTry={result.total.simulationTry}
          yAxisTickFormatter={(value) =>
            `${((value / result.total.simulationTry) * 100).toFixed(0)}%`
          }
          customTooltip={BannerGachaSuccessTooltip}
        />
      ) : null}
    </ChartWrapper>
  );
}
