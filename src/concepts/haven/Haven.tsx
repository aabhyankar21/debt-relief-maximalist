import { AnimatePresence, motion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { useMediaQuery } from '../../engine/useMediaQuery';
import { StepBody } from '../../steps/StepBody';
import {
  BackButton,
  LegalFooter,
  TrustBadge,
} from '../../shell/Chrome';
import { HavenResult } from './HavenResult';
import { InsightPanel } from './InsightPanel';
import havenLogo from './haven-logo.png';
import styles from './haven.module.css';
import './theme.css';

function HavenBrand() {
  return (
    <span className={styles.brand}>
      <img className={styles.brandLogo} src={havenLogo} alt="Haven Debt Relief" />
    </span>
  );
}

export function Haven() {
  const journey = useJourney();
  const { step, index, direction, finished } = journey;
  const hasSidePanel = useMediaQuery('(min-width: 1024px)');

  return (
    <div
      className={styles.shell}
      data-concept="haven"
      data-result={finished ? 'true' : undefined}
    >
      <aside className={styles.panel} hidden={finished}>
        <div className={styles.panelTop}>
          <HavenBrand />
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
              <HavenBrand />
            </span>
            <TrustBadge />
          </div>
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
              className={styles.stepWrap}
              data-result={finished ? 'true' : undefined}
              initial={{ opacity: 0, y: direction * 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction * -10 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
              {finished ? (
                <HavenResult />
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
