import { useEffect } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { insights, mixSegments, type ChartKind } from '../haven/figures';
import { useJourney } from '../../engine/journey';
import { CheckIcon, LockIcon, ShieldIcon } from '../../ui/icons';
import { FLUX_PALETTES, ParticleField } from './Particles';
import styles from './flux.module.css';

const MIX_COLORS = ['#d6ff3d', '#3df0ff', '#a78bfa', '#ff3d9a', '#ffb03d'];

const TRUST: Record<string, { icon: 'shield' | 'lock' | 'check'; label: string }[]> =
  {
    'debt-type': [
      { icon: 'check', label: "Won't affect your credit score" },
    ],
    contact: [
      { icon: 'lock', label: 'Secured by Forbes.com' },
      { icon: 'shield', label: 'Your privacy is our priority' },
    ],
    'date-of-birth': [
      { icon: 'check', label: 'No hard inquiry on this check' },
      { icon: 'lock', label: 'Never shared without permission' },
    ],
    phone: [
      { icon: 'lock', label: 'One-time text to confirm it is you' },
      { icon: 'shield', label: 'Secured by Forbes Advisor' },
    ],
    income: [
      { icon: 'lock', label: 'Your privacy is our priority' },
    ],
    address: [
      { icon: 'lock', label: 'Secured by Forbes.com' },
      { icon: 'check', label: 'Matched to in-state options' },
    ],
    result: [
      { icon: 'check', label: 'No impact to check options' },
    ],
  };

function TrustIcon({ name }: { name: 'shield' | 'lock' | 'check' }) {
  if (name === 'lock') return <LockIcon />;
  if (name === 'check') return <CheckIcon />;
  return <ShieldIcon />;
}

function useMetricText(
  value: number,
  prefix = '',
  suffix = '',
  decimals = 0,
) {
  const raw = useMotionValue(value);
  const spring = useSpring(raw, { stiffness: 140, damping: 20, mass: 0.7 });

  useEffect(() => {
    raw.set(value);
  }, [raw, value]);

  return useTransform(spring, (latest) => {
    const shown =
      decimals > 0 ? latest.toFixed(decimals) : `${Math.round(latest)}`;
    return `${prefix}${shown}${suffix}`;
  });
}

function RiseChart() {
  return (
    <svg className={styles.chart} viewBox="0 0 280 96" aria-hidden="true">
      <defs>
        <linearGradient id="fluxRise" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#d6ff3d" />
          <stop offset="100%" stopColor="#ff3d9a" />
        </linearGradient>
      </defs>
      <path
        d="M8 78 C 52 76, 78 68, 118 58 S 188 28, 272 16"
        fill="none"
        stroke="rgb(255 255 255 / 12%)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.path
        d="M8 78 C 52 76, 78 68, 118 58 S 188 28, 272 16"
        fill="none"
        stroke="url(#fluxRise)"
        strokeWidth="3.2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx="272"
        cy="16"
        r="6"
        fill="#ff3d9a"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.35 }}
        transition={{ delay: 0.85, type: 'spring', stiffness: 260, damping: 16 }}
      />
    </svg>
  );
}

function MixChart() {
  return (
    <div className={styles.mix}>
      <div className={styles.mixTrack}>
        {mixSegments.map((segment, i) => (
          <motion.span
            key={segment.id}
            className={styles.mixSeg}
            style={{ background: MIX_COLORS[i] }}
            initial={{ width: 0 }}
            animate={{ width: `${segment.share}%` }}
            whileHover={{ filter: 'brightness(1.18)', y: -2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            title={`${segment.label} ${segment.share}%`}
          />
        ))}
      </div>
      <ul className={styles.mixLegend}>
        {mixSegments.map((segment, i) => (
          <motion.li key={segment.id} whileHover={{ x: 3 }}>
            <i style={{ background: MIX_COLORS[i] }} />
            {segment.label} {segment.share}%
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function StressChart({ value }: { value: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={styles.ringWrap}>
      <svg className={styles.ringChart} viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgb(255 255 255 / 10%)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#3df0ff"
          strokeWidth="8"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  );
}

function ShareChart({ value }: { value: number }) {
  const filled = Math.round(value / 10);
  return (
    <div className={styles.people} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className={styles.person}
          data-on={i < filled}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.08 }}
          transition={{ delay: i * 0.04 }}
        />
      ))}
    </div>
  );
}

function SecureChart() {
  return (
    <svg className={styles.iconChart} viewBox="0 0 72 72" aria-hidden="true">
      <motion.path
        d="M36 10 58 20v18c0 14-9 24-22 28-13-4-22-14-22-28V20L36 10Z"
        fill="rgb(61 240 255 / 12%)"
        stroke="#3df0ff"
        strokeWidth="2.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9 }}
      />
      <motion.path
        d="m28 38 6 6 12-14"
        fill="none"
        stroke="#d6ff3d"
        strokeWidth="2.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      />
    </svg>
  );
}

function DtiChart() {
  return (
    <div className={styles.coins} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className={styles.coin}
          data-on={i === 0}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ y: -6, scale: 1.12 }}
          transition={{ delay: i * 0.045, type: 'spring', stiffness: 240 }}
        />
      ))}
    </div>
  );
}

