import phoneCard from './phone-card.png';
import styles from './phoneCard.module.css';

const preload = new Image();
preload.src = phoneCard;

export function PhoneCard({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  return (
    <div className={styles.scene} data-reduced={reducedMotion || undefined}>
      <div className={styles.float}>
        <img
          className={styles.photo}
          src={phoneCard}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
