import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import { ORBIT_MOTION, RESULTS_SPOTLIGHT } from './config';
import styles from './resultsSpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Negative delay so the partner ping peaks when the pin reaches its angle. */
function pingDelaySec(angle: number) {
  const norm = ((angle % 360) + 360) % 360;
  return (norm / 360 - 1) * RESULTS_SPOTLIGHT.scanSec;
}

export interface ResultsSpotlightProps {
  className?: string;
}

/**
 * Left-stage collage for Orbit step 7.
 * Desktop: dashed rings, centered "results ready" copy, and a radar pin
 * that orbits the rings scanning partner badges.
 * Mobile: compact radar orb + copy in the short stage.
 */
export function ResultsSpotlight({ className }: ResultsSpotlightProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = isDesktop && !reduceMotion;

  if (!isDesktop) {
    return (
      <MobileResultsSpotlight
        className={className}
        animate={!reduceMotion}
      />
    );
  }

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      style={
        {
          ['--scan-sec' as string]: `${RESULTS_SPOTLIGHT.scanSec}s`,
        } as CSSProperties
      }
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

        {RESULTS_SPOTLIGHT.partners.map((partner, index) => (
          <PartnerBadge
            key={partner.id}
            partner={partner}
            animate={!reduceMotion}
            enterDelay={motionOn ? 0.08 + index * 0.05 : 0}
            motionOn={motionOn}
          />
        ))}

        <RadarPin
          animate={!reduceMotion}
          radius={RESULTS_SPOTLIGHT.pinRadius}
          enter={motionOn}
        />

        <motion.div
          className={styles.centerCopy}
          initial={motionOn ? { scale: 0.96, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.1 }}
        >
          <CenterCopy pulse={!reduceMotion} />
        </motion.div>
      </div>
    </div>
  );
}

function MobileResultsSpotlight({
  className,
  animate,
}: {
  className?: string;
  animate: boolean;
}) {
  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      style={
        {
          ['--scan-sec' as string]: `${RESULTS_SPOTLIGHT.scanSec}s`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        <div className={styles.mobileRadar}>
          <img
            className={styles.mobileRings}
            src={ringsSrc}
            alt=""
            draggable={false}
          />
          {RESULTS_SPOTLIGHT.partners.slice(0, 4).map((partner) => (
            <PartnerBadge
              key={partner.id}
              partner={partner}
              animate={animate}
              enterDelay={0}
              motionOn={false}
              compact
            />
          ))}
          <RadarPin
            animate={animate}
            radius={RESULTS_SPOTLIGHT.pinRadius}
            enter={false}
            compact
          />
        </div>
        <div className={styles.mobileCopy}>
          <CenterCopy pulse={animate} mobile />
        </div>
      </div>
    </div>
  );
}

function CenterCopy({
  pulse,
  mobile = false,
}: {
  pulse: boolean;
  mobile?: boolean;
}) {
  return (
    <>
      <span className={styles.readyPill}>
        <span
          className={styles.readyDot}
          data-pulse={pulse ? '' : undefined}
        />
        {RESULTS_SPOTLIGHT.readyLabel}
      </span>
      <p className={mobile ? styles.mobileTitle : styles.title}>
        {RESULTS_SPOTLIGHT.title}
      </p>
      <p className={mobile ? styles.mobileBody : styles.body}>
        {mobile ? RESULTS_SPOTLIGHT.mobile.body : RESULTS_SPOTLIGHT.body}
      </p>
    </>
  );
}

function PartnerBadge({
  partner,
  animate,
  enterDelay,
  motionOn,
  compact = false,
}: {
  partner: (typeof RESULTS_SPOTLIGHT.partners)[number];
  animate: boolean;
  enterDelay: number;
  motionOn: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`${styles.partnerSlot}${compact ? ` ${styles.partnerSlotCompact}` : ''}`}
      style={
        {
          ['--angle' as string]: `${partner.angle}deg`,
          ['--radius' as string]: `${partner.radius}%`,
          ['--size' as string]: `${partner.size}%`,
          ['--ping-delay' as string]: `${pingDelaySec(partner.angle)}s`,
        } as CSSProperties
      }
    >
      <motion.div
        className={styles.partnerEnter}
        initial={motionOn ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: EASE_OUT, delay: enterDelay }}
      >
        <div
          className={`${styles.partner}${animate ? ` ${styles.partnerScan}` : ` ${styles.partnerStatic}`}`}
        >
          <img src={partner.logo} alt="" draggable={false} />
        </div>
      </motion.div>
    </div>
  );
}

function RadarPin({
  animate,
  radius,
  enter,
  compact = false,
}: {
  animate: boolean;
  radius: number;
  enter: boolean;
  compact?: boolean;
}) {
  return (
    <motion.div
      className={`${styles.radarArm}${compact ? ` ${styles.radarArmCompact}` : ''}${
        animate ? ` ${styles.radarSpin}` : ''
      }`}
      style={
        {
          ['--pin-radius' as string]: `${radius}%`,
        } as CSSProperties
      }
      initial={enter ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.2 }}
    >
      <div className={styles.radarSweep} />
      <div className={styles.pinAnchor}>
        <span className={styles.pinTrail} />
        <div className={styles.pinUpright}>
          <span className={styles.pin}>
            <span className={styles.pinHead} />
            <span className={styles.pinCore} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
