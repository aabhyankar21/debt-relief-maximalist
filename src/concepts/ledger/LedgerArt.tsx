import { motion, useReducedMotion } from 'motion/react';
import styles from './ledger.module.css';

const draw = (delay: number, duration = 1.1) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: {
    pathLength: { delay, duration, ease: [0.22, 1, 0.36, 1] as const },
    opacity: { delay, duration: 0.2 },
  },
});

/** Hand-drawn line art that redraws itself for each step of the journey. */
function StepArt({ stepId }: { stepId: string }) {
  switch (stepId) {
    case 'debt-amount':
      return (
        <>
          <motion.rect x="52" y="118" width="116" height="26" rx="13" {...draw(0.1)} />
          <motion.rect x="52" y="86" width="116" height="26" rx="13" {...draw(0.22)} />
          <motion.rect x="52" y="54" width="116" height="26" rx="13" {...draw(0.34)} />
          <motion.path d="M110 40v-22" {...draw(0.5, 0.5)} />
          <motion.path d="M92 24 110 6l18 18" {...draw(0.6, 0.5)} />
          <motion.circle cx="110" cy="99" r="7" {...draw(0.7, 0.6)} />
        </>
      );
    case 'debt-type':
      return (
        <>
          <motion.rect
            x="34"
            y="70"
            width="120"
            height="74"
            rx="10"
            transform="rotate(-9 94 107)"
            {...draw(0.1)}
          />
          <motion.rect x="66" y="60" width="120" height="74" rx="10" {...draw(0.28)} />
          <motion.path d="M66 84h120" {...draw(0.5, 0.6)} />
          <motion.path d="M82 112h30" {...draw(0.62, 0.4)} />
        </>
      );
    case 'contact':
      return (
        <>
          <motion.rect x="40" y="56" width="140" height="94" rx="10" {...draw(0.1)} />
          <motion.path d="M40 64 110 112 180 64" {...draw(0.32, 0.9)} />
          <motion.circle cx="152" cy="132" r="26" {...draw(0.6, 0.8)} />
          <motion.path d="m172 152 18 18" {...draw(0.85, 0.4)} />
        </>
      );
    case 'date-of-birth':
      return (
        <>
          <motion.path
            d="M110 22 178 48v54c0 36-27 62-68 76-41-14-68-40-68-76V48l68-26Z"
            {...draw(0.1, 1.3)}
          />
          <motion.path d="m84 104 20 20 38-40" {...draw(0.7, 0.7)} />
        </>
      );
    case 'phone':
      return (
        <>
          <motion.rect x="70" y="26" width="80" height="140" rx="14" {...draw(0.1, 1.2)} />
          <motion.path d="M98 42h24" {...draw(0.6, 0.4)} />
          <motion.path d="M110 150h.5" {...draw(0.7, 0.3)} />
          <motion.path d="M160 62c14 10 14 42 0 52" {...draw(0.75, 0.6)} />
          <motion.path d="M52 62c-14 10-14 42 0 52" {...draw(0.85, 0.6)} />
        </>
      );
    case 'income':
      return (
        <>
          <motion.path d="M38 152h150" {...draw(0.1, 0.6)} />
          <motion.path d="M38 152V34" {...draw(0.2, 0.6)} />
          <motion.rect x="58" y="112" width="24" height="40" {...draw(0.36)} />
          <motion.rect x="96" y="84" width="24" height="68" {...draw(0.48)} />
          <motion.rect x="134" y="52" width="24" height="100" {...draw(0.6)} />
          <motion.path d="M58 96 110 62l50-28" {...draw(0.78, 0.8)} />
        </>
      );
    default:
      return (
        <>
          <motion.path d="M42 96 110 40l68 56" {...draw(0.1, 0.9)} />
          <motion.path d="M58 88v66h104V88" {...draw(0.35, 0.9)} />
          <motion.rect x="94" y="112" width="32" height="42" {...draw(0.62)} />
          <motion.circle cx="110" cy="74" r="9" {...draw(0.8, 0.5)} />
        </>
      );
  }
}

/** Debt curve that visibly flattens as the user moves through the journey. */
function ReliefCurve({ progress }: { progress: number }) {
  const t = progress / 100;
  const endY = 40 + 84 * t;
  const c1y = 40 + 14 * t;
  const c2y = 44 + 74 * t;

  return (
    <svg className={styles.curve} viewBox="0 0 320 140" aria-hidden="true">
      <path
        d="M0 130h320"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
        fill="none"
      />
      <motion.path
        d={`M8 ${40} C 96 ${c1y}, 180 ${c2y}, 312 ${endY}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ d: `M8 40 C 96 ${c1y}, 180 ${c2y}, 312 ${endY}` }}
        transition={{ type: 'spring', stiffness: 90, damping: 20 }}
      />
      <motion.circle
        r="5"
        fill="currentColor"
        initial={false}
        animate={{ cx: 312, cy: endY }}
        transition={{ type: 'spring', stiffness: 90, damping: 20 }}
      />
    </svg>
  );
}

export function LedgerArt({
  stepId,
  progress,
  compact = false,
}: {
  stepId: string;
  progress: number;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={compact ? styles.artCompact : styles.art}>
      <svg
        key={reduceMotion ? 'static' : stepId}
        className={styles.artSvg}
        viewBox="0 0 220 190"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <StepArt stepId={stepId} />
      </svg>

      {compact ? null : (
        <div className={styles.artFoot}>
          <ReliefCurve progress={progress} />
        </div>
      )}
    </div>
  );
}
