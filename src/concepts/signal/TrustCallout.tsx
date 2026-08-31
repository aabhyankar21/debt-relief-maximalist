import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SIGNAL_CONFIG } from './config';
import styles from './trustCallout.module.css';

export interface TrustCalloutProps {
  text: string;
  visible: boolean;
}

export function TrustCallout({ text, visible }: TrustCalloutProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { timing } = SIGNAL_CONFIG;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={styles.callout}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: reduceMotion ? timing.reducedS : timing.calloutInS,
              ease: 'easeOut',
            },
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: reduceMotion ? timing.reducedS : timing.calloutOutS,
              ease: 'easeOut',
            },
          }}
        >
          <span className={styles.mark}>
            <span className={styles.dot} />
            <span className={styles.stem} />
          </span>
          <p className={styles.text}>{text}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
