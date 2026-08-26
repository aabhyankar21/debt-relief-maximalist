import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { steps, type Step } from '../data/journey';
import { isFieldValid } from './validation';

export interface DateValue {
  month: string;
  day: string;
  year: string;
}

export interface JourneyState {
  index: number;
  step: Step;
  totalSteps: number;
  progress: number;
  direction: 1 | -1;
  finished: boolean;
  choices: Record<string, string>;
  fields: Record<string, string>;
  dob: DateValue;
  canAdvance: boolean;
  selectChoice: (stepId: string, choiceId: string) => void;
  setField: (fieldId: string, value: string) => void;
  setDobPart: (part: keyof DateValue, value: string) => void;
  next: () => void;
  back: () => void;
  restart: () => void;
}

const JourneyContext = createContext<JourneyState | null>(null);

const emptyDob: DateValue = { month: '', day: '', year: '' };

/** Review affordance: `?s=3` opens the journey on a specific step. */
function initialIndex(): number {
  const raw = new URLSearchParams(window.location.search).get('s');
  const parsed = Number(raw);
  if (!raw || Number.isNaN(parsed)) return 0;
  return Math.min(Math.max(Math.trunc(parsed), 0), steps.length - 1);
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [finished, setFinished] = useState(false);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<Record<string, string>>({});
  const [dob, setDob] = useState<DateValue>(emptyDob);

  const step = steps[index];

  const next = useCallback(() => {
    setDirection(1);
    setIndex((current) => {
      if (current >= steps.length - 1) {
        setFinished(true);
        return current;
      }
      return current + 1;
    });
  }, []);

  const back = useCallback(() => {
    setDirection(-1);
    if (finished) {
      setFinished(false);
      return;
    }
    setIndex((current) => Math.max(0, current - 1));
  }, [finished]);

  const selectChoice = useCallback((stepId: string, choiceId: string) => {
    setChoices((current) => ({ ...current, [stepId]: choiceId }));
  }, []);

  const setField = useCallback((fieldId: string, value: string) => {
    setFields((current) => ({ ...current, [fieldId]: value }));
  }, []);

  const setDobPart = useCallback((part: keyof DateValue, value: string) => {
    setDob((current) => ({ ...current, [part]: value }));
  }, []);

  const restart = useCallback(() => {
    setDirection(1);
    setIndex(0);
    setFinished(false);
    setChoices({});
    setFields({});
    setDob(emptyDob);
  }, []);

  const canAdvance = useMemo(() => {
    if (step.kind === 'choice') return Boolean(choices[step.id]);
    if (step.kind === 'date')
      return Boolean(dob.month && dob.day && dob.year);
    return step.fields.every((field) =>
      field.required ? isFieldValid(field, fields[field.id] ?? '') : true,
    );
  }, [step, choices, fields, dob]);

  const value = useMemo<JourneyState>(
    () => ({
      index,
      step,
      totalSteps: steps.length,
      progress: finished ? 100 : step.progress,
      direction,
      finished,
      choices,
      fields,
      dob,
      canAdvance,
      selectChoice,
      setField,
      setDobPart,
      next,
      back,
      restart,
    }),
    [
      index,
      step,
      finished,
      direction,
      choices,
      fields,
      dob,
      canAdvance,
      selectChoice,
      setField,
      setDobPart,
      next,
      back,
      restart,
    ],
  );

  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  );
}

export function useJourney(): JourneyState {
  const context = useContext(JourneyContext);
  if (!context) throw new Error('useJourney must be used within JourneyProvider');
  return context;
}
