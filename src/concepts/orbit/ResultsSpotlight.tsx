import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import { ORBIT_MOTION, RESULTS_SPOTLIGHT } from './config';
import styles from './resultsSpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const SCAN_LINES = 6;
const MOBILE_SCAN_LINES = 5;

export interface ResultsSpotlightProps {
  className?: string;
}

/**
 * Left-stage collage for Orbit step 7.
 * Desktop: dashed rings + cream "results ready" card with scan beam
 * (Figma 220:14833). Mobile: landscape cream + scan card in the short stage.
 */
export function ResultsSpotlight({ className }: ResultsSpotlightProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = isDesktop && !reduceMotion;

  if (!isDesktop) {
    return <MobileResultsSpotlight className={className} />;
  }

  const { card, scanPanel } = RESULTS_SPOTLIGHT;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
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
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            width: `${card.w}%`,
            height: `${card.h}%`,
          }}
          initial={motionOn ? { scale: 0.96, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div className={styles.copy}>
            <p className={styles.title}>{RESULTS_SPOTLIGHT.title}</p>
            <p className={styles.body}>{RESULTS_SPOTLIGHT.body}</p>
          </div>
          <ScanPanel
            height={`${scanPanel.h}%`}
            lineCount={SCAN_LINES}
            scanning={!reduceMotion}
          />
        </motion.article>
      </div>
    </div>
  );
}

function MobileResultsSpotlight({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        <article className={styles.mobileCard}>
          <div className={styles.mobileCopy}>
            <span className={styles.readyPill}>
              <span
                className={styles.readyDot}
                data-pulse={reduceMotion ? undefined : ''}
              />
              Ready
            </span>
            <p className={styles.mobileTitle}>{RESULTS_SPOTLIGHT.title}</p>
            <p className={styles.mobileBody}>{RESULTS_SPOTLIGHT.mobile.body}</p>
          </div>
          <ScanPanel
            className={styles.mobileScan}
            lineCount={MOBILE_SCAN_LINES}
            scanning={!reduceMotion}
          />
        </article>
      </div>
    </div>
  );
}

function ScanPanel({
  height,
  lineCount,
  scanning,
  className,
}: {
  height?: string;
  lineCount: number;
  scanning: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${styles.scanPanel}${className ? ` ${className}` : ''}`}
      style={height ? { height } : undefined}
    >
      <div className={styles.scanLines}>
        {Array.from({ length: lineCount }, (_, index) => (
          <span key={index} className={styles.scanLine} />
        ))}
      </div>
      {scanning ? <div className={styles.scanBeam} /> : null}
    </div>
  );
}
