import { useId } from 'react';
import type { FieldDef } from '../../data/journey';
import {
  formatFieldValue,
  isFieldValid,
  validateField,
} from '../../engine/validation';
import { LegalLinks } from '../../shell/Chrome';
import arrowLeft from './assets/arrow-left.svg';
import bbbRating from './assets/bbb-rating.png';
import checkIcon from './assets/check.svg';
import forbesAdvisorLogo from './assets/forbes-advisor.png';
import iconLock from './assets/icon-lock.svg';
import trustpilotMark from './assets/trustpilot.png';
import { ORBIT_CONFIG } from './config';
import { ResultsSpotlight } from './ResultsSpotlight';
import styles from './orbit.module.css';
import './theme.css';

export interface AddressStepProps {
  fields: Record<string, string>;
  progress: number;
  canContinue: boolean;
  onChange: (fieldId: string, value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  className?: string;
}

/**
 * Orbit — Step 7 (address).
 * Desktop: results-ready card orbit left, address form right (Figma 220:14833).
 * Mobile: results card above a sheeted form (same short-stage pattern).
 */
export function AddressStep({
  fields,
  progress,
  canContinue,
  onChange,
  onContinue,
  onBack,
  className,
}: AddressStepProps) {
  const { step7, copy } = ORBIT_CONFIG;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const [address1, address2, zip] = step7.fields;

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="orbit"
      data-step="address"
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
          <ResultsSpotlight />
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
              {step7.headingBefore}
              <span className={styles.headingAccent}>{step7.headingAccent}</span>
              {step7.headingAfter}
            </h1>
            <p className={styles.subtext}>{step7.subtext}</p>
          </div>

          <div className={styles.fieldBlock}>
            <div className={styles.addressStack}>
              <OrbitField
                field={address1}
                value={fields[address1.id] ?? ''}
                onChange={(value) => onChange(address1.id, value)}
              />
              <OrbitField
                field={address2}
                value={fields[address2.id] ?? ''}
                onChange={(value) => onChange(address2.id, value)}
              />
            </div>

            <div className={styles.emailStack}>
              <OrbitField
                field={zip}
                value={fields[zip.id] ?? ''}
                onChange={(value) => onChange(zip.id, value)}
              />
              <p className={styles.secureNote}>
                <img
                  className={styles.secureIcon}
                  src={iconLock}
                  alt=""
                  width={18}
                  height={19}
                />
                {step7.secureNote}
              </p>
            </div>
          </div>

          <div className={styles.ctaDock}>
            <button
              type="button"
              className={styles.cta}
              disabled={!canContinue}
              onClick={onContinue}
            >
              {step7.cta}
            </button>
          </div>

          <div className={styles.trust}>
            {step7.trustItems.map((item) => (
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

function OrbitField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const error = value.trim() ? validateField(field, value) : null;
  const valid = isFieldValid(field, value);

  return (
    <div className={styles.field}>
      <label className="visually-hidden" htmlFor={id}>
        {field.label}
      </label>
      <input
        id={id}
        className={styles.fieldInput}
        type={field.type === 'zip' ? 'text' : field.type}
        inputMode={field.type === 'zip' ? 'numeric' : 'text'}
        autoComplete={field.autoComplete}
        placeholder={field.placeholder}
        value={value}
        data-valid={valid}
        data-invalid={Boolean(error)}
        aria-invalid={Boolean(error)}
        onChange={(event) =>
          onChange(formatFieldValue(field, event.target.value))
        }
      />
    </div>
  );
}
