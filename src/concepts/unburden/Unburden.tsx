import {
  useCallback,
  useEffect,
  useState,
  type FocusEvent,
  type PointerEvent,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useJourney } from '../../engine/journey';
import { useMediaQuery } from '../../engine/useMediaQuery';
import { StepBody, type StepCopySlot } from '../../steps/StepBody';
import {
  BackButton,
  LegalFooter,
  ProgressBar,
  TrustBadge,
} from '../../shell/Chrome';
import { ResultScreen } from '../../shell/ResultScreen';
import { PulseTitle } from '../pulse/PulseTitle';
import { UnburdenScene } from './UnburdenScene';
import {
  DEBT_BAND_WEIGHT,
  SCENE_STEP_BY_INDEX,
  isSpreadScene,
  unburdenAdvanceDelay,
} from './config';
import forbesAdvisorLogo from './forbes-advisor-logo.png';
import styles from './unburden.module.css';
import './theme.css';

const TITLE_TREATMENT: Record<
  number,
  {
    animateWeight: boolean;
    tick: boolean;
    highlight?: string[];
    highlightTick?: boolean;
  }
> = {
  1: { animateWeight: true, tick: true },
  2: {
    animateWeight: true,
    tick: true,
    highlight: ['Credit cards', 'personal loans'],
    highlightTick: false,
  },
  3: { animateWeight: false, tick: false },
  4: {
    animateWeight: true,
    tick: true,
    highlight: ['no impact on your credit score.'],
    highlightTick: false,
  },
  5: {
    animateWeight: false,
    tick: false,
    highlight: ['Your privacy is always protected.'],
    highlightTick: false,
  },
  6: { animateWeight: true, tick: true },
  7: { animateWeight: true, tick: true },
  8: { animateWeight: false, tick: false },
  9: { animateWeight: true, tick: true },
};

function BrandMark() {
  return (
    <span className={styles.brand}>
      <img
        className={styles.brandLogo}
        src={forbesAdvisorLogo}
        alt="Forbes Advisor"
      />
    </span>
  );
}

export function Unburden() {
  const journey = useJourney();
  const { step, index, progress, finished, choices } = journey;
  const reduceMotion = useReducedMotion() ?? false;
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  const [hoverChoice, setHoverChoice] = useState<string | null>(null);

  useEffect(() => setHoverChoice(null), [index, finished]);

  const sceneStep = finished ? 9 : (SCENE_STEP_BY_INDEX[index] ?? 1);

  const amountId =
    step.id === 'debt-amount'
      ? (hoverChoice ?? choices['debt-amount'] ?? '')
      : (choices['debt-amount'] ?? '');
  const debtAmountBand =
    amountId && amountId in DEBT_BAND_WEIGHT
      ? DEBT_BAND_WEIGHT[amountId]
      : 0.55;
  const typeSpotlight =
    step.id === 'debt-type' && canHover
      ? (hoverChoice ?? choices['debt-type'] ?? null)
      : null;

  const treatment = TITLE_TREATMENT[sceneStep] ?? TITLE_TREATMENT[1];
  const advanceDelay = unburdenAdvanceDelay(reduceMotion);

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
        tick={false}
        highlightPhrases={
          slot.kind === 'subtext'
            ? treatment.highlight ?? slot.emphasis
            : undefined
        }
        highlightTick={treatment.highlightTick !== false}
      />
    ),
    [treatment],
  );

  const trackChoiceHover = useCallback(
    (event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) => {
      if (step.id !== 'debt-amount' && step.id !== 'debt-type') return;
      const target = (event.target as HTMLElement | null)?.closest(
        '[data-choice-id]',
      );
      setHoverChoice(target?.getAttribute('data-choice-id') ?? null);
    },
    [step.id],
  );

  return (
    <div
      className={styles.root}
      data-concept="unburden"
      data-unburden-root=""
      data-unburden-layout={isSpreadScene(sceneStep) ? 'spread' : undefined}
      data-result={finished ? 'true' : undefined}
    >
      <div className={styles.shell}>
        <header className={styles.header} data-unburden-header="">
          <div className={styles.headerRow}>
            <BrandMark />
            <TrustBadge />
          </div>
        </header>

        <main className={styles.content} data-sticky-cta="true">
          <div className={styles.stage}>
            <div className={styles.sceneSlot} data-unburden-slot="" aria-hidden="true">
              <UnburdenScene
                step={sceneStep}
                debtAmountBand={debtAmountBand}
                spotlightId={typeSpotlight}
              />
            </div>

            <div className={styles.formCol} data-unburden-form="">
              {finished ? null : (
                <div className={styles.formChrome}>
                  {index === 0 ? null : (
                    <div className={styles.backSlot}>
                      <BackButton onClick={journey.back} />
                    </div>
                  )}
                  <div className={styles.progressSlot}>
                    <ProgressBar value={progress} />
                  </div>
                </div>
              )}
              {finished ? (
                <motion.div
                  className={styles.stepWrap}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: reduceMotion ? 0.2 : 0.34,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <ResultScreen centered />
                </motion.div>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step.id}
                    className={styles.stepWrap}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reduceMotion ? 0.2 : 0.34,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onPointerOver={trackChoiceHover}
                    onPointerLeave={() => setHoverChoice(null)}
                    onFocusCapture={trackChoiceHover}
                    onBlurCapture={(event) => {
                      const next = event.relatedTarget as Node | null;
                      if (!event.currentTarget.contains(next)) {
                        setHoverChoice(null);
                      }
                    }}
                  >
                    <StepBody
                      step={step}
                      hideCallout
                      renderCopy={renderCopy}
                      advanceDelay={advanceDelay}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </main>

        <LegalFooter />
      </div>
    </div>
  );
}
