import { motion } from 'motion/react';
import forbesAdvisorLogo from '../assets/forbes-advisor-logo.png';
import { chrome } from '../data/journey';
import { useAnimatedNumber } from '../engine/useAnimatedNumber';
import { ChevronLeftIcon, ShieldIcon } from '../ui/icons';
import styles from './chrome.module.css';

export function Brand({
  label = chrome.brand,
  logo,
}: {
  label?: string;
  logo?: boolean;
}) {
  if (logo) {
    return (
      <span className={styles.brand}>
        <img
          className={styles.brandLogo}
          src={forbesAdvisorLogo}
          alt="Forbes Advisor"
        />
      </span>
    );
  }

  return (
    <span className={styles.brand}>
      <span className={styles.brandDot} aria-hidden="true" />
      {label}
    </span>
  );
}

export function BackButton({
  onClick,
  hidden,
}: {
  onClick: () => void;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <button type="button" className={styles.backButton} onClick={onClick}>
      <ChevronLeftIcon />
      {chrome.backLabel}
    </button>
  );
}

export function TrustBadge() {
  return (
    <span className={styles.trustCluster}>
      <LegalLinks inHeader />
      <span className={styles.trustBadge}>
        <ShieldIcon />
        {chrome.trustBadge}
      </span>
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const label = useAnimatedNumber(value, '%');

  return (
    <div
      className={styles.progressWrap}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Journey progress"
    >
      <div className={styles.progressTrack}>
        <motion.div
          className={styles.progressFill}
          initial={false}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 140, damping: 22, mass: 0.7 }}
        />
      </div>
      <motion.span className={styles.progressValue}>{label}</motion.span>
    </div>
  );
}

export function ProgressRing({ value }: { value: number }) {
  const label = useAnimatedNumber(value, '%');
  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={styles.ring}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Journey progress"
    >
      <svg viewBox="0 0 46 46" aria-hidden="true">
        <circle
          cx="23"
          cy="23"
          r={radius}
          fill="none"
          stroke="var(--track-bg, rgb(255 255 255 / 18%))"
          strokeWidth="3"
        />
        <motion.circle
          cx="23"
          cy="23"
          r={radius}
          fill="none"
          stroke="var(--c-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
          transition={{ type: 'spring', stiffness: 130, damping: 24 }}
        />
      </svg>
      <motion.span className={styles.ringValue}>{label}</motion.span>
    </div>
  );
}

export function StepDots({ total, index }: { total: number; index: number }) {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={styles.dot}
          data-state={i < index ? 'done' : i === index ? 'active' : 'todo'}
        />
      ))}
    </div>
  );
}

export function LegalLinks({ inHeader = false }: { inHeader?: boolean }) {
  return (
    <nav
      className={`${styles.legalLinks} ${inHeader ? styles.headerLegal : ''}`}
      aria-label="Legal"
    >
      {chrome.legalLinks.map((link) => (
        <a className={styles.legalLink} href="#" key={link}>
          {link}
        </a>
      ))}
    </nav>
  );
}

export function LegalFooter() {
  return (
    <footer className={styles.legal}>
      <LegalLinks />
    </footer>
  );
}
