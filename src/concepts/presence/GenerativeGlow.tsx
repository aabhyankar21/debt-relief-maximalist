import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PRESENCE_CONFIG } from './config';
import styles from './generativeGlow.module.css';

export interface GenerativeGlowProps {
  /**
   * 0–1, driven by the selected debt band.
   * `0` (or no selection) keeps the idle baseline pulse.
   */
  intensity: number;
  /** Accent colour for the glow layers. Defaults to warm amber. */
  color?: string;
  className?: string;
}

/**
 * Soft light composited over the photo. Idle: a low-amplitude pulse.
 * On selection: blooms to the band intensity over ~500–600ms, then
 * settles into a quieter pulse at that new baseline.
 *
 * Band→intensity mapping stays in the parent/config — this component
 * only renders the light at the intensity it is given.
 */
export function GenerativeGlow({
  intensity,
  color = PRESENCE_CONFIG.colors.glow,
  className,
}: GenerativeGlowProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { glow } = PRESENCE_CONFIG;
  const target = intensity > 0 ? intensity : glow.idleIntensity;
  const duration = reduceMotion ? glow.reducedCrossfadeS : glow.bloomS;

  const opacity = 0.32 + target * 0.68;
  const scale = 0.76 + target * 0.44;

  return (
    <div
      className={`${styles.glow}${className ? ` ${className}` : ''}`}
      style={
        {
          '--glow-color': color,
          '--glow-x': glow.anchorX,
          '--glow-y': glow.anchorY,
          '--glow-pulse-s': `${glow.idlePulseS}s`,
          '--glow-pulse-amp': String(glow.idlePulseAmplitude),
        } as CSSProperties
      }
      aria-hidden="true"
      data-pulse={reduceMotion ? 'off' : 'on'}
    >
      {/* Outer Motion node owns intensity bloom; inner CSS node owns idle pulse
          so the two never fight over the same transform. */}
      <motion.div
        className={styles.slot}
        initial={false}
        animate={{ opacity: opacity * 0.65, scale: scale * 1.08 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`${styles.layer} ${styles.haze}`} />
      </motion.div>
      <motion.div
        className={styles.slot}
        initial={false}
        animate={{ opacity, scale }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`${styles.layer} ${styles.bloom}`} />
      </motion.div>
      <motion.div
        className={styles.slot}
        initial={false}
        animate={{ opacity: opacity * 1.08, scale: scale * 0.9 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`${styles.layer} ${styles.core}`} />
      </motion.div>
    </div>
  );
}
