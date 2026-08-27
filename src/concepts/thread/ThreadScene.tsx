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
} from 'motion/react';
import styles from './threadScene.module.css';

/* ------------------------------------------------------------------ *
 * Config
 *
 * Every colour, size and duration in the scene resolves from the two
 * objects below. Palette values are also emitted as `--ts-*` custom
 * properties so the CSS module can reach them. Tune the look here
 * without touching a line of animation logic.
 * ------------------------------------------------------------------ */

export interface ThreadPalette {
  backdropFrom: string;
  backdropTo: string;
  bokehCool: string;
  bokehWarm: string;
  /** Line at its most coiled: muted, low contrast. */
  lineCoiled: string;
  /** Line once straightened: warmer, marginally more present. */
  lineStraight: string;
  dotUnlit: string;
  dotLit: string;
  label: string;
}

export const THREAD_PALETTE: ThreadPalette = {
  backdropFrom: '#fdfbf9',
  backdropTo: '#f2eee8',
  bokehCool: '#d3dbe2',
  bokehWarm: '#e8cba6',
  lineCoiled: '#c9c2b8',
  lineStraight: '#d9a066',
  dotUnlit: '#d8d3c9',
  dotLit: '#e08a3c',
  label: '#3a362f',
};

export const THREAD_CONFIG = {
  /** Points sampled along the thread each frame. */
  samples: 210,
  line: {
    width: 2.1,
    coiledOpacity: 0.7,
    straightOpacity: 0.95,
  },
  dot: {
    radius: 4.4,
    glowRadius: 15,
    dimOpacity: 0.42,
    litOpacity: 0.82,
    highlightScale: 1.5,
  },
  coil: {
    turnsCoiled: 6,
    turnsStraight: 1.15,
    /**
     * Loop radius as a share of the gap between turns. Above 0.5 successive
     * loops overlap, which is the difference between a scalloped wave and a
     * length of coiled cord.
     */
    overlap: 0.62,
    /** Loops lean, the way slack string does. Radians, relaxed out by step 9. */
    tilt: -0.3,
    /** How far the selected debt band tightens or loosens the first coil. */
    bandBias: 0.2,
  },
  wobble: {
    nodes: 6,
    /** Fraction of the lateral extent. Deliberately barely perceptible. */
    amplitude: 0.06,
    minPeriod: 2.2,
    maxPeriod: 4.1,
    seed: 7,
  },
  timing: {
    morph: 0.5,
    highlight: 0.2,
    ring: 0.7,
    appear: 0.42,
  },
  layout: {
    /** Share of the cross axis the coil is allowed to occupy. */
    latExtent: 0.15,
    latMin: 32,
    latMax: 132,
    /** Where the thread's axis sits on the cross axis. */
    latCenterHorizontal: 0.66,
    latCenterVertical: 0.3,
    padFraction: 0.075,
    padMax: 72,
    /** Container aspect below which the thread runs top-to-bottom. */
    verticalBelowAspect: 0.8,
  },
};

/* ------------------------------------------------------------------ *
 * Steps and dots
 * ------------------------------------------------------------------ */

/**
 * How straight the thread is at each of the nine steps, 0 = most coiled.
 * Step 7 (income) carries the largest single pull by design.
 */
const STEP_UNWIND: Record<number, number> = {
  1: 0,
  2: 0.1,
  3: 0.2,
  4: 0.28,
  5: 0.34,
  6: 0.4,
  7: 0.74,
  8: 0.88,
  9: 1,
};

export interface ThreadDotConfig {
  id: string;
  /** Position along the thread, 0 at the near end, 1 at the far end. */
  t: number;
  appearsAt: number;
  /** Step at which the dot goes from unlit to lit. */
  litAt: number;
  /** One-time expanding ring when it lights — the verification beat. */
  ring?: boolean;
  /** `focusedField` values that highlight this dot as their nearest marker. */
  fields: string[];
  label: string;
}

