import { motion } from 'motion/react';
import { resultScreen } from '../data/journey';
import { CheckBullets } from '../ui/Notes';
import { CheckIcon, PhoneIcon } from '../ui/icons';
import ndrLogo from '../assets/national-debt-relief.png';
import ui from '../ui/ui.module.css';
import step from '../steps/stepBody.module.css';
import styles from './result.module.css';

export function ResultScreen({
  centered = false,
}: {
  centered?: boolean;
}) {
  return (
    <motion.div
      className={`${step.body}${centered ? ` ${styles.centered}` : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className={step.head}>
        <motion.p
          className={styles.kicker}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {resultScreen.eyebrow}
        </motion.p>
        <motion.h1
          className={step.heading}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {resultScreen.heading}
        </motion.h1>
      </header>

      <p className={styles.badge}>
        <span className={ui.bulletMark} aria-hidden="true">
          <CheckIcon />
        </span>
        {resultScreen.badge}
      </p>

      <div className={styles.partner}>
        <img
          className={styles.logo}
          src={ndrLogo}
          alt=""
        />
        <p className={styles.partnerName}>{resultScreen.partnerName}</p>
      </div>

      <p className={styles.status}>
        <span className={styles.statusIcon} aria-hidden="true">
          <PhoneIcon />
        </span>
        {resultScreen.status}
      </p>

      <CheckBullets items={resultScreen.bullets} />

      <a className={ui.button} href={resultScreen.phoneHref}>
        <span className={ui.buttonLabel}>{resultScreen.buttonLabel}</span>
        <PhoneIcon />
      </a>
    </motion.div>
  );
}
