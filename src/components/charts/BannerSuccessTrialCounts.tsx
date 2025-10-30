'use client';

import ChartWrapper from '#/components/charts/ChartWrapper';
import BrushBarChart from '#/components/charts/SummaryBrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';

export default function BannerSuccessTrialCounts({
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
      {/* 여기는 상위 컴포넌트에서 미리 result가 존재하는지 보고 보내는 게 맞을듯? */}
      {result && result.perBanner[0] ? (
        <BrushBarChart
          labels={Array.from(
            { length: result.perBanner[0].bannerHistograms.length },
            (_, index) => `${index}`,
          )}
          data={result.perBanner[0].bannerHistograms.map((value) => value)}
          colors={{
            backgroundColor: '#fe9a00',
            borderColor: '#fe9a00',
            hoverBackgroundColor: '#a684ff',
            hoverBorderColor: '#a684ff',
          }}
          tooltipCallback={() => 'dev'}
        />
      ) : null}
    </ChartWrapper>
  );
}