export const THREAD_DOTS: ThreadDotConfig[] = [
  {
    id: 'home',
    t: 0.05,
    appearsAt: 8,
    litAt: 8,
    fields: ['address'],
    label: 'Your area',
  },
  {
    id: 'debt-amount',
    t: 0.16,
    appearsAt: 1,
    litAt: 1,
    fields: ['debt-amount'],
    label: 'What you owe',
  },
  {
    id: 'debt-type',
    t: 0.29,
    appearsAt: 2,
    litAt: 2,
    fields: ['debt-type'],
    label: 'Kind of debt',
  },
  {
    id: 'contact',
    t: 0.43,
    appearsAt: 3,
    litAt: 3,
    fields: ['contact', 'date-of-birth'],
    label: 'You',
  },
  {
    id: 'phone',
    t: 0.67,
    appearsAt: 5,
    litAt: 6,
    ring: true,
    fields: ['phone', 'income'],
    label: 'Verification',
  },
  {
    id: 'partner',
    t: 0.96,
    appearsAt: 9,
    litAt: 9,
    fields: [],
    label: 'Your match',
  },
];

/** The handwritten first name hangs off this dot. */
const NAME_DOT = 'contact';

/** Coil tightness per debt band, -1 loosest to 1 tightest. */
const DEBT_BAND_TIGHTNESS: Record<string, number> = {
  '16-20': -1,
  '21-25': -0.5,
  '26-30': 0,
  '31-35': 0.5,
  '35-plus': 1,
};

export const DEBT_AMOUNT_OPTIONS = Object.keys(DEBT_BAND_TIGHTNESS);

/** Slow-drifting background blur discs, behind the thread. */
interface Bokeh {
  /** Percentages of the stage. */
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  dx: number;
  dy: number;
  /** One disc shifts warm at step 4 — the only tone change in the flow. */
  shifts?: boolean;
}

const BOKEH: Bokeh[] = [
  { x: 14, y: 22, size: 46, opacity: 0.11, duration: 41, dx: 3.5, dy: -2.4 },
  { x: 74, y: 16, size: 38, opacity: 0.1, duration: 34, dx: -2.8, dy: 3.1, shifts: true },
  { x: 58, y: 78, size: 52, opacity: 0.09, duration: 45, dx: 2.2, dy: -3.4 },
  { x: 90, y: 62, size: 30, opacity: 0.08, duration: 30, dx: -3.2, dy: -2.1 },
];

/* ------------------------------------------------------------------ *
 * Utilities
 * ------------------------------------------------------------------ */

const TAU = Math.PI * 2;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * A CSS transform always beats the SVG `transform` attribute on the same
 * element, and Framer writes CSS transforms — so the group we position by
 * hand and the group Framer scales have to be different elements.
 */
const CENTER_ORIGIN = {
  transformBox: 'fill-box',
  originX: 0.5,
  originY: 0.5,
} as const;

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

