import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import styles from './pulseField.module.css';

/* ------------------------------------------------------------------ *
 * Config
 *
 * Nothing below this block contains a colour, a count, a size or a
 * duration. Palette values are also emitted as `--pf-*` custom
 * properties so the CSS module reads from the same source.
 * ------------------------------------------------------------------ */

export interface PulsePalette {
  /** Warm ground the field drifts over. */
  base: string;
  /** The signal itself. */
  accent: string;
  /** Reserved for the hero moments — the OTP ring and the merge. */
  accentDeep: string;
  /** Wash that lifts under the cluster, so density reads as light. */
  glow: string;
}

export const PULSE_PALETTE: PulsePalette = {
  base: '#f2ede4',
  accent: '#2f6bff',
  accentDeep: '#1d4fd1',
  glow: 'rgb(47 107 255 / 14%)',
};

export const PULSE_CONFIG = {
  /**
   * Count is a budget, not a constant. A paid-traffic form pays for every
   * dropped frame, so the field asks for what the device can plausibly
   * afford and treats missing capability hints as "assume low-end".
   */
  particles: {
    min: 46,
    /**
     * The brief's ceilings, held to deliberately. Presence comes from the
     * halo and alpha work below rather than from more dots, so raising these
     * buys a little density at the cost of the one budget we were given.
     */
    mobileMax: 120,
    desktopMax: 250,
    /** Above this width the desktop ceiling applies. */
    desktopWidth: 640,
    /** One particle per this many CSS px² keeps density even across sizes. */
    areaPerParticle: 1600,
    /** Applied when the device reports few cores or little memory. */
    lowEndScale: 0.6,
    /** Cores/GiB at or below which the device counts as low-end. */
    lowEndCores: 4,
    lowEndMemory: 4,
    /** Retina is worth one step, not four. */
    dprCap: 2,
  },

  /**
   * The particle count is capped for performance, so presence has to come
   * from each dot rather than from more of them: a field of 250 faint
   * hairlines reads as dust on the screen, not as a signal.
   */
  dot: {
    minSize: 1.05,
    maxSize: 3.4,
    minAlpha: 0.42,
    maxAlpha: 1,
    /** Share of the field drawn as short segments rather than dots. */
    segmentShare: 0.34,
    /** Segment length per unit of per-frame travel, and its bounds. */
    segmentGain: 4.2,
    segmentMin: 2,
    segmentMax: 13,
  },

  /**
   * A crisp dot alone reads as a speck of dust. The halo behind it is what
   * makes the same dot read as a lit point — a signal rather than debris.
   *
   * Drawn from a sprite baked once, because a per-particle radial gradient
   * every frame is the one thing that would genuinely cost us here.
   * `shadowBlur` would look right too and is far more expensive.
   */
  halo: {
    /** Only the nearer half get one; a halo on every dot is just fog. */
    depthThreshold: 0.42,
    /** Halo radius as a multiple of the dot's own. */
    scale: 4.4,
    alpha: 0.5,
    /** Sprite resolution. Bigger buys nothing: it is a soft gradient. */
    sprite: 48,
  },

  /**
   * There is no card behind the form, so the copy sits directly on the field
   * and the field is what has to yield. Two mechanisms, both driven by the
   * copy column's measured rect rather than by hardcoded widths, so they hold
   * at any breakpoint:
   *
   *   - a cluster moves into the widest gutter beside the copy, where one is
   *     wide enough to hold it
   *   - ambient particles dim inside the copy's own footprint
   */
  quiet: {
    /**
     * Share of a particle's alpha removed under the copy. Enough to stop the
     * field competing with the type, not enough to leave a dead rectangle —
     * which is what this looks like on a phone, where the copy covers most of
     * the frame and there is no gutter to hold the field instead.
     */
    dim: 0.62,
    /** Fade band just outside the copy, as a share of the stage. */
    feather: 0.07,
    /**
     * A gutter narrower than this cannot hold a cluster without clipping, so
     * on those frames — phones, mostly — density stays where the step put it
     * and only the dimming does the work.
     */
    minGutter: 0.17,
  },

  drift: {
    /** Fractions of the stage's short side per second. */
    speed: 0.016,
    speedSpread: 0.7,
    /** Random-walk wobble, layered on top of the linear velocity. */
    wobble: 0.012,
    wobbleHz: 0.09,
    /** Particles wrap through this margin so edges never look swept clean. */
    margin: 0.06,
  },

  cluster: {
    /**
     * The field holds two loose lobes of density through the whole flow, so
     * step 9's merge has something real to combine. Spread is a share of the
     * cluster radius, kept under 1 so the lobes overlap: two clearly separate
     * blobs read as two clusters, which is step 9's job, not step 1's.
     */
    groups: 2,
    groupSpread: 0.62,
    groupSkewX: 1,
    groupSkewY: 0.42,
    /** Particles arrive over a spread of the transition, not all at once. */
    stagger: 0.45,
    /** Softness of the share cutoff, so the cluster edge is a fade. */
    shareSoftness: 0.12,
    /** Idle wander of a clustered particle around its own polar seat. */
    seatDrift: 0.16,
    spin: 0.05,
    /** Extra brightness a clustered particle gains over an ambient one. */
    lift: 0.4,
  },

  /** Step 1 and 2 scale cluster density and reach to the answer given. */
  band: {
    shareMin: 0.72,
    shareMax: 1.34,
    radiusMin: 0.84,
    radiusMax: 1.2,
    /** Brightness the matched debt type adds from step 2 on. */
    typeLift: 0.22,
  },

  orbit: {
    /** Ellipse radii as a share of the step's cluster radius. */
    rx: 1.25,
    ry: 0.52,
    /** How much of the ellipse the arc of particles covers. */
    arcSpan: 0.34,
    /** Peak share of the field drawn into the arc. */
    share: 0.3,
  },

  pulse: {
    /** Outward travel at the ring's peak, as a share of cluster radius. */
    amp: 1.15,
    /** Rings drawn in SVG, as shares of the cluster radius. */
    ringFrom: 0.35,
    ringTo: 2.5,
    ringWidth: 1.4,
    /** The second ring trails the first by this much of the transition. */
    ringDelay: 0.22,
    ringOpacity: 0.5,
  },

  energy: {
    /** Multipliers at the peak of the income step's lift. */
    speedGain: 2.3,
    brightGain: 0.5,
    sizeGain: 0.22,
  },

  settle: {
    /** Share of the drift speed taken away when the field calms. */
    slow: 0.62,
  },

  merge: {
    /** The combined cluster pulls tighter as well as together. */
    tighten: 0.24,
    /** ...and picks up the deeper blue. */
    deepen: 0.7,
  },

  /**
   * Intro-only. Never used by a numbered step. Count spikes above the
   * step baseline, motion is quick, and a subset of dots briefly render as
   * numeral/currency glyphs — texture, never a readable word or amount.
   */
  chaos: {
    /** Multiplier on the adaptive idle count, still bounded by the ceiling. */
    countScale: 1.65,
    speedGain: 3.2,
    wobbleGain: 2.6,
    sizeGain: 0.18,
    /** Share of the field that flickers as a glyph rather than a dot. */
    glyphShare: 0.22,
    glyphMin: 8,
    glyphMax: 13,
    flickerHz: 7,
    /**
     * How wide the settle front is, as a share of the stage. Narrow enough
     * that the wave reads as a single passing boundary, not a global fade.
     */
    waveFeather: 0.1,
    /** Denser ground the wave interpolates away from. */
    base: '#e4d5c4',
    overlay: 'rgb(46 28 12 / 10%)',
    /** Soft leading edge of the sweep itself. */
    front:
      'linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 22%) 42%, rgb(47 107 255 / 14%) 58%, transparent 100%)',
    glyphs: [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '$',
      '€',
      '£',
      '¥',
      '¢',
      '%',
      '+',
      '–',
    ] as const,
  },

  /** A few px, capped, and never on touch. */
  parallax: { strength: 7, spring: { stiffness: 48, damping: 22, mass: 0.8 } },

  timing: {
    /** Ease, not spring: a signal settles, it does not bounce. */
    cluster: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    orbit: { duration: 1.3, ease: [0.4, 0, 0.5, 1] },
    /** Hero moment #1, deliberately the most visible transition per beat. */
    pulse: { duration: 1.15, ease: [0.2, 0.7, 0.3, 1] },
    /** Hero moment #2. Rises fast, holds, eases back over ~2.6s total. */
    energy: { duration: 2.6, times: [0, 0.18, 0.52, 1] },
    settle: { duration: 1.1, ease: [0.33, 1, 0.68, 1] },
    /** Hero moment #3, and the longest move in the flow. */
    merge: { duration: 1.15, ease: [0.16, 1, 0.3, 1] },
    /** Focus moves the cluster rather than re-forming it. */
    anchor: { stiffness: 52, damping: 20, mass: 0.9 },
    /**
     * Reduced motion: cluster changes become an opacity cross-fade, so the
     * arrangement is swapped at the midpoint and nothing travels.
     */
    crossFade: 0.2,
    /** Drift is not removed under reduced motion, only taken to a crawl. */
    reducedDrift: 0.07,
  },

  /** Reported to the demo for tuning; also the console.log interval. */
  stats: { intervalMs: 500 },
} as const;

