import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { StepBody, type StepCopySlot } from '../../steps/StepBody';
import {
  BackButton,
  LegalFooter,
  ProgressBar,
  TrustBadge,
} from '../../shell/Chrome';
import { ResultScreen } from '../../shell/ResultScreen';
import { PulseTitle } from '../pulse/PulseTitle';
import { MosaicGrid } from './MosaicGrid';
import {
  DEBT_BAND_WEIGHT,
  DEBT_TYPE_MATCH_INDEX,
  INCOME_BAND_WEIGHT,
  SCENE_STEP_BY_INDEX,
  mosaicAdvanceDelay,
  tilesForStep,
} from './config';
import styles from './mosaic.module.css';
import './theme.css';

const PHONE_INDEX = 4;
const VERIFY_HOLD_MS = 900;

const TITLE_TREATMENT: Record<
  number,
  { animateWeight: boolean; tick: boolean; highlight?: string[] }
> = {
  1: { animateWeight: true, tick: true },
  2: {
    animateWeight: true,
    tick: true,
    highlight: ['Credit cards', 'personal loans'],
  },
  3: { animateWeight: false, tick: false },
  4: {
    animateWeight: true,
    tick: true,
    highlight: ['no impact on your credit score.'],
  },
  5: {
    animateWeight: false,
    tick: false,
    highlight: ['Your privacy is always protected.'],
  },
  6: { animateWeight: true, tick: true },
  7: { animateWeight: true, tick: true },
  8: { animateWeight: false, tick: false },
  9: { animateWeight: true, tick: true },
};

function BrandMark() {
  return (
    <span className={styles.brand}>
      <svg
        className={styles.brandMark}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect x="3.2" y="3.4" width="7.2" height="6.4" rx="1.4" fill="#c9744f" />
        <rect x="11.6" y="4.2" width="9" height="8.2" rx="1.6" fill="#d28a62" />
        <rect x="4" y="11.2" width="8.6" height="9.2" rx="1.5" fill="#b4633f" />
        <rect x="13.6" y="13.4" width="7.2" height="7" rx="1.4" fill="#c9744f" opacity="0.72" />
      </svg>
      Mosaic
    </span>
  );
}

export function Mosaic() {
  const journey = useJourney();
  const { step, index, progress, finished, choices } = journey;
  const reduceMotion = useReducedMotion() ?? false;

  const [hoverAmount, setHoverAmount] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const previousIndex = useRef(index);

  useEffect(() => {
    const from = previousIndex.current;
    previousIndex.current = index;
    if (reduceMotion || from !== PHONE_INDEX || index !== PHONE_INDEX + 1) {
      setVerifying(false);
      return;
    }
    setVerifying(true);
    const timer = window.setTimeout(() => setVerifying(false), VERIFY_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [index, reduceMotion]);

  useEffect(() => setHoverAmount(null), [index, finished]);

  const sceneStep = finished
    ? 9
    : verifying
      ? 6
      : SCENE_STEP_BY_INDEX[index] ?? 1;

  const amountId =
    step.id === 'debt-amount'
      ? (hoverAmount ?? choices['debt-amount'] ?? '')
      : (choices['debt-amount'] ?? '');
  const debtAmountBand =
    amountId && amountId in DEBT_BAND_WEIGHT
      ? DEBT_BAND_WEIGHT[amountId]
      : sceneStep === 1
        ? null
        : 0.5;

  const incomeBand = INCOME_BAND_WEIGHT[choices.income ?? ''] ?? 0.5;
  const matchedDebtTypeIndex = DEBT_TYPE_MATCH_INDEX[choices['debt-type'] ?? ''];

  const advanceDelay =
    step.id === 'debt-amount'
      ? (choiceId: string) =>
          mosaicAdvanceDelay(
            tilesForStep(1, DEBT_BAND_WEIGHT[choiceId] ?? 0, incomeBand, 70),
            reduceMotion,
          )
      : undefined;

  const treatment = TITLE_TREATMENT[sceneStep] ?? TITLE_TREATMENT[1];

  const renderCopy = useCallback(
    (slot: StepCopySlot) => (
      <PulseTitle
        key={slot.kind}
        text={slot.text}
        className={slot.className}
        as={
          slot.kind === 'heading' ? 'h1' : slot.kind === 'question' ? 'h2' : 'p'
        }
        restingWeight={slot.kind === 'heading' ? 700 : undefined}
        animateWeight={slot.kind !== 'subtext' && treatment.animateWeight}
        tick={slot.kind === 'heading' && treatment.tick}
        highlightPhrases={
          slot.kind === 'subtext'
            ? treatment.highlight ?? slot.emphasis
            : undefined
        }
      />
    ),
    [treatment],
  );

  const trackAmountHover = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (step.id !== 'debt-amount') return;
      const target = (event.target as HTMLElement | null)?.closest(
        '[data-choice-id]',
      );
      setHoverAmount(target?.getAttribute('data-choice-id') ?? null);
    },
    [step.id],
  );

  return (
    <div className={styles.root} data-concept="mosaic">
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <BackButton
              onClick={journey.back}
              hidden={index === 0 && !finished}
            />
            <BrandMark />
            <TrustBadge />
          </div>
          {finished ? null : (
            <div className={styles.progressSlot}>
              <ProgressBar value={progress} />
            </div>
          )}
        </header>

        <main className={styles.content} data-sticky-cta="true">
          <div className={styles.stage}>
            <div className={styles.mosaicSlot}>
              <MosaicGrid
                step={sceneStep}
                debtAmountBand={debtAmountBand}
                incomeBand={incomeBand}
                matchedDebtTypeIndex={matchedDebtTypeIndex}
              />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={finished ? 'result' : step.id}
                className={styles.stepWrap}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0.2 : 0.34,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onPointerOver={trackAmountHover}
                onPointerLeave={() => setHoverAmount(null)}
              >
                {finished ? (
                  <ResultScreen />
                ) : (
                  <StepBody
                    step={step}
                    hideCallout
                    renderCopy={renderCopy}
                    advanceDelay={advanceDelay}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <LegalFooter />
      </div>
    </div>
  );
}
