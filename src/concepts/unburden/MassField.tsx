import { useLayoutEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { UNBURDEN_CONFIG } from './config';
import type { FigureMass } from './Figure';
import { drawHand, handFloat, layoutScene, loadHandImage } from './handMesh';
import styles from './massField.module.css';

export interface MassFieldStats {
  held: number;
  releasing: number;
  budget: number;
}

export type MassFieldMode = 'palm' | 'spread';

export interface MassFieldProps {
  mass: FigureMass;
  held: number;
  budget: number;
  /** Palm keeps the sphere in the hand. Spread scatters it around the form. */
  mode?: MassFieldMode;
  reducedMotion?: boolean;
  onStats?: (stats: MassFieldStats) => void;
  className?: string;
}

interface Particle {
  seed: number;
  theta: number;
  phi: number;
  orbit: number;
  size: number;
  alpha: number;
  tone: number;
  spin: number;
  phase: number;
  released: boolean;
  tethered: boolean;
  age: number;
  life: number;
  vx: number;
  vy: number;
}

const SPRITE_TONES = 8;
const SPRITE_SIZE = 72;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function buildParticles(count: number): Particle[] {
  const rand = mulberry32(19);
  const { sizeMin, sizeMax } = UNBURDEN_CONFIG.coin;
  const { shells, outerOrbit, scatter } = UNBURDEN_CONFIG.sphere;
  const particles: Particle[] = [];

  const weights: number[] = [];
  let weightSum = 0;
  for (let s = 0; s < shells; s += 1) {
    const orbit = ((s + 1) / shells) * outerOrbit;
    const weight = orbit * orbit;
    weights.push(weight);
    weightSum += weight;
  }

  const counts = weights.map((weight) =>
    Math.max(1, Math.round((weight / weightSum) * count)),
  );
  let drift = counts.reduce((sum, n) => sum + n, 0) - count;
  for (let s = counts.length - 1; s >= 0 && drift !== 0; s -= 1) {
    const next = Math.max(1, counts[s] - drift);
    drift -= counts[s] - next;
    counts[s] = next;
  }

  let seed = 0;
  for (let s = 0; s < shells; s += 1) {
    const n = counts[s];
    const orbit = ((s + 1) / shells) * outerOrbit;
    for (let i = 0; i < n; i += 1) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const y = 1 - t * 2;
      particles.push({
        seed,
        theta: GOLDEN_ANGLE * i + s * 0.51 + (rand() - 0.5) * scatter * 2,
        phi:
          Math.acos(Math.max(-1, Math.min(1, y))) + (rand() - 0.5) * scatter,
        orbit: Math.min(
          outerOrbit,
          Math.max(0.05, orbit + (rand() - 0.5) * scatter * 0.35),
        ),
        size: sizeMin + rand() * (sizeMax - sizeMin),
        alpha: 0.8 + rand() * 0.2,
        tone: Math.floor(rand() * SPRITE_TONES),
        spin: (rand() - 0.5) * UNBURDEN_CONFIG.timing.holdSpin,
        phase: rand() * Math.PI * 2,
        released: false,
        tethered: orbit > 0.62 || seed % 4 === 0,
        age: 0,
        life: 0.95 + rand() * 0.55,
        vx: 0,
        vy: 0,
      });
      seed += 1;
    }
  }

  particles.sort((a, b) => b.orbit - a.orbit);
  return particles;
}

