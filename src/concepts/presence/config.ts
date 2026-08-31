/**
 * Presence — Step 1 tuning surface.
 * Timing, colours, and band→intensity live here so the screen can be
 * tuned without touching animation or layout code.
 */

export const PRESENCE_CONFIG = {
  colors: {
    /** Warm off-white for headline / question on the scrim. */
    text: '#f7f2ea',
    /** Slightly muted for helper + trust insight. */
    muted: '#d8cfc0',
    eyebrow: '#b8a994',
    /** Scrim dark warm neutral. */
    scrim: 'rgba(43, 38, 32, 0.55)',
    /** Idle / selected glow hue. */
    glow: '#d9a441',
    /** Selected pill fill. */
    selected: '#c9744f',
    selectedSoft: 'rgb(201 116 79 / 18%)',
    onSelected: '#fffaf4',
    /** Progress bar — keep the existing blue; amber flagged for later. */
    progress: '#2f6bff',
  },

  glow: {
    /** Baseline intensity before any band is chosen. */
    idleIntensity: 0.15,
    idlePulseS: 5.2,
    idlePulseAmplitude: 0.08,
    bloomS: 0.55,
    reducedCrossfadeS: 0.2,
    /** Soft-light layer sits near the hands (right of frame). */
    anchorX: '68%',
    anchorY: '58%',
  },

  /**
   * Debt band → GenerativeGlow intensity.
   * Lowest band settles above idle; highest reaches full bloom.
   */
  bandIntensity: {
    '16-20': 0.35,
    '21-25': 0.5,
    '26-30': 0.65,
    '31-35': 0.82,
    '35-plus': 1,
  } as Record<string, number>,

  /**
   * Load-in sequence (ms). First load only; replay remounts the screen.
   * Reduced motion collapses to a single ~300ms cross-fade.
   */
  loadIn: {
    photoMs: 400,
    chromeMs: 600,
    headlineMs: 600,
    headlineDurMs: 300,
    questionMs: 750,
    questionDurMs: 300,
    choicesMs: 1050,
    choicesDurMs: 300,
    insightMs: 1350,
    insightDurMs: 300,
    reducedMs: 300,
  },

  copy: {
    trustInsight:
      'Most people who reach out are managing debt in a similar range.',
  },
} as const;

export const DEBT_AMOUNT_OPTIONS = [
  { id: '16-20', label: '$16K - $20K' },
  { id: '21-25', label: '$21K - $25K' },
  { id: '26-30', label: '$26K - $30K' },
  { id: '31-35', label: '$31K - $35K' },
  { id: '35-plus', label: '$35K+' },
] as const;

export type DebtBandId = (typeof DEBT_AMOUNT_OPTIONS)[number]['id'];

export function glowIntensityForBand(band: string | null): number {
  if (!band) return 0;
  return PRESENCE_CONFIG.bandIntensity[band] ?? 0;
}