/* ------------------------------------------------------------------ *
 * Per-step behaviour
 * ------------------------------------------------------------------ */

export type PulseIntensity =
  | 'chaos'
  | 'idle'
  | 'cluster'
  | 'orbit'
  | 'pulse'
  | 'energy'
  | 'settle'
  | 'merge';

export interface PulseStepState {
  intensity: PulseIntensity;
  /** Cluster centre as a fraction of the stage, when nothing has focus. */
  anchor: { x: number; y: number };
  /** Cluster reach, as a share of the stage's short side. */
  radius: number;
  /** Share of the field that joins the cluster, before the band scales it. */
  share: number;
  /** 1 is round; below 1 reads as a direction rather than a blob. */
  squash: number;
  /** Degrees the squashed cluster is tilted by. */
  tilt: number;
}

/**
 * The whole per-step table in one place, so the component contains no
 * per-step logic. Motion does its real work at the trust steps (3, 5, 6)
 * and the three hero beats (6, 7, 9); the low-friction steps stay light on
 * purpose rather than getting an effect each for symmetry.
 *
 * Two numbers here pull against each other and both have a floor. `radius`
 * has to stay small, because a cluster only reads as density relative to the
 * ambient spacing around it — spread the same particles across a third of
 * the frame and it reads as ordinary scatter. `share` has to stay well under
 * half, because whatever joins the cluster leaves the ambient field, and a
 * thinned-out ambient field stops looking like a live signal at all.
 */
