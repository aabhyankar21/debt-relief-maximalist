/**
 * Step-relevant public context for the Haven concept.
 * These figures are not journey copy — they sit beside the form as education.
 */

export type ChartKind =
  | 'rise'
  | 'mix'
  | 'stress'
  | 'paper'
  | 'share'
  | 'secure'
  | 'dti'
  | 'states'
  | 'compare';

export interface InsightDef {
  kicker: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  body?: string;
  source?: string;
  chart: ChartKind;
  notes?: { value: string; label: string }[];
}

export const insights: Record<string, InsightDef> = {
  'debt-amount': {
    kicker: 'National snapshot',
    value: 1.26,
    prefix: '$',
    suffix: 'T',
    decimals: 2,
    label: 'U.S. credit card balances',
    body: 'Households collectively carry $1.26 trillion in card balances — up $21 billion in a single quarter. An estimate of your own total is enough to place you in that picture.',
    chart: 'rise',
  },
  'debt-type': {
    kicker: 'How U.S. household debt breaks down',
    value: 70,
    suffix: '%',
    label: 'of household debt is mortgages',
    chart: 'mix',
    notes: [
      { value: '$1.26T', label: 'Credit cards' },
      { value: '$1.65T', label: 'Student loans' },
      { value: '$1.71T', label: 'Auto loans' },
    ],
  },
  contact: {
    kicker: 'Money and wellbeing',
    value: 66,
    suffix: '%',
    label: 'of adults name money as a significant stressor',
    chart: 'paper',
  },
  'date-of-birth': {
    kicker: 'Why age is asked',
    value: 27,
    suffix: '%',
    label: 'of consumers have a collection on file',
    body: 'Eligibility windows vary by program and by age. Date of birth helps match those windows. It is not used to pull a hard credit score in this step.',
    chart: 'share',
  },
  phone: {
    kicker: 'Identity, kept quiet',
    value: 1.1,
    suffix: 'M',
    decimals: 1,
    label: 'identity-theft reports filed with the FTC last year',
    chart: 'secure',
  },
  income: {
    kicker: 'What households already pay',
    value: 11,
    suffix: '¢',
    label: 'of every disposable dollar goes to debt service',
    source: 'Federal Reserve Household Debt Service Ratio, Q1 2026',
    chart: 'dti',
    notes: [
      { value: '11.2%', label: 'Household debt-service ratio' },
    ],
  },
  address: {
    kicker: 'Relief is local',
    value: 50,
    label: 'states, 50 different rulebooks',
    body: 'Licensing, disclosures, and which companies may operate all change by state. A ZIP code is how the match stays inside the rules that apply to you.',
    chart: 'states',
  },
  result: {
    kicker: 'Before you choose',
    value: 3,
    label: 'estimates to sit with, side by side',
    body: 'Plans differ on fees, timeline, and monthly load. Looking at more than one offer is the calmest way to tell whether a fit is real.',
    source: 'CFPB · shopping for debt relief',
    chart: 'compare',
    notes: [
      { value: '0', label: 'Score impact to check options' },
    ],
  },
};

export const mixSegments = [
  { id: 'mortgage', label: 'Mortgage', share: 70, color: '#4A7C59' },
  { id: 'auto', label: 'Auto', share: 9, color: '#8FAE96' },
  { id: 'student', label: 'Student', share: 9, color: '#C4A574' },
  { id: 'card', label: 'Cards', share: 7, color: '#D4785A' },
  { id: 'other', label: 'Other', share: 5, color: '#D7E0D4' },
];
