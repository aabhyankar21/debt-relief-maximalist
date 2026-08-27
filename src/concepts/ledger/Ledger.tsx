import { AnimatePresence, motion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { StepBody } from '../../steps/StepBody';
import {
  BackButton,
  Brand,
  LegalFooter,
  LegalLinks,
  ProgressBar,
} from '../../shell/Chrome';
import { ResultScreen } from '../../shell/ResultScreen';
import { LedgerArt } from './LedgerArt';
import styles from './ledger.module.css';
import './theme.css';

const transition = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

export function Ledger() {
  const journey = useJourney();
  const { step, index, totalSteps, progress, direction, finished } = journey;

  return (
    <div className={styles.shell} data-concept="ledger">
      <aside className={styles.panel}>
        <div className={styles.panelTop}>
          <Brand />
          <p className={styles.chapter}>
            {String(Math.min(index + 1, totalSteps)).padStart(2, '0')} /{' '}
            {String(totalSteps).padStart(2, '0')}
          </p>
        </div>

        <LedgerArt stepId={finished ? 'result' : step.id} progress={progress} />
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <BackButton onClick={journey.back} hidden={index === 0 && !finished} />
            <span className={styles.headerBrand}>
              <Brand />
            </span>
            <LegalLinks inHeader />
          </div>
          <ProgressBar value={progress} />
        </header>

        <div className={styles.mobileArt}>
          <LedgerArt
            stepId={finished ? 'result' : step.id}
            progress={progress}
            compact
          />
        </div>

        <main className={styles.content}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={finished ? 'result' : step.id}
              className={styles.stepWrap}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -18 }}
              transition={transition}
            >
              {finished ? <ResultScreen /> : <StepBody step={step} />}
            </motion.div>
          </AnimatePresence>
        </main>

        <LegalFooter />
      </div>
    </div>
  );
}
