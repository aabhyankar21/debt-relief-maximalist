import birthDateCard from './date-of-birth.png';
import styles from './birthDateCard.module.css';

const preload = new Image();
preload.src = birthDateCard;

export function BirthDateCard({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  return (
    <div className={styles.scene} data-reduced={reducedMotion || undefined}>
      <div className={styles.float}>
        <img
          className={styles.photo}
          src={birthDateCard}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
