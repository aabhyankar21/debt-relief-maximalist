import { AnimatePresence, motion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { useMediaQuery } from '../../engine/useMediaQuery';
import { StepBody } from '../../steps/StepBody';
import {
  BackButton,
  Brand,
  LegalFooter,
  ProgressRing,
  StepDots,
  TrustBadge,
} from '../../shell/Chrome';
import { ResultScreen } from '../../shell/ResultScreen';
import { InsightPanel } from './InsightPanel';
import styles from './vault.module.css';
import './theme.css';

function Glow() {
  return (
    <div className={styles.glow} aria-hidden="true">
      <span className={styles.glowBlue} />
      <span className={styles.glowWarm} />
      <span className={styles.glowGrid} />
      <span className={styles.vignette} />
    </div>
  );
}

export function Vault() {
  const journey = useJourney();
  const { step, index, totalSteps, progress, direction, finished } = journey;
  const hasSidePanel = useMediaQuery('(min-width: 1024px)');

  return (
    <div className={styles.shell} data-concept="vault">
      <Glow />

      <aside className={styles.stage}>
        <div className={styles.stageTop}>
          <Brand logo />
          <StepDots total={totalSteps} index={finished ? totalSteps : index} />
        </div>
        <div className={styles.stageStack}>
          <InsightPanel />
          {!finished && step.callout && hasSidePanel ? (
            <aside className={styles.stageCallout}>
              <p className={styles.stageCalloutTitle}>{step.callout.title}</p>
              <p className={styles.stageCalloutBody}>{step.callout.body}</p>
            </aside>
          ) : null}
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <BackButton
              onClick={journey.back}
              hidden={index === 0 && !finished}
            />
            <span className={styles.headerBrand}>
              <Brand logo />
            </span>
          </div>
          <div className={styles.headerMeta}>
            <TrustBadge />
            <ProgressRing value={progress} />
          </div>
        </header>

        {hasSidePanel ? null : (
          <div className={styles.mobileInsight}>
            <InsightPanel compact />
          </div>
        )}

        <main className={styles.content} data-sticky-cta="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={finished ? 'result' : step.id}
              className={styles.card}
              initial={{ opacity: 0, y: direction * 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: direction * -14, filter: 'blur(8px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {finished ? (
                <ResultScreen />
              ) : (
                <StepBody step={step} hideCallout={hasSidePanel} />
              )}
            </motion.section>
          </AnimatePresence>
        </main>
      </div>

      <div className={styles.footer}>
        <LegalFooter />
      </div>
    </div>
  );
}
