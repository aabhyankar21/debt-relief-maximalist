import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';
import { useMediaQuery } from '../../engine/useMediaQuery';
import ringsSrc from './assets/rings.png';
import {
  ORBIT_AVATARS,
  ORBIT_AVATARS_MOBILE,
  ORBIT_MOTION,
  ORBIT_SCAN,
  ORBIT_STATS_CARD,
  type OrbitAvatar,
} from './config';
import styles from './insightDeck.module.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const FALLBACK_RGB = '80 90 110';
const dominantColorCache = new Map<string, string>();

/** Clockwise degrees from 12 o'clock for an avatar's center. */
function avatarAngle(avatar: OrbitAvatar): number {
  const cx = avatar.x + avatar.size / 2;
  const cy = avatar.y + avatar.size / 2;
  return (Math.atan2(cx - 50, -(cy - 50)) * 180) / Math.PI;
}

/** Smallest absolute distance between two angles in degrees. */
function angularDist(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
}

/** Lift very dark samples so colored shadows still read on white. */
function liftShadowRgb(r: number, g: number, b: number): string {
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum >= 72) {
    return `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;
  }
  const t = (72 - lum) / 72;
  const pull = 0.42 * t;
  return `${Math.round(r + (168 - r) * pull)} ${Math.round(g + (158 - g) * pull)} ${Math.round(b + (150 - b) * pull)}`;
}

/**
 * Sample a vivid dominant RGB from an image (space-separated, for
 * `rgb(var(--avatar-rgb) / a)`). Skips near-white / near-black pixels and
 * weights saturated mid-tones so clothing / props win over gray backgrounds.
 */
function sampleDominantRgb(src: string): Promise<string> {
  const cached = dominantColorCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const size = 40;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        dominantColorCache.set(src, FALLBACK_RGB);
        resolve(FALLBACK_RGB);
        return;
      }

      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      const buckets = new Map<
        string,
        { r: number; g: number; b: number; weight: number }
      >();

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a < 140) continue;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (lum > 236 || lum < 36) continue;

        const sat = max === 0 ? 0 : (max - min) / max;
        // Prefer colorful mid-tones; down-weight gray / muddy pixels.
        if (sat < 0.08 && lum > 160) continue;
        const midBoost = lum > 55 && lum < 190 ? 1.35 : 0.75;
        const weight = (0.35 + sat * 5.5) * midBoost;
        const key = `${r >> 4},${g >> 4},${b >> 4}`;
        const bucket = buckets.get(key);
        if (bucket) {
          bucket.r += r * weight;
          bucket.g += g * weight;
          bucket.b += b * weight;
          bucket.weight += weight;
        } else {
          buckets.set(key, {
            r: r * weight,
            g: g * weight,
            b: b * weight,
            weight,
          });
        }
      }

      let best: { r: number; g: number; b: number; weight: number } | null =
        null;
      for (const bucket of buckets.values()) {
        if (!best || bucket.weight > best.weight) best = bucket;
      }

      const rgb = best
        ? liftShadowRgb(
            best.r / best.weight,
            best.g / best.weight,
            best.b / best.weight,
          )
        : FALLBACK_RGB;
      dominantColorCache.set(src, rgb);
      resolve(rgb);
    };
    img.onerror = () => {
      dominantColorCache.set(src, FALLBACK_RGB);
      resolve(FALLBACK_RGB);
    };
    img.src = src;
  });
}

function useDominantRgb(src: string): string {
  const [rgb, setRgb] = useState(
    () => dominantColorCache.get(src) ?? FALLBACK_RGB,
  );

  useEffect(() => {
    let active = true;
    sampleDominantRgb(src).then((value) => {
      if (active) setRgb(value);
    });
    return () => {
      active = false;
    };
  }, [src]);

  return rgb;
}

/**
 * Step 1 left stage — dashed rings + circular photo avatars.
 * Desktop (Figma 159:11695): orbit + radar sweep scanning avatars + relief-medal hub.
 * Mobile (Figma 192:13248): shorter window of 5 avatars, no callout.
 */
export function InsightDeck({ className }: { className?: string }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion() ?? false;
  const motionOn = isDesktop && !reduceMotion;
  const ringsSpin = !reduceMotion;
  const scanOn = isDesktop && !reduceMotion;
  const [entered, setEntered] = useState(!motionOn);
  const [litId, setLitId] = useState<string | null>(null);
  /** Bumps to remount the face shine each time the radar finishes a lap. */
  const [shineKey, setShineKey] = useState(0);
  const sweepRotate = useMotionValue(0);
  const enteredRef = useRef(entered);
  const reduceMotionRef = useRef(reduceMotion);
  /** True once the sweep has passed ~300° — next wrap to ~0° is a completed lap. */
  const lapArmedRef = useRef(false);
  enteredRef.current = entered;
  reduceMotionRef.current = reduceMotion;

  const avatars = isDesktop ? ORBIT_AVATARS : ORBIT_AVATARS_MOBILE;

  useEffect(() => {
    if (!motionOn) {
      setEntered(true);
      return;
    }
    setEntered(false);
    const ms =
      (ORBIT_MOTION.enterStaggerSec * (avatars.length - 1) +
        ORBIT_MOTION.enterDurSec +
        0.05) *
      1000;
    const timer = window.setTimeout(() => setEntered(true), ms);
    return () => window.clearTimeout(timer);
  }, [motionOn, avatars.length]);

  // One clock for the sweep arm and which avatar is lit — keeps grow in sync.
  useEffect(() => {
    if (!scanOn) {
      sweepRotate.set(0);
      lapArmedRef.current = false;
      setLitId(null);
      return;
    }
    lapArmedRef.current = false;
    sweepRotate.set(0);
    const controls = animate(sweepRotate, 360, {
      duration: ORBIT_SCAN.scanSec,
      ease: 'linear',
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [scanOn, sweepRotate]);

  useMotionValueEvent(sweepRotate, 'change', (deg) => {
    // Arm near the end of a revolution; fire shine on the loop wrap to ~0°.
    if (deg >= 300) {
      lapArmedRef.current = true;
    } else if (lapArmedRef.current && deg < 40) {
      lapArmedRef.current = false;
      if (enteredRef.current && !reduceMotionRef.current) {
        setShineKey((key) => key + 1);
      }
    }

    if (!scanOn || !entered) {
      setLitId((prev) => (prev === null ? prev : null));
      return;
    }
    let bestId: string | null = null;
    let best: number = ORBIT_SCAN.litHalfAngle;
    for (const avatar of avatars) {
      const dist = angularDist(avatarAngle(avatar), deg);
      if (dist < best) {
        best = dist;
        bestId = avatar.id;
      }
    }
    setLitId((prev) => (prev === bestId ? prev : bestId));
  });

  return (
    <div
      className={`${styles.deck}${className ? ` ${className}` : ''}`}
      style={
        {
          ['--scan-sec' as string]: `${ORBIT_SCAN.scanSec}s`,
          ['--lit-scale' as string]: String(ORBIT_SCAN.litScale),
        } as CSSProperties
      }
      data-mobile={!isDesktop || undefined}
      aria-hidden="true"
    >
      <div className={styles.canvas}>
        <motion.img
          className={styles.rings}
          src={ringsSrc}
          alt=""
          draggable={false}
          initial={
            ringsSpin
              ? { scale: motionOn ? 0.94 : 1, rotate: 0 }
              : false
          }
          animate={
            ringsSpin
              ? { scale: 1, rotate: 360 }
              : { scale: 1, rotate: 0 }
          }
          transition={
            ringsSpin
              ? {
                  scale: {
                    duration: motionOn ? 1.1 : 0.01,
                    ease: EASE_OUT,
                  },
                  rotate: {
                    duration: ORBIT_MOTION.ringSpinSec,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }
              : { duration: 0.01 }
          }
        />

        {isDesktop ? (
          <RadarSweep rotate={sweepRotate} enter={motionOn} />
        ) : null}

        {avatars.map((avatar, index) => (
          <AvatarBubble
            key={avatar.id}
            avatar={avatar}
            index={index}
            motionOn={motionOn}
            entered={entered}
            isLit={scanOn && entered && litId === avatar.id}
          />
        ))}

        {isDesktop ? (
          <motion.div
            className={styles.centerCopy}
            style={{
              left: `${ORBIT_STATS_CARD.x}%`,
              top: `${ORBIT_STATS_CARD.y}%`,
              width: `${ORBIT_STATS_CARD.w}%`,
            }}
            initial={motionOn ? { opacity: 0, scale: 0.96 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.55,
              delay: motionOn ? 0.22 : 0,
              ease: EASE_OUT,
            }}
          >
            <div className={styles.medalFace}>
              <span className={styles.medalSpark} data-pos="tl" aria-hidden />
              <span className={styles.medalSpark} data-pos="tr" aria-hidden />
              {shineKey > 0 ? (
                <span
                  key={shineKey}
                  className={styles.medalShine}
                  aria-hidden
                />
              ) : null}
              <span className={styles.readyPill}>
                <span
                  className={styles.readyDot}
                  data-pulse={scanOn ? '' : undefined}
                />
                {ORBIT_STATS_CARD.pill}
              </span>
              <MedalShield className={styles.medalMark} />
              <p className={styles.statsHeadline}>
                {ORBIT_STATS_CARD.headline}
              </p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

function AvatarBubble({
  avatar,
  index,
  motionOn,
  entered,
  isLit,
}: {
  avatar: OrbitAvatar;
  index: number;
  motionOn: boolean;
  entered: boolean;
  isLit: boolean;
}) {
  const floatAmp =
    ORBIT_MOTION.floatAmps[index % ORBIT_MOTION.floatAmps.length];
  const floatDur =
    ORBIT_MOTION.floatDurations[index % ORBIT_MOTION.floatDurations.length];
  const crop = avatar.crop;
  const dominantRgb = useDominantRgb(avatar.image);

  return (
    <motion.div
      className={styles.avatar}
      style={
        {
          left: `${avatar.x}%`,
          top: `${avatar.y}%`,
          width: `${avatar.size}%`,
          height: `${avatar.size}%`,
          zIndex: isLit ? 30 : 10 + avatar.z,
          ['--avatar-rgb' as string]: dominantRgb,
        } as CSSProperties
      }
      initial={
        motionOn
          ? { opacity: 0, scale: 0.72, rotate: avatar.rotate - 8 }
          : false
      }
      animate={{
        opacity: 1,
        scale: isLit ? ORBIT_SCAN.litScale : 1,
        rotate: avatar.rotate,
      }}
      transition={
        entered
          ? {
              type: 'spring',
              ...ORBIT_MOTION.hoverSpring,
            }
          : {
              duration: motionOn ? ORBIT_MOTION.enterDurSec : 0.01,
              delay: motionOn ? index * ORBIT_MOTION.enterStaggerSec : 0,
              ease: EASE_OUT,
            }
      }
    >
      <div
        className={`${styles.avatarScan}${
          isLit ? ` ${styles.avatarScanLit}` : ''
        }`}
      >
        <motion.div
          className={styles.avatarInner}
          animate={
            !motionOn || !entered || isLit
              ? { y: 0 }
              : { y: [0, -floatAmp, 0, floatAmp * 0.45, 0] }
          }
          transition={
            !motionOn || !entered || isLit
              ? { duration: 0.2 }
              : {
                  duration: floatDur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.1,
                }
          }
        >
          {crop ? (
            <img
              src={avatar.image}
              alt=""
              draggable={false}
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.w}%`,
                height: `${crop.h}%`,
              }}
            />
          ) : (
            <img src={avatar.image} alt="" draggable={false} />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function RadarSweep({
  rotate,
  enter,
}: {
  rotate: MotionValue<number>;
  enter: boolean;
}) {
  return (
    <motion.div
      className={styles.radarArm}
      style={{ rotate }}
      initial={enter ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.2 }}
    >
      <div className={styles.radarSweep} />
    </motion.div>
  );
}

/** Embossed shield + check for the relief medal face. */
function MedalShield({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="medalShieldMetal"
          x1="6"
          y1="2"
          x2="42"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffff" />
          <stop offset="0.38" stopColor="#d8e0f5" />
          <stop offset="0.62" stopColor="#9aa8c8" />
          <stop offset="1" stopColor="#eef2ff" />
        </linearGradient>
      </defs>
      <path
        d="M24 2.5C18.2 6.2 11.4 8.4 4.5 9.2v14.6c0 11.4 7.6 21.4 19.5 25.7 11.9-4.3 19.5-14.3 19.5-25.7V9.2C36.6 8.4 29.8 6.2 24 2.5Z"
        stroke="url(#medalShieldMetal)"
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="rgb(255 255 255 / 8%)"
      />
      <path
        d="M16.2 26.2 21.4 31.4 32.2 19.8"
        stroke="url(#medalShieldMetal)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
