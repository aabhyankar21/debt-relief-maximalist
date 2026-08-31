import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SIGNAL_CONFIG, type SnapshotEntry } from './config';
import styles from './snapshotStrip.module.css';

export interface SnapshotStripProps {
  entries: SnapshotEntry[];
  /** True briefly on step 9, just as the match lands. */
  highlightAll?: boolean;
}

export function SnapshotStrip({
  entries,
  highlightAll = false,
}: SnapshotStripProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { timing } = SIGNAL_CONFIG;
  const [pulseIndex, setPulseIndex] = useState(-1);

  useEffect(() => {
    if (!highlightAll || entries.length === 0) {
      setPulseIndex(-1);
      return;
    }

    const ms = reduceMotion
      ? timing.reducedS * 1000
      : timing.chipHighlightS * 1000;
    const timers = entries.map((_, index) =>
      window.setTimeout(() => setPulseIndex(index), index * ms),
    );
    const done = window.setTimeout(
      () => setPulseIndex(-1),
      entries.length * ms + ms,
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(done);
    };
  }, [highlightAll, entries.length, reduceMotion, timing]);

  if (entries.length === 0) return null;

  return (
    <ul className={styles.strip} aria-hidden="true">
      <AnimatePresence initial={false}>
        {entries.map((entry, index) => {
          const pulsing = pulseIndex === index;
          return (
            <motion.li
              key={entry.id}
              className={styles.chip}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.84 }
              }
              animate={{
                opacity: 1,
                scale: pulsing ? 1.08 : 1,
                filter: pulsing ? 'brightness(1.12)' : 'brightness(1)',
              }}
              transition={
                pulsing
                  ? { duration: reduceMotion ? timing.reducedS : timing.chipHighlightS }
                  : {
                      duration: reduceMotion ? timing.reducedS : timing.chipInS,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
            >
              {entry.label}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
