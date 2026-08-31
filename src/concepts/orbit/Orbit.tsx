import { useCallback, useState } from 'react';
import { useJourney } from '../../engine/journey';
import { isFieldValid } from '../../engine/validation';
import { AddressStep } from './AddressStep';
import { BirthdayStep } from './BirthdayStep';
import { ContactStep } from './ContactStep';
import { DebtAmountStep } from './DebtAmountStep';
import { DebtTypeStep } from './DebtTypeStep';
import { IncomeStep } from './IncomeStep';
import { MatchStep } from './MatchStep';
import { PhoneStep } from './PhoneStep';
import {
  DEBT_AMOUNT_OPTIONS,
  DEBT_TYPE_OPTIONS,
  ORBIT_CONFIG,
} from './config';

/**
 * Live concept entry for Orbit.
 * Step 1 (debt amount) → Step 2 (debt type) → Step 3 (contact) →
 * Step 4 (date of birth) → Step 5 (phone) → Step 6 (income) →
 * Step 7 (address) → Step 8 (match).
 * Selection on steps 2 and 6 auto-advances. Continue on field/date
 * steps advances the journey. Address Continue finishes into match.
 */
export function Orbit() {
  const journey = useJourney();
  const [selectedBand, setSelectedBand] = useState<string | null>(
    () => journey.choices['debt-amount'] ?? null,
  );
  const [selectedType, setSelectedType] = useState<string | null>(
    () => journey.choices['debt-type'] ?? null,
  );
  const [selectedIncome, setSelectedIncome] = useState<string | null>(
    () => journey.choices.income ?? null,
  );

  const handleSelectBand = useCallback((band: string) => {
    setSelectedBand(band);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedBand) return;
    journey.selectChoice('debt-amount', selectedBand);
    journey.next();
  }, [journey, selectedBand]);

  const handleSelectType = useCallback(
    (typeId: string) => {
      setSelectedType(typeId);
      journey.selectChoice('debt-type', typeId);
      journey.next();
    },
    [journey],
  );

  const handleSelectIncome = useCallback(
    (incomeId: string) => {
      setSelectedIncome(incomeId);
      journey.selectChoice('income', incomeId);
      journey.next();
    },
    [journey],
  );

  const handleFieldChange = useCallback(
    (fieldId: string, value: string) => {
      journey.setField(fieldId, value);
    },
    [journey],
  );

  const handleContactContinue = useCallback(() => {
    if (!journey.canAdvance) return;
    journey.next();
  }, [journey]);

  const handleBirthdayContinue = useCallback(() => {
    if (!journey.canAdvance) return;
    journey.next();
  }, [journey]);

  const handlePhoneContinue = useCallback(() => {
    if (!journey.canAdvance) return;
    journey.next();
  }, [journey]);

  const handleAddressContinue = useCallback(() => {
    if (!journey.canAdvance) return;
    journey.next();
  }, [journey]);

  const handleBack = useCallback(() => {
    journey.back();
  }, [journey]);

  const canContactContinue = ORBIT_CONFIG.step3.fields.every((field) =>
    field.required
      ? isFieldValid(field, journey.fields[field.id] ?? '')
      : true,
  );

  const canPhoneContinue = isFieldValid(
    ORBIT_CONFIG.step5.field,
    journey.fields.phone ?? '',
  );

  const canAddressContinue = ORBIT_CONFIG.step7.fields.every((field) =>
    field.required
      ? isFieldValid(field, journey.fields[field.id] ?? '')
      : true,
  );

  if (journey.finished) {
    return <MatchStep />;
  }

  if (journey.index >= 6) {
    return (
      <AddressStep
        fields={journey.fields}
        progress={journey.progress}
        canContinue={canAddressContinue}
        onChange={handleFieldChange}
        onContinue={handleAddressContinue}
        onBack={handleBack}
      />
    );
  }

  if (journey.index >= 5) {
    return (
      <IncomeStep
        selectedIncome={selectedIncome}
        progress={journey.progress}
        onSelect={handleSelectIncome}
        onBack={handleBack}
      />
    );
  }

  if (journey.index >= 4) {
    return (
      <PhoneStep
        phone={journey.fields.phone ?? ''}
        progress={journey.progress}
        canContinue={canPhoneContinue}
        onChange={(value) => handleFieldChange('phone', value)}
        onContinue={handlePhoneContinue}
        onBack={handleBack}
      />
    );
  }

  if (journey.index >= 3) {
    return (
      <BirthdayStep
        dob={journey.dob}
        progress={journey.progress}
        canContinue={journey.canAdvance}
        onChange={journey.setDobPart}
        onContinue={handleBirthdayContinue}
        onBack={handleBack}
      />
    );
  }

  if (journey.index >= 2) {
    const amountId = selectedBand ?? journey.choices['debt-amount'] ?? null;
    const typeId = selectedType ?? journey.choices['debt-type'] ?? null;
    const debtAmountLabel =
      DEBT_AMOUNT_OPTIONS.find((option) => option.id === amountId)?.label ??
      null;
    const debtTypeLabel =
      DEBT_TYPE_OPTIONS.find((option) => option.id === typeId)?.label ?? null;

    return (
      <ContactStep
        fields={journey.fields}
        progress={journey.progress}
        canContinue={canContactContinue}
        debtAmountLabel={debtAmountLabel}
        debtTypeLabel={debtTypeLabel}
        onChange={handleFieldChange}
        onContinue={handleContactContinue}
        onBack={handleBack}
      />
    );
  }

  if (journey.index >= 1) {
    return (
      <DebtTypeStep
        selectedType={selectedType}
        progress={journey.progress}
        onSelect={handleSelectType}
        onBack={handleBack}
      />
    );
  }

  return (
    <DebtAmountStep
      selectedBand={selectedBand}
      onSelect={handleSelectBand}
      onContinue={handleContinue}
    />
  );
}