function paletteToCssVars(palette: ThreadPalette): CSSProperties {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) {
    vars[`--ts-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  }
  return vars as CSSProperties;
}

/* ---------------------------- wobble ---------------------------- */

interface WobbleNode {
  u: number;
  freq: number;
  phase: number;
  amp: number;
}

/**
 * Pseudo-random control points along the thread, each breathing on its own
 * slow cycle. Summed with a gaussian falloff they read as one string under
 * slight tension rather than a set of independent bumps.
 */
function buildWobbleNodes(): WobbleNode[] {
  const { nodes, minPeriod, maxPeriod, seed } = THREAD_CONFIG.wobble;
  const random = mulberry32(seed);
  return Array.from({ length: nodes }, (_, index) => ({
    u: (index + 0.5) / nodes,
    freq: 1 / lerp(minPeriod, maxPeriod, random()),
    phase: random() * TAU,
    amp: 0.55 + random() * 0.45,
  }));
}

function wobbleAt(nodes: WobbleNode[], u: number, seconds: number) {
  let sum = 0;
  for (const node of nodes) {
    const distance = (u - node.u) / 0.24;
    sum +=
      node.amp *
      Math.sin(seconds * node.freq * TAU + node.phase) *
      Math.exp(-distance * distance);
  }
  return sum;
}

/* ---------------------------- layout ---------------------------- */

interface Layout {
  vertical: boolean;
  /** Offset of the thread's near end along its own axis, in px. */
  pad: number;
  span: number;
  latCenter: number;
  latExtent: number;
}

function computeLayout(
  width: number,
  height: number,
  orientation: ThreadOrientation,
): Layout {
  const { layout } = THREAD_CONFIG;
  const aspect = height > 0 ? width / height : 1.6;
  const vertical =
    orientation === 'vertical' ||
    (orientation === 'auto' && aspect < layout.verticalBelowAspect);

  const axis = vertical ? height : width;
  const cross = vertical ? width : height;
  const pad = Math.min(axis * layout.padFraction, layout.padMax);

  return {
    vertical,
    pad,
    span: Math.max(axis - pad * 2, 0),
    latCenter:
      cross *
      (vertical ? layout.latCenterVertical : layout.latCenterHorizontal),
    latExtent: clamp(cross * layout.latExtent, layout.latMin, layout.latMax),
  };
}

/* ---------------------------- props ---------------------------- */

export type ThreadOrientation = 'auto' | 'horizontal' | 'vertical';

export interface ThreadSceneProps {
  /** 1-9. Each step lets the thread out another notch. */
  step: number;
  /** Band id (`'21-25'`). Scales how tightly the opening coil is wound. */
  debtAmount?: string;
  firstName?: string;
  /** Step id of the field under the pointer or holding focus. */
  focusedField?: string | null;
  /**
   * Progress is a floor function: the thread never re-coils when the person
   * steps back. The scene lab turns this off so the slider scrubs both ways.
   */
  floorProgress?: boolean;
  orientation?: ThreadOrientation;
  className?: string;
  palette?: ThreadPalette;
}

/* --------------------------- component --------------------------- */

export function ThreadScene({
  step,
  debtAmount = '',
  firstName = '',
  focusedField = null,
  floorProgress = true,
  orientation = 'auto',
  className,
  palette = THREAD_PALETTE,
}: ThreadSceneProps) {
  const uid = useId().replace(/:/g, '');
  const reduceMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRefs = useRef<Array<SVGGElement | null>>([]);
  const labelRef = useRef<SVGGElement>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });

  const activeStep = clamp(Math.round(step), 1, 9);

  /* The floor lives here rather than in the caller, so every host — the
     journey, the lab, a screenshot harness — gets the same guarantee. */
  const [peak, setPeak] = useState(activeStep);
  useEffect(() => {
    setPeak((current) =>
      !floorProgress || activeStep <= 1
        ? activeStep
        : Math.max(current, activeStep),
    );
  }, [activeStep, floorProgress]);
  const shapeStep = floorProgress ? Math.max(peak, activeStep) : activeStep;

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

  const layout = useMemo(
    () => computeLayout(size.w, size.h, orientation),
    [size.w, size.h, orientation],
  );
  const wobbleNodes = useMemo(buildWobbleNodes, []);

  /* --------------------- animated shape inputs --------------------- */

  const unwindTarget = STEP_UNWIND[shapeStep] ?? 0;
  const bandTarget = DEBT_BAND_TIGHTNESS[debtAmount.trim().toLowerCase()] ?? 0;

  const unwind = useMotionValue(unwindTarget);
  const band = useMotionValue(bandTarget);
  /** Idle wobble only runs between step transitions. */
  const settledRef = useRef(true);
  const gainRef = useRef(1);

  useEffect(() => {
    settledRef.current = false;
    const controls = animate(unwind, unwindTarget, {
      duration: reduceMotion ? 0.2 : THREAD_CONFIG.timing.morph,
      ease: reduceMotion ? 'linear' : EASE,
      onComplete: () => {
        settledRef.current = true;
      },
    });
    return () => controls.stop();
  }, [unwind, unwindTarget, reduceMotion]);

  useEffect(() => {
    const controls = animate(band, bandTarget, {
      duration: reduceMotion ? 0.2 : 0.6,
      ease: reduceMotion ? 'linear' : EASE,
    });
    return () => controls.stop();
  }, [band, bandTarget, reduceMotion]);

  /* ------------------------- per-frame draw ------------------------- */

  const lastDraw = useRef({ u: Number.NaN, bias: Number.NaN, w: 0, h: 0 });

  useAnimationFrame((timeMs, deltaMs) => {
    const path = pathRef.current;
    if (!path || layout.span <= 0) return;

    const u = unwind.get();
    const bias = band.get();

    /* Under reduced motion the shape is static between step transitions, so
       the loop costs a handful of comparisons and returns. */
    if (
      reduceMotion &&
      Math.abs(u - lastDraw.current.u) < 0.0004 &&
      Math.abs(bias - lastDraw.current.bias) < 0.0004 &&
      lastDraw.current.w === size.w &&
      lastDraw.current.h === size.h
    ) {
      return;
    }
    lastDraw.current = { u, bias, w: size.w, h: size.h };

    const seconds = timeMs / 1000;

    const wantGain = reduceMotion || !settledRef.current ? 0 : 1;
    gainRef.current += (wantGain - gainRef.current) * Math.min(1, deltaMs / 260);

    const { coil, wobble, samples } = THREAD_CONFIG;
    const eased = 1 - (1 - u) ** 2;
    const turns = lerp(
      coil.turnsCoiled * (1 + bias * coil.bandBias),
      coil.turnsStraight,
      eased,
    );
    /* Each turn is a circle rolled along the axis: sized against the gap
       between turns so the loops keep overlapping at any container width. */
    const radius =
      Math.min(layout.latExtent, (layout.span / turns) * coil.overlap) *
      (1 - u) ** 1.25;
    const tilt = coil.tilt * (1 - u);
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);
    const wob = reduceMotion
      ? 0
      : gainRef.current * wobble.amplitude * layout.latExtent;

    const point = (t: number): [number, number] => {
      const theta = t * turns * TAU;
      /* Tapering both ends keeps the thread anchored on its axis, so the
         coil reads as slack in the middle of a taut line. */
      const env = Math.sin(Math.PI * t) ** 0.55;
      const ex = radius * Math.sin(theta) * env;
      const ey = radius * Math.cos(theta) * env;
      const along = layout.pad + t * layout.span + (ex * cosTilt - ey * sinTilt);
      const lat =
        layout.latCenter +
        (ex * sinTilt + ey * cosTilt) +
        wob * wobbleAt(wobbleNodes, t, seconds) * env;
      return layout.vertical ? [lat, along] : [along, lat];
    };

    let d = '';
    for (let i = 0; i <= samples; i += 1) {
      const [x, y] = point(i / samples);
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    path.setAttribute('d', d);
    path.setAttribute(
      'stroke',
      mixHex(palette.lineCoiled, palette.lineStraight, u),
    );
    path.setAttribute(
      'stroke-opacity',
      String(
        lerp(THREAD_CONFIG.line.coiledOpacity, THREAD_CONFIG.line.straightOpacity, u),
      ),
    );

    THREAD_DOTS.forEach((dot, index) => {
      const node = dotRefs.current[index];
      if (!node) return;
      const [x, y] = point(dot.t);
      node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      if (dot.id === NAME_DOT && labelRef.current) {
        labelRef.current.setAttribute(
          'transform',
          `translate(${x.toFixed(1)} ${y.toFixed(1)})`,
        );
      }
    });
  });

  /* --------------------------- dot states --------------------------- */

  const { dot: dotCfg, timing } = THREAD_CONFIG;
  const appearTransition = {
    duration: reduceMotion ? 0.2 : timing.appear,
    ease: EASE,
  };
  const highlightTransition = {
    duration: reduceMotion ? 0.2 : timing.highlight,
    ease: 'easeOut' as const,
  };

  const displayName = firstName.trim();
  const showName = shapeStep >= 3 && displayName.length > 0;

  /* The label sits on the far side of the thread's axis so it never lands
     on top of the coil. */
  const labelOffset = layout.vertical
    ? { x: layout.latExtent * 0.5 + 14, y: 5 }
    : { x: 11, y: -14 };

  return (
    <div
      ref={stageRef}
      className={`${styles.stage}${className ? ` ${className}` : ''}`}
      style={paletteToCssVars(palette)}
      data-motion={reduceMotion ? 'off' : 'on'}
    >
      <div className={styles.bokehLayer} aria-hidden="true">
        {BOKEH.map((disc, index) => (
          <div
            key={index}
            className={styles.bokeh}
            style={
              {
                left: `${disc.x}%`,
                top: `${disc.y}%`,
                width: `${disc.size}%`,
                aspectRatio: '1',
                opacity: disc.opacity,
                animationDuration: `${disc.duration}s`,
                animationDelay: `${index * -6}s`,
                '--dx': `${disc.dx}%`,
                '--dy': `${disc.dy}%`,
              } as CSSProperties
            }
          >
            {disc.shifts ? (
              <span
                className={styles.bokehWarm}
                data-on={shapeStep >= 4 ? 'true' : undefined}
              />
            ) : null}
          </div>
        ))}
      </div>

      <svg
        className={styles.svg}
        viewBox={`0 0 ${Math.max(size.w, 1)} ${Math.max(size.h, 1)}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id={`${uid}-glow`}>
            <stop offset="0%" stopColor={palette.dotLit} stopOpacity="0.5" />
            <stop offset="55%" stopColor={palette.dotLit} stopOpacity="0.18" />
            <stop offset="100%" stopColor={palette.dotLit} stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          ref={pathRef}
          fill="none"
          stroke={palette.lineCoiled}
          strokeWidth={THREAD_CONFIG.line.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {THREAD_DOTS.map((dot, index) => {
          const visible = shapeStep >= dot.appearsAt;
          const lit = shapeStep >= dot.litAt;
          const highlighted =
            visible && focusedField != null && dot.fields.includes(focusedField);
          /* Every dot already placed gains a little presence as the flow
             moves on — the "existing dot brightens slightly" beat. */
          const matured = clamp((shapeStep - dot.litAt) / 3, 0, 1);

          return (
            <g
              key={dot.id}
              ref={(node) => {
                dotRefs.current[index] = node;
              }}
            >
              <motion.circle
                r={dotCfg.glowRadius}
                fill={`url(#${uid}-glow)`}
                initial={false}
                animate={{
                  opacity: lit ? (highlighted ? 1 : 0.55 + 0.3 * matured) : 0,
                  scale: highlighted ? 1.25 : 1,
                }}
                transition={highlighted ? highlightTransition : appearTransition}
                style={CENTER_ORIGIN}
              />

              {dot.ring && lit && !reduceMotion ? (
                <motion.circle
                  r={dotCfg.radius}
                  fill="none"
                  stroke={palette.dotLit}
                  strokeWidth={1.5}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: timing.ring, ease: 'easeOut' }}
                  style={CENTER_ORIGIN}
                />
              ) : null}

              <motion.circle
                r={dotCfg.radius}
                initial={false}
                animate={{
                  opacity: visible
                    ? lit
                      ? dotCfg.litOpacity + (1 - dotCfg.litOpacity) * matured
                      : dotCfg.dimOpacity
                    : 0,
                  scale: visible
                    ? (lit ? 1 : 0.85) * (highlighted ? dotCfg.highlightScale : 1)
                    : 0.4,
                  fill: lit ? palette.dotLit : palette.dotUnlit,
                }}
                transition={highlighted ? highlightTransition : appearTransition}
                style={CENTER_ORIGIN}
              />
            </g>
          );
        })}

        <g ref={labelRef}>
          <motion.text
            className={styles.name}
            x={labelOffset.x}
            y={labelOffset.y}
            fill={palette.label}
            initial={false}
            animate={{ opacity: showName ? 0.72 : 0 }}
            transition={appearTransition}
          >
            {displayName}
          </motion.text>
        </g>
      </svg>
    </div>
  );
}
