/**
 * Pose holds, particle budget, and release timing. Animation code reads
 * from here — tune the load without touching springs or canvas.
 */

export type PoseId = 1 | 2 | 3 | 4 | 5;

export interface Cluster {
  x: number;
  y: number;
  r: number;
}

export const UNBURDEN_CONFIG = {
  particles: {
    /** Lowest debt band, at the densest pose. */
    min: 900,
    /** Highest debt band — the brief's ceiling. */
    max: 1500,
    /** Leftover cluster at the end — never empty. */
    remainder: 110,
  },

  coin: {
    /** Pixel radius range for each spherical particle. */
    sizeMin: 3.8,
    sizeMax: 6.4,
  },

  /** Share of the cluster radius the sphere sits above the palm. */
  clusterHover: 1.08,

  sphere: {
    /** Radians per second around the vertical axis. */
    spin: 0.32,
    /** Concentric Fibonacci shells. Fewer shells = more air between coins. */
    shells: 7,
    /** Outer shell sits inside the clip so spheres are not sliced in half. */
    outerOrbit: 0.9,
    /** Organic scatter so packing does not read as a geodesic grid. */
    scatter: 0.14,
  },

  beams: {
    columns: 26,
    rows: 18,
    coreWidth: 1.25,
    glowWidth: 8,
  },

  colors: {
    figure: '#3a3228',
    shirt: '#4d4238',
    hair: '#2a241e',
    skin: '#5c4e40',
    /** Dusty periwinkle — cool side of the matte sphere. */
    particle: '#A5B4D4',
    /** Soft peach — warm, lit side. */
    particleLite: '#F8B195',
    highlight: '#FAD0C4',
    glow: 'rgb(154 173 200 / 18%)',
    string: 'rgb(244 184 154 / 40%)',
    shadow: 'rgb(58 50 40 / 16%)',
  },

  timing: {
    poseSpring: { stiffness: 88, damping: 22, mass: 1.05 },
    releaseMs: 920,
    staggerMs: 28,
    reducedMs: 200,
    holdJitter: 0.008,
    holdSpin: 0.22,
    idleDrift: 0.04,
  },

  /**
   * Field steps (contact, birth date, phone, address) and the partner
   * match break the palm cluster into loose orbs across the page. Cap
   * is a field budget, not a packed sphere.
   */
  spread: {
    cap: 170,
    formPad: 34,
    headerPad: 40,
    drift: 24,
    /** Quiet field behind the form — a quarter of the palm cluster. */
    opacity: 0.25,
  },

  /**
   * How much of the starting budget is still held at each scene (1–9).
   * Scene 1 is the full load; each later scene sheds a few more.
   * The remainder floor keeps a small cluster on the last scenes.
   */
  remaining: {
    1: 1,
    2: 0.82,
    3: 0.68,
    4: 0.58,
    5: 0.48,
    6: 0.36,
    7: 0.28,
    8: 0.2,
    9: 0.48,
  } as Record<number, number>,
} as const;

/**
 * Palm is locked to the still in scene layout (see handMesh.layoutScene).
 * Radius here is a share of the graphic slot.
 */
export const PALM = { x: 0.5, y: 0.5 };

export const CLUSTER_BY_POSE: Record<PoseId, Cluster> = {
  1: { x: PALM.x, y: PALM.y, r: 0.4 },
  2: { x: PALM.x, y: PALM.y, r: 0.33 },
  3: { x: PALM.x, y: PALM.y, r: 0.3 },
  4: { x: PALM.x, y: PALM.y, r: 0.265 },
  5: { x: PALM.x, y: PALM.y, r: 0.23 },
};

export const DEBT_BAND_WEIGHT: Record<string, number> = {
  '16-20': 0,
  '21-25': 0.25,
  '26-30': 0.5,
  '31-35': 0.75,
  '35-plus': 1,
};

export const DEBT_AMOUNT_OPTIONS = Object.keys(DEBT_BAND_WEIGHT);

export const SCENE_STEP_BY_INDEX = [1, 2, 3, 4, 5, 7, 8];

/** Five discrete holds. Scenes share a hold so the pose does not twitch every question. */
export const POSE_BY_SCENE: Record<number, PoseId> = {
  1: 1,
  2: 2,
  3: 3,
  4: 3,
  5: 3,
  6: 4,
  7: 4,
  8: 5,
  9: 5,
};

export const POSE_NOTES: Record<PoseId, string> = {
  1: 'Open palm — full sphere resting in the hand.',
  2: 'Held — load still dense, beginning to shed.',
  3: 'Lightening — strings take more of the mass.',
  4: 'Nearly lifted — smaller cluster, still nested in the palm.',
  5: 'Remainder — leftover coins hover in the palm, still tethered.',
};

export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function clusterForPose(pose: number, band: number | null): Cluster {
  const clamped = Math.min(5, Math.max(1, pose));
  const lo = Math.floor(clamped) as PoseId;
  const hi = Math.ceil(clamped) as PoseId;
  const t = clamped - lo;
  let r = lerp(CLUSTER_BY_POSE[lo].r, CLUSTER_BY_POSE[hi].r, t);
  if (clamped <= 1.08) {
    const weight = band == null ? 0.55 : clamp01(band);
    r *= lerp(0.86, 1.18, weight);
  }
  return {
    x: PALM.x,
    y: PALM.y,
    r,
  };
}

/** Starting budget for the selected (or previewed) debt band. */
export function particleBudget(debtAmountBand: number | null) {
  const { min, max } = UNBURDEN_CONFIG.particles;
  const band = debtAmountBand == null ? 0.5 : clamp01(debtAmountBand);
  return Math.round(min + band * (max - min));
}

export function heldCount(step: number, debtAmountBand: number | null) {
  const budget = particleBudget(debtAmountBand);
  const remain =
    UNBURDEN_CONFIG.remaining[step] ?? UNBURDEN_CONFIG.remaining[1];
  return Math.max(
    UNBURDEN_CONFIG.particles.remainder,
    Math.round(budget * remain),
  );
}

export function poseForScene(step: number): PoseId {
  return POSE_BY_SCENE[step] ?? 1;
}

/** Contact, birth date, phone, address, and the partner match drop the figure and scatter the cluster. */
export function isSpreadScene(step: number) {
  return step === 3 || step === 4 || step === 5 || step === 8 || step === 9;
}

export function unburdenAdvanceDelay(reduced: boolean) {
  return reduced
    ? UNBURDEN_CONFIG.timing.reducedMs
    : UNBURDEN_CONFIG.timing.releaseMs;
}
