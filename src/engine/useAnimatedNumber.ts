import { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';

/** Motion value that eases to `value` and formats it as a rounded string. */
export function useAnimatedNumber(
  value: number,
  suffix = '',
): MotionValue<string> {
  const raw = useMotionValue(value);
  const spring = useSpring(raw, { stiffness: 140, damping: 22, mass: 0.7 });

  useEffect(() => {
    raw.set(value);
  }, [raw, value]);

  return useTransform(spring, (latest) => `${Math.round(latest)}${suffix}`);
}
