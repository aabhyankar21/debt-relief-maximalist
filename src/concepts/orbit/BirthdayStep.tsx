import { useId } from 'react';
import { days, months, years } from '../../data/journey';
import type { DateValue } from '../../engine/journey';
import { LegalLinks } from '../../shell/Chrome';
import arrowLeft from './assets/arrow-left.svg';
import bbbRating from './assets/bbb-rating.png';
import checkIcon from './assets/check.svg';
import chevronDown from './assets/chevron-down.svg';
import forbesAdvisorLogo from './assets/forbes-advisor.png';
import iconLightbulb from './assets/icon-lightbulb.svg';
import trustpilotMark from './assets/trustpilot.png';
import { BirthdaySpotlight } from './BirthdaySpotlight';
import { StickyCtaDock } from './StickyCtaDock';
import { ORBIT_CONFIG } from './config';
import styles from './orbit.module.css';
import './theme.css';

export interface BirthdayStepProps {
  dob: DateValue;
  progress: number;
  canContinue: boolean;
  onChange: (part: keyof DateValue, value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  className?: string;
}

/**
 * Orbit — Step 4 (date of birth).
 * Desktop: birthday collage left, Month/Date/Year selects right (Figma 201:13851).
 * Mobile: collage above a sheeted form (Figma 197:13685).
 */
export function BirthdayStep({
  dob,
  progress,
  canContinue,
  onChange,
  onContinue,
  onBack,
  className,
}: BirthdayStepProps) {
  const { step4, copy } = ORBIT_CONFIG;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="orbit"
      data-step="date-of-birth"
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
          <BirthdaySpotlight />
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
              <span className={styles.headingDesktop}>
                {step4.headingBefore}
                <span className={styles.headingAccent}>
                  {step4.headingAccent}
                </span>
              </span>
              <span className={styles.headingMobile}>
                {step4.headingBefore}
                <span className={styles.headingAccent}>
                  {step4.mobileHeadingAccent}
                </span>
                {step4.mobileHeadingAfter}
              </span>
            </h1>
            <p className={styles.subtext}>{step4.subtext}</p>
          </div>

          <div className={styles.dobBlock}>
            <div className={styles.dobRow}>
              <OrbitSelect
                label="Month"
                placeholder={step4.monthPlaceholder}
                options={months}
                value={dob.month}
                onChange={(value) => onChange('month', value)}
              />
              <OrbitSelect
                label="Date"
                placeholder={step4.dayPlaceholder}
                options={days}
                value={dob.day}
                onChange={(value) => onChange('day', value)}
              />
              <OrbitSelect
                label="Year"
                placeholder={step4.yearPlaceholder}
                options={years}
                value={dob.year}
                onChange={(value) => onChange('year', value)}
              />
            </div>

            <p className={styles.tipNote}>
              <img
                className={styles.tipIcon}
                src={iconLightbulb}
                alt=""
                width={16}
                height={16}
              />
              <span>{step4.secureNote}</span>
            </p>
          </div>

          <StickyCtaDock>
            <button
              type="button"
              className={styles.cta}
              disabled={!canContinue}
              onClick={onContinue}
            >
              {step4.cta}
            </button>
          </StickyCtaDock>

          <div className={styles.trust}>
            {step4.trustItems.map((item) => (
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

function OrbitSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div className={styles.selectField}>
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <div className={styles.selectWrap}>
        <select
          id={id}
          className={styles.select}
          value={value}
          data-empty={value === ''}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <img
          className={styles.selectChevron}
          src={chevronDown}
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
