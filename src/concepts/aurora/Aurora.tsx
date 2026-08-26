import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
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
import { ReliefOrb } from './ReliefOrb';
import styles from './aurora.module.css';
import './theme.css';

function Backdrop({
  x,
  y,
}: {
  x: ReturnType<typeof useMotionValue<number>>;
  y: ReturnType<typeof useMotionValue<number>>;
}) {
  const ax = useTransform(x, (value) => value * 1.35);
  const ay = useTransform(y, (value) => value * 1.1);
  const bx = useTransform(x, (value) => value * -0.9);
  const by = useTransform(y, (value) => value * -0.7);
  const cx = useTransform(x, (value) => value * 0.55);
  const cy = useTransform(y, (value) => value * 0.8);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <motion.span className={styles.blobLayer} style={{ x: ax, y: ay }}>
        <span className={`${styles.blob} ${styles.blobA}`} />
      </motion.span>
      <motion.span className={styles.blobLayer} style={{ x: bx, y: by }}>
        <span className={`${styles.blob} ${styles.blobB}`} />
      </motion.span>
      <motion.span className={styles.blobLayer} style={{ x: cx, y: cy }}>
        <span className={`${styles.blob} ${styles.blobC}`} />
      </motion.span>
      <span className={styles.grid} />
      <span className={styles.vignette} />
    </div>
  );
}

export function Aurora() {
  const journey = useJourney();
  const { step, index, totalSteps, progress, direction, finished } = journey;
  const parallax = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!parallax) return;
    pointerX.set((event.clientX / window.innerWidth - 0.5) * 28);
    pointerY.set((event.clientY / window.innerHeight - 0.5) * 20);
  };

  return (
    <div
      className={styles.shell}
      data-concept="aurora"
      onPointerMove={onPointerMove}
    >
      <Backdrop x={pointerX} y={pointerY} />

      <aside className={styles.stage}>
        <div className={styles.stageTop}>
          <Brand />
          <StepDots total={totalSteps} index={finished ? totalSteps : index} />
        </div>
        <div className={styles.orbWrap}>
          <ReliefOrb progress={progress} />
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <BackButton onClick={journey.back} hidden={index === 0 && !finished} />
            <span className={styles.headerBrand}>
              <Brand />
            </span>
          </div>
          <div className={styles.headerMeta}>
            <TrustBadge />
            <ProgressRing value={progress} />
          </div>
        </header>

        <div className={styles.mobileOrb}>
          <ReliefOrb progress={progress} showValue={false} />
        </div>

        <main className={styles.content}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={finished ? 'result' : step.id}
              className={styles.card}
              initial={{ opacity: 0, y: direction * 22, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: direction * -16, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {finished ? <ResultScreen /> : <StepBody step={step} />}
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
