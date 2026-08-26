/**
 * Step-relevant public context for the Vault concept.
 * These figures sit beside the form as education — not journey copy.
 */

export type ChartKind =
  | 'rise'
  | 'mix'
  | 'stress'
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
    chart: 'rise',
  },
  'debt-type': {
    kicker: 'How household debt breaks down',
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
    kicker: 'A simple start',
    value: 0,
    label: 'commitment on this step',
    body: 'Just a name and email to keep the conversation going. You are exploring options — estimates follow when you are ready.',
    chart: 'secure',
  },
  'date-of-birth': {
    kicker: 'Why age is asked',
    value: 27,
    suffix: '%',
    label: 'of consumers have a collection on file',
    body: 'Eligibility windows vary by program and by age. Date of birth matches those windows — it is not a credit pull.',
    chart: 'share',
    notes: [{ value: '0', label: 'Hard inquiry on this check' }],
  },
  phone: {
    kicker: 'Identity, kept quiet',
    value: 1.1,
    suffix: 'M',
    decimals: 1,
    label: 'identity-theft reports filed last year',
    body: 'A one-time text confirms it is you. The number stays in the handoff — not a marketing list.',
    chart: 'secure',
    notes: [{ value: '1×', label: 'Text used to confirm it is you' }],
  },
  income: {
    kicker: 'Money and wellbeing',
    value: 66,
    suffix: '%',
    label: 'of adults name money as a significant stressor',
    body: 'Income sizes a payment against real life. Most people already feel this pressure — that is the point of a fit, not a judgment.',
    chart: 'stress',
    notes: [{ value: '11¢', label: 'of each disposable dollar goes to debt service' }],
  },
  address: {
    kicker: 'Relief is local',
    value: 50,
    label: 'states, 50 different rulebooks',
    body: 'Licensing and which companies may operate change by state. A ZIP keeps the match inside the rules that apply to you.',
    chart: 'states',
    notes: [{ value: 'ZIP', label: 'Routes you to in-state options' }],
  },
  result: {
    kicker: 'Before you choose',
    value: 3,
    label: 'estimates to sit with, side by side',
    body: 'Plans differ on fees, timeline, and monthly load. Looking at more than one offer is the calmest way to tell whether a fit is real.',
    chart: 'compare',
  },
};

export const mixSegments = [
  { id: 'mortgage', label: 'Mortgage', share: 70, color: '#00c896' },
  { id: 'auto', label: 'Auto', share: 9, color: '#3d8f78' },
  { id: 'student', label: 'Student', share: 9, color: '#c4a574' },
  { id: 'card', label: 'Cards', share: 7, color: '#e07a5f' },
  { id: 'other', label: 'Other', share: 5, color: 'rgb(255 255 255 / 22%)' },
];
