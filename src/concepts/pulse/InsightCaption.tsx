import { motion, useReducedMotion } from 'motion/react';
import { PULSE_CONFIG } from './PulseField';
import styles from './insightCaption.module.css';

/* ------------------------------------------------------------------ *
 * Config
 * ------------------------------------------------------------------ */

export const INSIGHT_CONFIG = {
  /**
   * Lands after the cluster it annotates has finished forming, so it reads
   * as a note about the field rather than a second thing arriving at once.
   */
  delayAfterCluster: 0.3,
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
  reduced: { duration: 0.2 },
} as const;

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export interface InsightCaptionProps {
  text: string;
  /** Fractions of the stage, so the caption tracks the cluster it annotates. */
  anchorPosition: { x: number; y: number };
  /**
   * `hero` is reserved for the income step, which carries the largest
   * caption of the flow.
   */
  tone?: 'default' | 'hero';
  /** Overrides the default "after the cluster settles" timing. */
  delay?: number;
  className?: string;
}

export function InsightCaption({
  text,
  anchorPosition,
  tone = 'default',
  delay,
  className,
}: InsightCaptionProps) {
  const reduceMotion = useReducedMotion() ?? false;

  const settled =
    delay ??
    PULSE_CONFIG.timing.cluster.duration + INSIGHT_CONFIG.delayAfterCluster;

  /* Past the midline the caption hangs from its right edge and mirrors its
     tick, so it opens inward instead of running off the frame. */
  const trailing = anchorPosition.x > 0.5;

  return (
    <motion.p
      className={`${styles.caption}${className ? ` ${className}` : ''}`}
      data-tone={tone}
      data-side={trailing ? 'right' : 'left'}
      style={{
        ...(trailing
          ? { right: `${(1 - anchorPosition.x) * 100}%` }
          : { left: `${anchorPosition.x * 100}%` }),
        top: `${anchorPosition.y * 100}%`,
      }}
      /* Opacity only, at either motion setting: the caption is anchored to a
         point in the field, so moving it would break the association. */
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: reduceMotion
          ? INSIGHT_CONFIG.reduced.duration
          : INSIGHT_CONFIG.duration,
        delay: reduceMotion ? 0 : settled,
        ease: INSIGHT_CONFIG.ease,
      }}
    >
      <span className={styles.mark} aria-hidden="true" />
      <span className={styles.text}>{text}</span>
    </motion.p>
  );
}
