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
import { insights, type ChartKind } from './figures';
import dollarBill from './dollar-bill.png';
import houseMortgage from './house-mortgage.png';
import styles from './haven.module.css';

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

const RISE_W = 440;
const RISE_H = 188;
const RISE_LINE = 'M8 140 C 120 138, 180 112, 252 80 S 372 34, 428 30';
const RISE_AREA = `${RISE_LINE} L428 150 L8 150 Z`;
const RISE_MARK = { x: 428, y: 30 };
const riseEase = [0.22, 1, 0.36, 1] as const;

function RiseChart() {
  const reduce = useReducedMotion() ?? false;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${RISE_W} ${RISE_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="havenRiseFill"
          x1="0"
          y1="28"
          x2="0"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#4a7c59" stopOpacity="0.38" />
          <stop offset="1" stopColor="#4a7c59" stopOpacity="0.02" />
        </linearGradient>
        <clipPath id="havenRiseClip">
          <motion.rect
            x="0"
            y="0"
            height={RISE_H}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: RISE_W }}
            transition={{ duration: reduce ? 0 : 1.2, ease: riseEase }}
          />
        </clipPath>
      </defs>

      <g className={styles.chartGrid}>
        <line x1="0" y1="48" x2={RISE_W} y2="48" />
        <line x1="0" y1="82" x2={RISE_W} y2="82" />
        <line x1="0" y1="116" x2={RISE_W} y2="116" />
        <line className={styles.chartBase} x1="0" y1="150" x2={RISE_W} y2="150" />
        <line x1="8" y1="150" x2="8" y2="155" />
        <line x1="428" y1="150" x2="428" y2="155" />
      </g>

      <g clipPath="url(#havenRiseClip)">
        <motion.path
          d={RISE_AREA}
          fill="url(#havenRiseFill)"
          stroke="none"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.2, duration: 0.75, ease: riseEase }}
        />
        <path
          d={RISE_LINE}
          fill="none"
          stroke="#b7c6b4"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d={RISE_LINE}
          fill="none"
          stroke="#3f6e4d"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 1.2, ease: riseEase }}
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
        fill="#d4785a"
        stroke="#fbfaf6"
        strokeWidth="2"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: reduce ? 0 : 0.95,
          type: 'spring',
          stiffness: 260,
          damping: 16,
        }}
      />

      <text className={styles.chartLabel} x="8" y="174">
        2019
      </text>
      <text className={styles.chartLabel} x="428" y="174" textAnchor="end">
        2026
      </text>
    </svg>
  );
}

function MixChart({
  notes = [],
}: {
  notes?: { value: string; label: string }[];
}) {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className={styles.mixHouse}>
      <motion.img
        className={styles.mixHousePhoto}
        src={houseMortgage}
        alt=""
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <ul
        className={styles.mixHouseCards}
        aria-label="Non-mortgage debt categories"
      >
        {notes.map((item, i) => (
          <motion.li
            key={item.label}
            className={styles.mixHouseCard}
            data-slot={i + 1}
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.25 + i * 0.12,
              type: 'spring',
              stiffness: 200,
              damping: 18,
            }}
          >
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function BillChart() {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      className={styles.billScene}
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduce
          ? { duration: 0 }
          : { type: 'spring', stiffness: 88, damping: 16, mass: 1 }
      }
    >
      <div className={styles.billFloat}>
        <img
          className={styles.billPhoto}
          src={dollarBill}
          alt=""
          aria-hidden="true"
        />
        <span
          className={styles.billGrain}
          aria-hidden="true"
          style={{
            WebkitMaskImage: `url(${dollarBill})`,
            maskImage: `url(${dollarBill})`,
          }}
        >
          <svg
            className={styles.billGrainTex}
            viewBox="0 0 180 180"
            preserveAspectRatio="none"
          >
            <filter
              id="havenBillGrain"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect
              width="100%"
              height="100%"
              filter="url(#havenBillGrain)"
            />
          </svg>
        </span>
      </div>
      <span className={styles.billWash} aria-hidden="true" />
    </motion.div>
  );
}

