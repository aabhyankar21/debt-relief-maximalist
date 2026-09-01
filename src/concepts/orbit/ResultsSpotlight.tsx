import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import { ORBIT_MOTION, RESULTS_SPOTLIGHT } from './config';
import styles from './resultsSpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type City = (typeof RESULTS_SPOTLIGHT.cities)[number];

/** Clockwise degrees from 12 o'clock for a city on the stage. */
function cityAngle(city: City): number {
  const { mapBox } = RESULTS_SPOTLIGHT;
  const sx = mapBox.x + (city.x / 100) * mapBox.w;
  const sy = mapBox.y + (city.y / 100) * mapBox.h;
  return (Math.atan2(sx - 50, -(sy - 50)) * 180) / Math.PI;
}

/** Negative delay so the city ping peaks when the sweep reaches its angle. */
function pingDelaySec(angle: number) {
  const norm = ((angle % 360) + 360) % 360;
  return (norm / 360 - 1) * RESULTS_SPOTLIGHT.scanSec;
}

export interface ResultsSpotlightProps {
  className?: string;
}

/**
 * Left-stage collage for Orbit step 7.
 * Desktop: dashed rings, USA map with city dots, centered "results ready"
 * copy, and a radar sweep across the map.
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

        <UsaMapLayer animate={!reduceMotion} enter={motionOn} />

        <RadarSweep animate={!reduceMotion} enter={motionOn} />

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
  const mobileCities = RESULTS_SPOTLIGHT.cities.filter((city) =>
    (RESULTS_SPOTLIGHT.mobile.cityIds as readonly string[]).includes(city.id),
  );

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
          <UsaMapLayer
            animate={animate}
            enter={false}
            cities={mobileCities}
            compact
          />
          <RadarSweep animate={animate} enter={false} />
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

function UsaMapLayer({
  animate,
  enter,
  cities = RESULTS_SPOTLIGHT.cities,
  compact = false,
}: {
  animate: boolean;
  enter: boolean;
  cities?: readonly City[];
  compact?: boolean;
}) {
  const { mapBox } = RESULTS_SPOTLIGHT;

  return (
    <motion.div
      className={`${styles.mapLayer}${compact ? ` ${styles.mapLayerCompact}` : ''}`}
      style={
        {
          left: `${mapBox.x}%`,
          top: `${mapBox.y}%`,
          width: `${mapBox.w}%`,
          height: `${mapBox.h}%`,
        } as CSSProperties
      }
      initial={enter ? { opacity: 0, scale: 0.96 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.05 }}
    >
      <img
        className={styles.mapImage}
        src={RESULTS_SPOTLIGHT.map}
        alt=""
        draggable={false}
      />
      {cities.map((city, index) => (
        <CityDot
          key={city.id}
          city={city}
          animate={animate}
          enterDelay={enter ? 0.1 + index * 0.02 : 0}
          motionOn={enter}
          compact={compact}
        />
      ))}
    </motion.div>
  );
}

function CityDot({
  city,
  animate,
  enterDelay,
  motionOn,
  compact = false,
}: {
  city: City;
  animate: boolean;
  enterDelay: number;
  motionOn: boolean;
  compact?: boolean;
}) {
  const angle = cityAngle(city);

  return (
    <div
      className={`${styles.citySlot}${compact ? ` ${styles.citySlotCompact}` : ''}`}
      style={
        {
          left: `${city.x}%`,
          top: `${city.y}%`,
          ['--ping-delay' as string]: `${pingDelaySec(angle)}s`,
        } as CSSProperties
      }
    >
      <motion.span
        className={`${styles.cityDot}${animate ? ` ${styles.cityScan}` : ` ${styles.cityStatic}`}`}
        initial={motionOn ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: EASE_OUT, delay: enterDelay }}
      />
    </div>
  );
}

function RadarSweep({
  animate,
  enter,
}: {
  animate: boolean;
  enter: boolean;
}) {
  return (
    <motion.div
      className={`${styles.radarArm}${animate ? ` ${styles.radarSpin}` : ''}`}
      initial={enter ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.2 }}
    >
      <div className={styles.radarSweep} />
    </motion.div>
  );
}
