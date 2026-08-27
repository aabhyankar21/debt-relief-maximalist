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
} from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import { traceMetaballs, type Lobe } from './metaball';
import styles from './morphScene.module.css';

/* ------------------------------------------------------------------ *
 * Config
 *
 * Nothing below this block contains a colour, a size or a duration.
 * Palette values are also emitted as `--ms-*` custom properties so the
 * CSS module reads from the same source. Tune the look here without
 * touching a line of animation logic.
 * ------------------------------------------------------------------ */

export interface MorphPalette {
  /** Near-white ground the mesh gradient sits on. */
  base: string;
  indigo: string;
  coral: string;
  mint: string;
  /** Blob body over the gradient. */
  glass: string;
  /** Specular highlight and sweep. */
  highlight: string;
  rim: string;
  /** Darker edge on the side away from the light — what sells the glass. */
  rimShade: string;
  /** Tinted by debt type; hue-rotated, never swapped. */
  tint: string;
  accent: string;
  track: string;
  /** Contact shadow, so the blob sits on the gradient rather than in it. */
  shadow: string;
}

export const MORPH_PALETTE: MorphPalette = {
  base: '#f7f6f4',
  indigo: '#5b6ee8',
  coral: '#ff8a65',
  mint: '#c9f0dc',
  /**
   * Deliberately lighter than a frosted panel would be. The blob's body
   * comes mostly from saturating and lifting what is behind it, not from
   * painting white over it — that is the difference between glass and milk.
   */
  glass: 'rgb(255 255 255 / 28%)',
  highlight: 'rgb(255 255 255 / 92%)',
  rim: 'rgb(255 255 255 / 78%)',
  rimShade: 'rgb(86 80 112 / 22%)',
  tint: '#7d8ce6',
  accent: '#ff8a65',
  track: 'rgb(120 116 130 / 20%)',
  shadow: 'rgb(74 68 100 / 26%)',
};

