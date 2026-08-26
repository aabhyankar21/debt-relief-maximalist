import { AnimatePresence, motion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { useMediaQuery } from '../../engine/useMediaQuery';
import { StepBody } from '../../steps/StepBody';
import {
  BackButton,
  Brand,
  LegalFooter,
  StepDots,
  TrustBadge,
} from '../../shell/Chrome';
import { ResultScreen } from '../../shell/ResultScreen';
import { Scene } from './Scene';
import styles from './bloom.module.css';
import './theme.css';

export function Bloom() {
  const journey = useJourney();
  const { step, index, totalSteps, direction, finished } = journey;
  const hasSidePanel = useMediaQuery('(min-width: 1024px)');

  return (
    <div className={styles.shell} data-concept="bloom">
      <div className={styles.atmosphere} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbPink}`} />
        <span className={`${styles.orb} ${styles.orbBlue}`} />
        <span className={`${styles.orb} ${styles.orbGold}`} />
      </div>

      <aside className={styles.stage}>
        <div className={styles.stageTop}>
          <Brand />
          <StepDots total={totalSteps} index={finished ? totalSteps : index} />
        </div>
        <Scene />
        <div className={styles.stageFoot}>
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
              <Brand />
            </span>
          </div>
          <div className={styles.headerMeta}>
            <TrustBadge />
            <span className={styles.headerDots}>
              <StepDots
                total={totalSteps}
                index={finished ? totalSteps : index}
              />
            </span>
          </div>
        </header>

        {hasSidePanel ? null : (
          <div className={styles.mobileScene}>
            <Scene compact />
          </div>
        )}

        <main className={styles.content} data-sticky-cta="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={finished ? 'result' : step.id}
              className={styles.stepWrap}
              initial={{ opacity: 0, y: direction * 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: direction * -14, scale: 0.99 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              {finished ? (
                <ResultScreen />
              ) : (
                <StepBody step={step} hideCallout={hasSidePanel} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <LegalFooter />
      </div>
    </div>
  );
}
