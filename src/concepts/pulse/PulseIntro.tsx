import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import { PrimaryButton } from '../../ui/Button';
import { PulseField } from './PulseField';
import { PulseTitle } from './PulseTitle';
import { PULSE_INTRO_COPY } from './copy';
import styles from './pulseIntro.module.css';
import './theme.css';

/* ------------------------------------------------------------------ *
 * Config
 *
 * The whole sequence is a testable duration, not a vibe. Chaos hold +
 * wave must land the CTA under `capMs` on a paid-traffic funnel.
 * ------------------------------------------------------------------ */

export const PULSE_INTRO_CONFIG = {
  storageKey: 'pulseIntroSeen',
  /** Dense/erratic field before the wave starts. */
  chaosHold: 0.1,
  /** Left-to-right settle. 100ms → 1.5s. */
  waveDuration: 1.4,
  waveEase: [0.4, 0, 0.2, 1] as const,
  /**
   * Wave progress at which the headline (roughly centre-left of the
   * copy column) is reached. Title mounts then, and resolves over
   * `titleDuration` — slower than every other PulseTitle on purpose.
   */
  titleAt: 0.42,
  titleDuration: 0.7,
  reduced: 0.3,
  /** Hard cap, mount to CTA interactive. Asserted in the lab. */
  capMs: 2000,
} as const;

export function hasSeenPulseIntro(): boolean {
  try {
    return sessionStorage.getItem(PULSE_INTRO_CONFIG.storageKey) === '1';
  } catch {
    return false;
  }
}

export function markPulseIntroSeen() {
  try {
    sessionStorage.setItem(PULSE_INTRO_CONFIG.storageKey, '1');
  } catch {
    /* Private mode: the intro will replay next visit, which is fine. */
  }
}

export function clearPulseIntroSeen() {
  try {
    sessionStorage.removeItem(PULSE_INTRO_CONFIG.storageKey);
  } catch {
    /* ignore */
  }
}

export interface PulseIntroProps {
  /** Fires when the CTA becomes interactive — analytics, not navigation. */
  onComplete?: () => void;
  /** Fires when the person taps Continue. */
  onContinue: () => void;
  className?: string;
}

export function PulseIntro({
  onComplete,
  onContinue,
  className,
}: PulseIntroProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const wave = useMotionValue(reduceMotion ? 1 : 0);
  const [titleReady, setTitleReady] = useState(reduceMotion);
  const [ctaReady, setCtaReady] = useState(reduceMotion);
  const [fieldIntensity, setFieldIntensity] = useState<
    'chaos' | undefined
  >(reduceMotion ? undefined : 'chaos');
  const completed = useRef(false);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    markPulseIntroSeen();
    onComplete?.();
  };

  useEffect(() => {
    if (reduceMotion) {
      wave.set(1);
      setTitleReady(true);
      setCtaReady(true);
      finish();
      return;
    }

    wave.set(0);
    const controls = animate(wave, 1, {
      delay: PULSE_INTRO_CONFIG.chaosHold,
      duration: PULSE_INTRO_CONFIG.waveDuration,
      ease: PULSE_INTRO_CONFIG.waveEase,
      onComplete: () => {
        setCtaReady(true);
        /* The wave has made the field look idle; hand it to step 1's
           cluster so the CTA lands on the same calm the form will use. */
        setFieldIntensity(undefined);
        finish();
      },
    });

    return () => controls.stop();
    // The sequence is one-shot per mount. onComplete is captured in finish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, wave]);

  useMotionValueEvent(wave, 'change', (value) => {
    if (!titleReady && value >= PULSE_INTRO_CONFIG.titleAt) {
      setTitleReady(true);
    }
  });

  const fade = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: PULSE_INTRO_CONFIG.reduced, ease: 'linear' as const },
      }
    : undefined;

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="pulse"
    >
      <PulseField
        className={styles.scene}
        step={1}
        intensity={fieldIntensity}
        wave={wave}
      />

      <motion.div className={styles.copy} {...fade}>
        {titleReady ? (
          <PulseTitle
            text={PULSE_INTRO_COPY.headline}
            as="h1"
            className={styles.headline}
            animateWeight
            tick
            resolveDuration={
              reduceMotion ? undefined : PULSE_INTRO_CONFIG.titleDuration
            }
          />
        ) : (
          <h1 className={styles.headline} style={{ visibility: 'hidden' }} aria-hidden="true">
            {PULSE_INTRO_COPY.headline}
          </h1>
        )}

        <div className={styles.cta}>
          {ctaReady ? (
            <PrimaryButton onClick={onContinue}>
              {PULSE_INTRO_COPY.cta}
            </PrimaryButton>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
