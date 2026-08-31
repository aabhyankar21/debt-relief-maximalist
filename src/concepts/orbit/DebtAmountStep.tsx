import { LegalLinks } from '../../shell/Chrome';
import { useMediaQuery } from '../../engine/useMediaQuery';
import bbbRating from './assets/bbb-rating.png';
import checkIcon from './assets/check.svg';
import forbesAdvisorLogo from './assets/forbes-advisor.png';
import trustpilotMark from './assets/trustpilot.png';
import { InsightDeck } from './InsightDeck';
import { DEBT_AMOUNT_OPTIONS, ORBIT_CONFIG } from './config';
import styles from './orbit.module.css';
import './theme.css';

export interface DebtAmountStepProps {
  selectedBand: string | null;
  onSelect: (band: string) => void;
  onContinue: () => void;
  className?: string;
}

/**
 * Orbit — Step 1.
 * Desktop: circular avatar orbit + cream stats card (Figma 159:11695).
 * Mobile: short avatar stage above sheeted form (Figma 192:13248).
 */
export function DebtAmountStep({
  selectedBand,
  onSelect,
  onContinue,
  className,
}: DebtAmountStepProps) {
  const { copy } = ORBIT_CONFIG;
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const canContinue = Boolean(selectedBand);

  const headingBefore = isDesktop
    ? copy.headingBefore
    : copy.mobileHeadingBefore;
  const headingAccent = isDesktop
    ? copy.headingAccent
    : copy.mobileHeadingAccent;
  const headingAfter = isDesktop
    ? copy.headingAfter
    : copy.mobileHeadingAfter;
  const headingLabel = `${headingBefore}${headingAccent}${headingAfter}`;

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="orbit"
      data-step="debt-amount"
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
        <aside className={styles.stage}>
          <InsightDeck />
        </aside>

        <main className={styles.form}>
          <div className={styles.copy}>
            <h1 className={styles.heading}>
              {headingBefore}
              <span className={styles.headingAccent}>{headingAccent}</span>
              {headingAfter}
            </h1>
            <p className={styles.subtext}>{copy.subtext}</p>
          </div>

          <div
            className={styles.choices}
            role="radiogroup"
            aria-label={headingLabel}
          >
            {DEBT_AMOUNT_OPTIONS.map((option) => {
              const selected = selectedBand === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-choice-id={option.id}
                  data-selected={selected}
                  className={styles.choice}
                  onClick={() => onSelect(option.id)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className={styles.ctaDock}>
            <button
              type="button"
              className={styles.cta}
              disabled={!canContinue}
              onClick={onContinue}
            >
              {copy.cta}
            </button>
          </div>

          <div className={styles.trust}>
            {copy.trustItems.map((item) => (
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
                {isDesktop ? (
                  <span className={styles.ratingPartners}>
                    {copy.ratingPartners}
                  </span>
                ) : (
                  <>
                    <span className={styles.ratingScore}>
                      {copy.ratingScore}
                    </span>
                    {copy.ratingLabel}
                  </>
                )}
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
