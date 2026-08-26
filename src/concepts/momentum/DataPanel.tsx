import { motion } from 'motion/react';
import { steps } from '../../data/journey';
import { useJourney } from '../../engine/journey';
import { useAnimatedNumber } from '../../engine/useAnimatedNumber';
import { CheckIcon } from '../../ui/icons';
import styles from './momentum.module.css';

const CHART_W = 260;
const CHART_H = 96;

function chartPoint(ratio: number) {
  const x = ratio * CHART_W;
  const y = 12 + (CHART_H - 26) * ratio ** 1.4;
  return [x, y] as const;
}

/** Descending payoff curve that fills in as the journey progresses. */
function PayoffChart({ ratio, id }: { ratio: number; id: string }) {
  const points = Array.from({ length: 25 }, (_, i) => chartPoint(i / 24));
  const line = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const head = chartPoint(ratio);

  return (
    <svg
      className={styles.spark}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#0ea472" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <motion.rect
            x="0"
            y="0"
            height={CHART_H}
            initial={false}
            animate={{ width: Math.max(ratio, 0.001) * CHART_W }}
            transition={{ type: 'spring', stiffness: 90, damping: 22 }}
          />
        </clipPath>
      </defs>

      <path
        d={line}
        fill="none"
        stroke="var(--c-border)"
        strokeWidth="2"
        strokeDasharray="3 6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      <path
        d={`M0 ${CHART_H - 1} L${CHART_W} ${CHART_H - 1}`}
        stroke="var(--c-border)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />

      <g clipPath={`url(#${id}-clip)`}>
        <path
          d={line}
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      <motion.circle
        r="4"
        fill="#0ea472"
        stroke="#fff"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={{ cx: head[0], cy: head[1] }}
        transition={{ type: 'spring', stiffness: 110, damping: 20 }}
      />
    </svg>
  );
}

export function DataPanel() {
  const journey = useJourney();
  const { index, totalSteps, progress, choices, step, finished } = journey;
  const counter = useAnimatedNumber(progress);

  const selected = steps
    .filter((entry) => entry.kind === 'choice' && choices[entry.id])
    .map((entry) => {
      const choice =
        entry.kind === 'choice'
          ? entry.choices.find((option) => option.id === choices[entry.id])
          : undefined;
      return { id: entry.id, label: choice?.label ?? '' };
    })
    .filter((entry) => entry.label);

  const activeIndex = finished ? totalSteps : index;

  return (
    <div className={styles.panelSticky}>
      <div className={styles.panelCard}>
        <p className={styles.panelLabel}>Progress</p>
        <div className={styles.metricRow}>
          <motion.span className={styles.metric}>{counter}</motion.span>
          <span className={styles.metricUnit}>%</span>
        </div>

        <PayoffChart ratio={progress / 100} id="panel" />

        <div className={styles.bars}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <motion.span
              key={i}
              className={styles.bar}
              data-state={
                i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'todo'
              }
              initial={false}
              animate={{
                scaleY: i <= activeIndex ? 1 : 0.55,
                opacity: i <= activeIndex ? 1 : 0.6,
              }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 20,
                delay: i * 0.025,
              }}
            />
          ))}
        </div>

        {selected.length ? (
          <div className={styles.chips}>
            {selected.map((entry) => (
              <motion.span
                key={entry.id}
                className={styles.chip}
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <CheckIcon />
                {entry.label}
              </motion.span>
            ))}
          </div>
        ) : null}
      </div>

      {!finished && step.callout ? (
        <motion.aside
          className={styles.panelCallout}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.panelCalloutTitle}>{step.callout.title}</p>
          <p className={styles.panelCalloutBody}>{step.callout.body}</p>
        </motion.aside>
      ) : null}
    </div>
  );
}

export function MobileStrip() {
  const { progress } = useJourney();
  const counter = useAnimatedNumber(progress);

  return (
    <div className={styles.mobilePanel}>
      <div className={styles.mobileStrip}>
        <motion.span className={styles.mobileStripMetric}>{counter}</motion.span>
        <span className={styles.metricUnit}>%</span>
        <PayoffChart ratio={progress / 100} id="strip" />
      </div>
    </div>
  );
}