export const MORPH_CONFIG = {
  /**
   * All blob geometry lives inside a square "field box" measured in px, so
   * one number scales the whole composition and the backdrop filter stays
   * bounded to a region rather than the whole viewport.
   */
  box: {
    /**
     * Wider than it is tall: what the blob needs room for is the step-7
     * stretch and the step-8 pair, both lateral. Every fraction below is
     * measured against the box's height, which is the `size` the component
     * computes, so one number scales the whole composition.
     */
    widthRatio: 1.36,
    factor: 0.99,
    heightFactor: 0.98,
    /** Portrait may overflow a little sideways to keep the blob present. */
    portraitFactor: 1.1,
    portraitHeightFactor: 0.6,
    /** Stage aspect ratio below which the layout counts as portrait. */
    portraitAspect: 0.85,
    min: 190,
    max: 900,
    /**
     * Centre of the box as a share of stage height. The form card is pinned
     * to the bottom of the stage at every breakpoint, so the blob sits high
     * and owns the space above it.
     */
    centerY: 0.43,
    portraitCenterY: 0.3,
  },

  /**
   * `iso` is the goo dial. Lower values pull each lobe's influence in
   * tighter, which is what keeps the two blobs at step 8 visibly separate
   * while still letting them fuse cleanly at step 9.
   */
  field: { iso: 0.25, cells: 52, smoothPoints: 56 },

  blob: {
    lobes: 3,
    /**
     * Surface radius of a single lobe, as a share of the box height. Sized
     * so the blob's silhouette crosses the form card's edges rather than
     * hiding entirely behind it — the card is meant to float on the blob,
     * not cover it.
     */
    radius: 0.205,
    /**
     * How far lobes sit from the blob's centre. Around two thirds of the
     * radius is the sweet spot: enough that the silhouette has lobed
     * character, not so much that it stops reading as one mass.
     */
    spread: 0.125,
    /** Slow wander of the blob as a whole. */
    wander: 0.016,
    /** Per-lobe pseudo-random drift. */
    drift: 0.013,
    /** Per-lobe radius breathing, as a fraction of the radius. */
    breath: 0.08,
    /** Lateral scale of the finished outline at full stretch. */
    stretchGain: 0.55,
    /** ...and the matching vertical squash, as glass would conserve volume. */
    stretchSquash: 0.14,
    /**
     * Lobes converge as the blob elongates. Without this the concavity
     * between two lobes gets stretched too and reads as a pinched waist;
     * with it the blob smooths out as it pulls, the way a liquid drop does.
     */
    stretchSmooth: 0.58,
    /** Lobes converge as the blob tightens. */
    tightenSpread: 0.5,
    /** ...and gain radius, so tightening reads as solid rather than small. */
    tightenRadius: 0.14,
    seed: 11,
  },

  secondary: {
    lobes: 2,
    /** Radius relative to the primary's lobes. */
    scale: 0.58,
    /**
     * Far enough apart that the field cannot bridge them — "beside, not
     * merged yet" has to survive the goo, not fight it.
     */
    beside: { x: 0.56, y: 0.06 },
    /** ...and close enough that step 9 fuses without being asked to. */
    merged: { x: 0.135, y: 0.03 },
    /** The pair drifts left as it arrives, so the composition stays centred. */
    recenter: -0.16,
    /** How much of that offset is given back once the two become one. */
    recenterOnMerge: 0.6,
    /** Extra distance while the second blob is still arriving. */
    entryDrift: 0.06,
    seed: 29,
  },

  attention: {
    /** Lean toward the form card when a field takes focus. */
    lean: 0.028,
    quiver: 0.007,
    quiverHz: 1.4,
    /** How far the specular highlight follows the pointer. */
    pointerPull: 0.13,
  },

  /** Resting position of the inner highlight, offset toward one edge. */
  highlight: { x: 0.36, y: 0.27 },

  ring: {
    /**
     * Radius as a share of the box height, at rest. Wider than the form
     * card, so the arc stays readable outside it.
     */
    radius: 0.38,
    width: 2,
    /** Degrees per second the arc creeps around the blob. */
    orbit: 2.2,
    /**
     * The arc stretches with the blob rather than staying a circle, so it
     * stays clear of the silhouette in every state. The dash maths still
     * runs on the untransformed circle, so progress stays exact.
     */
    stretchX: 0.45,
    stretchY: 0.1,
  },

  glass: { blur: 16, blurTight: 6 },

  timing: {
    /** Springs, not easing — liquid motion has to read as physical. */
    morph: { type: 'spring', stiffness: 120, damping: 14, mass: 0.9 },
    settle: { type: 'spring', stiffness: 90, damping: 18, mass: 1 },
    /** The step-9 merge, deliberately the slowest move in the flow. */
    merge: { type: 'spring', stiffness: 26, damping: 13, mass: 1.15 },
    attention: { type: 'spring', stiffness: 150, damping: 15, mass: 0.6 },
    sweep: 0.72,
    mesh: 1.8,
    ring: { type: 'spring', stiffness: 90, damping: 22, mass: 0.8 },
    /** Reduced motion keeps step morphs but halves them. */
    reduced: 0.22,
  },
} as const;

/* ------------------------------------------------------------------ *
 * Per-step reactions
 * ------------------------------------------------------------------ */

export type SecondaryState = 'hidden' | 'beside' | 'merged';

export interface MorphStepState {
  /** Baseline size, multiplied by the debt band's own scale. */
  scale: number;
  /** Lateral elongation, 0-1. */
  stretch: number;
  /** Rounder, more opaque, less blurred — the "locked in" read. */
  tighten: number;
  secondary: SecondaryState;
  /** Runs one specular sweep on entering the step. */
  sweep: boolean;
  /** Mesh gradient temperature, 0 neutral to 1 warm. */
  warmth: number;
  /** Mesh gradient brightness multiplier. */
  brightness: number;
}

/**
 * The whole per-step behaviour table in one place. Step 7 owns the largest
 * single reaction and step 9 the only combination moment; everything else is
 * deliberately small so those two land.
 */
