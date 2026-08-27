/**
 * Tile counts, colour bands, and timing for the mosaic. Animation code
 * reads from here — tune the fill without touching springs or layout.
 */

export type MosaicBand = 'clay' | 'teal' | 'blueTeal' | 'gold';
export type MosaicVariant = 'fill' | 'otp-icon' | 'final-bloom';

export interface MosaicStepConfig {
  /** Fixed count. Ignored when minTiles/maxTiles are set. */
  tiles?: number;
  minTiles?: number;
  maxTiles?: number;
  /** Which band slider drives a variable count. */
  band?: 'debt' | 'income';
  colorBand: MosaicBand;
  animationVariant: MosaicVariant;
  stagger: boolean;
}

export const MOSAIC_CONFIG = {
  tileCount: 70,

  colors: {
    clay: '#c9744f',
    teal: '#5f8a86',
    blueTeal: '#3f9aa8',
    gold: '#d9a441',
    empty: '#dcd4c6',
    background: '#f4efe6',
  },

  timing: {
    /** Standard fill, per tile. */
    fillMs: 400,
    staggerMs: 50,
    spring: { stiffness: 300, damping: 20 },
    otpMs: 500,
    bloomMs: 700,
    reducedMs: 200,
    shimmerS: 24,
  },

  /**
   * Step 1 interpolates 6 + band*8. Step 7 interpolates 12 + band*8.
   * Step 9 takes whatever is left so the spiral always completes at 70.
   */
  steps: {
    1: {
      minTiles: 6,
      maxTiles: 14,
      band: 'debt',
      colorBand: 'clay',
      animationVariant: 'fill',
      stagger: true,
    },
    2: {
      tiles: 8,
      colorBand: 'clay',
      animationVariant: 'fill',
      stagger: true,
    },
    3: {
      tiles: 3,
      colorBand: 'teal',
      animationVariant: 'fill',
      stagger: false,
    },
    4: {
      tiles: 2,
      colorBand: 'teal',
      animationVariant: 'fill',
      stagger: false,
    },
    5: {
      tiles: 3,
      colorBand: 'teal',
      animationVariant: 'fill',
      stagger: false,
    },
    6: {
      tiles: 4,
      colorBand: 'blueTeal',
      animationVariant: 'otp-icon',
      stagger: false,
    },
    7: {
      minTiles: 12,
      maxTiles: 20,
      band: 'income',
      colorBand: 'gold',
      animationVariant: 'fill',
      stagger: true,
    },
    8: {
      tiles: 6,
      colorBand: 'gold',
      animationVariant: 'fill',
      stagger: true,
    },
    9: {
      colorBand: 'gold',
      animationVariant: 'final-bloom',
      stagger: false,
    },
  } as Record<number, MosaicStepConfig>,
} as const;

export const DEBT_BAND_WEIGHT: Record<string, number> = {
  '16-20': 0,
  '21-25': 0.25,
  '26-30': 0.5,
  '31-35': 0.75,
  '35-plus': 1,
};

export const DEBT_AMOUNT_OPTIONS = Object.keys(DEBT_BAND_WEIGHT);

/** Credit cards and personal loans are the matched types. */
export const DEBT_TYPE_MATCH_INDEX: Record<string, number> = {
  'personal-loans': 0,
  'credit-card': 1,
  medical: 2,
  student: 3,
};

export const DEBT_TYPE_OPTIONS = Object.keys(DEBT_TYPE_MATCH_INDEX);

export const INCOME_BAND_WEIGHT: Record<string, number> = {
  'lt-10k': 0,
  '10-50k': 0.25,
  '50-100k': 0.5,
  '100k-plus': 1,
  unsure: 0.35,
};

export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function tilesForStep(
  step: number,
  debtAmountBand: number | null,
  incomeBand: number,
  remaining: number,
): number {
  const config = MOSAIC_CONFIG.steps[step as keyof typeof MOSAIC_CONFIG.steps];
  if (!config) return 0;

  if (config.animationVariant === 'final-bloom') return Math.max(remaining, 0);

  if (config.minTiles != null && config.maxTiles != null) {
    const span = config.maxTiles - config.minTiles;
    if (config.band === 'debt') {
      if (debtAmountBand == null) return 0;
      return Math.round(config.minTiles + clamp01(debtAmountBand) * span);
    }
    return Math.round(config.minTiles + clamp01(incomeBand) * span);
  }

  return config.tiles ?? 0;
}

export function filledThroughStep(
  step: number,
  debtAmountBand: number | null,
  incomeBand: number,
): number {
  let filled = 0;
  for (let current = 1; current <= step; current += 1) {
    filled += tilesForStep(
      current,
      debtAmountBand,
      incomeBand,
      MOSAIC_CONFIG.tileCount - filled,
    );
  }
  return Math.min(filled, MOSAIC_CONFIG.tileCount);
}

export function mosaicAdvanceDelay(tileCount: number, reduced: boolean) {
  if (reduced) return MOSAIC_CONFIG.timing.reducedMs;
  const { staggerMs, fillMs } = MOSAIC_CONFIG.timing;
  return Math.min(
    1180,
    staggerMs * Math.max(tileCount - 1, 0) + fillMs + 80,
  );
}

export const SCENE_STEP_BY_INDEX = [1, 2, 3, 4, 5, 7, 8];
