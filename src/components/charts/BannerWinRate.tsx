'use client';

import ChartWrapper from '#/components/charts/ChartWrapper';
import BrushBarChart from '#/components/charts/SummaryBrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';

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
          labels={result.perBanner.map(({ name }) => name)}
          data={result.perBanner.map(({ bannerSuccess }) => bannerSuccess)}
          colors={{
            backgroundColor: '#fe9a00CC',
            borderColor: '#fe9a00',
            hoverBackgroundColor: '#a684ffCC',
            hoverBorderColor: '#a684ff',
          }}
          tooltipCallback={() => 'test'}
        />
      ) : null}
    </ChartWrapper>
  );
}
