import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Transition,
} from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import styles from './clearingScene.module.css';

/* ------------------------------------------------------------------ *
 * Palette
 *
 * Every colour in the scene resolves from this one object. It is
 * emitted as `--cs-*` custom properties on the root element (used by
 * static fills and by the CSS module) and read directly in JS for the
 * values that interpolate over progress. Swap the object and the whole
 * scene re-themes without touching a line of animation logic.
 * ------------------------------------------------------------------ */

export interface ClearingPalette {
  skyTop: string;
  skyHorizon: string;
  skyWarm: string;
  lightEarly: string;
  lightLate: string;
  fog: string;
  fogWarm: string;
  groundNear: string;
  groundFar: string;
  ridgeFar: string;
  ridgeNear: string;
  terrainDim: string;
  terrainFocus: string;
  path: string;
  beaconUnlit: string;
  beaconLit: string;
  partner: string;
  marker: string;
  label: string;
}

export const CLEARING_PALETTE: ClearingPalette = {
  skyTop: '#2b3648',
  skyHorizon: '#4a3f52',
  skyWarm: '#d98a4f',
  lightEarly: '#c98b5a',
  lightLate: '#f4b878',
  fog: '#8d99b0',
  fogWarm: '#d8b294',
  groundNear: '#1d2331',
  groundFar: '#3b3849',
  ridgeFar: '#3e4659',
  ridgeNear: '#2c3243',
  terrainDim: '#565f6e',
  terrainFocus: '#7c8698',
  path: '#f4d9b0',
  beaconUnlit: '#4d5566',
  beaconLit: '#ffb35c',
  partner: '#1c1f26',
  marker: '#e7d3b4',
  label: '#f3e7d6',
};

