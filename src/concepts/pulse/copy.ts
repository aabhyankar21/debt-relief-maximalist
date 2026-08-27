/**
 * How each of the field's nine states treats the words on screen, plus the
 * mapping between those states and this journey's seven steps.
 *
 * Shared by the live concept and the review lab so the two can never drift.
 * Every phrase below is an exact substring of the frozen journey copy in
 * src/data/journey.ts — the words are wrapped, never rewritten.
 */

/**
 * Seven steps map one to one onto scenes 1-5, 7 and 8. Scene 6 — the OTP
 * pulse, and the first of the three hero moments — is a beat this journey
 * has no screen for; the concept plays it as the person leaves the phone
 * step. Scene 9 is the result screen.
 */
export const SCENE_STEP_BY_INDEX = [1, 2, 3, 4, 5, 7, 8];

/** Inverse of the above, for the lab's per-scene copy preview. */
export const JOURNEY_INDEX_BY_SCENE: Record<number, number | null> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  /* No screen of its own: the phone step's copy is still on screen. */
  6: 4,
  7: 5,
  8: 6,
  /* The result screen, which is shared chrome rather than a journey step. */
  9: null,
};

export interface TitleTreatment {
  animateWeight: boolean;
  tick: boolean;
  /** Applied to the step's helper copy, which is where these phrases live. */
  highlight?: string[];
}

/**
 * Highlights are reserved: colour on a phrase only earns its keep while it
 * stays rare. Weight ramp and tick travel together, and both are off at the
 * three "just answer" steps (3, 5, 8) on purpose — motion does its real work
 * at the trust steps and the three hero beats, not evenly across the flow.
 */
export const TITLE_TREATMENT: Record<number, TitleTreatment> = {
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
  /**
   * The privacy line is the phone step's copy in this journey, and the OTP
   * screen the spec hangs it on does not exist here — so the highlight
   * follows the words rather than the step number. The title itself still
   * gets the light treatment the spec asks of step 5.
   */
  5: {
    animateWeight: false,
    tick: false,
    highlight: ['Your privacy is always protected.'],
  },
  6: { animateWeight: true, tick: true },
  7: { animateWeight: true, tick: true },
  /**
   * The matched partner is revealed on the shared result screen rather than
   * in this title, so there is no phrase here to highlight.
   */
  8: { animateWeight: false, tick: false },
  9: { animateWeight: true, tick: true },
};

export interface InsightConfig {
  text: string;
  tone: 'default' | 'hero';
  anchor: { x: number; y: number };
  /** Captions lift on a narrow frame so they stay out of the form copy. */
  anchorNarrow: { x: number; y: number };
}

/**
 * PLACEHOLDER COPY. These are the only strings in this concept that are not
 * already-approved journey copy. They must not ship with real figures until
 * legal has signed the wording off, which is why they are labelled in place
 * rather than quietly reading like finished copy.
 *
 * Compliance also needs to see TITLE_TREATMENT before this ships: emphasising
 * fragments of regulated credit-score and privacy copy may need sign-off even
 * though the underlying words are unchanged.
 */
export type DataMomentVariant =
  | 'none'
  | 'benchmark-bar'
  | 'fit-arc'
  | 'trust-check'
  | 'counter'
  | 'snapshot-chips';

export interface DataMomentStep {
  variant: DataMomentVariant;
  /** Shown in the lab so empty steps can be verified as genuinely empty. */
  note: string;
}

/**
 * Only the steps that earn a data beat get a variant. 1, 3, 4 and 5 are
 * `none` on purpose — do not fill those slots for symmetry.
 *
 * COMPLIANCE: numeric content on 7, 8, 9 is placeholder/illustrative.
 */
export const DATA_MOMENTS: Record<number, DataMomentStep> = {
  1: {
    variant: 'none',
    note: 'Removed — the illustrative range bar was competing with the choices.',
  },
  2: {
    variant: 'fit-arc',
    note: 'Small fit ring. Brighter/fuller for credit cards and personal loans.',
  },
  3: { variant: 'none', note: 'Intentionally empty — transactional step.' },
  4: { variant: 'none', note: 'Intentionally empty — no age-based statistic.' },
  5: { variant: 'none', note: 'Intentionally empty — sets up the OTP pulse.' },
  6: {
    variant: 'trust-check',
    note: 'Symbolic shield/check, timed with the outward pulse ring. Not a number.',
  },
  7: {
    variant: 'counter',
    note: 'Largest numeric beat: illustrative savings/fit for the income band.',
  },
  8: {
    variant: 'counter',
    note: 'Lightweight provider-count tick for the area, once.',
  },
  9: {
    variant: 'snapshot-chips',
    note: 'Three flat chips recap what was used to match, then the partner reveal.',
  },
};

const DEBT_BAND_LABEL: Record<string, string> = {
  '16-20': '$16K–$20K',
  '21-25': '$21K–$25K',
  '26-30': '$26K–$30K',
  '31-35': '$31K–$35K',
  '35-plus': '$35K+',
};

