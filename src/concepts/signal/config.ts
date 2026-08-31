/**
 * Size, warmth, and timing for the trust beacon. Animation code reads
 * from here — tune the choreography without touching springs or layout.
 */

export type OtpStatus = 'idle' | 'pending' | 'verified';
export type SignalBehavior = 'idle' | 'otp-verify';

export interface SignalStepConfig {
  /** Multiplier on the band-derived base size. 1 holds the step-1 settle. */
  sizeMultiplier: number;
  /** 0 = cool slate, 1 = warm gold. Continuous ramp across the flow. */
  warmthLevel: number;
  behavior: SignalBehavior;
}

export interface SnapshotEntry {
  id: string;
  label: string;
}

export const SIGNAL_CONFIG = {
  particles: 12,

  colors: {
    cool: '#7d8ba0',
    warm: '#d9a441',
    otpScan: '#3f9aa8',
    matchedTint: '#c9a06a',
    unmatchedTint: '#6f8aa8',
  },

  scale: {
    /** Idle size before a band is chosen. */
    rest: 0.82,
    min: 0.72,
    max: 1.22,
  },

  timing: {
    breathS: 4.2,
    attentiveS: 1.55,
    otpScanS: 1.25,
    otpSettleS: 0.4,
    swarmS: 28,
    chipInS: 0.35,
    chipHighlightS: 0.1,
    calloutInS: 0.25,
    calloutOutS: 0.2,
    reducedS: 0.2,
    /** Parent-simulated code check. TrustSignal itself never times this. */
    otpPendingMs: 1400,
    /** Hold on step 1 so the band scale and first chip can land. */
    settleMs: 720,
  },

  steps: {
    1: { sizeMultiplier: 1, warmthLevel: 0.08, behavior: 'idle' },
    2: { sizeMultiplier: 1, warmthLevel: 0.16, behavior: 'idle' },
    3: { sizeMultiplier: 1, warmthLevel: 0.22, behavior: 'idle' },
    4: { sizeMultiplier: 1, warmthLevel: 0.28, behavior: 'idle' },
    5: { sizeMultiplier: 1, warmthLevel: 0.36, behavior: 'idle' },
    6: { sizeMultiplier: 1, warmthLevel: 0.42, behavior: 'otp-verify' },
    7: { sizeMultiplier: 1.06, warmthLevel: 0.62, behavior: 'idle' },
    8: { sizeMultiplier: 1.06, warmthLevel: 0.78, behavior: 'idle' },
    9: { sizeMultiplier: 1.14, warmthLevel: 1, behavior: 'idle' },
  } as Record<number, SignalStepConfig>,
} as const;

export const DEBT_BAND_WEIGHT: Record<string, number> = {
  '16-20': 0,
  '21-25': 0.25,
  '26-30': 0.5,
  '31-35': 0.75,
  '35-plus': 1,
};

export const DEBT_AMOUNT_OPTIONS = Object.keys(DEBT_BAND_WEIGHT);

export const DEBT_BAND_LABEL: Record<string, string> = {
  '16-20': '$16K – $20K',
  '21-25': '$21K – $25K',
  '26-30': '$26K – $30K',
  '31-35': '$31K – $35K',
  '35-plus': '$35K+',
};

/** Credit cards and personal loans are the matched types. */
export const DEBT_TYPE_MATCH_INDEX: Record<string, number> = {
  'personal-loans': 0,
  'credit-card': 1,
  medical: 2,
  student: 3,
};

export const DEBT_TYPE_OPTIONS = Object.keys(DEBT_TYPE_MATCH_INDEX);

export const DEBT_TYPE_LABEL: Record<string, string> = {
  'personal-loans': 'Personal Loans',
  'credit-card': 'Credit Card',
  medical: 'Medical',
  student: 'Student',
};

export const INCOME_LABEL: Record<string, string> = {
  'lt-10k': 'Under $10K',
  '10-50k': '$10K – $50K',
  '50-100k': '$50K – $100K',
  '100k-plus': '$100K+',
  unsure: 'Income unsure',
};

export const TITLE_TREATMENT: Record<
  number,
  {
    animateWeight: boolean;
    tick: boolean;
    highlight?: string[];
  }
> = {
  1: { animateWeight: true, tick: true },
  2: {
    animateWeight: true,
    tick: true,
    highlight: ['Credit cards', 'personal loans'],
  },
  3: { animateWeight: false, tick: false },
  4: {
    animateWeight: true,
    tick: true,
    highlight: ['no impact on your credit score.'],
  },
  5: { animateWeight: false, tick: false },
  6: {
    animateWeight: true,
    tick: true,
    highlight: ['Your privacy is always protected.'],
  },
  7: { animateWeight: true, tick: true },
  8: { animateWeight: false, tick: false },
  9: { animateWeight: true, tick: true },
};

