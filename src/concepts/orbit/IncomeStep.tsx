import { useState } from 'react';
import { LegalLinks } from '../../shell/Chrome';
import arrowLeft from './assets/arrow-left.svg';
import bbbRating from './assets/bbb-rating.png';
import checkIcon from './assets/check.svg';
import forbesAdvisorLogo from './assets/forbes-advisor.png';
import trustpilotMark from './assets/trustpilot.png';
import { INCOME_OPTIONS, ORBIT_CONFIG } from './config';
import { IncomeSpotlight } from './IncomeSpotlight';
import styles from './orbit.module.css';
import './theme.css';

export interface IncomeStepProps {
  selectedIncome: string | null;
  progress: number;
  onSelect: (incomeId: string) => void;
  onBack: () => void;
  className?: string;
}

/**
 * Orbit — Step 6 (estimated annual income).
 * Desktop: affordability dial left, income bands right.
 * Mobile: landscape dial card above a sheeted choice grid.
 * Selection auto-advances (same as debt type). Desktop hover
 * previews the dial so progress feedback is visible before advance.
 */
export function IncomeStep({
  selectedIncome,
  progress,
  onSelect,
  onBack,
  className,
}: IncomeStepProps) {
  const { step6, copy } = ORBIT_CONFIG;
  const headingLabel = `${step6.headingBefore}${step6.headingAccent}`;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const [previewIncome, setPreviewIncome] = useState<string | null>(null);
  const activeIncome = previewIncome ?? selectedIncome;

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="orbit"
      data-step="income"
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
        <aside className={styles.stage}>
          <IncomeSpotlight incomeId={activeIncome} />
        </aside>

        <main className={styles.form}>
          <div className={styles.copy}>
            <div className={styles.navRow}>
              <button
                type="button"
                className={styles.backCircle}
                onClick={onBack}
                aria-label="Go back"
              >
                <img
                  className={styles.backIcon}
                  src={arrowLeft}
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuenow={clampedProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Journey progress"
              >
                <div
                  className={styles.progressFill}
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>
            </div>

            <h1 className={styles.heading}>
              {step6.headingBefore}
              <span className={styles.headingAccent}>{step6.headingAccent}</span>
            </h1>
          </div>

          <div
            className={styles.choices}
            role="radiogroup"
            aria-label={headingLabel}
            onMouseLeave={() => setPreviewIncome(null)}
          >
            {INCOME_OPTIONS.map((option) => {
              const selected = selectedIncome === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-choice-id={option.id}
                  data-selected={selected}
                  className={styles.choice}
                  onMouseEnter={() => setPreviewIncome(option.id)}
                  onFocus={() => setPreviewIncome(option.id)}
                  onBlur={() => setPreviewIncome(null)}
                  onClick={() => onSelect(option.id)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className={styles.trust}>
            {step6.trustItems.map((item) => (
              <span key={item} className={styles.trustItem}>
                <img
                  className={styles.trustIcon}
                  src={checkIcon}
                  alt=""
                  width={16}
                  height={16}
                />
                {item}
              </span>
            ))}
          </div>

          <div className={`${styles.rating} ${styles.ratingInline}`}>
            <div className={styles.ratingBlock}>
              <p className={styles.ratingText}>
                <span className={styles.ratingPartners}>
                  {copy.ratingPartners}
                </span>
              </p>
              <img
                className={styles.trustpilot}
                src={trustpilotMark}
                alt="Trustpilot"
                width={156}
                height={18}
              />
            </div>
            <div className={styles.ratingDivider} aria-hidden="true" />
            <img
              className={styles.bbb}
              src={bbbRating}
              alt="BBB Accredited Business A+ Rating"
              width={68}
              height={38}
            />
          </div>

          <div className={styles.mobileLegal}>
            <LegalLinks />
          </div>
        </main>
      </div>
    </div>
  );
}
