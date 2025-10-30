'use client';

import ChartWrapper from '#/components/charts/ChartWrapper';
import BrushBarChart from '#/components/charts/SummaryBrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { truncateToDecimals } from '#/libs/utils';
import { TooltipContentProps } from 'recharts';

const BannerGachaCountTooltip: React.FC<
  TooltipContentProps<number, string> & { totalSimulationTry: number }
> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="space-y-3 rounded-lg bg-[#202020] px-4 py-3 shadow-lg shadow-[#202020]">
      <p className="text-lg">{label}</p>
      {payload.map((data, index) => (
        <div key={index} className="font-S-CoreDream-400 space-y-[2px] text-sm">
          <p>
            {`평균 가챠횟수 : `}
            <span className="text-amber-400">{`${data.value} 회`}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default function BannerAverageCounts({
  result,
}: {
  result: GachaSimulationMergedResult | null;
}) {
  return (
    <ChartWrapper
      title={
        <span>
          <span className="text-amber-400">배너별</span> 평균 가챠횟수
        </span>
      }
    >
      {result ? (
        <BrushBarChart
          labels={result.perBanner.map(({ name }) => name)}
          data={result.perBanner.map(({ bannerGachaRuns, bannerSuccess }) =>
            truncateToDecimals(bannerGachaRuns / bannerSuccess),
          )}
          colors={{
            backgroundColor: '#fe9a00CC',
            borderColor: '#fe9a00',
            hoverBackgroundColor: '#a684ff',
            hoverBorderColor: '#a684ff',
          }}
          tooltipCallback={() => 'test'}
        />
      ) : null}
    </ChartWrapper>
  );
}
