import { motion, useReducedMotion } from 'motion/react';
import { LegalLinks } from '../../shell/Chrome';
import { useJourney } from '../../engine/journey';
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

const BURST_PIECES = [
  { x: -92, y: -54, s: 7, c: '#0033ff', r: 28, d: 0 },
  { x: 86, y: -62, s: 6, c: '#35416e', r: -18, d: 0.04 },
  { x: -38, y: -88, s: 5, c: '#ffc547', r: 12, d: 0.02 },
  { x: 48, y: -78, s: 8, c: '#f6ead6', r: -8, d: 0.06 },
  { x: -110, y: 8, s: 5, c: '#007ac8', r: 22, d: 0.08 },
  { x: 104, y: 16, s: 6, c: '#0033ff', r: -26, d: 0.05 },
  { x: -72, y: 64, s: 4, c: '#ffc547', r: 40, d: 0.1 },
  { x: 78, y: 58, s: 5, c: '#35416e', r: -32, d: 0.07 },
  { x: -18, y: 86, s: 6, c: '#f6ead6', r: 16, d: 0.12 },
  { x: 22, y: -96, s: 4, c: '#007ac8', r: 8, d: 0.03 },
  { x: -128, y: -28, s: 4, c: '#f6ead6', r: -14, d: 0.09 },
  { x: 118, y: -36, s: 5, c: '#ffc547', r: 24, d: 0.11 },
  { x: 56, y: 82, s: 4, c: '#0033ff', r: -20, d: 0.14 },
  { x: -54, y: 90, s: 3, c: '#007ac8', r: 36, d: 0.13 },
] as const;

function givenName(raw: string | undefined): string | null {
  const name = raw?.trim();
  return name ? name : null;
}

function CelebrationBurst() {
  return (
    <div className={styles.burst} aria-hidden="true">
      {BURST_PIECES.map((piece, index) => (
        <motion.span
          key={index}
          className={styles.burstPiece}
          style={{
            width: piece.s,
            height: piece.s,
            background: piece.c,
          }}
          initial={{ opacity: 0.95, x: 0, y: 0, scale: 0.35, rotate: 0 }}
          animate={{
            opacity: 0,
            x: piece.x,
            y: piece.y,
            scale: 1,
            rotate: piece.r,
          }}
          transition={{
            duration: 1.05,
            delay: 0.18 + piece.d,
            ease: EASE_OUT,
          }}
        />
      ))}
    </div>
  );
}

function MatchSeal({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className={styles.seal}
      initial={reduceMotion ? false : { scale: 0.46, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 460, damping: 20, delay: 0.04 }
      }
      aria-hidden="true"
    >
      <span className={styles.sealOrbit} />
      <span className={styles.sealPing} />
      <svg className={styles.sealSvg} viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="26" fill="#0033ff" />
        <motion.path
          d="M17.5 29.2 L24.4 36.1 L39.2 20.4"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.42, delay: 0.26, ease: EASE_OUT }}
        />
      </svg>
    </motion.div>
  );
}

/**
 * Orbit — Step 8 (match / results).
 * Centered partner card on a clean white field (Figma 220:15016, rings omitted).
 * Mobile adapts the same layout into a stacked sheet.
 */
export function MatchStep({ className }: MatchStepProps) {
  const { step8 } = ORBIT_CONFIG;
  const journey = useJourney();
  const reduceMotion = useReducedMotion() ?? false;
  const name = givenName(journey.fields.firstName);
  const eyebrow = name
    ? step8.eyebrowNamed.replace('{name}', name)
    : step8.eyebrow;

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
            width={405}
            height={51}
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
          <div className={styles.hero}>
            <div className={styles.heroCrown}>
              <div className={styles.sealWrap}>
                {reduceMotion ? null : <CelebrationBurst />}
                <MatchSeal reduceMotion={reduceMotion} />
              </div>
              <p className={styles.eyebrow}>{eyebrow}</p>
            </div>

            <div className={styles.copy}>
              <h1 className={styles.heading}>{step8.heading}</h1>
              <p className={styles.kicker}>{step8.kicker}</p>
            </div>
          </div>

          <motion.article
            className={styles.card}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
          >
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
              {step8.bullets.map((item, index) => (
                <motion.li
                  key={item}
                  className={styles.benefit}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.38 + index * 0.07,
                    ease: EASE_OUT,
                  }}
                >
                  <img
                    className={styles.benefitIcon}
                    src={iconCheckCircle}
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>

            <p className={styles.note}>{step8.note}</p>

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
          </motion.article>
        </motion.div>
      </div>

      <div className={styles.mobileLegal}>
        <LegalLinks />
      </div>
    </div>
  );
}