function StressChart({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg className={styles.ringChart} viewBox="0 0 96 96" aria-hidden="true">
      <circle
        cx="48"
        cy="48"
        r={radius}
        fill="none"
        stroke="#d7e0d4"
        strokeWidth="8"
      />
      <motion.circle
        cx="48"
        cy="48"
        r={radius}
        fill="none"
        stroke="#4a7c59"
        strokeWidth="8"
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{
          strokeDashoffset: circumference * (1 - value / 100),
        }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function ShareChart({ value }: { value: number }) {
  const reduce = useReducedMotion() ?? false;
  const filled = Math.round(value / 10);
  return (
    <div className={styles.people} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className={styles.person}
          data-on={i < filled}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.35 }}
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

function SecureChart() {
  const reduce = useReducedMotion() ?? false;

  return (
    <svg className={styles.secureChart} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="havenSecureGlow" cx="50%" cy="46%" r="50%">
          <stop offset="0" stopColor="#4a7c59" stopOpacity="0.42" />
          <stop offset="0.55" stopColor="#4a7c59" stopOpacity="0.14" />
          <stop offset="1" stopColor="#4a7c59" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="havenSecureFill"
          x1="60"
          y1="16"
          x2="60"
          y2="105"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f4f8f3" />
          <stop offset="0.45" stopColor="#dce8db" />
          <stop offset="1" stopColor="#c5d6c4" />
        </linearGradient>
        <linearGradient
          id="havenSecureSheen"
          x1="44"
          y1="24"
          x2="78"
          y2="88"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#4a7c59" stopOpacity="0.06" />
        </linearGradient>
        <filter id="havenSecureDrop" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="4"
            floodColor="#4a7c59"
            floodOpacity="0.28"
          />
        </filter>
      </defs>

      <circle
        className={styles.secureGlow}
        cx="60"
        cy="62"
        r="48"
        fill="url(#havenSecureGlow)"
      />
      <circle className={styles.secureRipple} cx="60" cy="62" r="40" />
      <circle className={styles.secureRippleLate} cx="60" cy="62" r="40" />

      <g className={styles.secureBody} filter="url(#havenSecureDrop)">
        <motion.path
          d={SHIELD}
          fill="url(#havenSecureFill)"
          stroke="none"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.28, duration: 0.5, ease: riseEase }}
        />
        <motion.path
          d={SHIELD_INNER}
          fill="url(#havenSecureSheen)"
          stroke="none"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.42, duration: 0.45, ease: riseEase }}
        />
        <motion.path
          d={SHIELD}
          fill="none"
          stroke="#4a7c59"
          strokeWidth="2.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 0.95, ease: riseEase }}
        />
        <motion.path
          d={SHIELD_INNER}
          fill="none"
          stroke="#3f6e4d"
          strokeWidth="1.15"
          strokeLinejoin="round"
          opacity="0.35"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: reduce ? 0 : 0.18, duration: 0.8, ease: riseEase }}
        />
        <motion.path
          d={CHECK}
          fill="none"
          stroke="#3f6b4f"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: reduce ? 0 : 0.62, duration: 0.42, ease: riseEase }}
        />
        <motion.circle
          cx="60"
          cy="16.5"
          r="4.2"
          fill="#d4785a"
          stroke="#fbfaf6"
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

function DtiChart() {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className={styles.dtiScene} aria-hidden="true">
      <div className={styles.dtiCoins}>
        {Array.from({ length: 10 }, (_, i) => {
          const on = i === 0;
          return (
            <motion.span
              key={i}
              className={styles.dtiCoin}
              data-on={on}
              initial={reduce ? false : { scale: 0.5, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                delay: reduce ? 0 : 0.04 + i * 0.05,
                type: 'spring',
                stiffness: on ? 200 : 260,
                damping: on ? 14 : 18,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatesChart() {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: 50 }, (_, i) => (
        <motion.span
          key={i}
          className={styles.dot}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.012, type: 'spring', stiffness: 260 }}
        />
      ))}
    </div>
  );
}

function CompareChart() {
  const heights = [46, 72, 58];
  return (
    <div className={styles.compare} aria-hidden="true">
      {heights.map((height, i) => (
        <motion.span
          key={height}
          className={styles.compareCol}
          initial={{ height: 8 }}
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
  notes,
}: {
  kind: ChartKind;
  value: number;
  notes?: { value: string; label: string }[];
}) {
  switch (kind) {
    case 'rise':
      return <RiseChart />;
    case 'mix':
      return <MixChart notes={notes} />;
    case 'stress':
      return <StressChart value={value} />;
    case 'paper':
      return <BillChart />;
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

/** Calm, sourced context for the current step — never a copy of the form. */
export function InsightPanel({ compact = false }: { compact?: boolean }) {
  const { step, finished } = useJourney();
  const id = finished ? 'result' : step.id;
  const insight = insights[id] ?? insights['debt-amount'];
  const metric = useMetricText(
    insight.value,
    insight.prefix,
    insight.suffix,
    insight.decimals ?? 0,
  );

  if (finished) return null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.article
        key={id}
        className={styles.insight}
        data-compact={compact ? 'true' : 'false'}
        data-chart={insight.chart ?? undefined}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className={styles.kicker}>{insight.kicker}</p>
        <motion.p className={styles.metric}>{metric}</motion.p>
        <p className={styles.metricLabel}>{insight.label}</p>

        {compact ? null : (
          <>
            {insight.chart ? (
              <div className={styles.chartWrap}>
                <Chart
                  kind={insight.chart}
                  value={insight.value}
                  notes={insight.notes}
                />
              </div>
            ) : null}
            {insight.body ? (
              <p className={styles.body}>{insight.body}</p>
            ) : null}
            {insight.notes &&
            insight.notes.length > 0 &&
            insight.chart !== 'mix' ? (
              <ul className={styles.notes}>
                {insight.notes.map((item) => (
                  <li key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}

        {insight.source ? (
          <p className={styles.source}>{insight.source}</p>
        ) : null}
      </motion.article>
    </AnimatePresence>
  );
}
