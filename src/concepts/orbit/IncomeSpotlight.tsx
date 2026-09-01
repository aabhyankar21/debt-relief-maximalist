import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import {
  INCOME_SPOTLIGHT,
  ORBIT_MOTION,
  type IncomeBandId,
} from './config';
import styles from './incomeSpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Semicircle dial geometry (viewBox 140×88). */
const DIAL = {
  cx: 70,
  cy: 72,
  r: 52,
} as const;

export interface IncomeSpotlightProps {
  className?: string;
  /**
   * Active income band — desktop hover preview, or a prior selection
   * when the user navigates back. Null keeps the idle inviting state.
   */
  incomeId?: string | null;
}

/**
 * Left-stage collage for Orbit step 6.
 * Desktop: dashed rings + cream affordability dial card.
 * Mobile: landscape dial card in the short stage (idle trust state).
 */
export function IncomeSpotlight({
  className,
  incomeId = null,
}: IncomeSpotlightProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = isDesktop && !reduceMotion;
  const dial = resolveDial(incomeId);

  if (!isDesktop) {
    return (
      <MobileIncomeSpotlight
        className={className}
        dial={dial}
        animate={!reduceMotion}
      />
    );
  }

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      data-active={dial.active ? '' : undefined}
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        <motion.img
          className={styles.rings}
          src={ringsSrc}
          alt=""
          draggable={false}
          initial={
            ringsSpin ? { scale: motionOn ? 0.94 : 1, rotate: 0 } : false
          }
          animate={
            ringsSpin ? { scale: 1, rotate: 360 } : { scale: 1, rotate: 0 }
          }
          transition={
            ringsSpin
              ? {
                  scale: {
                    duration: motionOn ? 1.1 : 0.01,
                    ease: EASE_OUT,
                  },
                  rotate: {
                    duration: ORBIT_MOTION.ringSpinSec,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }
              : { duration: 0.01 }
          }
        />

        <motion.article
          className={styles.card}
          style={{ width: `${INCOME_SPOTLIGHT.card.w}%` }}
          initial={motionOn ? { scale: 0.96 } : false}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: motionOn ? 0.1 : 0,
            ease: EASE_OUT,
          }}
        >
          <CardCopy />
          <DialPanel dial={dial} animate={!reduceMotion} />
        </motion.article>
      </div>
    </div>
  );
}

function MobileIncomeSpotlight({
  className,
  dial,
  animate,
}: {
  className?: string;
  dial: DialState;
  animate: boolean;
}) {
  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      data-active={dial.active ? '' : undefined}
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        <article className={styles.mobileCard}>
          <div className={styles.mobileCopy}>
            <CardCopy compact />
          </div>
          <DialPanel
            className={styles.mobileDial}
            dial={dial}
            animate={animate}
            compact
          />
        </article>
      </div>
    </div>
  );
}

function CardCopy({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? styles.mobileCopyInner : styles.copy}>
      <span className={styles.pill}>
        <span className={styles.pillDot} data-pulse="" />
        {INCOME_SPOTLIGHT.pill}
      </span>
      <p className={compact ? styles.mobileTitle : styles.title}>
        {INCOME_SPOTLIGHT.title}
      </p>
      <ul className={styles.chips}>
        {INCOME_SPOTLIGHT.chips.map((label) => (
          <li key={label} className={styles.chip}>
            {label}
          </li>
        ))}
      </ul>
      {compact ? null : (
        <p className={styles.note}>{INCOME_SPOTLIGHT.note}</p>
      )}
    </div>
  );
}

type DialState = {
  level: number;
  label: string;
  active: boolean;
};

function resolveDial(incomeId: string | null): DialState {
  if (!incomeId) {
    return {
      level: INCOME_SPOTLIGHT.idleLevel,
      label: INCOME_SPOTLIGHT.idleLabel,
      active: false,
    };
  }

  const band =
    INCOME_SPOTLIGHT.bands[incomeId as IncomeBandId] ?? undefined;
  if (!band) {
    return {
      level: INCOME_SPOTLIGHT.idleLevel,
      label: INCOME_SPOTLIGHT.idleLabel,
      active: false,
    };
  }

  return {
    level: band.level,
    label: band.label,
    active: true,
  };
}

function DialPanel({
  dial,
  animate,
  compact = false,
  className,
}: {
  dial: DialState;
  animate: boolean;
  compact?: boolean;
  className?: string;
}) {
  const level = Math.min(1, Math.max(0, dial.level));
  const tip = tipPoint(level);

  return (
    <div
      className={`${styles.meter}${className ? ` ${className}` : ''}`}
      data-active={dial.active ? '' : undefined}
      data-idle={dial.active ? undefined : ''}
    >
      <div className={styles.meterGlow} />
      <svg
        className={styles.dialSvg}
        viewBox="0 0 140 88"
        fill="none"
        aria-hidden="true"
      >
        <path
          className={styles.dialTrack}
          d={arcPath(DIAL.cx, DIAL.cy, DIAL.r)}
          pathLength={100}
          strokeWidth={compact ? 9 : 10}
          strokeLinecap="round"
        />
        <path
          className={styles.dialFill}
          d={arcPath(DIAL.cx, DIAL.cy, DIAL.r)}
          pathLength={100}
          strokeWidth={compact ? 9 : 10}
          strokeLinecap="round"
          strokeDasharray={`${level * 100} 100`}
          style={{
            transition: animate
              ? 'stroke-dasharray 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
          }}
        />
        {[0.15, 0.35, 0.55, 0.75, 0.92].map((tick) => {
          const point = tipPoint(tick);
          return (
            <circle
              key={tick}
              className={styles.dialTick}
              cx={point.x}
              cy={point.y}
              r={1.6}
            />
          );
        })}
        <g
          className={styles.dialTipWrap}
          style={{
            transform: `translate(${tip.x}px, ${tip.y}px)`,
            transition: animate
              ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
          }}
        >
          <circle
            className={styles.dialTip}
            cx={0}
            cy={0}
            r={compact ? 4.5 : 5.5}
          />
        </g>
      </svg>
      <p className={styles.meterLabel}>{dial.label}</p>
    </div>
  );
}

/** Open-top semicircle path from left → right through the top. */
function arcPath(cx: number, cy: number, r: number) {
  const startX = cx - r;
  const endX = cx + r;
  /* sweep 1 = clockwise in SVG y-down = through the top */
  return `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`;
}

/** Point along the semicircle for a 0–1 level (left → right). */
function tipPoint(level: number) {
  const t = Math.min(1, Math.max(0, level));
  const angle = Math.PI - Math.PI * t;
  return {
    x: DIAL.cx + DIAL.r * Math.cos(angle),
    y: DIAL.cy - DIAL.r * Math.sin(angle),
  };
}