export const PULSE_STEPS: Record<number, PulseStepState> = {
  /* Loose, and sized to the debt band. */
  1: { intensity: 'cluster', anchor: { x: 0.5, y: 0.3 }, radius: 0.15, share: 0.3, squash: 1, tilt: 0 },
  /* Same density, reshaped into a direction. Not a chart — a lean. */
  2: { intensity: 'cluster', anchor: { x: 0.5, y: 0.29 }, radius: 0.19, share: 0.32, squash: 0.42, tilt: -13 },
  /* A few particles peel off toward the focused field; the live form
     supplies the actual anchor. */
  3: { intensity: 'cluster', anchor: { x: 0.5, y: 0.4 }, radius: 0.1, share: 0.2, squash: 0.82, tilt: 0 },
  4: { intensity: 'orbit', anchor: { x: 0.5, y: 0.27 }, radius: 0.15, share: 0.26, squash: 1, tilt: 0 },
  /* Tight and small: this exists to set up the payoff on 6. */
  5: { intensity: 'cluster', anchor: { x: 0.5, y: 0.27 }, radius: 0.07, share: 0.3, squash: 0.92, tilt: 0 },
  6: { intensity: 'pulse', anchor: { x: 0.5, y: 0.27 }, radius: 0.085, share: 0.34, squash: 1, tilt: 0 },
  /* The field itself is the event here, so the cluster lets go entirely. */
  7: { intensity: 'energy', anchor: { x: 0.5, y: 0.3 }, radius: 0.22, share: 0.22, squash: 0.88, tilt: 8 },
  /* Quieter, and low in the frame — near the viewer's side of the scene. */
  8: { intensity: 'settle', anchor: { x: 0.5, y: 0.62 }, radius: 0.1, share: 0.22, squash: 0.9, tilt: 0 },
  9: { intensity: 'merge', anchor: { x: 0.5, y: 0.32 }, radius: 0.13, share: 0.42, squash: 1, tilt: 0 },
};

/** Step 1's answer sets how much of the field the cluster commands. */
const DEBT_BAND_WEIGHT: Record<string, number> = {
  '16-20': 0,
  '21-25': 0.25,
  '26-30': 0.5,
  '31-35': 0.75,
  '35-plus': 1,
};

/**
 * Step 2 ticks the matched types brighter. Credit cards and personal loans
 * are the two the programme actually fits, which is what the helper copy
 * says, so they are the two that read strongest.
 */
const DEBT_TYPE_MATCH: Record<string, number> = {
  'personal-loans': 1,
  'credit-card': 1,
  medical: 0.45,
  student: 0.3,
};

export const DEBT_AMOUNT_OPTIONS = Object.keys(DEBT_BAND_WEIGHT);
export const DEBT_TYPE_OPTIONS = Object.keys(DEBT_TYPE_MATCH);

/* ------------------------------------------------------------------ *
 * Utilities
 * ------------------------------------------------------------------ */

const TAU = Math.PI * 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge1 <= edge0) return value >= edge1 ? 1 : 0;
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paletteToCssVars(palette: PulsePalette): CSSProperties {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) {
    vars[`--pf-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  }
  return vars as CSSProperties;
}

/**
 * The halo, baked once into an offscreen canvas so each particle costs a
 * single drawImage. Solid to a third of the radius so the dot keeps a crisp
 * core, then a soft falloff to nothing.
 */
function buildHaloSprite(
  rgb: [number, number, number],
  size: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const half = size / 2;
  if (!ctx) return canvas;

  const [r, g, b] = rgb;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.85)`);
  gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.34)`);
  gradient.addColorStop(0.62, `rgba(${r}, ${g}, ${b}, 0.09)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/** Canvas needs channels, not a hex string, to vary alpha per particle. */
function toRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

interface NavigatorCapabilities extends Navigator {
  deviceMemory?: number;
}

/**
 * Viewport area sets the ask, the device ceiling caps it, and an unknown
 * device is treated as a modest one. Returns a count, never a promise of
 * one: the caller re-runs this on resize.
 */
export function resolveParticleCount(
  width: number,
  height: number,
  override?: number,
): number {
  const { particles } = PULSE_CONFIG;
  if (width <= 0 || height <= 0) return 0;

  const ceiling =
    width >= particles.desktopWidth ? particles.desktopMax : particles.mobileMax;
  if (override != null) return clamp(Math.round(override), 0, particles.desktopMax);

  const byArea = Math.round((width * height) / particles.areaPerParticle);

  const nav = navigator as NavigatorCapabilities;
  const cores = nav.hardwareConcurrency ?? 0;
  const memory = nav.deviceMemory ?? 0;
  const lowEnd =
    (cores > 0 && cores <= particles.lowEndCores) ||
    (memory > 0 && memory <= particles.lowEndMemory);

  const budget = Math.min(ceiling, byArea) * (lowEnd ? particles.lowEndScale : 1);
  return clamp(Math.round(budget), Math.min(particles.min, ceiling), ceiling);
}

/**
 * Intro spike: above the idle ask, still bounded by a 1.65× lift of the
 * same device ceiling the idle field already respects.
 */
export function resolveChaosCount(idleCount: number, width: number): number {
  const { particles, chaos } = PULSE_CONFIG;
  if (idleCount <= 0) return 0;
  const ceiling =
    width >= particles.desktopWidth ? particles.desktopMax : particles.mobileMax;
  return clamp(
    Math.round(idleCount * chaos.countScale),
    idleCount,
    Math.round(ceiling * chaos.countScale),
  );
}

function readUnit(value: MotionValue<number> | number | undefined): number {
  if (value == null) return 0;
  return clamp(typeof value === 'number' ? value : value.get(), 0, 1);
}

/* ------------------------------ particles ------------------------------ */

interface Particle {
  /** Ambient position, in fractions of the stage, integrated every frame. */
  bx: number;
  by: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  segment: boolean;
  /** Parallax weight: nearer particles (bigger, brighter) move further. */
  depth: number;
  wobbleFx: number;
  wobblePx: number;
  wobbleFy: number;
  wobblePy: number;
  /** Which of the two lobes this particle joins. */
  group: number;
  /** Seat within its cluster, in polar terms. */
  angle: number;
  seat: number;
  spin: number;
  /** Place in the queue for both the arrival stagger and the share cutoff. */
  lag: number;
  shareRank: number;
  /** Position along the orbit arc. */
  pathT: number;
  /** Last drawn position in px, for the streak direction. */
  lastX: number;
  lastY: number;
  drawn: boolean;
  /** Intro texture only. Null for particles that stay dots even in chaos. */
  glyph: string | null;
}

