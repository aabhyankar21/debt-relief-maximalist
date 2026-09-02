import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import checkCircle from './assets/icon-check-circle.svg';
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
 * Desktop: rings + holographic HUD phone with a secure recap screen.
 * Mobile: inset glass device card with the same recap.
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
  const alive = !reduceMotion;

  if (!isDesktop) {
    return (
      <MobilePartnerSpotlight
        className={className}
        debtAmountLabel={debtAmountLabel}
        debtTypeLabel={debtTypeLabel}
        animate={!reduceMotion}
        alive={alive}
      />
    );
  }

  const { phoneBox } = PARTNER_SPOTLIGHT;

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
          className={styles.phoneWrap}
          style={{
            left: `${phoneBox.x}%`,
            top: `${phoneBox.y}%`,
            width: `${phoneBox.w}%`,
          }}
          initial={motionOn ? { scale: 0.94, opacity: 0, y: 18 } : false}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_OUT }}
        >
          <div className={styles.phoneTilt}>
            <PhoneDevice
              debtAmountLabel={debtAmountLabel}
              debtTypeLabel={debtTypeLabel}
              animate={motionOn}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MobilePartnerSpotlight({
  className,
  debtAmountLabel,
  debtTypeLabel,
  animate,
  alive,
}: {
  className?: string;
  debtAmountLabel: string | null;
  debtTypeLabel: string | null;
  animate: boolean;
  alive: boolean;
}) {
  const rows = [
    {
      id: 'amount',
      label: PARTNER_SPOTLIGHT.amountLabel,
      value: debtAmountLabel,
    },
    {
      id: 'type',
      label: PARTNER_SPOTLIGHT.typeLabel,
      value: debtTypeLabel,
    },
  ] as const;
  const savedCount = rows.filter((row) => Boolean(row.value)).length;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      data-alive={alive || undefined}
      aria-hidden="true"
    >
      <div className={styles.mobileDevice}>
        <div className={styles.mobileScreen}>
          <span className={styles.screenGlare} />
          <div className={styles.mobileTop}>
            <div className={styles.appIdentity}>
              <span className={styles.appMark}>FA</span>
              <span className={styles.appName}>
                {PARTNER_SPOTLIGHT.appName}
              </span>
            </div>
            <span className={styles.encrypted}>
              <img
                className={styles.encryptedIcon}
                src={iconLockSm}
                alt=""
                width={11}
                height={12}
                draggable={false}
              />
              {PARTNER_SPOTLIGHT.encryptedLabel}
            </span>
          </div>

          <div className={styles.mobileBody}>
            <div className={styles.mobileCopy}>
              <p className={styles.mobileHeading}>
                {PARTNER_SPOTLIGHT.summaryHeading}
              </p>
              <p className={styles.mobileSaved}>
                <span className={styles.savedCount}>{savedCount}</span>
                {` ${PARTNER_SPOTLIGHT.savedLabel}`}
              </p>
            </div>

            <div className={styles.mobileAnswers}>
              {rows.map((row, index) => {
                const filled = Boolean(row.value);
                return (
                  <motion.div
                    key={row.id}
                    className={styles.answerCard}
                    data-filled={filled ? '' : undefined}
                    initial={animate ? { opacity: 0, y: 6 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: animate ? 0.12 + index * 0.08 : 0,
                      ease: EASE_OUT,
                    }}
                  >
                    <div className={styles.answerCopy}>
                      <span className={styles.answerLabel}>{row.label}</span>
                      <span
                        className={styles.answerValue}
                        data-empty={filled ? undefined : ''}
                      >
                        {row.value ?? PARTNER_SPOTLIGHT.emptyValue}
                      </span>
                    </div>
                    {filled ? (
                      <img
                        className={styles.answerCheck}
                        src={checkCircle}
                        alt=""
                        width={16}
                        height={16}
                        draggable={false}
                      />
                    ) : (
                      <span className={styles.answerPending} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneDevice({
  debtAmountLabel,
  debtTypeLabel,
  animate,
}: {
  debtAmountLabel: string | null;
  debtTypeLabel: string | null;
  animate: boolean;
}) {
  const rows = [
    {
      id: 'amount',
      label: PARTNER_SPOTLIGHT.amountLabel,
      value: debtAmountLabel,
    },
    {
      id: 'type',
      label: PARTNER_SPOTLIGHT.typeLabel,
      value: debtTypeLabel,
    },
  ] as const;
  const savedCount = rows.filter((row) => Boolean(row.value)).length;

  return (
    <div className={styles.phone}>
      <span className={styles.btnSilent} />
      <span className={styles.btnVolumeUp} />
      <span className={styles.btnVolumeDown} />
      <span className={styles.btnPower} />

      <div className={styles.bezel}>
        <div className={styles.screen}>
          <div className={styles.statusBar}>
            <span className={styles.statusTime}>
              {PARTNER_SPOTLIGHT.statusTime}
            </span>
            <span className={styles.dynamicIsland} />
            <span className={styles.statusIcons} aria-hidden="true">
              <SignalBars />
              <WifiIcon />
              <BatteryIcon />
            </span>
          </div>

          <header className={styles.appHeader}>
            <div className={styles.appIdentity}>
              <span className={styles.appMark}>FA</span>
              <span className={styles.appName}>
                {PARTNER_SPOTLIGHT.appName}
              </span>
            </div>
            <span className={styles.encrypted}>
              <img
                className={styles.encryptedIcon}
                src={iconLockSm}
                alt=""
                width={11}
                height={12}
                draggable={false}
              />
              {PARTNER_SPOTLIGHT.encryptedLabel}
            </span>
          </header>

          <div className={styles.recap}>
            <p className={styles.recapHeading}>
              {PARTNER_SPOTLIGHT.summaryHeading}
            </p>

            <div className={styles.answerList}>
              {rows.map((row, index) => {
                const filled = Boolean(row.value);
                return (
                  <motion.div
                    key={row.id}
                    className={styles.answerCard}
                    data-filled={filled ? '' : undefined}
                    initial={animate ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: animate ? 0.22 + index * 0.1 : 0,
                      ease: EASE_OUT,
                    }}
                  >
                    <div className={styles.answerCopy}>
                      <span className={styles.answerLabel}>{row.label}</span>
                      <span
                        className={styles.answerValue}
                        data-empty={filled ? undefined : ''}
                      >
                        {row.value ?? PARTNER_SPOTLIGHT.emptyValue}
                      </span>
                    </div>
                    {filled ? (
                      <img
                        className={styles.answerCheck}
                        src={checkCircle}
                        alt=""
                        width={16}
                        height={16}
                        draggable={false}
                      />
                    ) : (
                      <span className={styles.answerPending} />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <p className={styles.savedLine}>
              <span className={styles.savedCount}>{savedCount}</span>
              {` ${PARTNER_SPOTLIGHT.savedLabel}`}
              <span className={styles.savedDot} />
              {PARTNER_SPOTLIGHT.nextHint}
            </p>
          </div>

          <p className={styles.privacyNote}>
            <img
              className={styles.privacyIcon}
              src={iconLockSm}
              alt=""
              width={12}
              height={13}
              draggable={false}
            />
            <span>{PARTNER_SPOTLIGHT.privacyNote}</span>
          </p>

          <span className={styles.homeIndicator} />
          <span className={styles.screenGlare} />
        </div>
      </div>
    </div>
  );
}

function SignalBars() {
  return (
    <svg
      className={styles.signal}
      viewBox="0 0 18 12"
      width="18"
      height="12"
      aria-hidden="true"
    >
      <rect x="0" y="8" width="3" height="4" rx="0.6" fill="currentColor" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="0.6" fill="currentColor" />
      <rect x="10" y="3" width="3" height="9" rx="0.6" fill="currentColor" />
      <rect
        x="15"
        y="0.5"
        width="3"
        height="11.5"
        rx="0.6"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg
      className={styles.wifi}
      viewBox="0 0 16 12"
      width="16"
      height="12"
      aria-hidden="true"
    >
      <path
        d="M8 9.6a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7Zm0-3.2c1.4 0 2.68.52 3.66 1.38l-1.2 1.2A3.45 3.45 0 0 0 8 8.1c-.9 0-1.72.32-2.36.86L4.44 7.78A5.1 5.1 0 0 1 8 6.4Zm0-3.15c2.3 0 4.4.86 6.02 2.28l-1.2 1.2A7.05 7.05 0 0 0 8 4.65c-1.9 0-3.64.7-5 1.88L1.8 5.33A8.85 8.85 0 0 1 8 3.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg
      className={styles.battery}
      viewBox="0 0 25 12"
      width="25"
      height="12"
      aria-hidden="true"
    >
      <rect
        x="0.6"
        y="0.6"
        width="21"
        height="10.8"
        rx="2.4"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity="0.4"
      />
      <rect x="2.2" y="2.2" width="16" height="7.6" rx="1.4" fill="currentColor" />
      <path
        d="M23 4.2v3.6c.9-.4.9-3.2 0-3.6Z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  );
}
