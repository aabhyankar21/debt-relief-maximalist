import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import { digitsOnly } from '../../engine/validation';
import iconLock from './assets/icon-lock.svg';
import ringsSrc from './assets/rings.png';
import { ORBIT_MOTION, PHONE_VAULT } from './config';
import styles from './phoneSpotlight.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SEAL_MS = 420;
const SLOT_COUNT = 10;

export interface PhoneSpotlightProps {
  className?: string;
  /** Live phone field — digits flash in the vault, then seal. */
  phone?: string;
}

/**
 * Left-stage collage for Orbit step 5.
 * Desktop: dashed rings + dim partner cards + glass number vault.
 * Mobile: landscape glass vault card in the short stage (no partner logos).
 */
export function PhoneSpotlight({
  className,
  phone = '',
}: PhoneSpotlightProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = isDesktop && !reduceMotion;
  const vault = useVaultSealing(phone, !reduceMotion);
  const alive = !reduceMotion;

  if (!isDesktop) {
    return (
      <MobilePhoneSpotlight
        className={className}
        vault={vault}
        animate={!reduceMotion}
      />
    );
  }

  const { card, cards } = PHONE_VAULT;

  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      data-alive={alive || undefined}
      data-sealed={vault.sealed ? '' : undefined}
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

        {cards.map((logo, index) => (
          <motion.div
            key={logo.id}
            className={`${styles.logo}${vault.sealed ? ` ${styles.logoSealed}` : ''}`}
            style={{
              left: `${logo.x}%`,
              top: `${logo.y}%`,
              width: `${logo.w}%`,
              height: `${logo.h}%`,
            }}
            initial={motionOn ? { scale: 0.92 } : false}
            animate={{ scale: 1 }}
            transition={{
              duration: ORBIT_MOTION.enterDurSec,
              delay: motionOn ? index * ORBIT_MOTION.enterStaggerSec : 0,
              ease: EASE_OUT,
            }}
          >
            <div
              className={styles.logoFloat}
              style={{
                ['--float-amp' as string]: `${ORBIT_MOTION.floatAmps[index % ORBIT_MOTION.floatAmps.length]}px`,
                ['--float-dur' as string]: `${ORBIT_MOTION.floatDurations[index % ORBIT_MOTION.floatDurations.length]}s`,
                ['--float-delay' as string]: `${0.8 + index * 0.35}s`,
              }}
            >
              <img src={logo.image} alt="" draggable={false} />
            </div>
          </motion.div>
        ))}

        <motion.article
          className={styles.card}
          style={{ width: `${card.w}%` }}
          initial={motionOn ? { scale: 0.96 } : false}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: motionOn ? 0.12 : 0,
            ease: EASE_OUT,
          }}
        >
          <span className={styles.cardSheen} />
          <div className={styles.copy}>
            <span className={styles.pill}>
              <span
                className={styles.pillDot}
                data-pulse={reduceMotion ? undefined : ''}
              />
              {PHONE_VAULT.pill}
            </span>
            <p className={styles.title}>{PHONE_VAULT.title}</p>
            <ul className={styles.chips}>
              {PHONE_VAULT.chips.map((label) => (
                <li key={label} className={styles.chip}>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <VaultPanel vault={vault} animate={!reduceMotion} />
        </motion.article>
      </div>
    </div>
  );
}

function MobilePhoneSpotlight({
  className,
  vault,
  animate,
}: {
  className?: string;
  vault: VaultSealing;
  animate: boolean;
}) {
  return (
    <div
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      data-alive={animate || undefined}
      data-sealed={vault.sealed ? '' : undefined}
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        <article className={styles.mobileCard}>
          <span className={styles.cardSheen} />
          <div className={styles.mobileCopy}>
            <span className={styles.pill}>
              <span
                className={styles.pillDot}
                data-pulse={animate ? '' : undefined}
              />
              {PHONE_VAULT.pill}
            </span>
            <p className={styles.mobileTitle}>{PHONE_VAULT.title}</p>
            <ul className={styles.chips}>
              {PHONE_VAULT.chips.map((label) => (
                <li key={label} className={styles.chip}>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <VaultPanel
            className={styles.mobileVault}
            vault={vault}
            animate={animate}
          />
        </article>
      </div>
    </div>
  );
}

type VaultSealing = ReturnType<typeof useVaultSealing>;

function useVaultSealing(phone: string, animate: boolean) {
  const digits = digitsOnly(phone).slice(0, SLOT_COUNT);
  const count = digits.length;
  const prevCount = useRef(animate ? 0 : count);
  const [sealedCount, setSealedCount] = useState(() =>
    animate ? 0 : count,
  );
  const [flashIndex, setFlashIndex] = useState(-1);

  useEffect(() => {
    if (!animate) {
      prevCount.current = count;
      setSealedCount(count);
      setFlashIndex(-1);
      return;
    }

    const prev = prevCount.current;
    prevCount.current = count;

    if (count === 0) {
      setSealedCount(0);
      setFlashIndex(-1);
      return;
    }

    if (count <= prev) {
      setSealedCount(count);
      setFlashIndex(-1);
      return;
    }

    setSealedCount(count - 1);
    setFlashIndex(count - 1);
    const id = window.setTimeout(() => {
      setSealedCount(count);
      setFlashIndex(-1);
    }, SEAL_MS);
    return () => window.clearTimeout(id);
  }, [animate, count]);

  return {
    digits,
    sealedCount,
    flashIndex,
    sealed: count === SLOT_COUNT && sealedCount === SLOT_COUNT && flashIndex < 0,
  };
}

function VaultPanel({
  vault,
  animate,
  className,
}: {
  vault: VaultSealing;
  animate: boolean;
  className?: string;
}) {
  const scanning = animate && !vault.sealed && vault.digits.length > 0;
  const idle = animate && !vault.sealed && vault.digits.length === 0;

  return (
    <div
      className={`${styles.vault}${className ? ` ${className}` : ''}`}
      data-sealed={vault.sealed ? '' : undefined}
      data-scanning={scanning ? '' : undefined}
    >
      <VaultNumber vault={vault} />
      {animate && !vault.sealed ? (
        <div
          className={styles.scanBeam}
          data-pace={scanning ? 'live' : idle ? 'idle' : undefined}
        />
      ) : null}
      <div className={styles.settleGlow} />
    </div>
  );
}

function VaultNumber({ vault }: { vault: VaultSealing }) {
  const slots = Array.from({ length: SLOT_COUNT }, (_, index) => {
    const filled = index < vault.digits.length;
    const flashing = index === vault.flashIndex;
    const sealed = index < vault.sealedCount && !flashing;
    return {
      index,
      char: filled ? vault.digits[index] : '',
      flashing,
      sealed,
    };
  });

  return (
    <div className={styles.vaultRow}>
      <span className={styles.vaultPrefix}>+1</span>
      <span className={styles.vaultGroup}>
        <span className={styles.vaultMark}>(</span>
        {slots.slice(0, 3).map((slot) => (
          <Slot key={slot.index} {...slot} />
        ))}
        <span className={styles.vaultMark}>)</span>
      </span>
      <span className={styles.vaultGroup}>
        {slots.slice(3, 6).map((slot) => (
          <Slot key={slot.index} {...slot} />
        ))}
      </span>
      <span className={styles.vaultDash}>–</span>
      <span className={styles.vaultGroup}>
        {slots.slice(6, 10).map((slot) => (
          <Slot key={slot.index} {...slot} />
        ))}
      </span>
      <span
        className={styles.vaultLock}
        data-on={vault.sealed ? '' : undefined}
      >
        <img src={iconLock} alt="" width={14} height={15} draggable={false} />
      </span>
    </div>
  );
}

function Slot({
  char,
  flashing,
  sealed,
}: {
  index: number;
  char: string;
  flashing: boolean;
  sealed: boolean;
}) {
  return (
    <span
      className={styles.slot}
      data-flash={flashing ? '' : undefined}
      data-sealed={sealed ? '' : undefined}
    >
      {flashing ? char : ''}
    </span>
  );
}
