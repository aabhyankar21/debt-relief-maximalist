import { AnimatePresence, motion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { useMediaQuery } from '../../engine/useMediaQuery';
import { StepBody } from '../../steps/StepBody';
import {
  BackButton,
  Brand,
  LegalFooter,
  ProgressBar,
  StepDots,
  TrustBadge,
} from '../../shell/Chrome';
import { ResultScreen } from '../../shell/ResultScreen';
import { DataPanel, MobileStrip } from './DataPanel';
import styles from './momentum.module.css';
import './theme.css';

export function Momentum() {
  const journey = useJourney();
  const { step, index, totalSteps, progress, direction, finished } = journey;
  // The data panel hosts the callout on desktop; on mobile it stays in the body.
  const hasSidePanel = useMediaQuery('(min-width: 1024px)');

  return (
    <div className={styles.shell} data-concept="momentum">
      <header className={styles.appBar}>
        <div className={styles.appBarRow}>
          <div className={styles.appBarLeft}>
            <BackButton onClick={journey.back} hidden={index === 0 && !finished} />
            <Brand />
          </div>
          <div className={styles.appBarRight}>
            <span className={styles.appBarDots}>
              <StepDots total={totalSteps} index={finished ? totalSteps : index} />
            </span>
            <TrustBadge />
          </div>
        </div>
        <ProgressBar value={progress} />
      </header>

      {hasSidePanel ? null : <MobileStrip />}

      <div className={styles.body}>
        <main className={styles.formCol}>
          <div className={styles.formInner} data-sticky-cta="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={finished ? 'result' : step.id}
                initial={{ opacity: 0, y: direction * 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction * -12 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                {finished ? (
                  <ResultScreen />
                ) : (
                  <StepBody step={step} hideCallout={hasSidePanel} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {hasSidePanel ? (
          <aside className={styles.panelCol}>
            <DataPanel />
          </aside>
        ) : null}
      </div>

      <LegalFooter />
    </div>
  );
}