function paletteToCssVars(palette: ClearingPalette): CSSProperties {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) {
    vars[`--cs-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  }
  return vars as CSSProperties;
}

/* ------------------------------------------------------------------ *
 * Composition geometry, in design units.
 *
 * There is no fixed viewBox. The viewBox is derived from the measured
 * container aspect ratio so it always matches the container exactly,
 * which means the scene is never letterboxed and never cropped. When
 * the container is tall the surplus goes to the sky, because the
 * composition is anchored near BASELINE_Y at the bottom.
 * ------------------------------------------------------------------ */

const HORIZON_Y = 400;
const BASELINE_Y = 646;
/**
 * Horizontal centre of the narrative span: the home marker at x=104 through
 * the light and partner at x≈634. MIN_VIEW_W is sized to hold exactly that,
 * so a tall portrait panel zooms in rather than drowning the scene in sky.
 */
const FOCUS_X = 380;
const MIN_VIEW_W = 620;
/** Shortest vertical slice, so very wide bands still read as landscape. */
const MIN_VIEW_H = 400;
/** Constant gap below the composition, independent of how tall the frame is. */
const BOTTOM_MARGIN = 26;
/** Headroom so the step-9 camera pull-back never exposes an edge. */
const CAMERA_PAD = 1.06;
const CAMERA_ZOOM = 1.05;

/** Where each ridge's base line sits. The near ridge doubles as the ground. */
const RIDGE_FAR_BASE = 400;
const RIDGE_NEAR_BASE = 410;

/**
 * A CSS `transform` always beats the SVG `transform` attribute on the same
 * element, and Framer writes CSS transforms — so anything it animates has to
 * be positioned by a plain wrapper group instead.
 */
const BOTTOM_ORIGIN = {
  transformBox: 'fill-box',
  originX: 0.5,
  originY: 1,
} as const;

const CENTER_ORIGIN = {
  transformBox: 'fill-box',
  originX: 0.5,
  originY: 0.5,
} as const;

const LIGHT = { x: 620, y: 400 };
const BEACON = { x: 468, y: 478 };
const PARTNER = { x: 634, y: 414 };
const HOME = { x: 104, y: 598 };
const FLAG = { x: 198, y: 582 };

const PATH_D =
  'M 138 606 C 214 592 268 566 300 536 C 336 502 396 492 452 480 ' +
  'C 512 468 556 450 586 432 C 600 424 608 418 618 414';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const PARTNER_D =
  'M -8 0 C -8 -16 -6.5 -24 -4.5 -29 C -6 -31 -6.6 -33.6 -5.6 -36.2 ' +
  'C -4.4 -39.8 -1.9 -41.8 0 -41.8 C 1.9 -41.8 4.4 -39.8 5.6 -36.2 ' +
  'C 6.6 -33.6 6 -31 4.5 -29 C 6.5 -24 8 -16 8 0 Z';

/* ---------------------------- props ---------------------------- */

export interface ClearingSceneProps {
  /** 1-9. Each step clears another band of fog. */
  step: number;
  /** Band id (`'21-25'`) or label (`'$21K - $25K'`). Drives ridge height. */
  debtAmount: string;
  /** Type id (`'credit-card'`). Selects which terrain formation focuses. */
  debtType: string;
  firstName: string;
  /** 0-100. Warms the sky, grows the light, sets the fog baseline. */
  progressPercent: number;
  className?: string;
  palette?: ClearingPalette;
}

/* --------------------------- mappings --------------------------- */

const DEBT_AMOUNT_HEIGHT: Record<string, number> = {
  '16-20': 0.26,
  '21-25': 0.44,
  '26-30': 0.62,
  '31-35': 0.8,
  '35-plus': 1,
};

export const DEBT_AMOUNT_OPTIONS = Object.keys(DEBT_AMOUNT_HEIGHT);

type FormationId =
  | 'jagged-rock'
  | 'rounded-boulder'
  | 'tall-spire'
  | 'smooth-mesa';

const FORMATION_BY_DEBT_TYPE: Record<string, FormationId> = {
  'credit-card': 'jagged-rock',
  'personal-loans': 'rounded-boulder',
  student: 'tall-spire',
  medical: 'smooth-mesa',
};

export const DEBT_TYPE_LABELS: Record<string, string> = {
  'credit-card': 'Credit card debt',
  'personal-loans': 'Personal loans',
  student: 'Student debt',
  medical: 'Medical debt',
};

export const DEBT_TYPE_OPTIONS = Object.keys(FORMATION_BY_DEBT_TYPE);

interface Formation {
  id: FormationId;
  /** Horizontal position as a fraction of the visible frame. */
  fx: number;
  baseY: number;
  /** Half-width, used to keep the shape inside the frame. */
  half: number;
  d: string;
}

/* Bases sit below RIDGE_NEAR_BASE so the formations read as features on
   the near ground rather than notches in the ridge line. */
const FORMATIONS: Formation[] = [
  {
    id: 'jagged-rock',
    fx: 0.05,
    baseY: 472,
    half: 48,
    d: 'M -46 0 L -31 -33 L -17 -19 L -3 -52 L 11 -25 L 25 -39 L 38 -12 L 47 0 Z',
  },
  {
    id: 'rounded-boulder',
    fx: 0.2,
    baseY: 488,
    half: 46,
    d: 'M -42 0 C -47 -25 -29 -45 -2 -45 C 25 -45 43 -27 40 0 Z',
  },
  {
    id: 'tall-spire',
    fx: 0.79,
    baseY: 478,
    half: 30,
    d: 'M -21 0 L -11 -28 L -5 -63 L 4 -78 L 12 -48 L 21 -24 L 27 0 Z',
  },
  {
    id: 'smooth-mesa',
    fx: 0.94,
    baseY: 492,
    half: 60,
    d: 'M -58 0 L -45 -30 L -17 -38 L 26 -38 L 47 -28 L 58 0 Z',
  },
];

/* ---------------- fog: a floor function, never refills ---------------- */

interface FogLayer {
  /** Opacity ceiling per step, indexed by step - 1. Never increases. */
  steps: number[];
  blur: number;
  frequency: string;
  displace: number;
  seed: number;
  /** userSpaceOnUse filter region, kept tight so the buffers stay small. */
  region: { y: number; h: number };
  /** Vertical span the fill gradient fades across. */
  extent: { top: number; bottom: number };
  /** Foreground fog must stay solid to the bottom edge of any viewBox. */
  fadeBottom: boolean;
  rects: Array<{ y: number; h: number; o: number }>;
  /** Pointer-parallax amplitude in design units. */
  parallax: number;
  /** Ambient drift amplitude and loop length. */
  drift: number;
  driftDuration: number;
}

const FOG_LAYERS: FogLayer[] = [
  {
    steps: [0.72, 0.54, 0.43, 0.35, 0.28, 0.22, 0.14, 0.09, 0.05],
    blur: 20,
    frequency: '0.0030 0.0090',
    displace: 74,
    seed: 3,
    region: { y: 280, h: 220 },
    extent: { top: 336, bottom: 432 },
    fadeBottom: true,
    rects: [
      { y: 348, h: 46, o: 0.7 },
      { y: 374, h: 40, o: 0.9 },
      { y: 396, h: 32, o: 0.6 },
    ],
    parallax: 4,
    drift: 10,
    driftDuration: 29,
  },
  {
    steps: [0.78, 0.62, 0.48, 0.38, 0.3, 0.23, 0.15, 0.09, 0.05],
    blur: 22,
    frequency: '0.0026 0.0072',
    displace: 88,
    seed: 11,
    region: { y: 330, h: 230 },
    extent: { top: 388, bottom: 490 },
    fadeBottom: true,
    rects: [
      { y: 398, h: 48, o: 0.85 },
      { y: 420, h: 44, o: 1 },
      { y: 444, h: 36, o: 0.7 },
    ],
    parallax: 7,
    drift: 14,
    driftDuration: 25,
  },
  {
    steps: [0.84, 0.78, 0.68, 0.55, 0.42, 0.29, 0.19, 0.11, 0.06],
    blur: 26,
    frequency: '0.0022 0.0060',
    displace: 104,
    seed: 23,
    region: { y: 380, h: 260 },
    extent: { top: 442, bottom: 558 },
    fadeBottom: true,
    rects: [
      { y: 452, h: 56, o: 0.8 },
      { y: 478, h: 50, o: 1 },
      { y: 506, h: 42, o: 0.72 },
    ],
    parallax: 11,
    drift: 18,
    driftDuration: 22,
  },
  {
    steps: [0.9, 0.87, 0.83, 0.77, 0.7, 0.59, 0.42, 0, 0],
    blur: 30,
    frequency: '0.0018 0.0048',
    displace: 122,
    seed: 41,
    region: { y: 450, h: 460 },
    extent: { top: 508, bottom: 880 },
    fadeBottom: false,
    rects: [
      { y: 520, h: 72, o: 0.78 },
      { y: 556, h: 68, o: 0.95 },
      { y: 598, h: 74, o: 1 },
      { y: 646, h: 240, o: 1 },
    ],
    parallax: 17,
    drift: 22,
    driftDuration: 20,
  },
];

/* --------------------------- utilities --------------------------- */

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixHex(from: string, to: string, t: number) {
  const amount = clamp(t, 0, 1);
  const parse = (hex: string) => {
    const value = parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  };
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const channel = (a: number, b: number) =>
    Math.round(lerp(a, b, amount)).toString(16).padStart(2, '0');
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
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

/**
 * A jagged silhouette spanning far wider than any viewBox we can
 * produce, with a valley opened around the light so the glow reads
 * through it. Amplitudes are normalised 0-1; the caller scales them.
 */
function buildRidge(
  seed: number,
  spacing: number,
  minAmp: number,
  maxAmp: number,
) {
  const random = mulberry32(seed);
  const peaks: Array<[number, number]> = [];
  for (let x = -1200; x <= 2200; x += spacing) {
    const jitter = (random() - 0.5) * spacing * 0.45;
    const dip = (x - LIGHT.x) / 165;
    const amp =
      (minAmp + random() * (maxAmp - minAmp)) *
      (1 - 0.62 * Math.exp(-dip * dip));
    peaks.push([x + jitter, amp]);
  }
  return peaks;
}

/**
 * Ridge outline drawn above a local y of 0 and closed along it, so the
 * shape's fill-box bottom edge sits exactly on the base line. That lets
 * us scale the ridge vertically with `transform-origin: 50% 100%`
 * instead of interpolating path data.
 */
function ridgePathD(peaks: Array<[number, number]>, rise: number) {
  const points: Array<[number, number]> = [];
  peaks.forEach((peak, index) => {
    if (index > 0) {
      const previous = peaks[index - 1];
      points.push([
        (previous[0] + peak[0]) / 2,
        -Math.min(previous[1], peak[1]) * 0.42 * rise,
      ]);
    }
    points.push([peak[0], -peak[1] * rise]);
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const first = points[0][0].toFixed(1);
  const last = points[points.length - 1][0].toFixed(1);
  return `${line} L ${last} 0 L ${first} 0 Z`;
}

function ridgeHeightFor(debtAmount: string) {
  const key = debtAmount.trim().toLowerCase();
  if (key in DEBT_AMOUNT_HEIGHT) return DEBT_AMOUNT_HEIGHT[key];
  const numbers = key.match(/\d+/g);
  if (!numbers?.length) return 0.5;
  return clamp((Number(numbers[numbers.length - 1]) - 14) / 24, 0.18, 1);
}

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

function computeViewBox(aspect: number): ViewBox {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1.6;
  let w = MIN_VIEW_W;
  let h = w / safeAspect;
  if (h < MIN_VIEW_H) {
    h = MIN_VIEW_H;
    w = h * safeAspect;
  }
  w *= CAMERA_PAD;
  h *= CAMERA_PAD;
  return {
    x: FOCUS_X - w / 2,
    y: BASELINE_Y + BOTTOM_MARGIN - h,
    w,
    h,
  };
}

/* ------------------------- ambient drift ------------------------- */

function ambientDrift(distance: number, duration: number) {
  return {
    x: [0, distance, -distance * 0.6, 0],
    y: [0, -distance * 0.35, distance * 0.2, 0],
    transition: {
      duration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    } as Transition,
  };
}

/* ---------------------------- fog bank ---------------------------- */

function FogBank({
  layer,
  index,
  uid,
  opacity,
  transition,
  pointerX,
  pointerY,
  reduceMotion,
}: {
  layer: FogLayer;
  index: number;
  uid: string;
  opacity: number;
  transition: Transition;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  reduceMotion: boolean;
}) {
  /* Fog drifts against the pointer, deeper layers moving least. */
  const x = useTransform(pointerX, (v) => -v * layer.parallax);
  const y = useTransform(pointerY, (v) => -v * layer.parallax * 0.5);

  return (
    <motion.g
      className={styles.fog}
      initial={false}
      animate={{ opacity }}
      transition={transition}
    >
      <motion.g style={{ x, y }}>
        <motion.g
          animate={
            reduceMotion
              ? undefined
              : ambientDrift(layer.drift, layer.driftDuration)
          }
        >
          <g filter={`url(#${uid}-fog-${index})`}>
            {layer.rects.map((rect, rectIndex) => (
              <rect
                key={rectIndex}
                x={-1200}
                y={rect.y}
                width={3400}
                height={rect.h}
                rx={rect.h / 2}
                fill={`url(#${uid}-fog-fill-${index})`}
                opacity={rect.o}
              />
            ))}
          </g>
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

/* ---------------------------- hotspots ---------------------------- */

interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
}

/* ---------------------------- component ---------------------------- */

export function ClearingScene({
  step,
  debtAmount,
  debtType,
  firstName,
  progressPercent,
  className,
  palette = CLEARING_PALETTE,
}: ClearingSceneProps) {
  const uid = useId().replace(/:/g, '');
  const reduceMotion = useReducedMotion() ?? false;
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const stageRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pinned, setPinned] = useState<string | null>(null);

  const activeStep = clamp(Math.round(step), 1, 9);
  const progress = clamp(progressPercent, 0, 100) / 100;

  /* Measure, then derive a viewBox whose aspect matches the container
     exactly — no letterboxing, no cropping, at any size. The first read is
     synchronous so the opening paint is already correctly framed; the
     observer only handles subsequent resizes. */
  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const measure = (width: number, height: number) => {
      setSize((current) =>
        current.w === width && current.h === height
          ? current
          : { w: width, h: height },
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

  const viewBox = useMemo(
    () => computeViewBox(size.h > 0 ? size.w / size.h : 1.6),
    [size.w, size.h],
  );

  const scale = size.w > 0 ? size.w / viewBox.w : 0;
  const cameraZoom = activeStep === 9 ? 1 : CAMERA_ZOOM;

  /** Design units -> CSS px within the stage, including the camera zoom. */
  const project = useCallback(
    (x: number, y: number) => ({
      left:
        size.w / 2 + ((x - viewBox.x) * scale - size.w / 2) * cameraZoom,
      top: size.h / 2 + ((y - viewBox.y) * scale - size.h / 2) * cameraZoom,
    }),
    [viewBox.x, viewBox.y, scale, size.w, size.h, cameraZoom],
  );

  /** Keep on-scene type legible no matter how far the camera pulled back. */
  const fontUnits = (px: number) => (scale > 0 ? px / scale : px);

  /* ---------------------------- parallax ---------------------------- */

  const parallaxEnabled = canHover && !reduceMotion;
  const pointerX = useSpring(0, { stiffness: 90, damping: 22, mass: 0.6 });
  const pointerY = useSpring(0, { stiffness: 90, damping: 22, mass: 0.6 });
  const lightX = useTransform(pointerX, (v) => -v * 6);
  const lightY = useTransform(pointerY, (v) => -v * 4);

  useEffect(() => {
    if (parallaxEnabled) return;
    pointerX.set(0);
    pointerY.set(0);
  }, [parallaxEnabled, pointerX, pointerY]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!parallaxEnabled || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(
      clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) * 2,
    );
    pointerY.set(
      clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5) * 2,
    );
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    setPinned(null);
  };

  /* ------------------------- derived visuals ------------------------- */

  const skyTop = mixHex(palette.skyTop, palette.skyWarm, progress * 0.4);
  const skyHorizon = mixHex(palette.skyHorizon, palette.skyWarm, progress * 0.72);
  const groundFar = mixHex(palette.groundFar, skyHorizon, 0.5);
  const lightColor = mixHex(
    palette.lightEarly,
    palette.lightLate,
    activeStep >= 7 ? 1 : clamp(progress * 1.1, 0, 1),
  );
  const fogColor = mixHex(palette.fog, palette.fogWarm, progress * 0.55);
  /* Atmospheric perspective as an opaque colour, not alpha — a translucent
     far ridge would let the warm ground bleed through as a hard stripe. */
  const ridgeFarColor = mixHex(palette.ridgeFar, skyHorizon, 0.2);

  const lightScale = 0.5 + 0.55 * progress + (activeStep >= 7 ? 0.32 : 0);
  const lightOpacity = 0.3 + 0.62 * progress + (activeStep >= 7 ? 0.08 : 0);

  const ridgeHeight = ridgeHeightFor(debtAmount);
  const farRidgeD = useMemo(() => ridgePathD(buildRidge(17, 118, 0.16, 0.72), 152), []);
  const nearRidgeD = useMemo(() => ridgePathD(buildRidge(91, 96, 0.24, 1), 196), []);
  const farRidgeScale = (40 + 112 * ridgeHeight) / 152;
  const nearRidgeScale = (46 + 150 * ridgeHeight) / 196;

  const typeKey = debtType.trim().toLowerCase();
  const matchedFormation = FORMATION_BY_DEBT_TYPE[typeKey];
  const displayName = firstName.trim() || 'You';

  /* Formations reposition across the visible frame rather than being cropped. */
  const frameLeft = viewBox.x + viewBox.w * 0.055;
  const frameRight = viewBox.x + viewBox.w * 0.945;
  const formationX = (formation: Formation) =>
    clamp(
      lerp(frameLeft, frameRight, formation.fx),
      viewBox.x + formation.half + 8,
      viewBox.x + viewBox.w - formation.half - 8,
    );

  const matched = FORMATIONS.find((f) => f.id === matchedFormation);

  /* ---------------------------- hotspots ---------------------------- */

  const hotspots: Hotspot[] = [];
  if (activeStep >= 2 && matched) {
    hotspots.push({
      id: 'terrain',
      label: DEBT_TYPE_LABELS[typeKey] ?? 'Your debt type',
      x: formationX(matched),
      y: matched.baseY - 48,
      r: 52,
    });
  }
  if (activeStep >= 5) {
    hotspots.push({
      id: 'beacon',
      label: activeStep >= 6 ? 'Identity verified' : 'Verification ahead',
      x: BEACON.x,
      y: BEACON.y - 44,
      r: 32,
    });
  }
  if (activeStep >= 8) {
    hotspots.push({
      id: 'home',
      label: 'Where you are today',
      x: HOME.x,
      y: HOME.y - 12,
      r: 30,
    });
  }
  if (activeStep >= 9) {
    hotspots.push({
      id: 'partner',
      label: 'Your relief specialist',
      x: PARTNER.x,
      y: PARTNER.y - 28,
      r: 28,
    });
  }

  /* Derived rather than stored, so a hotspot that disappears on a step
     change can never leave a stale label behind. */
  const activeHotspot = hotspots.some((h) => h.id === pinned) ? pinned : null;

  /* --------------------------- transitions --------------------------- */

  const stepTransition: Transition = reduceMotion
    ? { duration: 0.2, ease: 'linear' }
    : { duration: 0.6, ease: EASE };

  const pathTransition: Transition = reduceMotion
    ? { duration: 0.2, ease: 'linear' }
    : { duration: 1.2, ease: 'easeOut' };

  const fogOpacity = (layer: FogLayer) =>
    Math.min(layer.steps[activeStep - 1], layer.steps[0] * (1 - 0.92 * progress));

  const showPath = activeStep >= 3;
  const showBeacon = activeStep >= 5;
  const beaconLit = activeStep >= 6;
  const beaconColor = beaconLit ? palette.beaconLit : palette.beaconUnlit;
  const showHome = activeStep >= 8;
  const showPartner = activeStep >= 9;

  return (
    <div
      ref={stageRef}
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      style={paletteToCssVars(palette)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.svg
        className={styles.svg}
        viewBox={`${viewBox.x.toFixed(2)} ${viewBox.y.toFixed(2)} ${viewBox.w.toFixed(2)} ${viewBox.h.toFixed(2)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
        initial={false}
        animate={{ scale: cameraZoom }}
        transition={reduceMotion ? { duration: 0.2 } : { duration: 0.9, ease: EASE }}
        style={{ transformOrigin: '50% 50%' }}
      >
        <defs>
          <linearGradient
            id={`${uid}-sky`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1={-160}
            x2="0"
            y2={HORIZON_Y}
          >
            <stop offset="0%" className={styles.stop} style={{ stopColor: skyTop }} />
            <stop
              offset="100%"
              className={styles.stop}
              style={{ stopColor: skyHorizon }}
            />
          </linearGradient>

          <linearGradient
            id={`${uid}-ground`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1={HORIZON_Y}
            x2="0"
            y2={BASELINE_Y + 140}
          >
            <stop offset="0%" className={styles.stop} style={{ stopColor: groundFar }} />
            <stop
              offset="100%"
              className={styles.stop}
              style={{ stopColor: palette.groundNear }}
            />
          </linearGradient>

          {/* The near ridge's mass is the ground the viewer walks on, so it
              recedes into the foreground dark rather than sitting flat.
              Coordinates are local to the translated ridge group. */}
          <linearGradient
            id={`${uid}-near-mass`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1={0}
            x2="0"
            y2={BASELINE_Y + 200 - RIDGE_NEAR_BASE}
          >
            <stop
              offset="0%"
              className={styles.stop}
              style={{ stopColor: palette.ridgeNear }}
            />
            <stop
              offset="100%"
              className={styles.stop}
              style={{ stopColor: palette.groundNear }}
            />
          </linearGradient>

          <radialGradient id={`${uid}-glow`}>
            <stop
              offset="0%"
              className={styles.stop}
              style={{ stopColor: lightColor, stopOpacity: 0.95 }}
            />
            <stop
              offset="42%"
              className={styles.stop}
              style={{ stopColor: lightColor, stopOpacity: 0.32 }}
            />
            <stop
              offset="100%"
              className={styles.stop}
              style={{ stopColor: lightColor, stopOpacity: 0 }}
            />
          </radialGradient>

          {FOG_LAYERS.map((layer, index) => (
            <linearGradient
              key={`fill-${index}`}
              id={`${uid}-fog-fill-${index}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={layer.extent.top}
              x2="0"
              y2={layer.extent.bottom}
            >
              <stop
                offset="0%"
                className={styles.stop}
                style={{ stopColor: fogColor, stopOpacity: 0 }}
              />
              <stop
                offset="24%"
                className={styles.stop}
                style={{ stopColor: fogColor, stopOpacity: 1 }}
              />
              <stop
                offset={layer.fadeBottom ? '72%' : '100%'}
                className={styles.stop}
                style={{ stopColor: fogColor, stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                className={styles.stop}
                style={{ stopColor: fogColor, stopOpacity: layer.fadeBottom ? 0 : 1 }}
              />
            </linearGradient>
          ))}

          {FOG_LAYERS.map((layer, index) => (
            <filter
              key={index}
              id={`${uid}-fog-${index}`}
              filterUnits="userSpaceOnUse"
              x={-1300}
              y={layer.region.y}
              width={3600}
              height={layer.region.h}
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency={layer.frequency}
                numOctaves={3}
                seed={layer.seed}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={layer.displace}
                xChannelSelector="R"
                yChannelSelector="G"
                result="warped"
              />
              <feGaussianBlur in="warped" stdDeviation={layer.blur} />
            </filter>
          ))}

          <filter id={`${uid}-path-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={`${uid}-beacon-glow`} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="9" />
          </filter>

          <filter id={`${uid}-rim`} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* 1. sky + ground plane -------------------------------------- */}
        <g>
          <rect
            x={-1600}
            y={-1600}
            width={4400}
            height={1600 + HORIZON_Y}
            fill={`url(#${uid}-sky)`}
          />
          <rect
            x={-1600}
            y={HORIZON_Y}
            width={4400}
            height={1800}
            fill={`url(#${uid}-ground)`}
          />
        </g>

        {/* 2. light source -------------------------------------------- */}
        <motion.g style={{ x: lightX, y: lightY }}>
          <motion.g animate={reduceMotion ? undefined : ambientDrift(6, 26)}>
            <motion.g
              initial={false}
              animate={{
                x: activeStep >= 4 ? 18 : 0,
                y: activeStep >= 4 ? -13 : 0,
                rotate: activeStep >= 4 ? 6 : 0,
                scale: lightScale,
                opacity: lightOpacity,
              }}
              transition={stepTransition}
              style={CENTER_ORIGIN}
            >
              <circle cx={LIGHT.x} cy={LIGHT.y} r={300} fill={`url(#${uid}-glow)`} />
            </motion.g>

            <AnimatePresence>
              {activeStep >= 7 && !reduceMotion ? (
                <motion.circle
                  key="light-pulse"
                  cx={LIGHT.x}
                  cy={LIGHT.y}
                  r={190}
                  fill={`url(#${uid}-glow)`}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1.9, opacity: [0, 0.5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={CENTER_ORIGIN}
                />
              ) : null}
            </AnimatePresence>
          </motion.g>
        </motion.g>

        {/* 3. ridge (height mapped from debtAmount) -------------------- */}
        <motion.g
          initial={false}
          animate={{ opacity: activeStep >= 1 ? 1 : 0 }}
          transition={stepTransition}
        >
          {/* Hazed toward the sky rather than made translucent, so the strip
              of ground between the two base lines reads as depth, not a seam. */}
          <g transform={`translate(0 ${RIDGE_FAR_BASE})`}>
            <rect x={-1600} y={0} width={4400} height={1600} fill={ridgeFarColor} />
            <motion.path
              d={farRidgeD}
              fill={ridgeFarColor}
              initial={false}
              animate={{ scaleY: farRidgeScale }}
              transition={stepTransition}
              style={BOTTOM_ORIGIN}
            />
          </g>
          <g transform={`translate(0 ${RIDGE_NEAR_BASE})`}>
            <rect
              x={-1600}
              y={0}
              width={4400}
              height={1600}
              fill={`url(#${uid}-near-mass)`}
            />
            <motion.path
              d={nearRidgeD}
              fill={palette.ridgeNear}
              initial={false}
              animate={{ scaleY: nearRidgeScale }}
              transition={stepTransition}
              style={BOTTOM_ORIGIN}
            />
          </g>
        </motion.g>

        {/* 4. terrain formations (one focuses to match debtType) ------- */}
        <g>
          {FORMATIONS.map((formation) => {
            const focused = formation.id === matchedFormation && activeStep >= 2;
            const pulsing = focused && activeHotspot === 'terrain' && !reduceMotion;
            return (
              <g
                key={formation.id}
                transform={`translate(${formationX(formation).toFixed(1)} ${formation.baseY})`}
              >
                <motion.g
                  animate={{ scale: pulsing ? [1, 1.04, 1] : 1 }}
                  transition={
                    pulsing
                      ? { duration: 1.6, ease: 'easeInOut', repeat: Infinity }
                      : stepTransition
                  }
                  style={BOTTOM_ORIGIN}
                >
                  <motion.path
                    d={formation.d}
                    initial={false}
                    animate={{
                      fill: focused ? palette.terrainFocus : palette.terrainDim,
                      opacity: focused ? 1 : 0.4,
                    }}
                    transition={stepTransition}
                  />
                  <motion.path
                    d={formation.d}
                    fill="none"
                    stroke={palette.lightLate}
                    strokeWidth={1.4}
                    strokeLinejoin="round"
                    initial={false}
                    animate={{
                      opacity: focused
                        ? activeHotspot === 'terrain'
                          ? 0.7
                          : 0.22
                        : 0,
                    }}
                    transition={stepTransition}
                  />
                </motion.g>
              </g>
            );
          })}
        </g>

        {/* 5. path draw-on + name flag --------------------------------- */}
        <g>
          <motion.path
            d={PATH_D}
            fill="none"
            stroke={palette.path}
            strokeWidth={2.4}
            strokeLinecap="round"
            filter={`url(#${uid}-path-glow)`}
            initial={false}
            animate={{ pathLength: showPath ? 1 : 0, opacity: showPath ? 0.92 : 0 }}
            transition={pathTransition}
          />

          <motion.g
            initial={false}
            animate={{ opacity: showPath ? 1 : 0, y: showPath ? 0 : 6 }}
            transition={{
              ...stepTransition,
              /* Lands as the draw-on finishes, but only the first time. */
              delay: reduceMotion || activeStep !== 3 ? 0 : 1.25,
            }}
          >
            <line
              x1={FLAG.x}
              y1={FLAG.y}
              x2={FLAG.x}
              y2={FLAG.y - 30}
              stroke={palette.marker}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            <path
              d={`M ${FLAG.x} ${FLAG.y - 30} L ${FLAG.x + 19} ${FLAG.y - 25} L ${FLAG.x} ${FLAG.y - 20} Z`}
              fill={palette.lightLate}
            />
            <text
              className={styles.sceneLabel}
              x={FLAG.x + 27}
              y={FLAG.y - 19}
              fill={palette.label}
              fontSize={fontUnits(13)}
            >
              {displayName}
            </text>
          </motion.g>
        </g>

        {/* 6. beacon ---------------------------------------------------- */}
        <motion.g
          initial={false}
          animate={{ opacity: showBeacon ? 1 : 0 }}
          transition={stepTransition}
        >
          <g transform={`translate(${BEACON.x} ${BEACON.y})`}>
          <AnimatePresence>
            {beaconLit ? (
              <motion.circle
                key="beacon-ring"
                cx={0}
                cy={-46}
                r={13}
                fill="none"
                stroke={palette.beaconLit}
                strokeWidth={2}
                initial={{ scale: 1, opacity: 0.95 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.2 : 1, ease: 'easeOut' }}
                style={CENTER_ORIGIN}
              />
            ) : null}
          </AnimatePresence>

          <motion.circle
            cx={0}
            cy={-46}
            r={16}
            fill={palette.beaconLit}
            filter={`url(#${uid}-beacon-glow)`}
            initial={false}
            animate={{ opacity: beaconLit ? 0.85 : 0 }}
            transition={stepTransition}
          />
          <motion.path
            d="M -9 0 L -6.4 -34 L 6.4 -34 L 9 0 Z"
            initial={false}
            animate={{ fill: beaconColor }}
            transition={stepTransition}
          />
          <motion.rect
            x={-8}
            y={-52}
            width={16}
            height={13}
            rx={2.5}
            initial={false}
            animate={{ fill: beaconColor }}
            transition={stepTransition}
          />
          <motion.path
            d="M -11 -52 L 0 -63 L 11 -52 Z"
            initial={false}
            animate={{ fill: beaconColor }}
            transition={stepTransition}
          />
          </g>
        </motion.g>

        {/* 8. partner silhouette, warm-rimmed by the light ------------- */}
        <g transform={`translate(${PARTNER.x} ${PARTNER.y})`}>
          <motion.g
            initial={false}
            animate={{
              opacity: showPartner ? 1 : 0,
              scale: showPartner ? 1 : 0.9,
            }}
            transition={
              reduceMotion ? { duration: 0.2 } : { duration: 0.8, ease: EASE }
            }
            style={BOTTOM_ORIGIN}
          >
            <path
              d={PARTNER_D}
              fill={palette.lightLate}
              filter={`url(#${uid}-rim)`}
              opacity={0.9}
            />
            <path d={PARTNER_D} fill={palette.partner} />
          </motion.g>
        </g>

        {/* 7. fog banks, back to front --------------------------------- */}
        {FOG_LAYERS.map((layer, index) => (
          <FogBank
            key={index}
            layer={layer}
            index={index}
            uid={uid}
            opacity={fogOpacity(layer)}
            transition={stepTransition}
            pointerX={pointerX}
            pointerY={pointerY}
            reduceMotion={reduceMotion}
          />
        ))}

        {/* Home marker, revealed as the foreground fog burns off ------- */}
        <g transform={`translate(${HOME.x} ${HOME.y})`}>
          <motion.g
            initial={false}
            animate={{ opacity: showHome ? 1 : 0, y: showHome ? 0 : 6 }}
            transition={{ ...stepTransition, delay: reduceMotion ? 0 : 0.25 }}
          >
            <path d="M -10 -10 L -10 0 L 10 0 L 10 -10 Z" fill={palette.marker} />
            <path d="M -13.5 -10 L 0 -22 L 13.5 -10 Z" fill={palette.lightLate} />
            <rect x={-3} y={-7} width={6} height={7} fill={palette.partner} />
          </motion.g>
        </g>
      </motion.svg>

      {/* Interactive layer: real buttons projected onto the scene, so
          hover, keyboard focus and tap-to-reveal all work for free. */}
      <div className={styles.hotspots}>
        {hotspots.map((hotspot) => {
          const point = project(hotspot.x, hotspot.y);
          const radius = hotspot.r * scale * cameraZoom;
          if (radius <= 0) return null;
          return (
            <button
              key={hotspot.id}
              type="button"
              className={styles.hotspot}
              data-active={activeHotspot === hotspot.id ? 'true' : undefined}
              aria-label={hotspot.label}
              style={{
                left: point.left,
                top: point.top,
                width: radius * 2,
                height: radius * 2,
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setPinned(hotspot.id);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse') setPinned(null);
              }}
              onFocus={() => setPinned(hotspot.id)}
              onBlur={() => setPinned(null)}
              onClick={() =>
                setPinned((current) => (current === hotspot.id ? null : hotspot.id))
              }
            >
              <span className={styles.hotspotLabel} aria-hidden="true">
                {hotspot.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
