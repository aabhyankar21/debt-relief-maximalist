import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import { INCOME_SPOTLIGHT, ORBIT_MOTION } from './config';
import styles from './incomeSpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export interface IncomeSpotlightProps {
  className?: string;
}

/**
 * Left-stage collage for Orbit step 6.
 * Desktop: dashed rings, arched portrait, insight card (Figma 204:14279).
 * Mobile: portrait + insight card in the short stage window.
 */
export function IncomeSpotlight({ className }: IncomeSpotlightProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = isDesktop && !reduceMotion;

  if (!isDesktop) {
    return <MobileIncomeSpotlight className={className} />;
  }

  const { photoBox, photoCrop, photoRadius, callout } = INCOME_SPOTLIGHT;

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

        <motion.div
          className={styles.photo}
          style={{
            left: `${photoBox.x}%`,
            top: `${photoBox.y}%`,
            width: `${photoBox.w}%`,
            height: `${photoBox.h}%`,
            borderBottomLeftRadius: `${photoRadius}%`,
            borderBottomRightRadius: `${photoRadius}%`,
          }}
          initial={motionOn ? { scale: 0.96 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <img
            src={INCOME_SPOTLIGHT.photo}
            alt=""
            draggable={false}
            style={{
              left: `${photoCrop.x}%`,
              top: `${photoCrop.y}%`,
              width: `${photoCrop.w}%`,
              height: `${photoCrop.h}%`,
            }}
          />
        </motion.div>

        <motion.article
          className={styles.callout}
          style={{
            left: `${callout.x}%`,
            top: `${callout.y}%`,
            width: `${callout.w}%`,
            height: `${callout.h}%`,
          }}
          initial={motionOn ? { scale: 0.98, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: motionOn ? 0.14 : 0,
            ease: EASE_OUT,
          }}
        >
          <CalloutBody />
        </motion.article>
      </div>
    </div>
  );
}

function MobileIncomeSpotlight({ className }: { className?: string }) {
  const { photoBox, photoCrop, photoRadius, callout } =
    INCOME_SPOTLIGHT.mobile;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        <div
          className={styles.photo}
          style={{
            left: `${photoBox.x}%`,
            top: `${photoBox.y}%`,
            width: `${photoBox.w}%`,
            height: `${photoBox.h}%`,
            borderBottomLeftRadius: `${photoRadius}%`,
            borderBottomRightRadius: `${photoRadius}%`,
          }}
        >
          <img
            src={INCOME_SPOTLIGHT.photo}
            alt=""
            draggable={false}
            style={{
              left: `${photoCrop.x}%`,
              top: `${photoCrop.y}%`,
              width: `${photoCrop.w}%`,
              height: `${photoCrop.h}%`,
            }}
          />
        </div>

        <article
          className={styles.callout}
          style={{
            left: `${callout.x}%`,
            top: `${callout.y}%`,
            width: `${callout.w}%`,
            height: `${callout.h}%`,
          }}
        >
          <CalloutBody />
        </article>
      </div>
    </div>
  );
}

function CalloutBody() {
  return (
    <>
      <p className={styles.calloutTitle}>{INCOME_SPOTLIGHT.calloutTitle}</p>
      <p className={styles.calloutBody}>{INCOME_SPOTLIGHT.calloutBody}</p>
    </>
  );
}
