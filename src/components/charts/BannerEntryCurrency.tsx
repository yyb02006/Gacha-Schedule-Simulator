'use client';

import ChartWrapper from '#/components/charts/base/ChartWrapper';
import BrushBarChart from '#/components/charts/base/BrushBarChart';
import { BannerResult, GachaSimulationMergedResult } from '#/components/PickupList';
import { safeNumberOrZero, truncateToDecimals } from '#/libs/utils';
import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';
import {
  Dispatch,
  forwardRef,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChartRef } from '#/components/charts/base/Brush';

const createTooltipLiteral =
  (bannerResults: BannerResult[]) =>
  ({ title, textColors, body, datasets }: CreateTooltipLiteralProps<'bar'>) => {
    const dataset = datasets[0];
    const stringifiedValue = dataset.formattedValue ?? '';
    const { dataIndex } = dataset;

    return /*html*/ `
  <div class="space-y-3 rounded-xl bg-[#202020] opacity-90 px-4 py-3 shadow-xl shadow-[#141414]">
  ${title.map((t) => `<p style="color: ${textColors[0]}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
  ${body
    .map((b, i) => {
      return /*html*/ `<div key={i} class="font-S-CoreDream-300 space-y-3 text-sm whitespace-nowrap">
          <p>
            진입 시 평균 잔여 합성옥 : <span style="color: #ff6467;" class="font-S-CoreDream-500">${stringifiedValue} 합성옥</span>
          </p>
          <div class="space-y-[3px]">
            <p>
              필요 합성옥 기대값 :
              <span style="color: ${textColors[0]};" class="font-S-CoreDream-500">
                ${(truncateToDecimals(bannerResults[dataIndex].bannerWinGachaRuns / bannerResults[dataIndex].bannerSuccess, 0) * 600).toLocaleString()} 합성옥
              </span>
            </p>
            <p>
              소모 합성옥 기대값 누적 :
              <span style="color: ${textColors[0]};" class="font-S-CoreDream-500">
                ${(
                  truncateToDecimals(
                    bannerResults
                      .slice(0, dataIndex + 1)
                      .reduce(
                        (a, b) => a + safeNumberOrZero(b.bannerWinGachaRuns / b.bannerSuccess),
                        0,
                      ),
                    0,
                  ) * 600
                ).toLocaleString()} 합성옥
              </span>
            </p>
          </div>
        </div>`;
    })
    .join('')}
  </div>`;
  };

export interface LegendData<T extends 'bar' | 'line'> {
  chart: ChartRef<T> | null;
  selectionIndex: { start: number; end: number } | null;
}

const Legend = ({
  result,
  dispatchRef,
}: {
  result: GachaSimulationMergedResult;
  dispatchRef: RefObject<Dispatch<SetStateAction<LegendData<'bar'>>> | null>;
}) => {
  const [legendData, setLegendData] = useState<LegendData<'bar'>>({
    chart: null,
    selectionIndex: null,
  });
  const { cumulative, remained } = result.perBanner
    .slice(legendData.selectionIndex?.start, legendData.selectionIndex?.end)
    .reduce(
      (a, b) => {
        a.cumulative += b.additionalResource;
        a.remained =
          a.remained +
          b.additionalResource -
          truncateToDecimals(b.bannerWinGachaRuns / b.bannerSuccess, 0) * 600;
        return a;
      },
      { cumulative: result.total.initialResource, remained: result.total.initialResource },
    );
  useEffect(() => {
    dispatchRef.current = setLegendData;
  }, [dispatchRef]);
  return (
    <div className="font-S-CoreDream-300 flex flex-wrap gap-8 px-4 text-sm">
      <div>
        누적 합성옥 : <span className="font-S-CoreDream-500 text-red-400">{cumulative}</span>
      </div>
      <div>
        잔여 합성옥 :{' '}
        <span className="font-S-CoreDream-500 text-red-400">{remained >= 0 ? remained : 0}</span>
      </div>
    </div>
  );
};

const BannerEntryCurrency = forwardRef<
  HTMLDivElement,
  {
    result: GachaSimulationMergedResult | null;
    name?: string;
    id?: string;
    chartHeight?: string;
    brushHeight?: string;
    enableBrush?: boolean;
  }
>(({ result, name, id, chartHeight, brushHeight, enableBrush = true }, ref) => {
  // 헤더 : 누적 소모 합성옥, 남은 합성옥, 툴팁: 진입시 합성옥, 소모 합성옥, 누적 소모 합성옥,
  const data = result
    ? result.perBanner.map(({ bannerStartingCurrency }) => bannerStartingCurrency)
    : [];
  const dispatchRef = useRef<Dispatch<SetStateAction<LegendData<'bar'>>>>(null);
  return (
    <ChartWrapper
      header={
        <span>
          배너별 <span className="text-amber-400">진입 시 평균 재화</span>
        </span>
      }
      id={id}
      name={name}
      chartRef={ref}
    >
      {result ? (
        <BrushBarChart
          labels={result.perBanner.map(({ name }) => name)}
          data={data}
          barChartColors={{
            backgroundColor: '#ff6467CC',
            borderColor: '#ff6467',
            hoverBackgroundColor: '#8e51ffcc',
            hoverBorderColor: '#8e51ff',
          }}
          brushColor={{
            backgroundColor: '#8e51ffCC',
            borderColor: '#8e51ff',
          }}
          dispatchRef={dispatchRef}
          total={data.reduce((a, b) => a + b, 0)}
          padding={16}
          enableBrush={enableBrush}
          chartHeight={chartHeight}
          brushHeight={brushHeight}
          createTooltipLiteral={createTooltipLiteral(result.perBanner)}
        >
          <Legend result={result} dispatchRef={dispatchRef} />
        </BrushBarChart>
      ) : null}
    </ChartWrapper>
  );
});

BannerEntryCurrency.displayName = 'BannerEntryCurrency';

export default BannerEntryCurrency;
