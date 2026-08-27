import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { StepBody } from '../../steps/StepBody';
import {
  BackButton,
  LegalFooter,
  ProgressBar,
  TrustBadge,
} from '../../shell/Chrome';
import { ResultScreen } from '../../shell/ResultScreen';
import { ThreadScene } from './ThreadScene';
import styles from './thread.module.css';
import './theme.css';

/**
 * The scene runs nine steps; the journey has seven plus a result. Five map
 * one to one, then scene 6 (verification) is a beat the journey does not
 * have a screen for — it plays for a moment as the person leaves the phone
 * step, before the big straightening on income.
 */
const SCENE_STEP_BY_INDEX = [1, 2, 3, 4, 5, 7, 8];
const PHONE_INDEX = 4;
const VERIFY_HOLD_MS = 900;

/** Anything that behaves like a form control lights its dot on hover/focus. */
const CONTROL_SELECTOR = 'input, select, textarea, button, [role="radio"]';

function BrandMark() {
  return (
    <span className={styles.brand}>
      <svg className={styles.brandMark} viewBox="0 0 28 16" fill="none" aria-hidden="true">
        <path
          d="M1 8c2.4-5 4.8-5 7.2 0s4.8 5 7.2 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M15.4 8H26"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle cx="26" cy="8" r="2.2" fill="var(--c-accent)" />
      </svg>
      Thread
    </span>
  );
}

export function Thread() {
  const journey = useJourney();
  const { step, index, progress, direction, finished, choices, fields } = journey;
  const reduceMotion = useReducedMotion() ?? false;

  const [focusedField, setFocusedField] = useState<string | null>(null);

  /* Hold the verification beat for a moment on the way out of the phone
     step, so the dot lights and pulses before the line relaxes. */
  const [verifying, setVerifying] = useState(false);
  const previousIndex = useRef(index);
  useEffect(() => {
    const from = previousIndex.current;
    previousIndex.current = index;
    if (reduceMotion || from !== PHONE_INDEX || index !== PHONE_INDEX + 1) {
      setVerifying(false);
      return;
    }
    setVerifying(true);
    const timer = window.setTimeout(() => setVerifying(false), VERIFY_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [index, reduceMotion]);

  const sceneStep = finished ? 9 : verifying ? 6 : SCENE_STEP_BY_INDEX[index] ?? 1;

  /* Focus and hover share one handler: on touch there is no hover, and the
     focus event carries the same information. */
  const trackPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      setFocusedField(target?.closest(CONTROL_SELECTOR) ? step.id : null);
    },
    [step.id],
  );

  const trackFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(CONTROL_SELECTOR)) setFocusedField(step.id);
    },
    [step.id],
  );

  const clearFocus = useCallback(() => setFocusedField(null), []);

  useEffect(() => setFocusedField(null), [index, finished]);

  return (
    <div className={styles.root} data-concept="thread">
      <ThreadScene
        className={styles.scene}
        step={sceneStep}
        debtAmount={choices['debt-amount'] ?? ''}
        firstName={fields.firstName ?? ''}
        focusedField={focusedField}
      />

      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <BackButton onClick={journey.back} hidden={index === 0 && !finished} />
            <BrandMark />
            <TrustBadge />
          </div>
          {finished ? null : (
            <div className={styles.progressSlot}>
              <ProgressBar value={progress} />
            </div>
          )}
        </header>

        <main className={styles.content} data-sticky-cta="true">
          <div className={styles.card}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={finished ? 'result' : step.id}
                className={styles.stepWrap}
                initial={{ opacity: 0, y: direction * 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction * -10 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                onPointerOver={trackPointer}
                onPointerLeave={clearFocus}
                onFocusCapture={trackFocus}
                onBlurCapture={clearFocus}
              >
                {finished ? <ResultScreen /> : <StepBody step={step} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <LegalFooter />
      </div>
    </div>
  );
}
