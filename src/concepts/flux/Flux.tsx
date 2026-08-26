import { AnimatePresence, motion, useReducedMotion, useSpring } from 'motion/react';
import { useEffect } from 'react';
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
import { StatsDeck } from './StatsDeck';
import styles from './flux.module.css';
import './theme.css';

function Spotlight() {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 120, damping: 22, mass: 0.6 });
  const y = useSpring(0, { stiffness: 120, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce, x, y]);

  if (reduce) return null;

  return <motion.div className={styles.spot} style={{ x, y }} aria-hidden="true" />;
}

export function Flux() {
  const journey = useJourney();
  const { step, index, totalSteps, direction, finished } = journey;
  const hasSidePanel = useMediaQuery('(min-width: 1024px)');

  return (
    <div className={styles.shell} data-concept="flux">
      <div className={styles.atmosphere} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbLime}`} />
        <span className={`${styles.orb} ${styles.orbPink}`} />
        <span className={`${styles.orb} ${styles.orbCyan}`} />
      </div>
      <Spotlight />

      <aside className={styles.stage}>
        <div className={styles.stageTop}>
          <Brand logo />
          <StepDots total={totalSteps} index={finished ? totalSteps : index} />
        </div>
        <StatsDeck />
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
            <span className={styles.headerDots}>
              <StepDots
                total={totalSteps}
                index={finished ? totalSteps : index}
              />
            </span>
          </div>
        </header>

        {hasSidePanel ? null : (
          <div className={styles.mobilePlay}>
            <StatsDeck compact />
          </div>
        )}

        <main className={styles.content} data-sticky-cta="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={finished ? 'result' : step.id}
              className={styles.stepWrap}
              initial={{ opacity: 0, y: direction * 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction * -12 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
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
  );
}
