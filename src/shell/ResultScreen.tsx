import { motion } from 'motion/react';
import { resultScreen } from '../data/journey';
import { useJourney } from '../engine/journey';
import { CheckBullets } from '../ui/Notes';
import styles from './result.module.css';

export function ResultScreen() {
  const { restart } = useJourney();

  return (
    <motion.div
      className={styles.result}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className={styles.badge}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 14 }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <motion.path
            d="m4.8 12.6 4.6 4.6 9.8-10"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.28, duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
      </motion.span>

      <h1 className={styles.heading}>{resultScreen.heading}</h1>
      <CheckBullets items={resultScreen.bullets} />

      <button type="button" className={styles.restart} onClick={restart}>
        Start over
      </button>
    </motion.div>
  );
}
