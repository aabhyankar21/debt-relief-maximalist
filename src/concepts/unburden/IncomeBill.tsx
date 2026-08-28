import type { CSSProperties } from 'react';
import coin from './coin.png';
import { clamp01, lerp } from './config';
import styles from './incomeBill.module.css';

const preload = new Image();
preload.src = coin;

/**
 * Pile layers. `from` is the income-band floor that reveals the coin
 * (0 = default / <$10k / Unsure). Higher bands stack more coins.
 *
 * Counts: default 5 → $10–50k 7 → $50–100k 9 → $100k+ 12
 */
const COINS = [
  // Default / <$10k / Unsure — 5
  { x: '-20%', y: '26%', rotate: '-20deg', z: 1, size: 0.9, from: 0 },
  { x: '18%', y: '28%', rotate: '24deg', z: 2, size: 0.86, from: 0 },
  { x: '-4%', y: '12%', rotate: '-4deg', z: 4, size: 1, from: 0 },
  { x: '12%', y: '6%', rotate: '14deg', z: 5, size: 0.84, from: 0 },
  { x: '-16%', y: '4%', rotate: '-28deg', z: 3, size: 0.8, from: 0 },
  // $10–50k — +2 → 7
  { x: '4%', y: '-8%', rotate: '8deg', z: 6, size: 0.82, from: 0.25 },
  { x: '24%', y: '8%', rotate: '32deg', z: 3, size: 0.76, from: 0.25 },
  // $50–100k — +2 → 9
  { x: '-12%', y: '-18%', rotate: '-14deg', z: 7, size: 0.78, from: 0.55 },
  { x: '18%', y: '-16%', rotate: '18deg', z: 6, size: 0.74, from: 0.55 },
  // $100k+ — +3 → 12
  { x: '0%', y: '-30%', rotate: '4deg', z: 8, size: 0.8, from: 0.85 },
  { x: '-24%', y: '-8%', rotate: '-34deg', z: 4, size: 0.7, from: 0.85 },
  { x: '28%', y: '-6%', rotate: '28deg', z: 5, size: 0.68, from: 0.85 },
] as const;

/** Mild overall grow — most of the lift comes from adding coins. */
function scaleForBand(band: number | null) {
  if (band == null || band <= 0) return 1;
  return lerp(0.97, 1.12, clamp01(band));
}

function bandValue(band: number | null) {
  return band == null ? -1 : clamp01(band);
}

export function IncomeBill({
  incomeBand = null,
  reducedMotion = false,
}: {
  /** 0–1 from hovered/selected income option; null = default pile. */
  incomeBand?: number | null;
  reducedMotion?: boolean;
}) {
  const scale = scaleForBand(incomeBand);
  const active = bandValue(incomeBand);

  return (
    <div
      className={styles.scene}
      data-reduced={reducedMotion || undefined}
      style={{ '--income-scale': String(scale) } as CSSProperties}
    >
      <div className={styles.scale}>
        <div className={styles.float}>
          <div className={styles.pile}>
            {COINS.map((piece, i) => {
              const visible = piece.from === 0 || active >= piece.from;
              return (
                <img
                  key={i}
                  className={styles.coin}
                  src={coin}
                  alt=""
                  draggable={false}
                  data-visible={visible || undefined}
                  style={
                    {
                      '--coin-x': piece.x,
                      '--coin-y': piece.y,
                      '--coin-r': piece.rotate,
                      '--coin-s': String(piece.size),
                      zIndex: piece.z,
                    } as CSSProperties
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
