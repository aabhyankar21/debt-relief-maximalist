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
import iconLightbulb from './assets/icon-lightbulb.svg';
import iconLock from './assets/icon-lock.svg';
import trustpilotMark from './assets/trustpilot.png';
import { ORBIT_CONFIG } from './config';
import { PartnerSpotlight } from './PartnerSpotlight';
import { StickyCtaDock } from './StickyCtaDock';
import styles from './orbit.module.css';
import './theme.css';

export interface ContactStepProps {
  fields: Record<string, string>;
  progress: number;
  canContinue: boolean;
  debtAmountLabel?: string | null;
  debtTypeLabel?: string | null;
  onChange: (fieldId: string, value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  className?: string;
}

/**
 * Orbit — Step 3 (contact).
 * Desktop: secure-recap phone collage left, name/email form right.
 * Mobile: inset device-screen banner above a sheeted form.
 */
export function ContactStep({
  fields,
  progress,
  canContinue,
  debtAmountLabel = null,
  debtTypeLabel = null,
  onChange,
  onContinue,
  onBack,
  className,
}: ContactStepProps) {
  const { step3, copy } = ORBIT_CONFIG;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const [firstName, lastName, email] = step3.fields;

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="orbit"
      data-step="contact"
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
          <PartnerSpotlight
            debtAmountLabel={debtAmountLabel}
            debtTypeLabel={debtTypeLabel}
          />
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
              {step3.headingBefore}
              <span className={styles.headingAccent}>{step3.headingAccent}</span>
              {step3.headingAfter}
            </h1>
            <p className={styles.subtext}>{step3.subtext}</p>
          </div>

          <div className={styles.fieldBlock}>
            <div className={styles.nameRow}>
              <OrbitField
                field={firstName}
                value={fields[firstName.id] ?? ''}
                onChange={(value) => onChange(firstName.id, value)}
              />
              <OrbitField
                field={lastName}
                value={fields[lastName.id] ?? ''}
                onChange={(value) => onChange(lastName.id, value)}
              />
            </div>

            <div className={styles.emailStack}>
              <OrbitField
                field={email}
                value={fields[email.id] ?? ''}
                onChange={(value) => onChange(email.id, value)}
              />
              <p className={styles.secureNote}>
                <img
                  className={styles.secureIcon}
                  src={iconLock}
                  alt=""
                  width={18}
                  height={19}
                />
                {step3.secureNote}
              </p>
            </div>
          </div>

          <p className={styles.tipNote}>
            <img
              className={styles.tipIcon}
              src={iconLightbulb}
              alt=""
              width={16}
              height={16}
            />
            <span>
              {step3.tipBefore}
              <strong>{step3.tipEmph1}</strong>
              {step3.tipMid}
              <strong>{step3.tipEmph2}</strong>
            </span>
          </p>

          <StickyCtaDock>
            <button
              type="button"
              className={styles.cta}
              disabled={!canContinue}
              onClick={onContinue}
            >
              {step3.cta}
            </button>
          </StickyCtaDock>

          <div className={styles.trust}>
            {step3.trustItems.map((item) => (
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
        type={field.type}
        inputMode={field.type === 'email' ? 'email' : 'text'}
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
