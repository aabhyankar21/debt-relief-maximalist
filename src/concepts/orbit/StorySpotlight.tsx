import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import carouselDots from './assets/carousel-dots.svg';
import ringsSrc from './assets/rings.png';
import { ORBIT_MOTION, STORY_SPOTLIGHT } from './config';
import styles from './storySpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Left-stage collage for Orbit step 2: mint portrait panel, cream
 * outcome card, dashed rings (desktop), and carousel dots (desktop).
 * Desktop: Figma 159:11776. Mobile side-by-side: Figma 192:13349.
 */
export function StorySpotlight({ className }: { className?: string }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionReady = !reduceMotion;
  /** Desktop-only entrance / lift motion for photo + card. */
  const motionOn = isDesktop && motionReady;
  /** Continuous ring spin — desktop only (honors reduced motion). */
  const ringsSpin = isDesktop && motionReady;

  if (!isDesktop) {
    return (
      <div
        className={`${styles.stage}${className ? ` ${className}` : ''}`}
        aria-hidden="true"
      >
        <div
          className={styles.mint}
          style={{
            left: `${STORY_SPOTLIGHT.mobile.mint.x}%`,
            top: `${STORY_SPOTLIGHT.mobile.mint.y}%`,
            width: `${STORY_SPOTLIGHT.mobile.mint.w}%`,
            height: `${STORY_SPOTLIGHT.mobile.mint.h}%`,
          }}
        />
        <div
          className={styles.photo}
          style={{
            left: `${STORY_SPOTLIGHT.mobile.photoBox.x}%`,
            top: `${STORY_SPOTLIGHT.mobile.photoBox.y}%`,
            width: `${STORY_SPOTLIGHT.mobile.photoBox.w}%`,
            height: `${STORY_SPOTLIGHT.mobile.photoBox.h}%`,
          }}
        >
          <img
            src={STORY_SPOTLIGHT.photo}
            alt=""
            draggable={false}
            style={{
              left: `${STORY_SPOTLIGHT.mobile.photoCrop.x}%`,
              top: `${STORY_SPOTLIGHT.mobile.photoCrop.y}%`,
              width: `${STORY_SPOTLIGHT.mobile.photoCrop.w}%`,
              height: `${STORY_SPOTLIGHT.mobile.photoCrop.h}%`,
            }}
          />
        </div>
        <article
          className={styles.card}
          style={{
            left: `${STORY_SPOTLIGHT.mobile.card.x}%`,
            top: `${STORY_SPOTLIGHT.mobile.card.y}%`,
            width: `${STORY_SPOTLIGHT.mobile.card.w}%`,
          }}
        >
          <p className={styles.cardEyebrow}>{STORY_SPOTLIGHT.eyebrow}</p>
          <p className={styles.cardHeadline}>{STORY_SPOTLIGHT.headline}</p>
          <p className={styles.cardDetail}>
            {STORY_SPOTLIGHT.detailBefore} {STORY_SPOTLIGHT.detailAfter}
          </p>
        </article>
      </div>
    );
  }

  const { mint, photoBox, photoCrop, card, dots } = STORY_SPOTLIGHT;

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
            ringsSpin
              ? { scale: motionOn ? 0.94 : 1, rotate: 0 }
              : false
          }
          animate={
            ringsSpin
              ? { scale: 1, rotate: 360 }
              : { scale: 1, rotate: 0 }
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
          className={styles.panel}
          initial={motionOn ? { y: 28, scale: 0.96 } : false}
          animate={{ y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div
            className={styles.mint}
            style={{
              left: `${mint.x}%`,
              top: `${mint.y}%`,
              width: `${mint.w}%`,
              height: `${mint.h}%`,
            }}
          />
          <div
            className={styles.photo}
            style={{
              left: `${photoBox.x}%`,
              top: `${photoBox.y}%`,
              width: `${photoBox.w}%`,
              height: `${photoBox.h}%`,
            }}
          >
            <img
              src={STORY_SPOTLIGHT.photo}
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
            className={styles.card}
            style={{
              left: `${card.x}%`,
              top: `${card.y}%`,
              width: `${card.w}%`,
            }}
          >
            <p className={styles.cardEyebrow}>{STORY_SPOTLIGHT.eyebrow}</p>
            <p className={styles.cardHeadline}>{STORY_SPOTLIGHT.headline}</p>
            <p className={styles.cardDetail}>
              <span className={styles.cardDetailMuted}>
                {STORY_SPOTLIGHT.detailBefore}
              </span>{' '}
              <span className={styles.cardDetailStrong}>
                {STORY_SPOTLIGHT.detailAfter}
              </span>
            </p>
          </article>
        </motion.div>

        <img
          className={styles.dots}
          src={carouselDots}
          alt=""
          draggable={false}
          style={{
            left: `${dots.x}%`,
            top: `${dots.y}%`,
            width: `${dots.w}%`,
          }}
        />
      </div>
    </div>
  );
}
