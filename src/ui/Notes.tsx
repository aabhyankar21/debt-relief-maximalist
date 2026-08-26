import { CheckIcon, LockIcon, ShieldIcon } from './icons';
import styles from './ui.module.css';

export function CheckBullets({ items }: { items: string[] }) {
  return (
    <ul className={styles.bulletList}>
      {items.map((item) => (
        <li className={styles.bullet} key={item}>
          <span className={styles.bulletMark} aria-hidden="true">
            <CheckIcon />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DotBullets({ items }: { items: string[] }) {
  return (
    <ul className={styles.bulletList}>
      {items.map((item) => (
        <li className={styles.dotBullet} key={item}>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function SecureNote({ text }: { text: string }) {
  return (
    <p className={styles.secureNote}>
      <LockIcon />
      <span>{text}</span>
    </p>
  );
}

export function Disclaimer({ text }: { text: string }) {
  return (
    <p className={styles.disclaimer}>
      <ShieldIcon />
      <span>{text}</span>
    </p>
  );
}
