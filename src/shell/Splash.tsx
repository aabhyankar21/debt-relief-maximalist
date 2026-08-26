import { useConcept } from '../engine/concept';
import styles from './splash.module.css';

export function Splash() {
  const concept = useConcept();

  return (
    <div className={styles.splash} data-concept={concept} role="status" aria-live="polite">
      <span className={styles.mark} />
      Loading journey
    </div>
  );
}
