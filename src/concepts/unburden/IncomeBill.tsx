import dollarBill from './dollar-bill.png';
import styles from './incomeBill.module.css';

const preload = new Image();
preload.src = dollarBill;

export function IncomeBill({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <div className={styles.scene} data-reduced={reducedMotion || undefined}>
      <div className={styles.float}>
        <img
          className={styles.photo}
          src={dollarBill}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
