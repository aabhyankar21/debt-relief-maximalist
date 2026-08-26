import { AnimatePresence, motion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { useMediaQuery } from '../../engine/useMediaQuery';
import { StepBody } from '../../steps/StepBody';
import {
  BackButton,
  Brand,
  LegalFooter,
  ProgressBar,
  TrustBadge,
} from '../../shell/Chrome';
import { InsightPanel } from './InsightPanel';
import { VaultResult } from './VaultResult';
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
  const { step, index, progress, direction, finished } = journey;
  const hasSidePanel = useMediaQuery('(min-width: 1024px)');

  return (
    <div
      className={styles.shell}
      data-concept="vault"
      data-result={finished ? 'true' : undefined}
    >
      <Glow />

      <aside className={styles.stage} hidden={finished}>
        <div className={styles.stageTop}>
          <Brand logo />
        </div>
        {finished ? null : <InsightPanel />}
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <BackButton
              onClick={journey.back}
              hidden={index === 0 || finished}
            />
            <span className={styles.headerBrand}>
              <Brand logo />
            </span>
            <TrustBadge />
          </div>
          {finished ? null : (
            <div className={styles.progressSlot}>
              <ProgressBar value={progress} />
            </div>
          )}
        </header>

        {hasSidePanel || finished ? null : (
          <div className={styles.mobileInsight}>
            <InsightPanel compact />
          </div>
        )}

        <main
          className={styles.content}
          data-sticky-cta="true"
          data-result={finished ? 'true' : undefined}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={finished ? 'result' : step.id}
              className={finished ? styles.stepWrap : styles.card}
              data-result={finished ? 'true' : undefined}
              initial={{ opacity: 0, y: direction * 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: direction * -14, filter: 'blur(8px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {finished ? (
                <VaultResult />
              ) : (
                <StepBody step={step} hideCallout />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <LegalFooter />
      </div>
    </div>
  );
}
