import type { FieldDef } from '../data/journey';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function formatZip(value: string): string {
  return digitsOnly(value).slice(0, 5);
}

export function formatFieldValue(field: FieldDef, value: string): string {
  if (field.type === 'tel') return formatPhone(value);
  if (field.type === 'zip') return formatZip(value);
  return value;
}

/** Returns an error message, or null when the field is acceptable. */
export function validateField(field: FieldDef, raw: string): string | null {
  const value = raw.trim();

  if (!value) {
    return field.required ? `${field.label} is required` : null;
  }

  if (field.type === 'email' && !EMAIL_RE.test(value)) {
    return 'Enter a valid email address';
  }

  if (field.type === 'tel' && digitsOnly(value).length !== 10) {
    return 'Enter a valid 10-digit phone number';
  }

  if (field.type === 'zip' && digitsOnly(value).length !== 5) {
    return 'Enter a valid 5-digit ZIP code';
  }

  return null;
}

export function isFieldValid(field: FieldDef, raw: string): boolean {
  if (!field.required && !raw.trim()) return true;
  return validateField(field, raw) === null && Boolean(raw.trim());
}