function buildParticles(count: number, seed: number): Particle[] {
  const random = mulberry32(seed);
  const { dot, drift, cluster, chaos } = PULSE_CONFIG;

  return Array.from({ length: count }, (_, index) => {
    const depth = random();
    const speed = drift.speed * (1 - drift.speedSpread / 2 + random() * drift.speedSpread);
    const heading = random() * TAU;
    const glyph =
      random() < chaos.glyphShare
        ? chaos.glyphs[Math.floor(random() * chaos.glyphs.length)]
        : null;

    return {
      bx: random(),
      by: random(),
      vx: Math.cos(heading) * speed,
      vy: Math.sin(heading) * speed,
      size: lerp(dot.minSize, dot.maxSize, depth),
      alpha: lerp(dot.minAlpha, dot.maxAlpha, depth * 0.7 + random() * 0.3),
      segment: random() < dot.segmentShare,
      depth,
      wobbleFx: drift.wobbleHz * (0.6 + random() * 0.9),
      wobblePx: random() * TAU,
      wobbleFy: drift.wobbleHz * (0.6 + random() * 0.9),
      wobblePy: random() * TAU,
      group: index % cluster.groups,
      angle: random() * TAU,
      /** Square-rooted so seats spread evenly over area, not over radius. */
      seat: Math.sqrt(random()),
      spin: cluster.spin * (random() > 0.5 ? 1 : -1) * (0.5 + random()),
      lag: random(),
      shareRank: random(),
      pathT: random(),
      lastX: 0,
      lastY: 0,
      drawn: false,
      glyph,
    };
  });
}

/* ------------------------------ props ------------------------------ */

export interface PulseFieldStats {
  particles: number;
  intensity: PulseIntensity;
  fps: number;
  reducedMotion: boolean;
  /** 0–1 settle front. Only meaningful while intensity is `chaos`. */
  wave: number;
}

/** A rectangle in stage fractions, origin top-left. */
export interface PulseRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Moves a cluster into the widest gutter beside the copy. Returns the anchor
 * untouched when neither side can hold one, which is the phone case: there the
 * copy spans the frame and only the dimming keeps the type clear.
 */
function displaceAnchor(
  anchor: { x: number; y: number },
  quiet: PulseRect | null,
): { x: number; y: number } {
  if (!quiet) return anchor;

  const left = quiet.x;
  const right = 1 - (quiet.x + quiet.w);
  /* Ties break right, because the insight captions live in the left gutter. */
  const toRight = right >= left;
  const room = toRight ? right : left;
  if (room < PULSE_CONFIG.quiet.minGutter) return anchor;

  return { x: toRight ? 1 - room / 2 : room / 2, y: anchor.y };
}

/**
 * Which side of the copy a step's density ends up on, so an annotation can be
 * placed with the cluster it refers to. `'none'` means it never moved.
 */
export function pulseDensitySide(
  step: number,
  quiet: PulseRect | null,
): 'left' | 'right' | 'none' {
  const base = PULSE_STEPS[clamp(Math.round(step), 1, 9)].anchor;
  const moved = displaceAnchor(base, quiet);
  if (moved.x === base.x) return 'none';
  return moved.x > 0.5 ? 'right' : 'left';
}

/**
 * Mirrors an annotation's anchor onto the side density ended up on, so a
 * caption stays with the cluster it refers to instead of pointing at an empty
 * gutter. Anchors are authored for one side and reflected for the other.
 */
export function alignToDensitySide(
  anchor: { x: number; y: number },
  side: 'left' | 'right' | 'none',
): { x: number; y: number } {
  if (side === 'none') return anchor;
  const alreadyRight = anchor.x > 0.5;
  return alreadyRight === (side === 'right')
    ? anchor
    : { x: 1 - anchor.x, y: anchor.y };
}

/**
 * Whether a point falls under the copy: 1 anywhere inside the rect, easing to
 * 0 across a feather band just outside it.
 *
 * The band is an absolute share of the stage, not a share of the rect, so it
 * stays a narrow fade whether the copy occupies a column on a desktop frame or
 * most of a phone one.
 */
function quietWeight(
  x: number,
  y: number,
  quiet: PulseRect,
  feather: number,
): number {
  if (quiet.w <= 0 || quiet.h <= 0) return 0;

  const outX = Math.max(quiet.x - x, x - (quiet.x + quiet.w), 0);
  const outY = Math.max(quiet.y - y, y - (quiet.y + quiet.h), 0);

  return (
    (1 - smoothstep(0, feather, outX)) * (1 - smoothstep(0, feather, outY))
  );
}

/**
 * How settled a particle is given a left-to-right wave front. 0 is still
 * chaos (ahead of the front), 1 is idle (behind it).
 */
function waveSettle(x: number, front: number, feather: number): number {
  return 1 - smoothstep(front - feather, front + feather * 0.2, x);
}

export interface PulseFieldProps {
  /** 1-9. Selects the row of `PULSE_STEPS` that drives everything. */
  step: number;
  /** Overrides the step's own intensity. Mostly for the review harness. */
  intensity?: PulseIntensity;
  /**
   * Cluster centre as a fraction of the stage — typically the focused
   * field's position. Falls back to the step's own anchor.
   */
  clusterAnchor?: { x: number; y: number } | null;
  /**
   * The copy column's footprint, in stage fractions. Density moves out of it
   * and dims inside it, so type stays legible without a card behind it.
   */
  quietZone?: PulseRect | null;
  /** Band id (`'21-25'`). Scales cluster density and reach. */
  debtAmount?: string;
  /** Type id (`'credit-card'`). Ticks the matched types brighter. */
  debtType?: string;
  /** Hard cap for the review harness; production leaves this alone. */
  particleCap?: number;
  /**
   * Intro settle front, 0 (full chaos) to 1 (indistinguishable from idle).
   * Ignored unless intensity is `chaos`. A MotionValue is preferred so the
   * intro timeline can drive the field without a React render per frame.
   */
  wave?: MotionValue<number> | number;
  onStats?: (stats: PulseFieldStats) => void;
  className?: string;
  palette?: PulsePalette;
}

