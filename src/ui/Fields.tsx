import { useId, useState } from 'react';
import type { FieldDef } from '../data/journey';
import { formatFieldValue, isFieldValid, validateField } from '../engine/validation';
import { CheckIcon } from './icons';
import styles from './ui.module.css';

interface TextFieldProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}

const inputModes: Record<FieldDef['type'], 'text' | 'email' | 'tel' | 'numeric'> = {
  text: 'text',
  email: 'email',
  tel: 'tel',
  zip: 'numeric',
};

export function TextField({ field, value, onChange }: TextFieldProps) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const error = touched ? validateField(field, value) : null;
  const valid = isFieldValid(field, value) && Boolean(value.trim());

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {field.label}
        {!field.required ? (
          <span className={styles.optionalTag}> (optional)</span>
        ) : null}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          className={styles.input}
          type={field.type === 'zip' ? 'text' : field.type}
          inputMode={inputModes[field.type]}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          value={value}
          data-valid={valid}
          data-invalid={Boolean(error)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(formatFieldValue(field, event.target.value))}
          onBlur={() => setTouched(true)}
        />
        {valid ? (
          <span className={styles.validMark} aria-hidden="true">
            <CheckIcon />
          </span>
        ) : null}
      </div>
      {error ? (
        <p className={styles.errorText} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  hideLabel?: boolean;
}

export function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  hideLabel,
}: SelectFieldProps) {
  const id = useId();

  return (
    <div className={styles.field}>
      <label
        className={hideLabel ? 'visually-hidden' : styles.fieldLabel}
        htmlFor={id}
      >
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
        <span className={styles.selectArrow} aria-hidden="true" />
      </div>
    </div>
  );
}