export const MORPH_STEPS: Record<number, MorphStepState> = {
  1: { scale: 1, stretch: 0, tighten: 0, secondary: 'hidden', sweep: false, warmth: 0, brightness: 1 },
  2: { scale: 1.02, stretch: 0.03, tighten: 0, secondary: 'hidden', sweep: false, warmth: 0, brightness: 1 },
  3: { scale: 1.03, stretch: 0.05, tighten: 0, secondary: 'hidden', sweep: false, warmth: 0, brightness: 1 },
  4: { scale: 1.04, stretch: 0.06, tighten: 0, secondary: 'hidden', sweep: false, warmth: 0.62, brightness: 1.01 },
  5: { scale: 1.05, stretch: 0.08, tighten: 0, secondary: 'hidden', sweep: false, warmth: 0.62, brightness: 1.01 },
  6: { scale: 1, stretch: 0, tighten: 1, secondary: 'hidden', sweep: true, warmth: 0.58, brightness: 1.02 },
  7: { scale: 1.13, stretch: 0.72, tighten: 0, secondary: 'hidden', sweep: false, warmth: 0.54, brightness: 1.1 },
  8: { scale: 1.06, stretch: 0.18, tighten: 0, secondary: 'beside', sweep: false, warmth: 0.5, brightness: 1.06 },
  9: { scale: 1.1, stretch: 0.1, tighten: 0.25, secondary: 'merged', sweep: false, warmth: 0.46, brightness: 1.08 },
};

/** Step 1 sizes the blob to the band and keeps that size as the baseline. */
const DEBT_BAND_SCALE: Record<string, number> = {
  '16-20': 0.84,
  '21-25': 0.92,
  '26-30': 1,
  '31-35': 1.09,
  '35-plus': 1.18,
};

/** A tint rotation, not a colour swap — it stays the same material. */
const DEBT_TYPE_HUE: Record<string, number> = {
  'personal-loans': -18,
  'credit-card': 15,
  medical: 6,
  student: -9,
};

export const DEBT_AMOUNT_OPTIONS = Object.keys(DEBT_BAND_SCALE);
export const DEBT_TYPE_OPTIONS = Object.keys(DEBT_TYPE_HUE);

/** Radial washes making up the mesh gradient. Percentages of the stage. */
interface MeshLayer {
  hue: 'indigo' | 'coral' | 'mint';
  x: number;
  y: number;
  size: number;
  opacity: number;
  /** Seconds for one drift loop. */
  duration: number;
  dx: number;
  dy: number;
}

const MESH: MeshLayer[] = [
  { hue: 'indigo', x: 16, y: 22, size: 82, opacity: 0.56, duration: 76, dx: 7, dy: -5 },
  { hue: 'coral', x: 84, y: 16, size: 70, opacity: 0.46, duration: 88, dx: -8, dy: 6 },
  { hue: 'mint', x: 70, y: 84, size: 88, opacity: 0.5, duration: 64, dx: 5, dy: -7 },
  { hue: 'indigo', x: 6, y: 90, size: 62, opacity: 0.34, duration: 81, dx: 9, dy: -4 },
  /* The centre wash exists so the blob has something to refract: over a
     flat near-white ground the glass has nothing to work with. */
  { hue: 'coral', x: 44, y: 54, size: 56, opacity: 0.3, duration: 69, dx: -6, dy: -8 },
];

/* ------------------------------------------------------------------ *
 * Utilities
 * ------------------------------------------------------------------ */

const TAU = Math.PI * 2;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
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

