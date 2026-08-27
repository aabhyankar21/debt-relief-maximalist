import { useEffect, useId, useRef } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import styles from './dataMoment.module.css';

/* ------------------------------------------------------------------ *
 * Config
 *
 * Timing and geometry only. Numeric/label content is always passed in
 * as props — steps 1, 7, 8 and 9 need compliance-approved copy or an
 * explicit "illustrative" label before shipping with real figures.
 * ------------------------------------------------------------------ */

export const DATA_MOMENT_CONFIG = {
  bar: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  arc: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  trust: { duration: 1.05, delay: 0.08 },
  counter: { duration: 0.7 },
  chips: { duration: 0.32, stagger: 0.15, ease: [0.22, 1, 0.36, 1] as const },
  reduced: { duration: 0.2 },
  geometry: {
    barHeight: 8,
    markerWidth: 2,
    arcSize: 44,
    arcStroke: 3.2,
  },
} as const;

export type DataMomentVariant =
  | 'none'
  | 'benchmark-bar'
  | 'fit-arc'
  | 'trust-check'
  | 'counter'
  | 'snapshot-chips';

export interface SnapshotChip {
  label: string;
  value: string;
}

export interface DataMomentProps {
  variant: DataMomentVariant;
  /** 0–1 for bars/arcs; a count target for `counter`. */
  value?: number | string;
  label?: string;
  /** Comparison point on the benchmark bar, 0–1. */
  marker?: number;
  chips?: SnapshotChip[];
  className?: string;
}

function asUnit(value: number | string | undefined, fallback = 0) {
  if (value == null) return fallback;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(numeric, 0), 1);
}

