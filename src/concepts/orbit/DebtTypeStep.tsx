import { LegalLinks } from '../../shell/Chrome';
import { useMediaQuery } from '../../engine/useMediaQuery';
import arrowLeft from './assets/arrow-left.svg';
import bbbRating from './assets/bbb-rating.png';
import checkIcon from './assets/check.svg';
import forbesAdvisorLogo from './assets/forbes-advisor.png';
import trustpilotMark from './assets/trustpilot.png';
import { DEBT_TYPE_OPTIONS, ORBIT_CONFIG } from './config';
import { StorySpotlight } from './StorySpotlight';
import styles from './orbit.module.css';
import './theme.css';

export interface DebtTypeStepProps {
  selectedType: string | null;
  progress: number;
  onSelect: (typeId: string) => void;
  onBack: () => void;
  className?: string;
}

/**
 * Orbit — Step 2.
 * Desktop: story-spotlight collage left, debt-type form right (Figma 159:11776).
 * Mobile: side-by-side spotlight above a sheeted single-column form (Figma 192:13349).
 */
export function DebtTypeStep({
  selectedType,
  progress,
  onSelect,
  onBack,
  className,
}: DebtTypeStepProps) {
  const { step2, copy } = ORBIT_CONFIG;
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const headingLabel = `${step2.headingBefore}${step2.headingAccent}${step2.headingAfter}`;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="orbit"
      data-step="debt-type"
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
          <StorySpotlight />
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
              {step2.headingBefore}
              <span className={styles.headingAccent}>{step2.headingAccent}</span>
              {step2.headingAfter}
            </h1>
            <p className={styles.subtext}>{step2.subtext}</p>
          </div>

          <div
            className={styles.typeChoices}
            role="radiogroup"
            aria-label={headingLabel}
          >
            {DEBT_TYPE_OPTIONS.map((option) => {
              const selected = selectedType === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-choice-id={option.id}
                  data-selected={selected}
                  className={styles.typeChoice}
                  onClick={() => onSelect(option.id)}
                >
                  <span className={styles.typeChoiceLabel}>{option.label}</span>
                  <span className={styles.typeChoiceIcon}>
                    <img
                      src={option.icon}
                      alt=""
                      width={48}
                      height={40}
                      draggable={false}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.trust}>
            {step2.trustItems.map((item) => (
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
                      {step2.ratingScore}
                    </span>
                    {step2.ratingLabel}
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
