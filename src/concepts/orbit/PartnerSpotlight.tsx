import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import iconLockSm from './assets/icon-lock-sm.svg';
import ringsSrc from './assets/rings.png';
import { ORBIT_MOTION, PARTNER_SPOTLIGHT } from './config';
import styles from './partnerSpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export interface PartnerSpotlightProps {
  className?: string;
  /** Selected debt-amount band label (summary card). */
  debtAmountLabel?: string | null;
  /** Selected debt-type label (summary card). */
  debtTypeLabel?: string | null;
}

/**
 * Left-stage collage for Orbit step 3.
 * Desktop: dashed rings, arched portrait, summary card (Figma 159:11858).
 * Mobile: dashed rings, portrait, summary card (Figma 192:13517).
 */
export function PartnerSpotlight({
  className,
  debtAmountLabel = null,
  debtTypeLabel = null,
}: PartnerSpotlightProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = !reduceMotion;

  if (!isDesktop) {
    return (
      <MobilePartnerSpotlight
        className={className}
        ringsSpin={ringsSpin}
        debtAmountLabel={debtAmountLabel}
        debtTypeLabel={debtTypeLabel}
      />
    );
  }

  const { photoBox, photoCrop, photoRadius, summaryCard } = PARTNER_SPOTLIGHT;

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
            src={PARTNER_SPOTLIGHT.photo}
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
          className={styles.summaryCard}
          style={{
            left: `${summaryCard.x}%`,
            top: `${summaryCard.y}%`,
            width: `${summaryCard.w}%`,
            height: `${summaryCard.h}%`,
          }}
          initial={motionOn ? { scale: 0.98, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: motionOn ? 0.14 : 0,
            ease: EASE_OUT,
          }}
        >
          <SummaryCardBody
            debtAmountLabel={debtAmountLabel}
            debtTypeLabel={debtTypeLabel}
          />
        </motion.article>
      </div>
    </div>
  );
}

function MobilePartnerSpotlight({
  className,
  ringsSpin,
  debtAmountLabel,
  debtTypeLabel,
}: {
  className?: string;
  ringsSpin: boolean;
  debtAmountLabel: string | null;
  debtTypeLabel: string | null;
}) {
  const { photoBox, photoCrop, photoRadius, summaryCard } =
    PARTNER_SPOTLIGHT.mobile;

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
          initial={ringsSpin ? { scale: 1, rotate: 0 } : false}
          animate={
            ringsSpin
              ? { scale: 1, rotate: 360 }
              : { scale: 1, rotate: 0 }
          }
          transition={
            ringsSpin
              ? {
                  scale: { duration: 0.01 },
                  rotate: {
                    duration: ORBIT_MOTION.ringSpinSec,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }
              : { duration: 0.01 }
          }
        />

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
            src={PARTNER_SPOTLIGHT.photo}
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
          className={styles.summaryCard}
          style={{
            left: `${summaryCard.x}%`,
            top: `${summaryCard.y}%`,
            width: `${summaryCard.w}%`,
            height: `${summaryCard.h}%`,
          }}
        >
          <SummaryCardBody
            debtAmountLabel={debtAmountLabel}
            debtTypeLabel={debtTypeLabel}
          />
        </article>
      </div>
    </div>
  );
}

function SummaryCardBody({
  debtAmountLabel,
  debtTypeLabel,
}: {
  debtAmountLabel: string | null;
  debtTypeLabel: string | null;
}) {
  return (
    <>
      <div className={styles.summaryBody}>
        <p className={styles.summaryHeading}>
          {PARTNER_SPOTLIGHT.summaryHeading}
        </p>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>
            {PARTNER_SPOTLIGHT.amountLabel}
          </span>
          <span className={styles.summaryValue}>
            {debtAmountLabel ?? '—'}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>
            {PARTNER_SPOTLIGHT.typeLabel}
          </span>
          <span className={styles.summaryValue}>
            {debtTypeLabel ?? '—'}
          </span>
        </div>
      </div>
      <p className={styles.privacyNote}>
        <img
          className={styles.privacyIcon}
          src={iconLockSm}
          alt=""
          width={14}
          height={15}
          draggable={false}
        />
        <span>{PARTNER_SPOTLIGHT.privacyNote}</span>
      </p>
    </>
  );
}