function hexRgb(hex: string) {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function mixRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Matte pastel orb: diagonal periwinkle → peach, high roughness,
 * no specular. Soft-particle alpha at the rim.
 */
function bakeSphereSprite(
  cool: { r: number; g: number; b: number },
  warm: { r: number; g: number; b: number },
  lift: { r: number; g: number; b: number },
  variation: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const image = ctx.createImageData(SPRITE_SIZE, SPRITE_SIZE);
  const data = image.data;
  const cx = (SPRITE_SIZE - 1) / 2;
  const radius = SPRITE_SIZE / 2.08;
  const base = mixRgb(cool, warm, variation);
  const lit = mixRgb(base, lift, 0.22 + variation * 0.18);

  for (let y = 0; y < SPRITE_SIZE; y += 1) {
    for (let x = 0; x < SPRITE_SIZE; x += 1) {
      const nx = (x - cx) / radius;
      const ny = (y - cx) / radius;
      const dist = Math.hypot(nx, ny);
      if (dist > 1.18) continue;

      const wrap = 0.86 + 0.14 * (0.5 + 0.5 * (nx * 0.22 + ny * 0.78));
      const rim = smoothstep(0.55, 1, dist);
      const r = Math.round(Math.min(255, lit.r * wrap + rim * 10));
      const g = Math.round(Math.min(255, lit.g * wrap + rim * 8));
      const b = Math.round(Math.min(255, lit.b * wrap + rim * 7));

      let alpha: number;
      if (dist <= 0.84) {
        alpha = 255;
      } else if (dist >= 1) {
        alpha = Math.round(70 * (1 - smoothstep(1, 1.18, dist)));
      } else {
        alpha = Math.round(255 - 185 * smoothstep(0.84, 1, dist));
      }

      const i = (y * SPRITE_SIZE + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = alpha;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function bakeSphereSprites(
  cool: { r: number; g: number; b: number },
  warm: { r: number; g: number; b: number },
  lift: { r: number; g: number; b: number },
) {
  return Array.from({ length: SPRITE_TONES }, (_, i) =>
    bakeSphereSprite(cool, warm, lift, i / Math.max(SPRITE_TONES - 1, 1)),
  );
}

function drawSphereSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  px: number,
  py: number,
  size: number,
  alpha: number,
) {
  const radius = Math.max(1.1, size);
  const draw = radius * 2.2;
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, px - draw / 2, py - draw / 2, draw, draw);
}

function drawLaserGrid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  time: number,
  reduce: boolean,
  clay: { r: number; g: number; b: number },
  lite: { r: number; g: number; b: number },
  mint: { r: number; g: number; b: number },
  beamTop = -40,
) {
  const { columns, rows, coreWidth, glowWidth } = UNBURDEN_CONFIG.beams;
  const span = radius * 1.08;
  const top = beamTop;
  const bottom = cy - radius * 0.08;
  if (bottom <= 12) return;

  const left = cx - span * 0.5;
  const right = cx + span * 0.5;

  ctx.save();
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';

  for (let j = 0; j < rows; j += 1) {
    const u = j / Math.max(rows - 1, 1);
    const y = top + (bottom - top) * (0.28 + u * 0.72);
    const fade =
      (0.04 + 0.14 * u) *
      (reduce ? 1 : 0.7 + 0.3 * Math.sin(time * 2.4 + j * 0.4));
    ctx.strokeStyle = `rgba(${lite.r},${lite.g},${lite.b},${fade})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  for (let i = 0; i < columns; i += 1) {
    const t = i / Math.max(columns - 1, 1);
    const x = left + span * t;
    const pulse = reduce
      ? 0.92
      : 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(time * 5.2 + i * 0.62));

    const glow = ctx.createLinearGradient(x, top, x, bottom);
    glow.addColorStop(0, `rgba(${mint.r},${mint.g},${mint.b},${0.5 * pulse})`);
    glow.addColorStop(
      0.12,
      `rgba(${lite.r},${lite.g},${lite.b},${0.32 * pulse})`,
    );
    glow.addColorStop(
      0.7,
      `rgba(${clay.r},${clay.g},${clay.b},${0.14 * pulse})`,
    );
    glow.addColorStop(1, `rgba(${clay.r},${clay.g},${clay.b},0)`);
    ctx.strokeStyle = glow;
    ctx.lineWidth = glowWidth;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();

    const core = ctx.createLinearGradient(x, top, x, bottom);
    core.addColorStop(0, `rgba(255,255,255,${pulse})`);
    core.addColorStop(
      0.08,
      `rgba(${mint.r},${mint.g},${mint.b},${0.92 * pulse})`,
    );
    core.addColorStop(
      0.7,
      `rgba(${lite.r},${lite.g},${lite.b},${0.46 * pulse})`,
    );
    core.addColorStop(1, `rgba(${clay.r},${clay.g},${clay.b},0)`);
    ctx.strokeStyle = core;
    ctx.lineWidth = coreWidth;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }

  ctx.restore();
}

interface AvoidRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ScatterHome {
  x: number;
  y: number;
  z: number;
}

interface AvoidZones {
  form: AvoidRect | null;
  header: AvoidRect | null;
}

function boxInFrame(el: Element | null, frame: DOMRect): AvoidRect | null {
  if (!el) return null;
  const box = el.getBoundingClientRect();
  if (box.width < 8 || box.height < 8) return null;
  return {
    x: box.left - frame.left,
    y: box.top - frame.top,
    w: box.width,
    h: box.height,
  };
}

function measureAvoidZones(field: HTMLElement): AvoidZones {
  const root = field.closest('[data-unburden-root]');
  const scope = root ?? document;
  const frame = field.getBoundingClientRect();
  return {
    form: boxInFrame(scope.querySelector('[data-unburden-form]'), frame),
    header: boxInFrame(
      scope.querySelector('[data-unburden-header], header'),
      frame,
    ),
  };
}

interface ScatterPads {
  formX: number;
  formY: number;
  header: number;
}

interface Band {
  x: number;
  y: number;
  w: number;
  h: number;
}

function expandRect(rect: AvoidRect, padX: number, padY: number): AvoidRect {
  return {
    x: rect.x - padX,
    y: rect.y - padY,
    w: rect.w + padX * 2,
    h: rect.h + padY * 2,
  };
}

function pointInRect(px: number, py: number, rect: AvoidRect) {
  return (
    px >= rect.x &&
    px <= rect.x + rect.w &&
    py >= rect.y &&
    py <= rect.y + rect.h
  );
}

function blocked(
  px: number,
  py: number,
  zones: AvoidZones,
  pads: ScatterPads,
) {
  if (zones.header && pointInRect(px, py, expandRect(zones.header, 0, pads.header))) {
    return true;
  }
  if (zones.form && pointInRect(px, py, expandRect(zones.form, pads.formX, pads.formY))) {
    return true;
  }
  return false;
}

function freeBands(
  width: number,
  height: number,
  zones: AvoidZones,
  pads: ScatterPads,
  edge: number,
): Band[] {
  const headerBottom = zones.header
    ? zones.header.y + zones.header.h + pads.header
    : edge;
  const top = Math.max(edge, headerBottom);
  const floor = height - edge;
  const left = edge;
  const right = width - edge;
  if (floor - top < 12 || right - left < 12) return [];

  if (!zones.form) {
    return [{ x: left, y: top, w: right - left, h: floor - top }];
  }

  const form = expandRect(zones.form, pads.formX, pads.formY);
  const fx0 = Math.max(left, form.x);
  const fy0 = Math.max(top, form.y);
  const fx1 = Math.min(right, form.x + form.w);
  const fy1 = Math.min(floor, form.y + form.h);
  const minSide = width < 720 ? 10 : 16;
  const minStrip = width < 720 ? 10 : 14;

  const bands: Band[] = [];
  if (fx0 - left >= minSide) {
    bands.push({ x: left, y: top, w: fx0 - left, h: floor - top });
  }
  if (right - fx1 >= minSide) {
    bands.push({ x: fx1, y: top, w: right - fx1, h: floor - top });
  }
  if (fy0 - top >= minStrip) {
    bands.push({ x: left, y: top, w: right - left, h: fy0 - top });
  }
  if (floor - fy1 >= minStrip) {
    bands.push({ x: left, y: fy1, w: right - left, h: floor - fy1 });
  }
  return bands.filter((band) => band.w >= 10 && band.h >= 10);
}

function pickBand(bands: Band[], seed: number): Band | null {
  if (!bands.length) return null;
  const weights = bands.map((band) => Math.pow(band.w * band.h, 1.05));
  const sum = weights.reduce((total, weight) => total + weight, 0);
  if (sum <= 0) return bands[0] ?? null;
  let ticket = hash2(seed, 3) * sum;
  for (let i = 0; i < bands.length; i += 1) {
    ticket -= weights[i] ?? 0;
    if (ticket <= 0) return bands[i] ?? null;
  }
  return bands[bands.length - 1] ?? null;
}

function fract(value: number) {
  return value - Math.floor(value);
}

function hash2(seed: number, salt: number) {
  return fract(Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453);
}

/** Seat inside leftover page bands so the field follows the form as it resizes. */
function scatterHome(
  particle: Particle,
  width: number,
  height: number,
  zones: AvoidZones,
  pads: ScatterPads,
): ScatterHome | null {
  const narrow = width < 720;
  const edge = Math.max(narrow ? 10 : 14, Math.min(width, height) * 0.018);
  const bands = freeBands(width, height, zones, pads, edge);
  if (!bands.length) return null;
  if (hash2(particle.seed, 99) < (narrow ? 0.12 : 0.2)) return null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const band = pickBand(bands, particle.seed + attempt * 17);
    if (!band) continue;
    const a = hash2(particle.seed, attempt * 3.17 + 0.4);
    const b = hash2(particle.seed, attempt * 8.91 + 2.2);
    const kind = hash2(particle.seed, attempt * 1.7 + 11);

    let u: number;
    let v: number;
    if (kind < 0.42) {
      u = Math.pow(a, 0.55);
      v = Math.pow(b, kind < 0.22 ? 0.45 : 1.35);
      if (hash2(particle.seed, attempt + 4) > 0.5) u = 1 - u;
    } else if (kind < 0.75) {
      u = fract(a * 5.1 + b * 2.4);
      v = fract(b * 4.6 + a * 1.8);
    } else {
      u = Math.pow(a, 0.38);
      v = Math.pow(b, 1.2);
      if (hash2(particle.seed, attempt + 21) > 0.5) u = 1 - u;
    }

    const x = band.x + 4 + u * Math.max(1, band.w - 8);
    const y = band.y + 4 + v * Math.max(1, band.h - 8);
    if (blocked(x, y, zones, pads)) continue;

    const z =
      (hash2(particle.seed, 13) * 2 - 1) * 0.82 +
      (particle.orbit - 0.5) * 0.36;
    return {
      x,
      y,
      z: Math.max(-1, Math.min(1, z)),
    };
  }

  return null;
}

function spherePoint(
  particle: Particle,
  radius: number,
  rot: number,
  jitter: number,
  time: number,
  reduce: boolean,
) {
  const wobble = reduce
    ? 1
    : 1 + Math.sin(time * 1.4 + particle.phase) * jitter;
  const reach = particle.orbit * radius * wobble;
  const sinPhi = Math.sin(particle.phi);
  const x = reach * sinPhi * Math.cos(particle.theta);
  const y = reach * Math.cos(particle.phi);
  const z = reach * sinPhi * Math.sin(particle.theta);
  if (reduce) return { x, y, z };
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);
  return {
    x: x * cosR - z * sinR,
    y,
    z: x * sinR + z * cosR,
  };
}

export function MassField({
  mass,
  held,
  budget,
  mode = 'palm',
  reducedMotion,
  onStats,
  className,
}: MassFieldProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const reduce = reducedMotion ?? prefersReduced;
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useMemo(
    () => buildParticles(UNBURDEN_CONFIG.particles.max),
    [UNBURDEN_CONFIG.coin.sizeMin, UNBURDEN_CONFIG.coin.sizeMax],
  );
  const heldTarget = useRef(held);
  const massRef = useRef(mass);
  const budgetRef = useRef(budget);

  heldTarget.current = held;
  massRef.current = mass;
  budgetRef.current = budget;

  useLayoutEffect(() => {
    const node = stageRef.current;
    const canvas = canvasRef.current;
    if (!node || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ticks = 0;
    let raf = 0;
    let last = performance.now();
    let running = true;
    let hand: HTMLImageElement | null = null;
    const clay = hexRgb(UNBURDEN_CONFIG.colors.particle);
    const lite = hexRgb(UNBURDEN_CONFIG.colors.particleLite);
    const mint = hexRgb(UNBURDEN_CONFIG.colors.highlight);
    const sprites = bakeSphereSprites(clay, lite, mint);
    const spread = mode === 'spread';

    if (!spread) {
      loadHandImage().then((img) => {
        if (running) hand = img;
      });
    }

    const resize = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.round(rect.width * dpr));
      const nextH = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width === nextW && canvas.height === nextH) return;
      canvas.width = nextW;
      canvas.height = nextH;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    const frame = node.closest('[data-unburden-root]');
    if (frame && frame !== node) observer.observe(frame);
    window.addEventListener('resize', resize);

    const draw = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      const fieldBox = node.getBoundingClientRect();
      const width = fieldBox.width;
      const height = fieldBox.height;
      ctx.clearRect(0, 0, width, height);

      const target = heldTarget.current;
      const activeCount = Math.min(budgetRef.current, particles.length);
      const holdCount = Math.min(target, activeCount);

      if (spread) {
        const zones = measureAvoidZones(node);
        const spreadCfg = UNBURDEN_CONFIG.spread;
        const cap = spreadCfg.cap ?? 190;
        const narrow = width < 720;
        const pads: ScatterPads = {
          formX: narrow ? 12 : (spreadCfg.formPad ?? 32),
          formY: narrow ? 8 : (spreadCfg.formPad ?? 32),
          header: narrow ? 14 : (spreadCfg.headerPad ?? 16),
        };
        const shown = Math.min(holdCount, cap, particles.length);
        const activeFrom = particles.length - shown;
        const time = now / 1000;
        const wander = reduce ? 0 : (spreadCfg.drift ?? 22);
        const fieldAlpha = spreadCfg.opacity ?? 0.5;

        const drawable: {
          particle: Particle;
          px: number;
          py: number;
          z: number;
        }[] = [];

        particles.forEach((particle, rank) => {
          if (rank < activeFrom) return;
          const home = scatterHome(particle, width, height, zones, pads);
          if (!home) return;
          const px =
            home.x +
            Math.sin(time * 0.31 + particle.phase * 1.7) *
              wander *
              (0.55 + particle.orbit);
          const py =
            home.y +
            Math.cos(time * 0.24 + particle.phase * 0.9) *
              wander *
              (0.4 + particle.orbit * 0.7);
          if (
            blocked(px, py, zones, {
              formX: pads.formX * 0.7,
              formY: pads.formY * 0.7,
              header: pads.header,
            })
          ) {
            return;
          }
          const z = reduce
            ? home.z
            : Math.max(
                -1,
                Math.min(
                  1,
                  home.z + Math.sin(time * 0.33 + particle.phase) * 0.14,
                ),
              );
          drawable.push({ particle, px, py, z });
        });

        drawable.sort((a, b) => a.z - b.z);
        for (const { particle, px, py, z } of drawable) {
          const depth = 0.62 + 0.38 * ((z + 1) * 0.5);
          const variety = 0.62 + hash2(particle.seed, 5) * 0.95;
          const size =
            particle.size * variety * (0.48 + 0.92 * depth);
          const shade = Math.min(
            1,
            Math.max(
              0,
              0.28 +
                0.52 * depth +
                0.2 * hash2(particle.seed, 8),
            ),
          );
          const tone = Math.round(shade * (SPRITE_TONES - 1));
          drawSphereSprite(
            ctx,
            sprites[tone] ?? sprites[particle.tone] ?? sprites[0]!,
            px,
            py,
            size,
            particle.alpha * depth * fieldAlpha,
          );
        }

        ctx.globalAlpha = 1;
        if (ticks % 12 === 0) {
          onStats?.({
            held: drawable.length,
            releasing: 0,
            budget: budgetRef.current,
          });
        }
        ticks += 1;
        raf = requestAnimationFrame(draw);
        return;
      }

      const m = massRef.current;
      const layout = layoutScene(width, height, m.r);
      const time = now / 1000;
      const floatY = handFloat(time, reduce);
      const cx = layout.palmX;
      const radius = layout.clusterR;
      const cy =
        layout.palmY - radius * UNBURDEN_CONFIG.clusterHover + floatY;
      const sizeScale = Math.max(0.4, Math.min(0.78, radius / 200));
      drawHand(ctx, layout, hand, floatY);

      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.08);
      const density = Math.min(holdCount / 420, 1);
      wash.addColorStop(
        0,
        `rgba(${mint.r},${mint.g},${mint.b},${0.1 * density})`,
      );
      wash.addColorStop(
        0.45,
        `rgba(${clay.r},${clay.g},${clay.b},${0.12 * density})`,
      );
      wash.addColorStop(1, `rgba(${clay.r},${clay.g},${clay.b},0)`);
      ctx.fillStyle = wash;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      let heldCountNow = 0;
      let releasing = 0;

      const activeFrom = particles.length - activeCount;
      particles.forEach((particle, rank) => {
        const exists = rank >= activeFrom;
        const shouldHold = rank >= particles.length - holdCount;

        if (!exists) {
          particle.released = false;
          particle.age = 0;
          return;
        }

        if (!shouldHold && !particle.released) {
          particle.released = true;
          particle.tethered = true;
          particle.age = 0;
          if (reduce) {
            particle.vx = 0;
            particle.vy = 0;
          } else {
            particle.vx =
              (particle.seed % 2 === 0 ? -1 : 1) * (4 + particle.orbit * 8);
            particle.vy = -48 - particle.orbit * 26;
          }
        }

        if (shouldHold && particle.released) {
          particle.released = false;
          particle.age = 0;
          particle.tethered = particle.orbit > 0.62 || particle.seed % 4 === 0;
        }

        if (particle.released) {
          particle.age += dt;
          const t = Math.min(particle.age / particle.life, 1);
          particle.vx *= 1 - dt * 0.55;
          particle.vy -= 22 * (1 - t) * dt;
          if (particle.vy > -10) particle.vy = -10;
          releasing += 1;
        } else {
          heldCountNow += 1;
        }
      });

      const jitter = UNBURDEN_CONFIG.timing.holdJitter;
      const rot = reduce ? 0 : time * UNBURDEN_CONFIG.sphere.spin;

      const placed: {
        particle: Particle;
        px: number;
        py: number;
        z: number;
        live: number;
      }[] = [];

      particles.forEach((particle, rank) => {
        const exists = rank >= activeFrom;
        const live = particle.released
          ? 1 - Math.min(particle.age / particle.life, 1)
          : 1;
        if (!exists || (live <= 0.02 && particle.released)) return;

        const point = spherePoint(particle, radius, rot, jitter, time, reduce);
        let px: number;
        let py: number;
        let z = point.z;

        if (particle.released) {
          const traveled = particle.age;
          px = cx + point.x + particle.vx * traveled;
          py = Math.min(cy + point.y + particle.vy * traveled, cy + point.y);
          z += traveled * 8;
        } else {
          px = cx + point.x;
          py = cy + point.y;
        }

        placed.push({ particle, px, py, z, live });
      });

      drawLaserGrid(
        ctx,
        cx,
        cy,
        radius,
        time,
        reduce,
        clay,
        lite,
        mint,
        layout.beamTop,
      );

      const drawable = placed.sort((a, b) => a.z - b.z);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.04, 0, Math.PI * 2);
      ctx.clip();
      for (const { particle, px, py, z } of drawable) {
        if (particle.released) continue;
        const depth = 0.62 + 0.38 * ((z / Math.max(radius, 1) + 1) * 0.5);
        const alpha = particle.alpha * depth;
        const size = particle.size * (0.82 + 0.18 * depth) * sizeScale;
        const shade = Math.min(
          1,
          Math.max(
            0,
            0.5 +
              0.5 *
                (((px - cx) / Math.max(radius, 1)) * 0.58 +
                  ((py - cy) / Math.max(radius, 1)) * 0.82),
          ),
        );
        const tone = Math.round(shade * (SPRITE_TONES - 1));
        drawSphereSprite(
          ctx,
          sprites[tone] ?? sprites[particle.tone] ?? sprites[0]!,
          px,
          py,
          size,
          alpha,
        );
      }
      ctx.restore();

      for (const { particle, px, py, z, live } of drawable) {
        if (!particle.released) continue;
        const fade = live * live;
        const depth = 0.62 + 0.38 * ((z / Math.max(radius, 1) + 1) * 0.5);
        const alpha = particle.alpha * fade * depth;
        const size =
          particle.size * (0.72 + live * 0.28) * (0.82 + 0.18 * depth) * sizeScale;
        const shade = Math.min(
          1,
          Math.max(
            0,
            0.5 +
              0.5 *
                (((px - cx) / Math.max(radius, 1)) * 0.58 +
                  ((py - cy) / Math.max(radius, 1)) * 0.82),
          ),
        );
        const tone = Math.round(shade * (SPRITE_TONES - 1));
        drawSphereSprite(
          ctx,
          sprites[tone] ?? sprites[particle.tone] ?? sprites[0]!,
          px,
          py,
          size,
          alpha,
        );
      }

      ctx.globalAlpha = 1;

      if (ticks % 12 === 0) {
        onStats?.({ held: heldCountNow, releasing, budget: budgetRef.current });
      }
      ticks += 1;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [mode, onStats, particles, reduce]);

  return (
    <div
      ref={stageRef}
      className={`${styles.field}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
