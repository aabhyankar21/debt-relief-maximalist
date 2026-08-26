import { motion, useReducedMotion } from 'motion/react';
import { useAnimatedNumber } from '../../engine/useAnimatedNumber';
import styles from './aurora.module.css';

const CHAIN_LINKS = 5;
const PARTICLES = 7;

/**
 * Progress-driven orb: the ring fills, the chain links below dissolve, and
 * released particles rise as the journey advances.
 */
export function ReliefOrb({
  progress,
  showValue = true,
}: {
  progress: number;
  showValue?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const label = useAnimatedNumber(progress, '%');
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const t = progress / 100;

  return (
    <svg className={styles.orb} viewBox="0 0 280 300" aria-hidden="true">
      <defs>
        <linearGradient id="orbArc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ee7f9" />
          <stop offset="55%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <radialGradient id="orbCore" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="rgb(147 197 253 / 55%)" />
          <stop offset="52%" stopColor="rgb(99 102 241 / 22%)" />
          <stop offset="100%" stopColor="rgb(15 23 42 / 5%)" />
        </radialGradient>
        <filter id="orbGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform="translate(140 118)">
        <circle className={styles.orbCore} r="82" fill="url(#orbCore)" />
        {showValue ? (
          <motion.text
            className={styles.orbValue}
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {label}
          </motion.text>
        ) : null}
        <circle
          r={radius}
          fill="none"
          stroke="rgb(255 255 255 / 12%)"
          strokeWidth="4"
        />
        <motion.circle
          className={styles.orbArc}
          r={radius}
          fill="none"
          stroke="url(#orbArc)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#orbGlow)"
          transform="rotate(-90)"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - t) }}
          transition={{ type: 'spring', stiffness: 90, damping: 22 }}
        />

        {/* Released particles rise once relief begins */}
        {Array.from({ length: PARTICLES }, (_, i) => {
          const visible = t > (i + 1) / (PARTICLES + 2);
          const x = -58 + i * 19;
          return (
            <motion.circle
              key={i}
              cx={x}
              r={2.6}
              fill="#a5f3fc"
              initial={false}
              animate={
                visible
                  ? {
                      cy: reduceMotion ? -34 : [26, -46],
                      opacity: reduceMotion ? 0.8 : [0, 0.9, 0],
                    }
                  : { cy: 26, opacity: 0 }
              }
              transition={
                reduceMotion
                  ? { duration: 0.3 }
                  : {
                      duration: 3.6 + i * 0.35,
                      repeat: Infinity,
                      delay: i * 0.42,
                      ease: 'easeOut',
                    }
              }
            />
          );
        })}
      </g>

      {/* Chain links dissolve as progress grows */}
      <g transform="translate(140 244)">
        {Array.from({ length: CHAIN_LINKS }, (_, i) => {
          const broken = t >= (i + 1) / CHAIN_LINKS;
          const x = (i - (CHAIN_LINKS - 1) / 2) * 34;
          return (
            <motion.g
              key={i}
              initial={false}
              animate={{
                opacity: broken ? 0 : 0.6,
                y: broken ? -14 : 0,
                scale: broken ? 0.6 : 1,
                rotate: broken ? (i % 2 ? 22 : -22) : 0,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ originX: '50%', originY: '50%' }}
            >
              <ellipse
                cx={x}
                cy="0"
                rx="12"
                ry="17"
                fill="none"
                stroke="rgb(226 232 240 / 55%)"
                strokeWidth="3"
              />
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
}
