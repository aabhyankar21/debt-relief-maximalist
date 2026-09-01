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
import { PhoneSpotlight } from './PhoneSpotlight';
import { StickyCtaDock } from './StickyCtaDock';
import styles from './orbit.module.css';
import './theme.css';

export interface PhoneStepProps {
  phone: string;
  progress: number;
  canContinue: boolean;
  onChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  className?: string;
}

/**
 * Orbit — Step 5 (phone number).
 * Desktop: number vault left, phone form right (Figma 201:14012).
 * Mobile: vault strip above a sheeted form (Figma 201:14093).
 */
export function PhoneStep({
  phone,
  progress,
  canContinue,
  onChange,
  onContinue,
  onBack,
  className,
}: PhoneStepProps) {
  const { step5, copy } = ORBIT_CONFIG;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const { consent } = step5;

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="orbit"
      data-step="phone"
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
          <PhoneSpotlight phone={phone} />
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
              {step5.headingBefore}
              <span className={styles.headingAccent}>{step5.headingAccent}</span>
              {step5.headingAfter}
            </h1>
            <p className={`${styles.subtext} ${styles.subtextDesktop}`}>
              {step5.subtext}
            </p>
            <p className={`${styles.subtext} ${styles.subtextMobile}`}>
              {step5.mobileSubtext}
            </p>
          </div>

          <div className={styles.phoneBlock}>
            <PhoneField
              field={step5.field}
              value={phone}
              onChange={onChange}
            />

            <p className={styles.secureNote}>
              <img
                className={styles.secureIcon}
                src={iconLock}
                alt=""
                width={18}
                height={19}
              />
              {step5.secureNote}
            </p>

            <p className={styles.tipNote}>
              <img
                className={styles.tipIcon}
                src={iconLightbulb}
                alt=""
                width={16}
                height={16}
              />
              <span>{step5.tip}</span>
            </p>
          </div>

          <div className={styles.ctaStack}>
            <StickyCtaDock>
              <button
                type="button"
                className={styles.cta}
                disabled={!canContinue}
                onClick={onContinue}
              >
                {step5.cta}
              </button>
            </StickyCtaDock>

            <p className={styles.consent}>
              {consent.before}
              <a className={styles.consentLink} href="#">
                {consent.spinwheel}
              </a>
              {consent.mid}
              <a className={styles.consentLink} href="#">
                {consent.privacy}
              </a>
              {consent.and}
              <a className={styles.consentLink} href="#">
                {consent.terms}
              </a>
            </p>

            <div className={styles.trust}>
              {step5.trustItems.map((item) => (
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

function PhoneField({
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
        type="tel"
        inputMode="tel"
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