const DEBT_TYPE_LABEL: Record<string, string> = {
  'personal-loans': 'Personal loans',
  'credit-card': 'Credit cards',
  medical: 'Medical',
  student: 'Student',
};

const INCOME_LABEL: Record<string, string> = {
  'lt-10k': 'Under $10K',
  '10-50k': '$10K–$50K',
  '50-100k': '$50K–$100K',
  '100k-plus': '$100K+',
  unsure: 'Unsure',
};

/** Illustrative only — not a real savings estimate. */
const INCOME_SAVINGS: Record<string, number> = {
  'lt-10k': 2800,
  '10-50k': 6400,
  '50-100k': 9200,
  '100k-plus': 12000,
  unsure: 5400,
};

export interface ResolvedDataMoment {
  variant: DataMomentVariant;
  value?: number;
  label?: string;
  marker?: number;
  chips?: { label: string; value: string }[];
}

export function resolveDataMoment(
  scene: number,
  choices: Record<string, string>,
): ResolvedDataMoment {
  const variant = DATA_MOMENTS[scene]?.variant ?? 'none';

  if (variant === 'benchmark-bar') {
    const bands = ['16-20', '21-25', '26-30', '31-35', '35-plus'];
    const index = Math.max(bands.indexOf(choices['debt-amount'] ?? ''), 0);
    return {
      variant,
      value: (index + 1) / bands.length,
      marker: 0.55,
      /* COMPLIANCE: illustrative framing. */
      label: '[Illustrative] typical range for people who complete this program',
    };
  }

  if (variant === 'fit-arc') {
    const type = choices['debt-type'] ?? '';
    const fit = type === 'credit-card' || type === 'personal-loans' ? 1 : type ? 0.38 : 0.55;
    return {
      variant,
      value: fit,
      label: '[Illustrative] how well this debt type fits these programs',
    };
  }

  if (variant === 'trust-check') {
    return { variant, label: 'Encrypted one-time check' };
  }

  if (variant === 'counter' && scene === 7) {
    const income = choices.income ?? '';
    return {
      variant,
      value: INCOME_SAVINGS[income] ?? 6400,
      label: '[Illustrative] estimated potential savings range for this income band',
    };
  }

  if (variant === 'counter' && scene === 8) {
    return {
      variant,
      value: 18,
      label: '[Illustrative] approved providers currently serving this area',
    };
  }

  if (variant === 'snapshot-chips') {
    return {
      variant,
      chips: [
        {
          label: 'Debt',
          value: DEBT_BAND_LABEL[choices['debt-amount'] ?? ''] ?? 'Not set',
        },
        {
          label: 'Type',
          value: DEBT_TYPE_LABEL[choices['debt-type'] ?? ''] ?? 'Not set',
        },
        {
          label: 'Income',
          value: INCOME_LABEL[choices.income ?? ''] ?? 'Not set',
        },
      ],
    };
  }

  return { variant: 'none' };
}

export const PULSE_INSIGHTS: Record<number, InsightConfig> = {
  1: {
    text: '[Placeholder] Context about balances in this range goes here.',
    tone: 'default',
    anchor: { x: 0.08, y: 0.24 },
    anchorNarrow: { x: 0.08, y: 0.15 },
  },
  7: {
    text: '[Placeholder] The largest insight of the flow — income framing copy sits here.',
    tone: 'hero',
    anchor: { x: 0.07, y: 0.19 },
    anchorNarrow: { x: 0.07, y: 0.13 },
  },
};

/**
 * Intro copy lives here rather than in the frozen journey: this screen is
 * concept chrome, not a step. Calm and plain on purpose — the wave carries
 * the emotion, the words should not compete with it.
 */
export const PULSE_INTRO_COPY = {
  headline: "Let's untangle this, together",
  cta: 'Continue',
} as const;

export const SCENE_NOTES: Record<number, string> = {
  1: 'Loose cluster, and its density and reach scale with the selected debt band. Insight caption fades in once the cluster settles.',
  2: 'Same density reshaped into a direction — squashed and tilted, not a chart. The matched debt types tick brighter. "Credit cards" and "personal loans" resolve a beat after the sentence around them.',
  3: 'A small cluster peels off toward the focused field. On the real form it follows focus, settling beside whichever field is being typed into. Title is blur-resolve only. No DataMoment.',
  4: 'A thin arc of particles traces one pass round a shared ellipse, then dissolves back into the field. "no impact on your credit score." carries the highlight.',
  5: 'A tight, small cluster gathers at one point. Deliberately the quietest step — it exists to set up the payoff on 6.',
  6: 'Hero moment #1: the cluster pulses outward in one clean concentric ring. The longest and most visible transition so far, and the only place two SVG rings are drawn.',
  7: 'Hero moment #2: the whole field speeds up and brightens for a few seconds, then eases back. The cluster loosens its grip because the field itself is the event. Largest insight caption of the flow.',
  8: 'A quieter, localised cluster settles low in the frame, near the viewer\u2019s side. The field slows for the first time.',
  9: 'Hero moment #3: the two lobes of density merge into one denser cluster and pick up the deeper blue. The longest transition in the flow, and the first time the field visibly calms. Snapshot chips recap the match inputs.',
};
