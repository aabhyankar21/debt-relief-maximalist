import contactCard from './contact-card.png';
import styles from './contactCard.module.css';

const preload = new Image();
preload.src = contactCard;

export function ContactCard({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  return (
    <div className={styles.scene} data-reduced={reducedMotion || undefined}>
      <div className={styles.float}>
        <img
          className={styles.photo}
          src={contactCard}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
