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
import { MorphScene } from './MorphScene';
import styles from './morph.module.css';
import './theme.css';

/**
 * The scene runs nine states; the journey has seven steps plus a result.
 * Seven map one to one, and scene 6 — the verification "locked in" beat — is
 * a moment the journey has no screen for, so it plays for a breath as the
 * person leaves the phone step, before the big stretch on income.
 */
const SCENE_STEP_BY_INDEX = [1, 2, 3, 4, 5, 7, 8];
const PHONE_INDEX = 4;
const VERIFY_HOLD_MS = 900;

/** Anything that behaves like a form control counts as focus for the blob. */
const CONTROL_SELECTOR = 'input, select, textarea, button, [role="radio"]';

function BrandMark() {
  return (
    <span className={styles.brand}>
      <svg
        className={styles.brandMark}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 3.6c4 0 7.2 2.9 7.2 6.7 0 4.4-3.4 6.4-5.4 8.6-1 1.1-2.6 1.1-3.6 0-2-2.2-5.4-4.2-5.4-8.6C4.8 6.5 8 3.6 12 3.6Z"
          fill="currentColor"
          opacity="0.22"
        />
        <path
          d="M12 3.6c4 0 7.2 2.9 7.2 6.7 0 4.4-3.4 6.4-5.4 8.6-1 1.1-2.6 1.1-3.6 0-2-2.2-5.4-4.2-5.4-8.6C4.8 6.5 8 3.6 12 3.6Z"
          stroke="currentColor"
          strokeWidth="1.3"
          opacity="0.7"
        />
        <circle cx="9.6" cy="8.8" r="1.9" fill="#fff" opacity="0.75" />
      </svg>
      Morph
    </span>
  );
}

export function Morph() {
  const journey = useJourney();
  const { step, index, progress, direction, finished, choices } = journey;
  const reduceMotion = useReducedMotion() ?? false;

  const [focusedField, setFocusedField] = useState<string | null>(null);

  /* Hold the verification beat on the way out of the phone step, so the
     blob tightens and takes its highlight sweep before it relaxes. */
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

  const sceneStep = finished
    ? 9
    : verifying
      ? 6
      : SCENE_STEP_BY_INDEX[index] ?? 1;

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
    <div className={styles.root} data-concept="morph">
      <MorphScene
        className={styles.scene}
        step={sceneStep}
        debtAmount={choices['debt-amount'] ?? ''}
        debtType={choices['debt-type'] ?? ''}
        focusedField={focusedField}
        progressPercent={progress}
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
