import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import { ORBIT_MOTION, PARTNER_ORBIT } from './config';
import styles from './phoneSpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export interface PhoneSpotlightProps {
  className?: string;
}

/**
 * Left-stage collage for Orbit step 5.
 * Desktop: dashed rings + partner logo cards + center callout (Figma 201:14012).
 * Mobile: partner cards + callout in the short stage window (Figma 201:14093).
 */
export function PhoneSpotlight({ className }: PhoneSpotlightProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = isDesktop && !reduceMotion;

  if (!isDesktop) {
    return <MobilePhoneSpotlight className={className} />;
  }

  const { cards, calloutBox } = PARTNER_ORBIT;

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

        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className={styles.card}
            style={{
              left: `${card.x}%`,
              top: `${card.y}%`,
              width: `${card.w}%`,
              height: `${card.h}%`,
            }}
            initial={motionOn ? { scale: 0.92, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: ORBIT_MOTION.enterDurSec,
              delay: motionOn ? index * ORBIT_MOTION.enterStaggerSec : 0,
              ease: EASE_OUT,
            }}
          >
            <img src={card.image} alt="" draggable={false} />
          </motion.div>
        ))}

        <motion.article
          className={styles.callout}
          style={{
            left: `${calloutBox.x}%`,
            top: `${calloutBox.y}%`,
            width: `${calloutBox.w}%`,
          }}
          initial={motionOn ? { scale: 0.96, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: motionOn ? 0.18 : 0,
            ease: EASE_OUT,
          }}
        >
          <p className={styles.calloutText}>{PARTNER_ORBIT.callout}</p>
        </motion.article>
      </div>
    </div>
  );
}

function MobilePhoneSpotlight({ className }: { className?: string }) {
  const { cards, calloutBox } = PARTNER_ORBIT.mobile;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={styles.card}
            style={{
              left: `${card.x}%`,
              top: `${card.y}%`,
              width: `${card.w}%`,
              height: `${card.h}%`,
            }}
          >
            <img src={card.image} alt="" draggable={false} />
          </div>
        ))}

        <article
          className={styles.callout}
          style={{
            left: `${calloutBox.x}%`,
            top: `${calloutBox.y}%`,
            width: `${calloutBox.w}%`,
          }}
        >
          <p className={styles.calloutText}>{PARTNER_ORBIT.callout}</p>
        </article>
      </div>
    </div>
  );
}
