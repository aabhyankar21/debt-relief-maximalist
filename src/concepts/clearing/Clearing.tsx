import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { StepBody } from '../../steps/StepBody';
import { BackButton, LegalFooter, ProgressBar, TrustBadge } from '../../shell/Chrome';
import { ResultScreen } from '../../shell/ResultScreen';
import { ClearingScene } from './ClearingScene';
import styles from './clearing.module.css';
import './theme.css';

/** One line of narration per scene step, so the visual explains itself. */
const CAPTIONS: Record<number, { kicker: string; line: string }> = {
  1: { kicker: 'The clearing', line: 'The ridge ahead is the size of what you owe.' },
  2: { kicker: 'Your terrain', line: 'We can see the shape of your debt now.' },
  3: { kicker: 'The route', line: 'A path opens from where you stand.' },
  4: { kicker: 'Light shifts', line: 'The day turns; your options come into view.' },
  5: { kicker: 'Checkpoint', line: 'A beacon waits further up the trail.' },
  6: { kicker: 'Verified', line: 'The beacon is lit. You are confirmed.' },
  7: { kicker: 'Breaking through', line: 'The fog is burning off ahead of you.' },
  8: { kicker: 'Almost clear', line: 'You can see how far you have already come.' },
  9: { kicker: 'Arrival', line: 'Someone is waiting to walk the rest with you.' },
};

function BrandMark() {
  return (
    <span className={styles.brand}>
      <svg
        className={styles.brandMark}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="9.5" r="4.5" fill="var(--c-accent)" opacity="0.9" />
        <path
          d="M2 19.5 L8.5 11 L12.5 16 L16 12 L22 19.5 Z"
          fill="currentColor"
          opacity="0.85"
        />
      </svg>
      Clearing
    </span>
  );
}

export function Clearing() {
  const journey = useJourney();
  const { step, index, progress, direction, finished, choices, fields } = journey;
  const reduceMotion = useReducedMotion() ?? false;

  /* The journey has seven form steps; the scene has nine. Finishing lands
     on step 8 (foreground fog clears) and settles into 9 (arrival). */
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    if (!finished) {
      setArrived(false);
      return;
    }
    const timer = window.setTimeout(
      () => setArrived(true),
      reduceMotion ? 180 : 900,
    );
    return () => window.clearTimeout(timer);
  }, [finished, reduceMotion]);

  const sceneStep = finished ? (arrived ? 9 : 8) : index + 1;
  const caption = CAPTIONS[sceneStep];

  return (
    <div className={styles.root} data-concept="clearing">
      <div className={styles.shell} data-result={finished ? 'true' : undefined}>
        <aside className={styles.visual}>
          <ClearingScene
            className={styles.scene}
            step={sceneStep}
            debtAmount={choices['debt-amount'] ?? ''}
            debtType={choices['debt-type'] ?? ''}
            firstName={fields.firstName ?? ''}
            progressPercent={progress}
          />

          <div className={styles.visualBrand}>
            <BrandMark />
          </div>

          <div className={styles.visualOverlay}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={sceneStep}
                className={styles.visualCopy}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                transition={{
                  duration: reduceMotion ? 0.2 : 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span className={styles.visualKicker}>{caption.kicker}</span>
                <p className={styles.visualLine}>{caption.line}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>

        <div className={styles.main}>
          <header className={styles.header}>
            <div className={styles.headerRow}>
              <BackButton
                onClick={journey.back}
                hidden={index === 0 && !finished}
              />
              <span className={styles.headerBrand}>
                <BrandMark />
              </span>
              <TrustBadge />
            </div>
            {finished ? null : (
              <div className={styles.progressSlot}>
                <ProgressBar value={progress} />
              </div>
            )}
          </header>

          <main
            className={styles.content}
            data-sticky-cta="true"
            data-result={finished ? 'true' : undefined}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={finished ? 'result' : step.id}
                className={styles.stepWrap}
                initial={{ opacity: 0, y: direction * 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction * -10 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              >
                {finished ? (
                  <ResultScreen />
                ) : (
                  <StepBody step={step} hideCallout />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <LegalFooter />
        </div>
      </div>
    </div>
  );
}