function asCount(value: number | string | undefined) {
  if (value == null) return 0;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatCount(value: number) {
  return Math.round(value).toLocaleString('en-US');
}

export function DataMoment({
  variant,
  value,
  label,
  marker = 0.55,
  chips,
  className,
}: DataMomentProps) {
  if (variant === 'none') return null;

  const wrap = `${styles.moment}${className ? ` ${className}` : ''}`;

  return (
    <div className={wrap} data-variant={variant} aria-hidden="true">
      {variant === 'benchmark-bar' ? (
        <BenchmarkBar value={asUnit(value)} marker={marker} label={label} />
      ) : null}
      {variant === 'fit-arc' ? (
        <FitArc value={asUnit(value)} label={label} />
      ) : null}
      {variant === 'trust-check' ? <TrustCheck label={label} /> : null}
      {variant === 'counter' ? (
        <Counter value={asCount(value)} label={label} />
      ) : null}
      {variant === 'snapshot-chips' ? (
        <SnapshotChips chips={chips ?? []} />
      ) : null}
    </div>
  );
}

function BenchmarkBar({
  value,
  marker,
  label,
}: {
  value: number;
  marker: number;
  label?: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const { bar, reduced } = DATA_MOMENT_CONFIG;
  const width = useMotionValue(0);
  const barWidth = useTransform(width, (t) => `${(t * 100).toFixed(2)}%`);

  useEffect(() => {
    width.set(reduceMotion ? value : 0);
    const controls = animate(width, value, {
      duration: reduceMotion ? reduced.duration : bar.duration,
      ease: reduceMotion ? 'linear' : bar.ease,
    });
    return () => controls.stop();
  }, [width, value, reduceMotion]);

  return (
    <div className={styles.barBlock}>
      <div className={styles.barTrack}>
        <motion.span className={styles.barFill} style={{ width: barWidth }} />
        <span
          className={styles.barMarker}
          style={{ left: `${marker * 100}%` }}
        />
      </div>
      {label ? <p className={styles.caption}>{label}</p> : null}
    </div>
  );
}

function FitArc({ value, label }: { value: number; label?: string }) {
  const reduceMotion = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, '');
  const { arc, reduced, geometry } = DATA_MOMENT_CONFIG;
  const radius = (geometry.arcSize - geometry.arcStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = useMotionValue(circumference);

  useEffect(() => {
    const target = circumference * (1 - value);
    offset.set(reduceMotion ? target : circumference);
    const controls = animate(offset, target, {
      duration: reduceMotion ? reduced.duration : arc.duration,
      ease: reduceMotion ? 'linear' : arc.ease,
    });
    return () => controls.stop();
  }, [offset, value, circumference, reduceMotion]);

  return (
    <div className={styles.arcBlock}>
      <svg
        className={styles.arc}
        width={geometry.arcSize}
        height={geometry.arcSize}
        viewBox={`0 0 ${geometry.arcSize} ${geometry.arcSize}`}
      >
        <circle
          cx={geometry.arcSize / 2}
          cy={geometry.arcSize / 2}
          r={radius}
          fill="none"
          stroke={`url(#${uid}-track)`}
          strokeWidth={geometry.arcStroke}
        />
        <motion.circle
          cx={geometry.arcSize / 2}
          cy={geometry.arcSize / 2}
          r={radius}
          fill="none"
          stroke="var(--pulse-accent)"
          strokeWidth={geometry.arcStroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          transform={`rotate(-90 ${geometry.arcSize / 2} ${geometry.arcSize / 2})`}
        />
        <defs>
          <linearGradient id={`${uid}-track`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--pulse-accent)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--pulse-accent)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
      {label ? <p className={styles.caption}>{label}</p> : null}
    </div>
  );
}

function TrustCheck({ label }: { label?: string }) {
  const reduceMotion = useReducedMotion() ?? false;
  const { trust, reduced } = DATA_MOMENT_CONFIG;
  const draw = reduceMotion
    ? { duration: reduced.duration, delay: 0 }
    : { duration: trust.duration, delay: trust.delay, ease: 'easeOut' as const };

  return (
    <div className={styles.trust}>
      <svg className={styles.shield} viewBox="0 0 36 40" fill="none">
        <motion.path
          d="M18 2.4 32 8.2v11.4c0 8.2-5.6 15.6-14 18.4C9.6 35.2 4 27.8 4 19.6V8.2L18 2.4Z"
          stroke="var(--pulse-accent-deep)"
          strokeWidth="1.6"
          initial={{ pathLength: 0, opacity: reduceMotion ? 0 : 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={draw}
        />
        <motion.path
          d="m12.2 20.2 4.1 4.2 7.8-8.4"
          stroke="var(--pulse-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: reduceMotion ? 0 : 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            ...draw,
            delay: (draw.delay ?? 0) + (reduceMotion ? 0 : 0.28),
          }}
        />
      </svg>
      {label ? <p className={styles.caption}>{label}</p> : null}
    </div>
  );
}

function Counter({ value, label }: { value: number; label?: string }) {
  const reduceMotion = useReducedMotion() ?? false;
  const nodeRef = useRef<HTMLSpanElement>(null);
  const counter = useMotionValue(0);
    const { counter: timing } = DATA_MOMENT_CONFIG;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    if (reduceMotion) {
      node.textContent = formatCount(value);
      return;
    }

    const from = value >= 1000 ? Math.floor((value * 0.78) / 100) * 100 : 0;
    counter.set(from);
    const unsubscribe = counter.on('change', (next) => {
      node.textContent = formatCount(next);
    });
    const controls = animate(counter, value, {
      duration: timing.duration,
      ease: 'easeOut',
    });

    return () => {
      controls.stop();
      unsubscribe();
      node.textContent = formatCount(value);
    };
  }, [counter, value, reduceMotion]);

  return (
    <div className={styles.counter}>
      <span ref={nodeRef} className={styles.counterValue}>
        {formatCount(reduceMotion ? value : 0)}
      </span>
      {label ? <p className={styles.caption}>{label}</p> : null}
    </div>
  );
}

function SnapshotChips({ chips }: { chips: SnapshotChip[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  const { chips: timing, reduced } = DATA_MOMENT_CONFIG;

  return (
    <ul className={styles.chips}>
      {chips.map((chip, index) => (
        <motion.li
          key={`${chip.label}-${chip.value}`}
          className={styles.chip}
          initial={
            reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }
          }
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? reduced.duration : timing.duration,
            delay: reduceMotion ? 0 : index * timing.stagger,
            ease: timing.ease,
          }}
        >
          <span className={styles.chipLabel}>{chip.label}</span>
          <span className={styles.chipValue}>{chip.value}</span>
        </motion.li>
      ))}
    </ul>
  );
}
