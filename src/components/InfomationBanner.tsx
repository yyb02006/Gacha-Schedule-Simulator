import { cardTransition, cardVariants, toOpacityZero } from '#/constants/variants';
import { motion } from 'motion/react';

export default function ScheduleOverview() {
  return (
    <div className="w-[480px] space-y-6">
      <motion.div
        variants={cardVariants}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...cardTransition, ease: 'easeIn' }}
        initial="exit"
        className="font-S-CoreDream-500 flex w-[480px] items-center rounded-xl p-4"
      >
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
        >
          명일방주 가챠 일정 <span className="text-amber-400">시뮬레이터</span>
        </motion.div>
      </motion.div>
      <motion.div
        variants={cardVariants}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...cardTransition, ease: 'easeIn' }}
        initial="exit"
        className="font-S-CoreDream-500 w-full rounded-xl p-4"
      >
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
        >
          가챠 시뮬레이션 <span className="text-amber-400">결과</span>
        </motion.div>
      </motion.div>
      <motion.div
        variants={cardVariants}
        whileInView="idle"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...cardTransition, ease: 'easeIn' }}
        initial="exit"
        className="font-S-CoreDream-500 w-full rounded-xl p-4"
      >
        <motion.div
          variants={toOpacityZero}
          whileInView="idle"
          viewport={{ once: true, amount: 0.5 }}
          initial="exit"
        >
          가챠 시뮬레이션 <span className="text-amber-400">평균</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
