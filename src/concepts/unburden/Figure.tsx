import { useEffect } from 'react';
import {
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { UNBURDEN_CONFIG, clusterForPose, type PoseId } from './config';

export interface FigureMass {
  x: number;
  y: number;
  r: number;
}

export interface FigureProps {
  pose: PoseId;
  /** 0–1. Fattens the palm cluster on the heaviest hold. */
  debtAmountBand: number | null;
  onMass?: (mass: FigureMass) => void;
}

/** Headless pose spring. The hand plate is drawn on the mass canvas
 *  so the cluster stays locked to the palm at every breakpoint. */
export function Figure({ pose, debtAmountBand, onMass }: FigureProps) {
  const reduced = useReducedMotion() ?? false;
  const spring = useSpring(
    pose,
    reduced
      ? { stiffness: 480, damping: 48, mass: 0.4 }
      : UNBURDEN_CONFIG.timing.poseSpring,
  );
  const drift = useMotionValue(0);

  useEffect(() => {
    spring.set(pose);
  }, [pose, spring]);

  useAnimationFrame((time) => {
    if (reduced) {
      drift.set(0);
      return;
    }
    drift.set(Math.sin(time / 7200) * UNBURDEN_CONFIG.timing.idleDrift);
  });

  const display = useTransform([spring, drift], (latest) => {
    const value = Number(latest[0]) + Number(latest[1]);
    return Math.min(5, Math.max(1, value));
  });

  useEffect(() => {
    const publish = (value: number) => {
      onMass?.(clusterForPose(value, debtAmountBand));
    };
    publish(display.get());
    return display.on('change', publish);
  }, [display, debtAmountBand, onMass]);

  return null;
}