function StatesChart() {
  return (
    <div className={styles.stateDots} aria-hidden="true">
      {Array.from({ length: 50 }, (_, i) => (
        <motion.span
          key={i}
          className={styles.stateDot}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.6 }}
          transition={{ delay: i * 0.01, type: 'spring', stiffness: 280 }}
        />
      ))}
    </div>
  );
}

function CompareChart() {
  const heights = [48, 78, 60];
  const colors = ['#3df0ff', '#d6ff3d', '#ff3d9a'];
  return (
    <div className={styles.compare} aria-hidden="true">
      {heights.map((height, i) => (
        <motion.span
          key={colors[i]}
          className={styles.compareCol}
          style={{ background: colors[i] }}
          initial={{ height: 8 }}
          animate={{ height }}
          whileHover={{ scaleY: 1.08, filter: 'brightness(1.15)' }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 170 }}
        />
      ))}
    </div>
  );
}

function Chart({ kind, value }: { kind: ChartKind; value: number }) {
  switch (kind) {
    case 'rise':
      return <RiseChart />;
    case 'mix':
      return <MixChart />;
    case 'stress':
      return <StressChart value={value} />;
    case 'share':
      return <ShareChart value={value} />;
    case 'secure':
      return <SecureChart />;
    case 'dti':
      return <DtiChart />;
    case 'states':
      return <StatesChart />;
    case 'compare':
      return <CompareChart />;
  }
}

/** Step-relevant stats, graphs, and trust marks — never a copy of the form. */
export function StatsDeck({ compact = false }: { compact?: boolean }) {
  const { step, finished } = useJourney();
  const reduce = useReducedMotion();
  const id = finished ? 'result' : step.id;
  const insight = insights[id] ?? insights['debt-amount'];
  const marks = TRUST[id] ?? [];
  const palette = FLUX_PALETTES[id] ?? FLUX_PALETTES['debt-amount'];
  const metric = useMetricText(
    insight.value,
    insight.prefix,
    insight.suffix,
    insight.decimals ?? 0,
  );

  return (
    <div className={styles.deck} data-compact={compact ? 'true' : 'false'}>
      <ParticleField palette={palette} compact={compact} className={styles.particles} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={id}
          className={styles.insight}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.kicker}>{insight.kicker}</p>
          <motion.p className={styles.metric}>{metric}</motion.p>
          <p className={styles.metricLabel}>{insight.label}</p>

          <div className={styles.chartWrap}>
            <Chart kind={insight.chart} value={insight.value} />
          </div>

          {compact || !insight.body ? null : (
            <p className={styles.body}>{insight.body}</p>
          )}

          {insight.notes ? (
            <ul className={styles.notes}>
              {insight.notes.map((note) => (
                <motion.li
                  key={note.label}
                  whileHover={reduce ? undefined : { y: -3, scale: 1.03 }}
                >
                  <strong>{note.value}</strong>
                  <span>{note.label}</span>
                </motion.li>
              ))}
            </ul>
          ) : null}

          {marks.length > 0 ? (
            <ul className={styles.trustMarks}>
              {(compact ? marks.slice(0, 1) : marks).map((mark) => (
                <motion.li
                  key={mark.label}
                  whileHover={reduce ? undefined : { y: -2, scale: 1.04 }}
                >
                  <TrustIcon name={mark.icon} />
                  {mark.label}
                </motion.li>
              ))}
            </ul>
          ) : null}

          {insight.source ? (
            <p className={styles.source}>{insight.source}</p>
          ) : null}
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