export const SCENE_NOTES: Record<number, string> = {
  1: 'Size and density follow the selected debt band, then settle. First snapshot chip appears. No callout.',
  2: 'Tint shifts toward the matched type. Second chip (debt type) is added.',
  3: 'Attentive pulse on field focus; otherwise a steady breath. Snapshot unchanged.',
  4: 'Same attentive pulse. No callout, no new chip.',
  5: 'Callout on field focus: existing privacy language, sourced from the signal.',
  6: 'OTP scan while pending, lock the instant otpStatus is verified. Callout on enter.',
  7: 'Warms and brightens. Third chip (income tier) is added.',
  8: 'Callout on address focus. Fourth chip (locality) is added.',
  9: 'Warmest state. Full strip pulses once, then the sourced match cue.',
};

/** Journey index for each visual scene. 6 is the OTP beat on the phone step. */
export const SCENE_STEP_BY_INDEX = [1, 2, 3, 4, 5, 7, 8];

export const JOURNEY_INDEX_BY_SCENE: Record<number, number | null> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 4,
  7: 5,
  8: 6,
  9: null,
};

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function mixHex(from: string, to: string, t: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const mixed = a.map((channel, i) =>
    Math.round(lerp(channel, b[i], clamp01(t))),
  );
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Step 1 derives size from the debt band. `null` is the idle rest size
 * before a band is chosen. Later steps hold that settle unless the step
 * config's sizeMultiplier lifts it.
 */
export function resolveSignalScale(
  step: number,
  debtAmountBand: number | null,
) {
  const config = SIGNAL_CONFIG.steps[step] ?? SIGNAL_CONFIG.steps[1];
  const { rest, min, max } = SIGNAL_CONFIG.scale;
  const base =
    debtAmountBand == null ? rest : lerp(min, max, clamp01(debtAmountBand));
  return base * config.sizeMultiplier;
}

export function resolveSignalColor(
  step: number,
  warmthLevel: number,
  matchedDebtTypeIndex?: number,
  otpStatus: OtpStatus = 'idle',
) {
  const config = SIGNAL_CONFIG.steps[step] ?? SIGNAL_CONFIG.steps[1];
  if (config.behavior === 'otp-verify' && otpStatus === 'pending') {
    return SIGNAL_CONFIG.colors.otpScan;
  }

  let color = mixHex(
    SIGNAL_CONFIG.colors.cool,
    SIGNAL_CONFIG.colors.warm,
    warmthLevel,
  );

  if (step === 2 && matchedDebtTypeIndex != null) {
    const matched = matchedDebtTypeIndex <= 1;
    color = mixHex(
      color,
      matched
        ? SIGNAL_CONFIG.colors.matchedTint
        : SIGNAL_CONFIG.colors.unmatchedTint,
      0.42,
    );
  }

  if (config.behavior === 'otp-verify' && otpStatus === 'verified') {
    color = mixHex(color, SIGNAL_CONFIG.colors.warm, 0.35);
  }

  return color;
}

/**
 * Snapshot chips only grow. Debt range at 1, type at 2, income at 7,
 * locality at 8. Step 9 shows the complete strip.
 */
export function snapshotEntries(
  step: number,
  choices: Record<string, string>,
  zip?: string,
): SnapshotEntry[] {
  const entries: SnapshotEntry[] = [];

  if (step >= 1 && choices['debt-amount']) {
    entries.push({
      id: 'debt-amount',
      label: DEBT_BAND_LABEL[choices['debt-amount']] ?? choices['debt-amount'],
    });
  }

  if (step >= 2 && choices['debt-type']) {
    entries.push({
      id: 'debt-type',
      label: DEBT_TYPE_LABEL[choices['debt-type']] ?? choices['debt-type'],
    });
  }

  if (step >= 7 && choices.income) {
    entries.push({
      id: 'income',
      label: INCOME_LABEL[choices.income] ?? choices.income,
    });
  }

  if (step >= 8) {
    entries.push({
      id: 'locality',
      label: zip ? `ZIP ${zip}` : 'Local match',
    });
  }

  return entries;
}

/**
 * Callouts only on 5 (focus), 6 (enter), 8 (focus), 9 (enter).
 * Copy is existing journey language, presented by the signal.
 */
export function calloutText(step: number, fieldFocused: boolean): string | null {
  if (step === 5 && fieldFocused) {
    return 'Your information is secure and will never be shared without your permission';
  }
  if (step === 6) {
    return 'Your privacy is always protected.';
  }
  if (step === 8 && fieldFocused) {
    return 'Confirm or update your address so we can find the right options for you.';
  }
  if (step === 9) {
    return 'A+ BBB rating and AFCC accredited';
  }
  return null;
}

export function signalAdvanceDelay(reduced: boolean) {
  return reduced
    ? SIGNAL_CONFIG.timing.reducedS * 1000
    : SIGNAL_CONFIG.timing.settleMs;
}
