import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PRESENCE_CONFIG } from './config';
import styles from './trustInsightLine.module.css';

export interface TrustInsightLineProps {
  text?: string;
  visible: boolean;
  className?: string;
}

/**
 * Caption-scale reassurance near the question. No icon, no badge —
 * plain text that answers "is my number normal?" after the question
 * has resolved. Parent owns when `visible` flips true.
 */
export function TrustInsightLine({
  text = PRESENCE_CONFIG.copy.trustInsight,
  visible,
  className,
}: TrustInsightLineProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const duration = reduceMotion
    ? PRESENCE_CONFIG.loadIn.reducedMs / 1000
    : PRESENCE_CONFIG.loadIn.insightDurMs / 1000;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.p
          key="trust-insight"
          className={`${styles.line}${className ? ` ${className}` : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
