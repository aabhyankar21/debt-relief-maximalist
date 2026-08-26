import { useEffect } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { useJourney } from '../../engine/journey';
import { insights, mixSegments, type ChartKind } from './figures';
import styles from './vault.module.css';

function useMetricText(
  value: number,
  prefix = '',
  suffix = '',
  decimals = 0,
) {
  const raw = useMotionValue(value);
  const spring = useSpring(raw, { stiffness: 120, damping: 22, mass: 0.8 });

  useEffect(() => {
    raw.set(value);
  }, [raw, value]);

  return useTransform(spring, (latest) => {
    const shown =
      decimals > 0 ? latest.toFixed(decimals) : `${Math.round(latest)}`;
    return `${prefix}${shown}${suffix}`;
  });
}

const ease = [0.22, 1, 0.36, 1] as const;

const RISE_W = 440;
const RISE_H = 188;
const RISE_LINE = 'M8 140 C 120 138, 180 112, 252 80 S 372 34, 428 30';
const RISE_AREA = `${RISE_LINE} L428 150 L8 150 Z`;
const RISE_MARK = { x: 428, y: 30 };

function RiseChart({ reduce }: { reduce: boolean }) {
  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${RISE_W} ${RISE_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="vaultRiseFill"
          x1="0"
          y1="28"
          x2="0"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#00c896" stopOpacity="0.32" />
          <stop offset="1" stopColor="#00c896" stopOpacity="0" />
        </linearGradient>
        <clipPath id="vaultRiseClip">
          <motion.rect
            x="0"
            y="0"
            height={RISE_H}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: RISE_W }}
            transition={{ duration: reduce ? 0 : 1.2, ease }}
          />
        </clipPath>
      </defs>
      <g clipPath="url(#vaultRiseClip)">
        <motion.path
          d={RISE_AREA}
          fill="url(#vaultRiseFill)"
          stroke="none"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.2, duration: 0.75, ease }}
        />
        <path
          d={RISE_LINE}
          fill="none"
          stroke="rgb(255 255 255 / 16%)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d={RISE_LINE}
          fill="none"
          stroke="#00c896"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 1.2, ease }}
        />
      </g>
      <circle
        className={styles.ripple}
        cx={RISE_MARK.x}
        cy={RISE_MARK.y}
        r="7"
        fill="none"
      />
      <circle
        className={styles.rippleLate}
        cx={RISE_MARK.x}
        cy={RISE_MARK.y}
        r="7"
        fill="none"
      />
      <motion.circle
        cx={RISE_MARK.x}
        cy={RISE_MARK.y}
        r="6.25"
        fill="#e07a5f"
        stroke="#14181d"
        strokeWidth="2"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={reduce ? { scale: 1 } : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.95, type: 'spring', stiffness: 260, damping: 16 }}
      />
    </svg>
  );
}

