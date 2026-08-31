import ringsSrc from './assets/rings.png';
import { INSIGHT_CARDS } from './config';
import styles from './insightMarquee.module.css';

/**
 * Mobile top stage: orbital rings behind a seamless leftward loop of
 * upright insight cards (Figma node 192:13248).
 */
export function InsightMarquee({ className }: { className?: string }) {
  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <img className={styles.rings} src={ringsSrc} alt="" draggable={false} />

      <div className={styles.viewport}>
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <div key={copy} className={styles.group}>
              {INSIGHT_CARDS.map((card) => (
                <article
                  key={`${copy}-${card.id}`}
                  className={styles.card}
                  data-tone={card.tone}
                >
                  <div className={styles.cardPhoto}>
                    <img src={card.image} alt="" draggable={false} />
                  </div>
                  <p className={styles.cardText}>{card.text}</p>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