/* ---------------------------- component ---------------------------- */

export function PulseField({
  step,
  intensity,
  clusterAnchor = null,
  quietZone = null,
  debtAmount = '',
  debtType = '',
  particleCap,
  wave,
  onStats,
  className,
  palette = PULSE_PALETTE,
}: PulseFieldProps) {
  const uid = useId().replace(/:/g, '');
  const reduceMotion = useReducedMotion() ?? false;
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState({ w: 0, h: 0 });

  const activeStep = clamp(Math.round(step), 1, 9);
  const state = PULSE_STEPS[activeStep];
  const activeIntensity = intensity ?? state.intensity;

  const {
    timing,
    cluster,
    band,
    orbit,
    pulse,
    energy,
    settle,
    merge,
    chaos,
    dot,
    drift,
    parallax,
    halo: haloCfg,
    quiet: quietCfg,
  } = PULSE_CONFIG;

  const inChaos = activeIntensity === 'chaos';

  /* ----------------------------- measure ----------------------------- */

  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const measure = (w: number, h: number) => {
      setStage((current) =>
        Math.abs(current.w - w) < 1 && Math.abs(current.h - h) < 1
          ? current
          : { w, h },
      );
    };

    const rect = node.getBoundingClientRect();
    measure(rect.width, rect.height);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      measure(width, height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const idleCount = useMemo(
    () => resolveParticleCount(stage.w, stage.h, particleCap),
    [stage.w, stage.h, particleCap],
  );
  const count = inChaos ? resolveChaosCount(idleCount, stage.w) : idleCount;

  /**
   * Rebuilt only when the count changes, and always from the same seed, so
   * a resize re-densifies the field instead of reshuffling it.
   */
  const particles = useMemo(() => buildParticles(count, 7), [count]);

  /* -------------------------- animated inputs -------------------------- */

  const clustered =
    activeIntensity !== 'idle' &&
    activeIntensity !== 'energy' &&
    activeIntensity !== 'chaos';

  const clusterBlend = useMotionValue(clustered ? 1 : 0);
  const shareLevel = useMotionValue(0);
  const radiusLevel = useMotionValue(1);
  const orbitT = useMotionValue(0);
  const pulseT = useMotionValue(0);
  const energyT = useMotionValue(0);
  const calmT = useMotionValue(0);
  const mergeT = useMotionValue(0);
  /** Only used under reduced motion, where transitions are a cross-fade. */
  const fade = useMotionValue(1);

  /**
   * A focus anchor wins outright: it is already placed beside the control it
   * belongs to. Failing that, the step's own anchor is moved clear of the copy.
   */
  const targetAnchor = useMemo(
    () => clusterAnchor ?? displaceAnchor(state.anchor, quietZone),
    [clusterAnchor, state.anchor, quietZone],
  );

  const anchorX = useSpring(targetAnchor.x, timing.anchor);
  const anchorY = useSpring(targetAnchor.y, timing.anchor);

  const bandWeight = DEBT_BAND_WEIGHT[debtAmount.trim().toLowerCase()] ?? 0.5;
  const typeMatch =
    activeStep >= 2 ? DEBT_TYPE_MATCH[debtType.trim().toLowerCase()] ?? 0 : 0;

  const shareTarget =
    state.share * lerp(band.shareMin, band.shareMax, bandWeight);
  const radiusTarget = lerp(band.radiusMin, band.radiusMax, bandWeight);

  useEffect(() => {
    anchorX.set(targetAnchor.x);
    anchorY.set(targetAnchor.y);
  }, [anchorX, anchorY, targetAnchor]);

  /**
   * Under reduced motion nothing travels between arrangements: the field
   * fades down, the new arrangement is set at the midpoint, and it fades
   * back up. Opacity only, 200ms, exactly as the conversion safeguard asks.
   */
  useEffect(() => {
    if (!reduceMotion) {
      fade.set(1);
      return;
    }
    const half = (timing.crossFade / 2) * 1000;
    const controls = animate(fade, [1, 0, 1], {
      duration: timing.crossFade,
      times: [0, 0.5, 1],
      ease: 'linear',
    });
    const swap = window.setTimeout(() => {
      clusterBlend.set(clustered ? 1 : 0);
      shareLevel.set(shareTarget);
      radiusLevel.set(radiusTarget);
      mergeT.set(activeIntensity === 'merge' ? 1 : 0);
      calmT.set(
        activeIntensity === 'settle' || activeIntensity === 'merge' ? 1 : 0,
      );
      orbitT.set(0);
      pulseT.set(0);
      energyT.set(0);
    }, half);

    return () => {
      controls.stop();
      window.clearTimeout(swap);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, activeStep, activeIntensity, shareTarget, radiusTarget]);

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(clusterBlend, clustered ? 1 : 0, timing.cluster);
    return () => controls.stop();
  }, [clusterBlend, clustered, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(shareLevel, shareTarget, timing.cluster);
    return () => controls.stop();
  }, [shareLevel, shareTarget, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(radiusLevel, radiusTarget, timing.cluster);
    return () => controls.stop();
  }, [radiusLevel, radiusTarget, reduceMotion]);

  /* One pass round the ellipse on entering step 4, then back to ambient. */
  useEffect(() => {
    if (reduceMotion || activeIntensity !== 'orbit') {
      orbitT.set(0);
      return;
    }
    orbitT.set(0);
    const controls = animate(orbitT, 1, timing.orbit);
    return () => controls.stop();
  }, [orbitT, activeIntensity, activeStep, reduceMotion]);

  /* Hero moment #1. */
  useEffect(() => {
    if (reduceMotion || activeIntensity !== 'pulse') {
      pulseT.set(0);
      return;
    }
    pulseT.set(0);
    const controls = animate(pulseT, 1, timing.pulse);
    return () => controls.stop();
  }, [pulseT, activeIntensity, activeStep, reduceMotion]);

  /* Hero moment #2: rise, hold, ease back. */
  useEffect(() => {
    if (reduceMotion || activeIntensity !== 'energy') {
      energyT.set(0);
      return;
    }
    energyT.set(0);
    const controls = animate(energyT, [0, 1, 1, 0], {
      duration: timing.energy.duration,
      times: timing.energy.times as unknown as number[],
      ease: 'easeInOut',
    });
    return () => controls.stop();
  }, [energyT, activeIntensity, activeStep, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const calm =
      activeIntensity === 'settle' || activeIntensity === 'merge' ? 1 : 0;
    const controls = animate(calmT, calm, timing.settle);
    return () => controls.stop();
  }, [calmT, activeIntensity, reduceMotion]);

  /* Hero moment #3, and the longest transition in the flow. */
  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(
      mergeT,
      activeIntensity === 'merge' ? 1 : 0,
      timing.merge,
    );
    return () => controls.stop();
  }, [mergeT, activeIntensity, reduceMotion]);

  /* ----------------------------- parallax ----------------------------- */

  const pointerX = useSpring(0, parallax.spring);
  const pointerY = useSpring(0, parallax.spring);
  const magnetic = finePointer && !reduceMotion;

  useEffect(() => {
    if (!magnetic) {
      pointerX.set(0);
      pointerY.set(0);
      return;
    }
    const onMove = (event: PointerEvent) => {
      const node = stageRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        pointerX.set(0);
        pointerY.set(0);
        return;
      }
      pointerX.set(clamp((event.clientX - rect.left) / rect.width, 0, 1) - 0.5);
      pointerY.set(clamp((event.clientY - rect.top) / rect.height, 0, 1) - 0.5);
    };
    const onLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [magnetic, pointerX, pointerY]);

  /* ---------------------------- canvas sizing ---------------------------- */

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stage.w <= 0 || stage.h <= 0) return;
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      PULSE_CONFIG.particles.dprCap,
    );
    canvas.width = Math.round(stage.w * dpr);
    canvas.height = Math.round(stage.h * dpr);
    const ctx = canvas.getContext('2d');
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [stage.w, stage.h]);

  /* ------------------------------- stats ------------------------------- */

  const statsRef = useRef(onStats);
  statsRef.current = onStats;
  const frameTimes = useRef({ frames: 0, since: 0, fps: 0 });

  /* ---------------------------- per-frame draw ---------------------------- */

  const accentRgb = useMemo(() => toRgb(palette.accent), [palette.accent]);
  const deepRgb = useMemo(() => toRgb(palette.accentDeep), [palette.accentDeep]);

  /* One sprite, in the base accent. During the hero beats the dot cores
     shift to the deeper blue while their halos stay accent — at halo
     opacities the difference is invisible, and it saves a second sprite. */
  const halo = useMemo(
    () => buildHaloSprite(accentRgb, PULSE_CONFIG.halo.sprite),
    [accentRgb],
  );

  useAnimationFrame((timeMs, deltaMs) => {
    const canvas = canvasRef.current;
    if (!canvas || stage.w <= 0 || stage.h <= 0 || particles.length === 0) return;
    if (document.hidden) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* A tab returning from the background hands us a huge delta; clamping
       stops the field from teleporting on the first frame back. */
    const dt = Math.min(deltaMs, 48) / 1000;
    const seconds = timeMs / 1000;
    const { w, h } = stage;
    const minDim = Math.min(w, h);

    const blendNow = clusterBlend.get();
    const shareNow = shareLevel.get();
    const radiusNow = radiusLevel.get();
    const orbitNow = orbitT.get();
    const pulseNow = pulseT.get();
    const energyNow = energyT.get();
    const calmNow = calmT.get();
    const mergeNow = mergeT.get();
    const fadeNow = fade.get();
    const waveNow = inChaos ? readUnit(wave) : 1;

    const speedScale =
      (reduceMotion ? timing.reducedDrift : 1) *
      (1 + energyNow * energy.speedGain) *
      (1 - calmNow * settle.slow);

    /* The wash covers everything the wave has not yet passed, so the
       denser ground recedes with the front rather than fading globally. */
    const wash = washRef.current;
    if (wash) {
      wash.style.opacity = inChaos ? '1' : '0';
      wash.style.clipPath = `inset(0 0 0 ${(waveNow * 100).toFixed(2)}%)`;
    }
    const front = frontRef.current;
    if (front) {
      const showFront = inChaos && waveNow > 0 && waveNow < 1;
      front.style.opacity = showFront ? '1' : '0';
      front.style.left = `${(waveNow * 100).toFixed(2)}%`;
    }

    /* Cluster geometry for this frame. */
    const clusterRadius = state.radius * radiusNow * minDim;
    const ringOffset = Math.sin(Math.PI * pulseNow) * pulse.amp;
    const tightened = 1 - mergeNow * merge.tighten;
    const tilt = (state.tilt * Math.PI) / 180;
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);
    const groupOffset = clusterRadius * cluster.groupSpread * (1 - mergeNow);

    const cx = anchorX.get() * w;
    const cy = anchorY.get() * h;

    const parallaxX = pointerX.get() * parallax.strength;
    const parallaxY = pointerY.get() * parallax.strength;

    /* The arc on step 4 sweeps once around a shared ellipse; its own
       envelope rises and dissolves so it never has to be released. */
    const orbitEnvelope = orbitNow > 0 ? Math.sin(Math.PI * orbitNow) : 0;
    const orbitRx = clusterRadius * orbit.rx;
    const orbitRy = clusterRadius * orbit.ry;

    ctx.clearRect(0, 0, w, h);

    const [ar, ag, ab] = accentRgb;
    const [dr, dg, db] = deepRgb;
    const deepMix = Math.max(mergeNow * merge.deepen, pulseNow > 0 ? 0.5 : 0);
    const r = Math.round(lerp(ar, dr, deepMix));
    const g = Math.round(lerp(ag, dg, deepMix));
    const b = Math.round(lerp(ab, db, deepMix));

    for (let index = 0; index < particles.length; index += 1) {
      const p = particles[index];
      const settled = inChaos
        ? waveSettle(p.bx, waveNow, chaos.waveFeather)
        : 1;
      const chaosAmt = 1 - settled;
      const pSpeed = speedScale * lerp(1, chaos.speedGain, chaosAmt);

      /* ---- ambient: always running, whatever else is happening ---- */
      p.bx += p.vx * dt * pSpeed;
      p.by += p.vy * dt * pSpeed;

      const margin = drift.margin;
      if (p.bx < -margin) p.bx += 1 + margin * 2;
      if (p.bx > 1 + margin) p.bx -= 1 + margin * 2;
      if (p.by < -margin) p.by += 1 + margin * 2;
      if (p.by > 1 + margin) p.by -= 1 + margin * 2;

      const wobble =
        (reduceMotion ? 0 : drift.wobble * minDim) *
        lerp(1, chaos.wobbleGain, chaosAmt);
      const ambientX =
        p.bx * w +
        Math.sin(seconds * p.wobbleFx * TAU + p.wobblePx) * wobble +
        parallaxX * p.depth;
      const ambientY =
        p.by * h +
        Math.cos(seconds * p.wobbleFy * TAU + p.wobblePy) * wobble +
        parallaxY * p.depth;

      /* ---- how much of this particle belongs to the named behaviour ---- */
      const gate = clamp(
        (shareNow - p.shareRank) / cluster.shareSoftness,
        0,
        1,
      );
      const arrival = easeOutCubic(
        clamp(
          (blendNow - p.lag * cluster.stagger) / (1 - cluster.stagger),
          0,
          1,
        ),
      );
      const pull = arrival * gate;

      let x = ambientX;
      let y = ambientY;

      if (pull > 0.001) {
        /* Polar seat inside its own lobe, squashed and tilted per step. */
        const angle = p.angle + (reduceMotion ? 0 : seconds * p.spin);
        const seatWobble = reduceMotion
          ? 0
          : Math.sin(seconds * p.wobbleFx * TAU + p.wobblePy) *
            cluster.seatDrift;
        const reach =
          clusterRadius * tightened * (p.seat + seatWobble) * (1 + ringOffset);

        const localX = Math.cos(angle) * reach;
        const localY = Math.sin(angle) * reach * state.squash;

        const side = p.group === 0 ? -1 : 1;
        const clusterX =
          cx +
          localX * cosTilt -
          localY * sinTilt +
          side * groupOffset * cluster.groupSkewX;
        const clusterY =
          cy +
          localX * sinTilt +
          localY * cosTilt -
          side * groupOffset * cluster.groupSkewY;

        x = lerp(ambientX, clusterX, pull);
        y = lerp(ambientY, clusterY, pull);
      }

      /* ---- step 4's arc, layered over whatever the cluster is doing ---- */
      if (orbitEnvelope > 0.001 && p.shareRank < orbit.share) {
        const along =
          -Math.PI / 2 + orbitNow * TAU + p.pathT * orbit.arcSpan * TAU;
        const orbitX = cx + Math.cos(along) * orbitRx;
        const orbitY = cy + Math.sin(along) * orbitRy;
        x = lerp(x, orbitX, orbitEnvelope);
        y = lerp(y, orbitY, orbitEnvelope);
      }

      /* ---- paint ---- */
      if (!p.drawn) {
        p.lastX = x;
        p.lastY = y;
        p.drawn = true;
      }

      /*
       * The copy sits on the field with nothing between them, so the field
       * gives way where the type is. Dimming rather than excluding: the
       * particles still cross the copy, they just stop competing with it.
       */
      const quietFade = quietZone
        ? 1 -
          quietCfg.dim *
            quietWeight(x / w, y / h, quietZone, quietCfg.feather)
        : 1;

      const overflowFade =
        inChaos && index >= idleCount ? settled : 1;

      const alpha =
        clamp(
          p.alpha *
            (1 + pull * cluster.lift) *
            (1 + energyNow * energy.brightGain) *
            (1 + typeMatch * band.typeLift * pull),
          0,
          1,
        ) *
        fadeNow *
        quietFade *
        overflowFade;

      const size = p.size * (1 + energyNow * energy.sizeGain) * (1 + chaosAmt * chaos.sizeGain);

      /* Halo first, so the crisp core lands on top of its own glow. */
      if (p.depth >= haloCfg.depthThreshold) {
        const spread = size * haloCfg.scale;
        ctx.globalAlpha = alpha * haloCfg.alpha;
        ctx.drawImage(halo, x - spread, y - spread, spread * 2, spread * 2);
      }

      ctx.globalAlpha = alpha;

      const flicker =
        0.55 +
        0.45 * Math.sin(seconds * chaos.flickerHz * TAU + p.wobblePx);
      const showGlyph =
        inChaos &&
        p.glyph != null &&
        chaosAmt > 0.18 &&
        flicker > 0.38;

      if (showGlyph && p.glyph) {
        const glyphSize = lerp(chaos.glyphMin, chaos.glyphMax, p.depth);
        ctx.fillStyle = `rgb(${r} ${g} ${b})`;
        ctx.font = `${glyphSize.toFixed(1)}px "Work Sans", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.glyph, x, y);
      } else if (p.segment) {
        /* Streak along actual travel, so speed is visible rather than
           implied. Static particles fall back to their drift heading. */
        let dx = x - p.lastX;
        let dy = y - p.lastY;
        const travel = Math.hypot(dx, dy);
        if (travel < 0.01) {
          dx = p.vx;
          dy = p.vy;
        }
        const heading = Math.atan2(dy, dx);
        const length = clamp(
          travel * dot.segmentGain,
          dot.segmentMin,
          dot.segmentMax,
        );
        ctx.strokeStyle = `rgb(${r} ${g} ${b})`;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(heading) * length, y - Math.sin(heading) * length);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgb(${r} ${g} ${b})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, TAU);
        ctx.fill();
      }

      p.lastX = x;
      p.lastY = y;
    }

    ctx.globalAlpha = 1;

    /* ------------------------------ stats ------------------------------ */
    const report = statsRef.current;
    if (report) {
      const meter = frameTimes.current;
      meter.frames += 1;
      if (timeMs - meter.since >= PULSE_CONFIG.stats.intervalMs) {
        meter.fps = Math.round(
          (meter.frames * 1000) / Math.max(1, timeMs - meter.since),
        );
        meter.frames = 0;
        meter.since = timeMs;
        report({
          particles: particles.length,
          intensity: activeIntensity,
          fps: meter.fps,
          reducedMotion: reduceMotion,
          wave: inChaos ? waveNow : 1,
        });
      }
    }
  });

  /* ------------------------------- render ------------------------------- */

  /* The OTP ring is a discrete one-off, so it is SVG rather than canvas —
     a single crisp stroke beats a thousand dots trying to form a circle. */
  const ringCx = useTransform(anchorX, (v) => v * stage.w);
  const ringCy = useTransform(anchorY, (v) => v * stage.h);
  const ringBase = state.radius * Math.min(stage.w, stage.h);

  const ringOne = useTransform(pulseT, (t) =>
    ringBase * lerp(pulse.ringFrom, pulse.ringTo, t),
  );
  const ringOneOpacity = useTransform(pulseT, (t) =>
    t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) * pulse.ringOpacity,
  );
  const ringTwo = useTransform(pulseT, (t) => {
    const trailing = clamp((t - pulse.ringDelay) / (1 - pulse.ringDelay), 0, 1);
    return ringBase * lerp(pulse.ringFrom, pulse.ringTo, trailing);
  });
  const ringTwoOpacity = useTransform(pulseT, (t) => {
    const trailing = clamp((t - pulse.ringDelay) / (1 - pulse.ringDelay), 0, 1);
    return trailing <= 0 || trailing >= 1
      ? 0
      : Math.sin(Math.PI * trailing) * pulse.ringOpacity * 0.6;
  });

  /* The cluster sits in a faint wash of its own, so density reads as light
     gathering rather than as dots piling up. */
  const glowX = useTransform(anchorX, (v) => `${(v * 100).toFixed(2)}%`);
  const glowY = useTransform(anchorY, (v) => `${(v * 100).toFixed(2)}%`);
  const glowOpacity = useTransform(
    [clusterBlend, energyT, fade],
    ([blend, lift, opacity]: number[]) =>
      (blend * 0.7 + lift * 0.5) * opacity,
  );
  const glowScale = useTransform(
    [radiusLevel, energyT],
    ([reach, lift]: number[]) => reach * (1 + lift * 0.3),
  );

  return (
    <div
      ref={stageRef}
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      style={paletteToCssVars(palette)}
      data-motion={reduceMotion ? 'off' : 'on'}
      aria-hidden="true"
    >
      <motion.div
        className={styles.glow}
        style={{
          left: glowX,
          top: glowY,
          opacity: glowOpacity,
          scale: glowScale,
          /* Sized in the same unit as the cluster radius, not as a share of
             the stage width, so the wash tracks the density it belongs to
             instead of stretching on a wide frame. */
          width: `${state.radius * Math.min(stage.w, stage.h) * 5.2}px`,
        }}
      />

      <div
        ref={washRef}
        className={styles.wash}
        style={{
          background: `linear-gradient(180deg, ${chaos.base}, ${chaos.base})`,
          opacity: 0,
        }}
      />
      <div
        ref={frontRef}
        className={styles.front}
        style={{ background: chaos.front, opacity: 0 }}
      />

      <canvas ref={canvasRef} className={styles.canvas} />

      {stage.w > 0 ? (
        <svg
          className={styles.rings}
          viewBox={`0 0 ${Math.max(stage.w, 1)} ${Math.max(stage.h, 1)}`}
          focusable="false"
        >
          <defs>
            <radialGradient id={`${uid}-ring`}>
              <stop offset="70%" stopColor={palette.accentDeep} stopOpacity="0" />
              <stop offset="100%" stopColor={palette.accentDeep} stopOpacity="1" />
            </radialGradient>
          </defs>
          <motion.circle
            cx={ringCx}
            cy={ringCy}
            r={ringOne}
            style={{ opacity: ringOneOpacity }}
            fill="none"
            stroke={palette.accentDeep}
            strokeWidth={pulse.ringWidth}
          />
          <motion.circle
            cx={ringCx}
            cy={ringCy}
            r={ringTwo}
            style={{ opacity: ringTwoOpacity }}
            fill="none"
            stroke={palette.accent}
            strokeWidth={pulse.ringWidth}
          />
        </svg>
      ) : null}
    </div>
  );
}
