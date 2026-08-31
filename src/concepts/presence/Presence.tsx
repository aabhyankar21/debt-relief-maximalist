import { useCallback, useState } from 'react';
import { useJourney } from '../../engine/journey';
import { DebtAmountStep } from './DebtAmountStep';

/**
 * Live concept entry for Presence.
 * Scoped to step 1 for this deliverable — selection is recorded on the
 * journey but does not advance, so the glow reaction can be reviewed in place.
 */
export function Presence() {
  const journey = useJourney();
  const [selectedBand, setSelectedBand] = useState<string | null>(
    () => journey.choices['debt-amount'] ?? null,
  );

  const handleSelect = useCallback(
    (band: string) => {
      setSelectedBand(band);
      journey.selectChoice('debt-amount', band);
    },
    [journey],
  );

  return (
    <DebtAmountStep
      selectedBand={selectedBand}
      onSelect={handleSelect}
      progress={journey.progress}
    />
  );
}
