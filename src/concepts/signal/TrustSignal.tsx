import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  SIGNAL_CONFIG,
  resolveSignalColor,
  resolveSignalScale,
  type OtpStatus,
} from './config';
import styles from './trustSignal.module.css';

export interface TrustSignalProps {
  step: number;
  debtAmountBand: number | null;
  matchedDebtTypeIndex?: number;
  otpStatus?: OtpStatus;
  /** Small quicker pulse while a typed field is focused. */
  attentive?: boolean;
  className?: string;
}

const PARTICLES = Array.from(
  { length: SIGNAL_CONFIG.particles },
  (_, index) => index,
);

export function TrustSignal({
  step,
  debtAmountBand,
  matchedDebtTypeIndex,
  otpStatus = 'idle',
  attentive = false,
  className,
}: TrustSignalProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const config = SIGNAL_CONFIG.steps[step] ?? SIGNAL_CONFIG.steps[1];
  const { timing } = SIGNAL_CONFIG;
  const scanning = config.behavior === 'otp-verify' && otpStatus === 'pending';
  const verified = config.behavior === 'otp-verify' && otpStatus === 'verified';
  const color = resolveSignalColor(
    step,
    config.warmthLevel,
    matchedDebtTypeIndex,
    otpStatus,
  );
  const scale = resolveSignalScale(step, debtAmountBand);
  const density =
    0.52 + Math.min(Math.max(debtAmountBand ?? 0.38, 0), 1) * 0.48;

  const breath = reduceMotion
    ? { scale: 1 }
    : scanning
      ? { scale: [1, 0.94, 1] }
      : attentive
        ? { scale: [1, 1.055, 1] }
        : { scale: [1, 1.032, 1] };

  const breathTransition = reduceMotion
    ? { duration: 0 }
    : scanning
      ? {
          duration: timing.otpScanS,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }
      : attentive
        ? {
            duration: timing.attentiveS,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }
        : {
            duration: timing.breathS,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          };

  const orbitScale = scanning ? [1, 0.38, 1] : verified ? 0.52 : 1;
  const orbitTransition = reduceMotion
    ? { duration: timing.reducedS }
    : scanning
      ? {
          duration: timing.otpScanS,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }
      : {
          duration: verified ? timing.otpSettleS : timing.reducedS,
          ease: [0.22, 1, 0.36, 1] as const,
        };

  return (
    <div
      className={`${styles.wrap}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <motion.div
        className={styles.signal}
        style={
          {
            '--signal-color': color,
            '--signal-density': density,
          } as CSSProperties
        }
        initial={false}
        animate={{ scale }}
        transition={{
          duration: reduceMotion ? timing.reducedS : 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          className={styles.halo}
          animate={breath}
          transition={breathTransition}
        />
        <motion.div
          className={styles.bloom}
          animate={
            reduceMotion
              ? { opacity: 0.55 + density * 0.35 }
              : {
                  opacity: scanning
                    ? [0.5 + density * 0.3, 0.72 + density * 0.28, 0.5 + density * 0.3]
                    : [0.48 + density * 0.28, 0.62 + density * 0.38, 0.48 + density * 0.28],
                }
          }
          transition={
            reduceMotion
              ? { duration: timing.reducedS }
              : {
                  duration: scanning ? timing.otpScanS : timing.breathS,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
        <div className={styles.core} />

        <motion.div
          className={styles.swarm}
          animate={
            reduceMotion || scanning ? { rotate: 0 } : { rotate: 360 }
          }
          transition={
            reduceMotion || scanning
              ? { duration: 0 }
              : {
                  duration: timing.swarmS,
                  repeat: Infinity,
                  ease: 'linear',
                }
          }
        >
          {PARTICLES.map((index) => {
            const angle = (index / PARTICLES.length) * 360;
            return (
              <span
                key={index}
                className={styles.orbit}
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <motion.span
                  className={styles.orbitInner}
                  initial={false}
                  animate={{ scale: orbitScale }}
                  transition={orbitTransition}
                >
                  <span className={styles.particle} />
                </motion.span>
              </span>
            );
          })}
        </motion.div>

        {verified ? (
          <motion.div
            className={styles.lock}
            initial={
              reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.72 }
            }
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: reduceMotion ? 0 : timing.otpSettleS,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <svg viewBox="0 0 48 48" fill="none">
              <circle
                cx="24"
                cy="24"
                r="15.5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M17.5 24.4l4.2 4.2 8.8-9.2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
