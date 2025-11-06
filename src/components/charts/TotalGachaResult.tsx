'use client';

import { CreateTooltipLiteralProps } from '#/components/charts/BannerWinRate';
import ChartWrapper from '#/components/charts/base/ChartWrapper';
import DonutChart from '#/components/charts/base/DonutChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { rarityColor } from '#/constants/ui';
import { obtainedTypes, rarities } from '#/constants/variables';
import { cls, truncateToDecimals } from '#/libs/utils';
import { OperatorRarityForString } from '#/types/types';

const tooltip = ({
  title,
  textColor,
  body,
  data,
  total,
}: CreateTooltipLiteralProps<'doughnut'>) => {
  const stringifiedValue = data?.formattedValue ?? '';
  const parsedRawValue = data.parsed;
  const label = data.label;
  const borderColor = (data.dataset.borderColor as string[])[data.dataIndex];

  return /*html*/ `
    <div class="space-y-3 rounded-xl bg-[#202020] px-4 py-3 opacity-90 shadow-xl shadow-[#141414]">
      ${title.map((t) => `<p style="color: ${textColor}" class="text-lg font-S-CoreDream-500">${t}</p>`).join('')}
      ${body
        .map((b, i) => {
          return /*html*/ `
          <div class="font-S-CoreDream-300 space-y-[2px] text-sm">
            <p>
              ${label} 등장 횟수 :
              <span style="color: ${borderColor};">${stringifiedValue} 회</span>
            </p>
            <p>
              ${label} 등장 확률 :
              <span style="color: ${borderColor};">${truncateToDecimals((parsedRawValue / (total ?? 1)) * 100)}%</span>
            </p>
          </div>
        `;
        })
        .join('')}
    </div>
  `;
};

const createLegendHTML = (labels: string[], colors: string[]) =>
  labels
    .map((label, i) => {
      const color = colors[i];
      return `
        <div data-index="${i}" class="flex items-center gap-1 cursor-pointer group">
          <div class="size-2 rounded-full transition-transform group-hover:scale-[120%]"
            style="background:${color}"/></div>
          <span class="text-[#ccc] group-hover:text-[#eaeaea]">${label}</span>
        </div>
      `;
    })
    .join('');

const RarityResultDetail = ({
  result,
  rarity,
}: {
  result: GachaSimulationMergedResult;
  rarity: OperatorRarityForString;
}) => {
  return (
    <ul className="font-S-CoreDream-500 flex-1 space-y-1 text-[15px] whitespace-nowrap">
      <h1 className={cls(rarityColor[rarity].textColor, 'mb-[10px]')}>
        {`${rarities[rarity]}성 결과`} (
        {truncateToDecimals(
          (result.total.statistics[rarity].totalObtained / result.total.totalGachaRuns) * 100,
        )}
        %)
      </h1>
      {obtainedTypes.map((obtainedType) => (
        <li key={obtainedType} className="font-S-CoreDream-300 text-[13px]">
          {obtainedType === 'totalObtained' ? (
            <div>
              {'총 등장 : '}
              {result.total.statistics[rarity][obtainedType].toLocaleString()} 회{' '}
            </div>
          ) : (
            <div>
              {obtainedType === 'pickupObtained' ? '픽업오퍼 등장' : '목표오퍼 등장'} :{' '}
              {result.total.statistics[rarity][obtainedType].toLocaleString()} 회
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default function TotalGachaResult({
  result,
}: {
  result: GachaSimulationMergedResult | null;
}) {
  const rarityResultData = {
    data:
      result === null
        ? []
        : [
            result.total.statistics.sixth.totalObtained,
            result.total.statistics.fifth.totalObtained,
            result.total.statistics.fourth.totalObtained,
            result.total.totalGachaRuns -
              result.total.statistics.sixth.totalObtained -
              result.total.statistics.fifth.totalObtained -
              result.total.statistics.fourth.totalObtained,
          ],
    labels: ['6성', '5성', '4성', '3성'],
  };
  return (
    <ChartWrapper
      title={
        <span>
          <span className="text-amber-400">전체 가챠 </span>통계
        </span>
      }
    >
      {result ? (
        <div className="p-4 text-sm">
          <DonutChart
            data={rarityResultData.data}
            labels={rarityResultData.labels}
            backgroundColor={Object.values(rarityColor).map(({ HEX }) => HEX + 'CC')}
            borderColor={Object.values(rarityColor).map(({ HEX }) => HEX)}
            createLegendHTML={createLegendHTML}
            tooltipCallback={tooltip}
          />
          <div className="flex flex-col flex-wrap gap-5">
            <div className="flex flex-1 flex-wrap gap-4">
              <RarityResultDetail rarity="sixth" result={result} />
              <RarityResultDetail rarity="fifth" result={result} />
            </div>
            <div className="flex flex-1 flex-wrap gap-4">
              <RarityResultDetail rarity="fourth" result={result} />
              <div className="font-S-CoreDream-500 flex-1 space-y-1 text-[15px] whitespace-nowrap">
                <h1 className="mb-[10px] text-sky-500">
                  3성 결과 (
                  {truncateToDecimals(
                    ((result.total.totalGachaRuns -
                      result.total.statistics.sixth.totalObtained -
                      result.total.statistics.fifth.totalObtained -
                      result.total.statistics.fourth.totalObtained) /
                      result.total.totalGachaRuns) *
                      100,
                  )}
                  %)
                </h1>
                <div className="font-S-CoreDream-300 text-[13px]">
                  총 등장 :{' '}
                  {(
                    result.total.totalGachaRuns -
                    result.total.statistics.sixth.totalObtained -
                    result.total.statistics.fifth.totalObtained -
                    result.total.statistics.fourth.totalObtained
                  ).toLocaleString()}{' '}
                  회{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ChartWrapper>
  );
}
