import { motion } from 'motion/react';
import ndrLogo from './national-debt-relief.png';
import styles from './vault.module.css';

const BENEFITS = [
  'A+ BBB rating and AFCC accredited',
  'Free consultation and personalized savings estimate',
  'Combine high-interest debts into one low monthly payment',
];

function BadgeCheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path
        d="m6.2 10.2 2.4 2.4 5.2-5.4"
        fill="none"
        stroke="#061410"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusPhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.726 3.095A1.5 1.5 0 0 1 6.135 7.9l-1.002.89a6.024 6.024 0 0 0 6.08 6.08l.89-1.002a1.5 1.5 0 0 1 1.63-.704l3.095.726A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-6.627 0-12-5.373-12-12V3.5Z"
      />
    </svg>
  );
}

function BenefitCheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path
        d="m6.2 10.2 2.4 2.4 5.2-5.4"
        fill="none"
        stroke="#061410"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CallPhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.726 3.095A1.5 1.5 0 0 1 6.135 7.9l-1.002.89a6.024 6.024 0 0 0 6.08 6.08l.89-1.002a1.5 1.5 0 0 1 1.63-.704l3.095.726A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-6.627 0-12-5.373-12-12V3.5Z"
      />
    </svg>
  );
}

export function VaultResult() {
  return (
    <motion.div
      className={styles.result}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className={styles.resultEyebrow}>Congratulations!</p>
      <h1 className={styles.resultHeading}>
        We have matched you with your personalized Debt Relief provider
      </h1>

      <article className={styles.pickCard}>
        <p className={styles.pickBadge}>
          <BadgeCheckIcon />
          Our pick for you
        </p>

        <div className={styles.pickBrand}>
          <p className={styles.pickName}>National Debt Relief</p>
          <img
            className={styles.pickLogo}
            src={ndrLogo}
            alt="National Debt Relief"
          />
        </div>

        <hr className={styles.pickRule} />

        <p className={styles.pickStatus}>
          <span className={styles.pickPhoneIcon}>
            <StatusPhoneIcon />
          </span>
          You’re almost done! A representative will call shortly to help finish
          the process.
        </p>

        <ul className={styles.pickBenefits}>
          {BENEFITS.map((item) => (
            <li key={item}>
              <BenefitCheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <a className={styles.callNow} href="tel:#">
          Call Now
          <CallPhoneIcon />
        </a>
      </article>
    </motion.div>
  );
}
