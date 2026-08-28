import { useCallback, useState } from 'react';
import {
  clusterForPose,
  heldCount,
  isSpreadScene,
  particleBudget,
  poseForScene,
} from './config';
import { Figure, type FigureMass } from './Figure';
import { AddressCard } from './AddressCard';
import { BirthDateCard } from './BirthDateCard';
import { ContactCard } from './ContactCard';
import { IncomeBill } from './IncomeBill';
import { MassField, type MassFieldStats } from './MassField';
import { PhoneCard } from './PhoneCard';
import { TypeCollage } from './TypeCollage';
import styles from './unburdenScene.module.css';

export interface UnburdenSceneProps {
  step: number;
  debtAmountBand: number | null;
  /** Hovered or selected debt type on scene 2. */
  spotlightId?: string | null;
  /** Hovered or selected income band (0–1) on scene 7. */
  incomeBand?: number | null;
  reducedMotion?: boolean;
  onStats?: (stats: MassFieldStats) => void;
  className?: string;
}

const REST_MASS: FigureMass = clusterForPose(1, 0.55);

export function UnburdenScene({
  step,
  debtAmountBand,
  spotlightId = null,
  incomeBand = null,
  reducedMotion,
  onStats,
  className,
}: UnburdenSceneProps) {
  const [mass, setMass] = useState<FigureMass>(REST_MASS);
  const pose = poseForScene(step);
  const held = heldCount(step, debtAmountBand);
  const budget = particleBudget(debtAmountBand);
  const spread = isSpreadScene(step);

  const onMass = useCallback((next: FigureMass) => {
    setMass((current) =>
      Math.abs(current.x - next.x) < 0.002 &&
      Math.abs(current.y - next.y) < 0.002 &&
      Math.abs(current.r - next.r) < 0.002
        ? current
        : next,
    );
  }, []);

  return (
    <div
      className={`${styles.scene}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {step === 2 ? (
        <TypeCollage activeId={spotlightId} />
      ) : step === 3 ? (
        <ContactCard reducedMotion={reducedMotion} />
      ) : step === 4 ? (
        <BirthDateCard reducedMotion={reducedMotion} />
      ) : step === 5 ? (
        <PhoneCard reducedMotion={reducedMotion} />
      ) : step === 7 ? (
        <IncomeBill incomeBand={incomeBand} reducedMotion={reducedMotion} />
      ) : step === 8 ? (
        <AddressCard reducedMotion={reducedMotion} />
      ) : (
        <>
          {spread ? null : (
            <Figure
              pose={pose}
              debtAmountBand={debtAmountBand}
              onMass={onMass}
            />
          )}
          <MassField
            className={styles.mass}
            mode={spread ? 'spread' : 'palm'}
            mass={mass}
            held={held}
            budget={budget}
            reducedMotion={reducedMotion}
            onStats={onStats}
          />
        </>
      )}
    </div>
  );
}
