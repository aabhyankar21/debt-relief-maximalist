import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  MOSAIC_CONFIG,
  filledThroughStep,
  tilesForStep,
  type MosaicBand,
} from './config';
import styles from './mosaicGrid.module.css';

export interface MosaicGridStats {
  filled: number;
  total: number;
  stepTiles: number;
}

export interface MosaicGridProps {
  step: number;
  /** 0–1, or null when step 1 has no answer yet. */
  debtAmountBand: number | null;
  incomeBand: number;
  matchedDebtTypeIndex?: number;
  className?: string;
  reducedMotion?: boolean;
  onStats?: (stats: MosaicGridStats) => void;
}

interface TileSpec {
  i: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  radius: number;
  tone: number;
  band: MosaicBand;
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string) {
  const raw = hex.replace('#', '');
  const value = Number.parseInt(raw, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const to = (channel: number) =>
    clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Hand-colored variation inside a band, not a second palette. */
function toneHex(hex: string, tone: number) {
  const { r, g, b } = hexToRgb(hex);
  const shift = tone * 20;
  return rgbToHex(r + shift, g + shift * 0.88, b + shift * 0.7);
}

function bandForIndex(
  index: number,
  debtAmountBand: number | null,
  incomeBand: number,
): MosaicBand {
  let cursor = 0;
  for (let step = 1; step <= 9; step += 1) {
    const count = tilesForStep(
      step,
      debtAmountBand,
      incomeBand,
      MOSAIC_CONFIG.tileCount - cursor,
    );
    if (index < cursor + count) {
      return MOSAIC_CONFIG.steps[step as keyof typeof MOSAIC_CONFIG.steps]
        .colorBand;
    }
    cursor += count;
  }
  return 'gold';
}

/**
 * Vogel spiral from the centre, then a few separation passes so the
 * three size classes sit as a loose mosaic rather than a spreadsheet.
 * Fill order is generation order — always the next unfilled spiral slot.
 */
function layoutTiles(
  count: number,
  debtAmountBand: number | null,
  incomeBand: number,
): TileSpec[] {
  const rand = mulberry32(2026);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const sizes = [
    { w: 0.068, h: 0.062 },
    { w: 0.094, h: 0.088 },
    { w: 0.122, h: 0.112 },
  ];
  const pattern = [1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 2, 0, 1];

  const tiles: TileSpec[] = [];
  for (let i = 0; i < count; i += 1) {
    const radius = 0.038 + 0.4 * Math.sqrt(i / Math.max(count - 1, 1));
    const angle = i * golden + 0.4;
    const size = sizes[pattern[i % pattern.length]];
    tiles.push({
      i,
      x: 0.5 + radius * Math.cos(angle),
      y: 0.5 + radius * Math.sin(angle),
      w: size.w * (0.86 + rand() * 0.28),
      h: size.h * (0.86 + rand() * 0.28),
      rotate: (rand() - 0.5) * 9,
      radius: 2.2 + rand() * 5.4,
      tone: rand() * 2 - 1,
      band: bandForIndex(i, debtAmountBand, incomeBand),
    });
  }

  for (let pass = 0; pass < 8; pass += 1) {
    for (let i = 0; i < tiles.length; i += 1) {
      for (let j = i + 1; j < tiles.length; j += 1) {
        const a = tiles[i];
        const b = tiles[j];
        const gap = 0.007;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const ox = (a.w + b.w) / 2 + gap;
        const oy = (a.h + b.h) / 2 + gap;
        if (Math.abs(dx) >= ox || Math.abs(dy) >= oy) continue;
        const pushX = (ox - Math.abs(dx)) * Math.sign(dx || 1) * 0.5;
        const pushY = (oy - Math.abs(dy)) * Math.sign(dy || 1) * 0.5;
        a.x -= pushX;
        a.y -= pushY;
        b.x += pushX;
        b.y += pushY;
      }
    }
  }

  for (const tile of tiles) {
    tile.x = clamp(tile.x, tile.w / 2 + 0.016, 1 - tile.w / 2 - 0.016);
    tile.y = clamp(tile.y, tile.h / 2 + 0.016, 1 - tile.h / 2 - 0.016);
  }

  return tiles;
}

export function MosaicGrid({
  step,
  debtAmountBand,
  incomeBand,
  matchedDebtTypeIndex,
  className,
  reducedMotion,
  onStats,
}: MosaicGridProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const reduceMotion = reducedMotion ?? prefersReduced;
  const { tileCount, colors, timing } = MOSAIC_CONFIG;

  const filled = filledThroughStep(step, debtAmountBand, incomeBand);
  const stepTiles = tilesForStep(
    step,
    debtAmountBand,
    incomeBand,
    tileCount - filledThroughStep(step - 1, debtAmountBand, incomeBand),
  );

  const tiles = useMemo(
    () => layoutTiles(tileCount, debtAmountBand, incomeBand),
    [tileCount, debtAmountBand, incomeBand],
  );

  /* The wave starts from however many were already filled, so only the
     newly-claimed spiral slots play the scale/bloom. */
  const committed = useRef(0);
  const [waveFrom, setWaveFrom] = useState(0);
  const [bloom, setBloom] = useState(false);

  useEffect(() => {
    setWaveFrom(committed.current);
    committed.current = filled;
  }, [filled]);

  useEffect(() => {
    if (step !== 9) {
      setBloom(false);
      return;
    }
    const wait = reduceMotion ? timing.reducedMs : 420;
    const timer = window.setTimeout(() => setBloom(true), wait);
    return () => window.clearTimeout(timer);
  }, [step, reduceMotion, timing.reducedMs]);

  useEffect(() => {
    onStats?.({ filled, total: tileCount, stepTiles });
  }, [filled, tileCount, stepTiles, onStats]);

  const stepConfig = MOSAIC_CONFIG.steps[step as keyof typeof MOSAIC_CONFIG.steps];
  const stagger = stepConfig?.stagger === true && !reduceMotion;
  const variant = stepConfig?.animationVariant ?? 'fill';

  const step2Start = filledThroughStep(1, debtAmountBand, incomeBand);
  const step2End = step2Start + tilesForStep(2, debtAmountBand, incomeBand, tileCount);
  const otpStart = filledThroughStep(5, debtAmountBand, incomeBand);
  const otpEnd = otpStart + tilesForStep(6, debtAmountBand, incomeBand, tileCount);

  return (
    <div
      className={`${styles.field}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      data-reduced={reduceMotion ? 'true' : undefined}
      style={{
        ['--mosaic-empty' as string]: colors.empty,
        ['--mosaic-shimmer' as string]: `${timing.shimmerS}s`,
      }}
    >
      {tiles.map((tile) => {
        const isFilled = tile.i < filled;
        const isNew = isFilled && tile.i >= waveFrom;
        const delayIndex = tile.i - waveFrom;
        const delay = stagger && isNew ? (delayIndex * timing.staggerMs) / 1000 : 0;
        const color = toneHex(colors[tile.band], tile.tone);
        const boostSat =
          matchedDebtTypeIndex != null &&
          matchedDebtTypeIndex <= 1 &&
          tile.i >= step2Start &&
          tile.i < step2End;
        const showOtp =
          variant === 'otp-icon' && tile.i >= otpStart && tile.i < otpEnd && isFilled;

        const fillTransition = reduceMotion
          ? { duration: timing.reducedMs / 1000, ease: 'linear' as const }
          : {
              duration: timing.fillMs / 1000,
              ease: [0.22, 1, 0.36, 1] as const,
              delay,
            };

        const scaleAnimate = reduceMotion
          ? { scale: 1 }
          : bloom
            ? { scale: [1, 1.04, 1] }
            : isNew
              ? { scale: [0.85, 1.05, 1] }
              : { scale: 1 };

        const scaleTransition = bloom
          ? {
              duration: reduceMotion ? timing.reducedMs / 1000 : timing.bloomMs / 1000,
              ease: 'easeOut' as const,
            }
          : isNew && !reduceMotion
            ? { type: 'spring' as const, ...timing.spring, delay }
            : { duration: 0.2 };

        return (
          <motion.div
            key={tile.i}
            className={styles.tile}
            style={{
              left: `${(tile.x - tile.w / 2) * 100}%`,
              top: `${(tile.y - tile.h / 2) * 100}%`,
              width: `${tile.w * 100}%`,
              height: `${tile.h * 100}%`,
              borderRadius: tile.radius,
              rotate: tile.rotate,
              filter: bloom
                ? undefined
                : boostSat
                  ? 'saturate(1.28)'
                  : undefined,
            }}
            initial={false}
            animate={{
              ...scaleAnimate,
              filter: bloom
                ? ['brightness(1)', 'brightness(1.15)', 'brightness(1)']
                : boostSat
                  ? 'saturate(1.28)'
                  : 'brightness(1)',
            }}
            transition={scaleTransition}
          >
            <span className={styles.grout} />
            <motion.span
              className={styles.paint}
              style={{
                background: `radial-gradient(circle at 35% 30%, ${toneHex(color, 0.45)} 0%, ${color} 62%, ${toneHex(color, -0.35)} 100%)`,
                animationDelay: `${tile.i * 0.16}s`,
              }}
              initial={false}
              animate={{
                clipPath: isFilled
                  ? 'circle(145% at 50% 50%)'
                  : 'circle(0% at 50% 50%)',
                opacity: isFilled ? 1 : 0,
              }}
              transition={
                reduceMotion
                  ? { duration: timing.reducedMs / 1000, ease: 'linear' as const }
                  : fillTransition
              }
            >
              {showOtp ? (
                <motion.svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={false}
                  animate={{
                    strokeDashoffset: 0,
                  }}
                  style={{ strokeDasharray: 28, strokeDashoffset: 28 }}
                  transition={{
                    duration: reduceMotion
                      ? timing.reducedMs / 1000
                      : timing.otpMs / 1000,
                    ease: 'easeOut',
                    delay,
                  }}
                >
                  <path
                    d="M8 12.4 10.6 15 16 9"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              ) : null}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}