function MixChart({ reduce }: { reduce: boolean }) {
  return (
    <div className={styles.mix}>
      <div className={styles.mixTrack}>
        {mixSegments.map((segment) => (
          <motion.span
            key={segment.id}
            className={styles.mixSeg}
            style={{ background: segment.color }}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${segment.share}%` }}
            transition={{ duration: 0.7, ease }}
          />
        ))}
      </div>
      <ul className={styles.mixLegend}>
        {mixSegments.map((segment, i) => (
          <motion.li
            key={segment.id}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.05, duration: 0.36, ease }}
          >
            <i style={{ background: segment.color }} />
            {segment.label} {segment.share}%
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function StressChart({ value, reduce }: { value: number; reduce: boolean }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg className={styles.ringChart} viewBox="0 0 96 96" aria-hidden="true">
      <circle
        cx="48"
        cy="48"
        r={radius}
        fill="none"
        stroke="rgb(255 255 255 / 12%)"
        strokeWidth="8"
      />
      <motion.circle
        cx="48"
        cy="48"
        r={radius}
        fill="none"
        stroke="#00c896"
        strokeWidth="8"
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        strokeDasharray={circumference}
        initial={
          reduce
            ? { strokeDashoffset: circumference * (1 - value / 100) }
            : { strokeDashoffset: circumference }
        }
        animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
        transition={{ duration: 1, ease }}
      />
    </svg>
  );
}

function ShareChart({ value, reduce }: { value: number; reduce: boolean }) {
  const filled = Math.round(value / 10);
  return (
    <div className={styles.people} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className={styles.person}
          data-on={i < filled}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.32, ease }}
        />
      ))}
    </div>
  );
}

const SHIELD =
  'M60 16 L93 30.5 V54.5 C93 79 76.5 95.5 60 104.5 C43.5 95.5 27 79 27 54.5 V30.5 Z';
const SHIELD_INNER =
  'M60 24.5 L84 36 V54.5 C84 75 71 89.5 60 96.5 C49 89.5 36 75 36 54.5 V36 Z';
const CHECK = 'M45 59.5 L54.5 69.5 L76.5 45.5';

function SecureChart({ reduce }: { reduce: boolean }) {
  return (
    <svg className={styles.secureChart} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="vaultSecureGlow" cx="50%" cy="46%" r="50%">
          <stop offset="0" stopColor="#00c896" stopOpacity="0.38" />
          <stop offset="0.55" stopColor="#00c896" stopOpacity="0.12" />
          <stop offset="1" stopColor="#00c896" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="vaultSecureFill"
          x1="60"
          y1="16"
          x2="60"
          y2="105"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="rgb(0 200 150 / 28%)" />
          <stop offset="0.5" stopColor="rgb(0 200 150 / 14%)" />
          <stop offset="1" stopColor="rgb(0 200 150 / 6%)" />
        </linearGradient>
        <linearGradient
          id="vaultSecureSheen"
          x1="44"
          y1="24"
          x2="78"
          y2="88"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#00c896" stopOpacity="0.08" />
        </linearGradient>
        <filter id="vaultSecureDrop" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="5"
            floodColor="#00c896"
            floodOpacity="0.42"
          />
        </filter>
      </defs>

      <circle
        className={styles.secureGlow}
        cx="60"
        cy="62"
        r="48"
        fill="url(#vaultSecureGlow)"
      />
      <circle className={styles.secureRipple} cx="60" cy="62" r="40" />
      <circle className={styles.secureRippleLate} cx="60" cy="62" r="40" />

      <g className={styles.secureBody} filter="url(#vaultSecureDrop)">
        <motion.path
          d={SHIELD}
          fill="url(#vaultSecureFill)"
          stroke="none"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.28, duration: 0.5, ease }}
        />
        <motion.path
          d={SHIELD_INNER}
          fill="url(#vaultSecureSheen)"
          stroke="none"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.42, duration: 0.45, ease }}
        />
        <motion.path
          d={SHIELD}
          fill="none"
          stroke="#00c896"
          strokeWidth="2.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 0.95, ease }}
        />
        <motion.path
          d={SHIELD_INNER}
          fill="none"
          stroke="#7ae8c8"
          strokeWidth="1.15"
          strokeLinejoin="round"
          opacity="0.45"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: reduce ? 0 : 0.18, duration: 0.8, ease }}
        />
        <motion.path
          d={CHECK}
          fill="none"
          stroke="#7ae8c8"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: reduce ? 0 : 0.62, duration: 0.42, ease }}
        />
        <motion.circle
          cx="60"
          cy="16.5"
          r="4.2"
          fill="#e07a5f"
          stroke="#14181d"
          strokeWidth="1.6"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: reduce ? 0 : 0.88,
            type: 'spring',
            stiffness: 280,
            damping: 16,
          }}
        />
      </g>
    </svg>
  );
}

function DtiChart({ reduce }: { reduce: boolean }) {
  return (
    <div className={styles.coins} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <motion.span
          key={i}
          className={styles.coin}
          data-on={i === 0}
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 240 }}
        />
      ))}
    </div>
  );
}

function StatesChart({ reduce }: { reduce: boolean }) {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: 50 }, (_, i) => (
        <motion.span
          key={i}
          className={styles.dot}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.012, type: 'spring', stiffness: 260 }}
        />
      ))}
    </div>
  );
}

function CompareChart({ reduce }: { reduce: boolean }) {
  const heights = [46, 72, 58];
  return (
    <div className={styles.compare} aria-hidden="true">
      {heights.map((height, i) => (
        <motion.span
          key={height}
          className={styles.compareCol}
          initial={reduce ? { height } : { height: 8 }}
          animate={{ height }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 160 }}
        />
      ))}
    </div>
  );
}

function Chart({
  kind,
  value,
  reduce,
}: {
  kind: ChartKind;
  value: number;
  reduce: boolean;
}) {
  switch (kind) {
    case 'rise':
      return <RiseChart reduce={reduce} />;
    case 'mix':
      return <MixChart reduce={reduce} />;
    case 'stress':
      return <StressChart value={value} reduce={reduce} />;
    case 'share':
      return <ShareChart value={value} reduce={reduce} />;
    case 'secure':
      return <SecureChart reduce={reduce} />;
    case 'dti':
      return <DtiChart reduce={reduce} />;
    case 'states':
      return <StatesChart reduce={reduce} />;
    case 'compare':
      return <CompareChart reduce={reduce} />;
  }
}

/** Step-relevant context for the current Vault step — never a copy of the form. */
export function InsightPanel({ compact = false }: { compact?: boolean }) {
  const { step, finished } = useJourney();
  const reduce = useReducedMotion() ?? false;
  const id = finished ? 'result' : step.id;
  const insight = insights[id] ?? insights['debt-amount'];
  const metric = useMetricText(
    insight.value,
    insight.prefix,
    insight.suffix,
    insight.decimals ?? 0,
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.article
        key={id}
        className={styles.insight}
        data-compact={compact ? 'true' : 'false'}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -10 }}
        transition={{ duration: 0.38, ease }}
      >
        <p className={styles.kicker}>{insight.kicker}</p>
        <motion.p className={styles.metric}>{metric}</motion.p>
        <p className={styles.metricLabel}>{insight.label}</p>

        {compact ? null : (
          <>
            <div className={styles.chartWrap}>
              <Chart kind={insight.chart} value={insight.value} reduce={reduce} />
            </div>
            {insight.body ? (
              <p className={styles.insightBody}>{insight.body}</p>
            ) : null}
            {insight.notes && insight.notes.length > 0 ? (
              <ul className={styles.notes}>
                {insight.notes.map((note, i) => (
                  <motion.li
                    key={note.label}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.18 + i * 0.08,
                      duration: 0.4,
                      ease,
                    }}
                  >
                    <strong>{note.value}</strong>
                    <span>{note.label}</span>
                  </motion.li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </motion.article>
    </AnimatePresence>
  );
}
