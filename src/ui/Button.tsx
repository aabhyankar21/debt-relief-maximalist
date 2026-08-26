import { useRef, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { useConcept } from '../engine/concept';
import { ArrowRightIcon } from './icons';
import styles from './ui.module.css';

interface Props {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  withArrow?: boolean;
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
  withArrow = true,
}: Props) {
  const concept = useConcept();
  const reduceMotion = useReducedMotion();
  const kinetic = concept === 'flux' && !reduceMotion && !disabled;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 });
  const localRef = useRef<HTMLButtonElement | null>(null);

  return (
    <motion.button
      ref={localRef}
      type="button"
      className={styles.button}
      data-kinetic={kinetic ? 'true' : undefined}
      disabled={disabled}
      onClick={onClick}
      style={kinetic ? { x: springX, y: springY } : undefined}
      onPointerMove={(event) => {
        const node = localRef.current;
        if (!node || !kinetic || event.pointerType !== 'mouse') return;
        const rect = node.getBoundingClientRect();
        node.style.setProperty(
          '--shine-x',
          `${((event.clientX - rect.left) / rect.width) * 100}%`,
        );
        node.style.setProperty(
          '--shine-y',
          `${((event.clientY - rect.top) / rect.height) * 100}%`,
        );
        x.set((event.clientX - (rect.left + rect.width / 2)) * 0.18);
        y.set((event.clientY - (rect.top + rect.height / 2)) * 0.22);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={kinetic ? { scale: 1.03 } : undefined}
      whileTap={disabled ? undefined : { scale: 0.985 }}
    >
      <span className={styles.buttonLabel}>{children}</span>
      {withArrow ? <ArrowRightIcon /> : null}
    </motion.button>
  );
}
