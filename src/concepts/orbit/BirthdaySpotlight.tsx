import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import { BIRTHDAY_SPOTLIGHT, ORBIT_MOTION } from './config';
import styles from './birthdaySpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export interface BirthdaySpotlightProps {
  className?: string;
}

/**
 * Left-stage collage for Orbit step 4.
 * Desktop: rings + portrait + peak badge + decade timeline + glass insight.
 * Mobile: glass banner + arched portrait with compact HUD chips.
 */
export function BirthdaySpotlight({ className }: BirthdaySpotlightProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = isDesktop && !reduceMotion;
  const alive = !reduceMotion;

  if (!isDesktop) {
    return <MobileBirthdaySpotlight className={className} alive={alive} />;
  }

  const { photoBox, photoCrop, photoRadius, callout, badge, timeline } =
    BIRTHDAY_SPOTLIGHT;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      data-alive={alive || undefined}
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
            src={BIRTHDAY_SPOTLIGHT.photo}
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

        <motion.div
          className={styles.badge}
          style={{
            left: `${badge.x}%`,
            top: `${badge.y}%`,
            width: `${badge.w}%`,
          }}
          initial={motionOn ? { opacity: 0, y: 8, scale: 0.96 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.45,
            delay: motionOn ? 0.18 : 0,
            ease: EASE_OUT,
          }}
        >
          <span className={styles.badgeDot} />
          {BIRTHDAY_SPOTLIGHT.badgeLabel}
        </motion.div>

        <motion.div
          className={styles.timeline}
          style={{
            left: `${timeline.x}%`,
            top: `${timeline.y}%`,
            width: `${timeline.w}%`,
          }}
          initial={motionOn ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: motionOn ? 0.22 : 0,
            ease: EASE_OUT,
          }}
        >
          <DecadeTimeline />
        </motion.div>

        <motion.article
          className={styles.callout}
          style={{
            left: `${callout.x}%`,
            top: `${callout.y}%`,
            width: `${callout.w}%`,
          }}
          initial={motionOn ? { scale: 0.98, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: motionOn ? 0.28 : 0,
            ease: EASE_OUT,
          }}
        >
          <span className={styles.calloutSheen} />
          <CalloutBody />
        </motion.article>
      </div>
    </div>
  );
}

function MobileBirthdaySpotlight({
  className,
  alive,
}: {
  className?: string;
  alive: boolean;
}) {
  const { callout } = BIRTHDAY_SPOTLIGHT.mobile;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      data-alive={alive || undefined}
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        {/*
          Mobile photo size/crop is CSS-owned (cqw) so the 128×189 arched
          portrait stays correct when the stage banner height changes.
        */}
        <div className={styles.photo}>
          <img
            src={BIRTHDAY_SPOTLIGHT.photo}
            alt=""
            draggable={false}
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
          <span className={styles.calloutSheen} />
          <div className={styles.mobileCopy}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} />
              {BIRTHDAY_SPOTLIGHT.badgeLabel}
            </span>
            <p className={styles.calloutTitle}>
              {BIRTHDAY_SPOTLIGHT.calloutTitle}
            </p>
            <p className={styles.calloutBody}>
              {BIRTHDAY_SPOTLIGHT.mobileCalloutBody}
            </p>
            <div className={styles.timeline}>
              <DecadeTimeline />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function DecadeTimeline() {
  return (
    <div className={styles.decadeRow}>
      {BIRTHDAY_SPOTLIGHT.decades.map((decade) => (
        <span
          key={decade.id}
          className={styles.decade}
          data-peak={decade.peak ? '' : undefined}
        >
          {decade.label}
        </span>
      ))}
    </div>
  );
}

function CalloutBody() {
  return (
    <>
      <p className={styles.calloutTitle}>{BIRTHDAY_SPOTLIGHT.calloutTitle}</p>
      <p className={styles.calloutBody}>{BIRTHDAY_SPOTLIGHT.calloutBody}</p>
    </>
  );
}