function paletteToCssVars(palette: MorphPalette): CSSProperties {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) {
    vars[`--ms-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  }
  return vars as CSSProperties;
}

/* ------------------------------ lobes ------------------------------ */

interface LobeSeed {
  /** Resting angle around the blob's centre. */
  angle: number;
  radiusScale: number;
  /** Radians per second the lobe creeps around the centre. */
  spin: number;
  driftFx: number;
  driftPx: number;
  driftFy: number;
  driftPy: number;
  breathF: number;
  breathP: number;
}

/**
 * Each lobe breathes and wanders on its own slow cycle. Summed through the
 * metaball field they read as one mass under slight internal pressure
 * rather than a set of independent circles.
 */
function buildSeeds(count: number, seed: number): LobeSeed[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, index) => ({
    angle: (index / count) * TAU + random() * 0.6,
    radiusScale: 0.8 + random() * 0.42,
    spin: (0.04 + random() * 0.06) * (random() > 0.5 ? 1 : -1),
    driftFx: 0.24 + random() * 0.2,
    driftPx: random() * TAU,
    driftFy: 0.24 + random() * 0.2,
    driftPy: random() * TAU,
    breathF: 0.26 + random() * 0.22,
    breathP: random() * TAU,
  }));
}

/* ------------------------------ props ------------------------------ */

export interface MorphSceneProps {
  /** 1-9. Drives the whole reaction table above. */
  step: number;
  /** Band id (`'21-25'`). Sets the blob's baseline size. */
  debtAmount?: string;
  /** Type id (`'credit-card'`). Rotates the blob's tint. */
  debtType?: string;
  /** Step id of the field holding focus, or null when idle. */
  focusedField?: string | null;
  /** Defaults to the step's share of nine. */
  progressPercent?: number;
  /** Shows the plain linear bar alongside the arc. */
  linearFallback?: boolean;
  className?: string;
  palette?: MorphPalette;
}

/* ---------------------------- component ---------------------------- */

export function MorphScene({
  step,
  debtAmount = '',
  debtType = '',
  focusedField = null,
  progressPercent,
  linearFallback = false,
  className,
  palette = MORPH_PALETTE,
}: MorphSceneProps) {
  const uid = useId().replace(/:/g, '');
  const reduceMotion = useReducedMotion() ?? false;
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  const stageRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  /* Every one of these is the same traced contour, drawn a different way. */
  const rimRef = useRef<SVGPathElement>(null);
  const edgeRef = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const shadowRef = useRef<SVGPathElement>(null);
  const ringRef = useRef<SVGGElement>(null);

  const [stage, setStage] = useState({ w: 0, h: 0 });

  const activeStep = clamp(Math.round(step), 1, 9);
  const state = MORPH_STEPS[activeStep];
  const progress = progressPercent ?? (activeStep / 9) * 100;

  /* ----------------------------- measure ----------------------------- */

  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const measure = (w: number, h: number) => {
      setStage((current) =>
        current.w === w && current.h === h ? current : { w, h },
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

  /**
   * `size` is the box's height and the unit every blob fraction is measured
   * in. It is whichever of the stage's two dimensions runs out first, so the
   * composition scales instead of needing a separate mobile layout.
   */
  const { size, centerRatio } = useMemo(() => {
    const { w, h } = stage;
    if (w <= 0 || h <= 0) return { size: 0, centerRatio: 0.5 };
    const { box } = MORPH_CONFIG;
    const portrait = w / h < box.portraitAspect;
    const byWidth =
      (w * (portrait ? box.portraitFactor : box.factor)) / box.widthRatio;
    const byHeight = h * (portrait ? box.portraitHeightFactor : box.heightFactor);
    return {
      size: clamp(Math.min(byWidth, byHeight), box.min, box.max),
      centerRatio: portrait ? box.portraitCenterY : box.centerY,
    };
  }, [stage]);

  const boxWidth = size * MORPH_CONFIG.box.widthRatio;

  const seeds = useMemo(
    () => ({
      primary: buildSeeds(MORPH_CONFIG.blob.lobes, MORPH_CONFIG.blob.seed),
      secondary: buildSeeds(
        MORPH_CONFIG.secondary.lobes,
        MORPH_CONFIG.secondary.seed,
      ),
    }),
    [],
  );

  /* -------------------------- animated inputs -------------------------- */

  const { timing } = MORPH_CONFIG;
  const reduced = { duration: timing.reduced, ease: EASE };

  const scale = useMotionValue(state.scale);
  const stretch = useMotionValue(state.stretch);
  const tighten = useMotionValue(state.tighten);
  const secondary = useMotionValue(state.secondary === 'hidden' ? 0 : 1);
  const merged = useMotionValue(state.secondary === 'merged' ? 1 : 0);
  const attention = useMotionValue(0);
  const hue = useMotionValue(0);
  const sweep = useMotionValue(0);

  const bandScale = DEBT_BAND_SCALE[debtAmount.trim().toLowerCase()] ?? 1;
  const scaleTarget = state.scale * bandScale;
  const hueTarget = activeStep >= 2 ? DEBT_TYPE_HUE[debtType.trim()] ?? 0 : 0;
  const secondaryTarget = state.secondary === 'hidden' ? 0 : 1;
  const mergedTarget = state.secondary === 'merged' ? 1 : 0;

  /* The size pulse is the spring's own overshoot: a low damping ratio makes
     the blob swell past its new size and settle back, which is exactly the
     brief the band change asks for. */
  useEffect(() => {
    const controls = animate(
      scale,
      scaleTarget,
      reduceMotion ? reduced : timing.morph,
    );
    return () => controls.stop();
  }, [scale, scaleTarget, reduceMotion]);

  useEffect(() => {
    const controls = animate(
      stretch,
      state.stretch,
      reduceMotion ? reduced : timing.settle,
    );
    return () => controls.stop();
  }, [stretch, state.stretch, reduceMotion]);

  useEffect(() => {
    const controls = animate(
      tighten,
      state.tighten,
      reduceMotion ? reduced : timing.morph,
    );
    return () => controls.stop();
  }, [tighten, state.tighten, reduceMotion]);

  useEffect(() => {
    const controls = animate(
      secondary,
      secondaryTarget,
      reduceMotion ? reduced : timing.settle,
    );
    return () => controls.stop();
  }, [secondary, secondaryTarget, reduceMotion]);

  useEffect(() => {
    const controls = animate(
      merged,
      mergedTarget,
      reduceMotion ? reduced : timing.merge,
    );
    return () => controls.stop();
  }, [merged, mergedTarget, reduceMotion]);

  useEffect(() => {
    const controls = animate(hue, hueTarget, reduceMotion ? reduced : timing.settle);
    return () => controls.stop();
  }, [hue, hueTarget, reduceMotion]);

  /* Ambient wobble is motion for its own sake, so it goes under reduced
     motion; the discrete step morphs above stay. */
  useEffect(() => {
    const target = reduceMotion ? 0 : focusedField ? 1 : 0;
    const controls = animate(attention, target, timing.attention);
    return () => controls.stop();
  }, [attention, focusedField, reduceMotion]);

  useEffect(() => {
    if (!state.sweep) {
      sweep.set(0);
      return;
    }
    sweep.set(0);
    const controls = animate(sweep, 1, {
      duration: reduceMotion ? timing.sweep / 2 : timing.sweep,
      ease: 'easeInOut',
    });
    return () => controls.stop();
  }, [sweep, state.sweep, activeStep, reduceMotion]);

  /* --------------------- pointer-following highlight --------------------- */

  const pointerX = useSpring(0, { stiffness: 60, damping: 20, mass: 0.7 });
  const pointerY = useSpring(0, { stiffness: 60, damping: 20, mass: 0.7 });
  const magnetic = finePointer && !reduceMotion;

  useEffect(() => {
    if (!magnetic) {
      pointerX.set(0);
      pointerY.set(0);
      return;
    }
    const node = stageRef.current;
    if (!node) return;

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerX.set(clamp((event.clientX - rect.left) / rect.width, 0, 1) - 0.5);
      pointerY.set(clamp((event.clientY - rect.top) / rect.height, 0, 1) - 0.5);
    };
    const onLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
    };
  }, [magnetic, pointerX, pointerY]);

  const { highlight, attention: attentionCfg, glass } = MORPH_CONFIG;

  const highlightX = useTransform(
    pointerX,
    (v) => `${((highlight.x + v * attentionCfg.pointerPull) * 100).toFixed(1)}%`,
  );
  const highlightY = useTransform(
    pointerY,
    (v) => `${((highlight.y + v * attentionCfg.pointerPull) * 100).toFixed(1)}%`,
  );

  /* The blob's body is the gradient behind it, blurred and pushed: heavy
     saturation is what makes the interior read as a different substance
     from the exterior when both are nearly white. */
  const backdrop = useTransform(
    tighten,
    (v) =>
      `blur(${lerp(glass.blur, glass.blurTight, v).toFixed(1)}px) saturate(${lerp(2.1, 2.5, v).toFixed(2)}) brightness(1.07) contrast(1.05)`,
  );
  const tintFilter = useTransform(hue, (v) => `hue-rotate(${v.toFixed(1)}deg)`);
  const sweepX = useTransform(sweep, [0, 1], ['-120%', '120%']);
  const sweepOpacity = useTransform(sweep, (v) =>
    v <= 0 || v >= 1 ? 0 : Math.sin(Math.PI * v) * 0.9,
  );

  /* ---------------------------- per-frame draw ---------------------------- */

  const signature = useRef('');

  useAnimationFrame((timeMs) => {
    const node = glassRef.current;
    if (!node || size <= 0) return;

    const seconds = reduceMotion ? 0 : timeMs / 1000;
    const s = scale.get();
    const stretchNow = stretch.get();
    const tightenNow = tighten.get();
    const secondaryNow = secondary.get();
    const mergedNow = merged.get();
    const attentionNow = attention.get();

    /* Under reduced motion the ambient cycles are frozen, so once the step
       springs settle there is nothing new to draw. */
    const next = `${size}|${seconds.toFixed(3)}|${s.toFixed(4)}|${stretchNow.toFixed(4)}|${tightenNow.toFixed(4)}|${secondaryNow.toFixed(4)}|${mergedNow.toFixed(4)}|${attentionNow.toFixed(4)}`;
    if (next === signature.current) return;
    signature.current = next;

    const { blob, secondary: secondaryCfg, field, ring } = MORPH_CONFIG;
    const originX = boxWidth / 2;
    const originY = size / 2;

    const wanderX = Math.sin(seconds * 0.13 + 0.6) * blob.wander;
    const wanderY = Math.cos(seconds * 0.11 + 1.9) * blob.wander;
    const quiver =
      attentionNow *
      attentionCfg.quiver *
      Math.sin(seconds * attentionCfg.quiverHz * TAU);

    /* The pair slides left as the second blob arrives and drifts back as the
       two become one, so the composition never lurches to one side. */
    const recenter =
      secondaryNow *
      secondaryCfg.recenter *
      (1 - mergedNow * secondaryCfg.recenterOnMerge);

    const centerX = originX + (wanderX + recenter) * size;
    const centerY =
      originY + (wanderY + attentionNow * attentionCfg.lean + quiver) * size;

    const lobeRadius =
      blob.radius * size * s * (1 + tightenNow * blob.tightenRadius);
    const spread =
      blob.spread *
      size *
      (1 - tightenNow * blob.tightenSpread) *
      (1 - stretchNow * blob.stretchSmooth);

    const lobes: Lobe[] = [];

    for (const seed of seeds.primary) {
      const angle = seed.angle + seconds * seed.spin;
      const driftX = reduceMotion
        ? 0
        : Math.sin(seconds * seed.driftFx * TAU + seed.driftPx) * blob.drift;
      const driftY = reduceMotion
        ? 0
        : Math.cos(seconds * seed.driftFy * TAU + seed.driftPy) * blob.drift;
      const breath = reduceMotion
        ? 1
        : 1 + Math.sin(seconds * seed.breathF * TAU + seed.breathP) * blob.breath;

      lobes.push({
        x: centerX + Math.cos(angle) * spread + driftX * size,
        y: centerY + Math.sin(angle) * spread + driftY * size,
        r: lobeRadius * seed.radiusScale * breath,
      });
    }

    if (secondaryNow > 0.005) {
      /* Arriving from a little further out reads as "settling into place"
         rather than appearing on the spot. */
      const arriving = 1 - secondaryNow;
      const offsetX =
        lerp(secondaryCfg.beside.x, secondaryCfg.merged.x, mergedNow) +
        arriving * secondaryCfg.entryDrift;
      const offsetY = lerp(
        secondaryCfg.beside.y,
        secondaryCfg.merged.y,
        mergedNow,
      );
      const secondaryX = centerX + offsetX * size;
      const secondaryY = centerY + offsetY * size;
      const secondarySpread = spread * secondaryCfg.scale;
      const secondaryRadius =
        blob.radius * size * s * secondaryCfg.scale * secondaryNow;

      for (const seed of seeds.secondary) {
        const angle = seed.angle + seconds * seed.spin;
        const driftX = reduceMotion
          ? 0
          : Math.sin(seconds * seed.driftFx * TAU + seed.driftPx) * blob.drift;
        const driftY = reduceMotion
          ? 0
          : Math.cos(seconds * seed.driftFy * TAU + seed.driftPy) * blob.drift;
        const breath = reduceMotion
          ? 1
          : 1 +
            Math.sin(seconds * seed.breathF * TAU + seed.breathP) * blob.breath;

        lobes.push({
          x: secondaryX + Math.cos(angle) * secondarySpread + driftX * size,
          y: secondaryY + Math.sin(angle) * secondarySpread + driftY * size,
          r: secondaryRadius * seed.radiusScale * breath,
        });
      }
    }

    /* One traced contour set for both blobs: separate while they are apart,
       a single fused outline once they overlap. Nothing here knows which
       case it is drawing. */
    const d = traceMetaballs(lobes, {
      ...field,
      scaleX: 1 + stretchNow * blob.stretchGain,
      scaleY: 1 - stretchNow * blob.stretchSquash,
      originX: centerX,
      originY: centerY,
    });
    if (d) {
      node.style.clipPath = `path("${d}")`;
      rimRef.current?.setAttribute('d', d);
      edgeRef.current?.setAttribute('d', d);
      clipRef.current?.setAttribute('d', d);
      shadowRef.current?.setAttribute('d', d);
    }

    /* The arc orbits the blob rather than the box, so it tracks the drift
       and takes on the blob's own aspect as it stretches. */
    const ringNode = ringRef.current;
    if (ringNode) {
      const spin = reduceMotion ? 0 : seconds * ring.orbit;
      const rx = (1 + stretchNow * ring.stretchX).toFixed(4);
      const ry = (1 - stretchNow * ring.stretchY).toFixed(4);
      const ox = originX.toFixed(1);
      const oy = originY.toFixed(1);
      /* Scale outside the rotation, so the ellipse stays axis-aligned and
         only the dash start creeps round. Rotating outside the scale makes
         the whole ellipse tumble. */
      ringNode.setAttribute(
        'transform',
        `translate(${(centerX - originX).toFixed(1)} ${(centerY - originY).toFixed(1)}) translate(${ox} ${oy}) scale(${rx} ${ry}) rotate(${spin.toFixed(2)}) translate(-${ox} -${oy})`,
      );
    }
  });

  /* ------------------------------- render ------------------------------- */

  const viewWidth = Math.max(boxWidth, 1);
  const viewHeight = Math.max(size, 1);
  const ringRadius = size * MORPH_CONFIG.ring.radius;
  const circumference = TAU * ringRadius;
  const roundedProgress = Math.round(clamp(progress, 0, 100));

  const boxStyle: CSSProperties = {
    width: `${boxWidth}px`,
    height: `${size}px`,
    top: `${centerRatio * 100}%`,
  };

  return (
    <div
      ref={stageRef}
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      style={paletteToCssVars(palette)}
      data-motion={reduceMotion ? 'off' : 'on'}
    >
      <motion.div
        className={styles.mesh}
        aria-hidden="true"
        initial={false}
        animate={{ filter: `saturate(1.02) brightness(${state.brightness})` }}
        transition={{ duration: reduceMotion ? timing.reduced : timing.mesh, ease: 'easeInOut' }}
      >
        {MESH.map((layer, index) => (
          <div
            key={index}
            className={styles.meshLayer}
            style={
              {
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                width: `${layer.size}%`,
                opacity: layer.opacity,
                animationDuration: `${layer.duration}s`,
                animationDelay: `${index * -9}s`,
                '--ms-layer': `var(--ms-${layer.hue})`,
                '--dx': `${layer.dx}%`,
                '--dy': `${layer.dy}%`,
              } as CSSProperties
            }
          />
        ))}
        <motion.div
          className={styles.warm}
          initial={false}
          animate={{ opacity: state.warmth * 0.55 }}
          transition={{ duration: reduceMotion ? timing.reduced : timing.mesh, ease: 'easeInOut' }}
        />
      </motion.div>

      {size > 0 ? (
        <div className={styles.box} style={boxStyle}>
          {/* Behind the glass: a soft contact shadow, so the blob sits on
              the gradient rather than being a hole cut into it. */}
          <svg
            className={styles.underlay}
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <filter
                id={`${uid}-drop`}
                x="-25%"
                y="-25%"
                width="150%"
                height="150%"
              >
                <feGaussianBlur stdDeviation={Math.max(6, size * 0.028)} />
              </filter>
            </defs>
            <path
              ref={shadowRef}
              fill={palette.shadow}
              stroke="none"
              filter={`url(#${uid}-drop)`}
              transform={`translate(0 ${(size * 0.022).toFixed(1)})`}
            />
          </svg>

          <motion.div
            ref={glassRef}
            className={styles.glass}
            style={{ '--ms-backdrop': backdrop } as CSSProperties}
          >
            <div className={styles.fill} />
            <motion.div className={styles.solid} style={{ opacity: tighten }} />
            <motion.div className={styles.tint} style={{ filter: tintFilter }} />
            <motion.div
              className={styles.inner}
              style={
                {
                  '--ms-hl-x': highlightX,
                  '--ms-hl-y': highlightY,
                } as CSSProperties
              }
            />
            <motion.div
              className={styles.sweep}
              style={{ x: sweepX, opacity: sweepOpacity }}
            />
          </motion.div>

          <svg
            className={styles.overlay}
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              {/* Clipping a wide stroke to its own path keeps only the inner
                  half of it, which is how the edge-lens band below stays
                  inside the silhouette. */}
              <clipPath id={`${uid}-inside`}>
                <path ref={clipRef} />
              </clipPath>

              {/* Bright where the fake light source is, dark on the far side.
                  A rim that is white all the way round reads as an outline;
                  one that turns over reads as a lit edge. */}
              <linearGradient id={`${uid}-rim`} x1="0.12" y1="0" x2="0.88" y2="1">
                <stop offset="0%" stopColor={palette.highlight} />
                <stop offset="38%" stopColor={palette.rim} />
                <stop offset="100%" stopColor={palette.rimShade} />
              </linearGradient>

              <linearGradient id={`${uid}-edge`} x1="0.15" y1="0" x2="0.85" y2="1">
                <stop offset="0%" stopColor={palette.highlight} />
                <stop offset="55%" stopColor="rgb(255 255 255 / 6%)" />
                <stop offset="100%" stopColor={palette.rimShade} />
              </linearGradient>

              <filter
                id={`${uid}-soft`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation={Math.max(2, size * 0.011)} />
              </filter>
            </defs>

            {/* The refraction cue: light bending through the thickness of
                the glass, brightest where it enters and darkest opposite. */}
            <g clipPath={`url(#${uid}-inside)`}>
              <path
                ref={edgeRef}
                fill="none"
                stroke={`url(#${uid}-edge)`}
                strokeWidth={Math.max(5, size * 0.038)}
                filter={`url(#${uid}-soft)`}
              />
            </g>

            <path
              ref={rimRef}
              className={styles.rim}
              fill="none"
              stroke={`url(#${uid}-rim)`}
            />
          </svg>

          <div
            className={styles.progress}
            role="progressbar"
            aria-valuenow={roundedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Journey progress"
          >
            <svg
              className={styles.overlay}
              viewBox={`0 0 ${viewWidth} ${viewHeight}`}
              aria-hidden="true"
              focusable="false"
            >
              <g ref={ringRef}>
                <g transform={`rotate(-90 ${viewWidth / 2} ${viewHeight / 2})`}>
                  <circle
                    cx={viewWidth / 2}
                    cy={viewHeight / 2}
                    r={ringRadius}
                    fill="none"
                    stroke={palette.track}
                    strokeWidth={MORPH_CONFIG.ring.width}
                    vectorEffect="non-scaling-stroke"
                  />
                  <motion.circle
                    cx={viewWidth / 2}
                    cy={viewHeight / 2}
                    r={ringRadius}
                    fill="none"
                    stroke={palette.accent}
                    strokeWidth={MORPH_CONFIG.ring.width}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={circumference}
                    initial={false}
                    animate={{
                      strokeDashoffset: circumference * (1 - clamp(progress, 0, 100) / 100),
                    }}
                    transition={reduceMotion ? reduced : timing.ring}
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>
      ) : null}

      <div className={styles.grain} aria-hidden="true" />

      {linearFallback ? (
        <div className={styles.linear} aria-hidden="true">
          <div
            className={styles.linearFill}
            style={{ width: `${clamp(progress, 0, 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
