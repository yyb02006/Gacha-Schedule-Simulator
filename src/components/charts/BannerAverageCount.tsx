import BrushBarChart from '#/components/charts/SummaryBrushBarChart';
import { GachaSimulationMergedResult } from '#/components/PickupList';
import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { truncateToTwoDecimals } from '#/libs/utils';
import { motion } from 'motion/react';
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

export default function BannerAverageCount({
  result,
}: {
  result: GachaSimulationMergedResult | null;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileInView="idle"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ ...cardTransition, ease: 'easeIn' }}
      initial="exit"
      className="font-S-CoreDream-500 w-full space-y-3 rounded-xl p-4"
    >
      <motion.div
        variants={toOpacityZero}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        initial="exit"
      >
        <span className="text-amber-400">배너별</span> 평균 가챠횟수
      </motion.div>
      {result ? (
        <BrushBarChart
          data={result.perBanner.map(({ name, bannerGachaRuns, bannerSuccess }) => ({
            name,
            value: truncateToTwoDecimals(bannerGachaRuns / bannerSuccess),
          }))}
          totalSimulationTry={result.total.simulationTry}
          customTooltip={BannerGachaCountTooltip}
        />
      ) : null}
    </motion.div>
  );
}
