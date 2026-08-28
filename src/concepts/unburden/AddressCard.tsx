import addressCard from './address-card.png';
import styles from './addressCard.module.css';

const preload = new Image();
preload.src = addressCard;

export function AddressCard({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  return (
    <div className={styles.scene} data-reduced={reducedMotion || undefined}>
      <div className={styles.float}>
        <img
          className={styles.photo}
          src={addressCard}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
