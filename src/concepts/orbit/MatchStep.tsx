import { motion, useReducedMotion } from 'motion/react';
import { LegalLinks } from '../../shell/Chrome';
import forbesAdvisorLogo from './assets/forbes-advisor.png';
import iconCheckCircle from './assets/icon-check-circle.svg';
import iconPhoneCall from './assets/icon-phone-call.svg';
import iconPhoneStatus from './assets/icon-phone-status.svg';
import iconPickCheck from './assets/icon-pick-check.svg';
import iconPickCheckMark from './assets/icon-pick-check-mark.svg';
import logoNdr from './assets/logo-ndr-match.png';
import { ORBIT_CONFIG } from './config';
import styles from './matchStep.module.css';
import './theme.css';

export interface MatchStepProps {
  className?: string;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Orbit — Step 8 (match / results).
 * Centered partner card on a clean white field (Figma 220:15016, rings omitted).
 * Mobile adapts the same layout into a stacked sheet.
 */
export function MatchStep({ className }: MatchStepProps) {
  const { step8 } = ORBIT_CONFIG;
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="orbit"
      data-step="match"
    >
      <header className={styles.header}>
        <span className={styles.brand}>
          <img
            className={styles.brandLogo}
            src={forbesAdvisorLogo}
            alt="Forbes Advisor"
            width={135}
            height={17}
          />
        </span>
        <LegalLinks inHeader />
      </header>

      <div className={styles.body}>
        <motion.div
          className={styles.content}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{step8.eyebrow}</p>
            <h1 className={styles.heading}>{step8.heading}</h1>
          </div>

          <article className={styles.card}>
            <p className={styles.badge}>
              <span className={styles.badgeIcon} aria-hidden="true">
                <img
                  className={styles.badgeCheck}
                  src={iconPickCheck}
                  alt=""
                  width={18}
                  height={18}
                />
                <img
                  className={styles.badgeMark}
                  src={iconPickCheckMark}
                  alt=""
                  width={15}
                  height={10}
                />
              </span>
              {step8.badge}
            </p>

            <div className={styles.partner}>
              <p className={styles.partnerName}>{step8.partnerName}</p>
              <img
                className={styles.partnerLogo}
                src={logoNdr}
                alt=""
                width={186}
                height={48}
              />
            </div>

            <hr className={styles.rule} />

            <p className={styles.status}>
              <span className={styles.statusIcon} aria-hidden="true">
                <img
                  className={styles.statusPhone}
                  src={iconPhoneStatus}
                  alt=""
                  width={14}
                  height={14}
                />
              </span>
              {step8.status}
            </p>

            <ul className={styles.benefits}>
              {step8.bullets.map((item) => (
                <li key={item} className={styles.benefit}>
                  <img
                    className={styles.benefitIcon}
                    src={iconCheckCircle}
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button type="button" className={styles.cta}>
              {step8.cta}
              <img
                className={styles.ctaIcon}
                src={iconPhoneCall}
                alt=""
                width={24}
                height={24}
              />
            </button>
          </article>
        </motion.div>
      </div>

      <div className={styles.mobileLegal}>
        <LegalLinks />
      </div>
    </div>
  );
}
