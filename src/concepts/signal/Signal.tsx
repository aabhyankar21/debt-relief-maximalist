import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { steps } from '../../data/journey';
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
import { TrustSignal } from './TrustSignal';
import { SnapshotStrip } from './SnapshotStrip';
import { TrustCallout } from './TrustCallout';
import {
  DEBT_BAND_WEIGHT,
  DEBT_TYPE_MATCH_INDEX,
  SCENE_STEP_BY_INDEX,
  SIGNAL_CONFIG,
  TITLE_TREATMENT,
  calloutText,
  signalAdvanceDelay,
  snapshotEntries,
  type OtpStatus,
} from './config';
import stepStyles from '../../steps/stepBody.module.css';
import styles from './signal.module.css';
import './theme.css';

const PHONE_INDEX = 4;
const CONTROL_SELECTOR = 'input, select, textarea';

function BrandMark() {
  return (
    <span className={styles.brand}>
      <svg
        className={styles.brandMark}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        <circle
          cx="12"
          cy="12"
          r="6"
          stroke="currentColor"
          strokeWidth="1.3"
          opacity="0.55"
        />
        <circle
          cx="12"
          cy="12"
          r="9.6"
          stroke="currentColor"
          strokeWidth="1.1"
          opacity="0.22"
        />
      </svg>
      Signal
    </span>
  );
}

export function Signal() {
  const journey = useJourney();
  const { step, index, progress, finished, choices, fields } = journey;
  const reduceMotion = useReducedMotion() ?? false;

  const [hoverAmount, setHoverAmount] = useState<string | null>(null);
  const [fieldFocused, setFieldFocused] = useState(false);
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('idle');
  const [verifying, setVerifying] = useState(false);
  const [highlightAll, setHighlightAll] = useState(false);
  const previousIndex = useRef(index);

  useEffect(() => {
    const from = previousIndex.current;
    previousIndex.current = index;

    if (from !== PHONE_INDEX || index !== PHONE_INDEX + 1) {
      if (!verifying) setOtpStatus('idle');
      return;
    }

    setVerifying(true);

    if (reduceMotion) {
      setOtpStatus('verified');
      const release = window.setTimeout(() => {
        setVerifying(false);
        setOtpStatus('idle');
      }, SIGNAL_CONFIG.timing.reducedS * 1000);
      return () => window.clearTimeout(release);
    }

    setOtpStatus('pending');
    const { otpPendingMs, otpSettleS } = SIGNAL_CONFIG.timing;
    const verify = window.setTimeout(() => setOtpStatus('verified'), otpPendingMs);
    const release = window.setTimeout(
      () => {
        setVerifying(false);
        setOtpStatus('idle');
      },
      otpPendingMs + otpSettleS * 1000 + 180,
    );

    return () => {
      window.clearTimeout(verify);
      window.clearTimeout(release);
    };
  }, [index, reduceMotion, verifying]);

  useEffect(() => {
    setFieldFocused(false);
    setHoverAmount(null);
  }, [index, finished]);

  useEffect(() => {
    if (!finished) {
      setHighlightAll(false);
      return;
    }
    setHighlightAll(true);
    const ms =
      (reduceMotion
        ? SIGNAL_CONFIG.timing.reducedS
        : SIGNAL_CONFIG.timing.chipHighlightS) *
        4 *
        1000 +
      80;
    const timer = window.setTimeout(() => setHighlightAll(false), ms);
    return () => window.clearTimeout(timer);
  }, [finished, reduceMotion]);

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
      : null;
  const matchedDebtTypeIndex = DEBT_TYPE_MATCH_INDEX[choices['debt-type'] ?? ''];

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

  const cue = calloutText(sceneStep, fieldFocused);
  const entries = snapshotEntries(sceneStep, choices, fields.zip);
  const advanceDelay =
    step.id === 'debt-amount' ? signalAdvanceDelay(reduceMotion) : undefined;

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

  const trackFocus = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement | null)?.closest(
      CONTROL_SELECTOR,
    );
    setFieldFocused(Boolean(target));
  }, []);

  const clearFocus = useCallback(() => setFieldFocused(false), []);

  const phoneStep = steps[PHONE_INDEX];

  return (
    <div className={styles.root} data-concept="signal">
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <BackButton
              onClick={journey.back}
              hidden={index === 0 && !finished && !verifying}
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
            <div className={styles.beacon}>
              <div className={styles.signalSlot}>
                <TrustSignal
                  step={sceneStep}
                  debtAmountBand={debtAmountBand}
                  matchedDebtTypeIndex={matchedDebtTypeIndex}
                  otpStatus={otpStatus}
                  attentive={fieldFocused && !verifying && !finished}
                />
              </div>
              <SnapshotStrip entries={entries} highlightAll={highlightAll} />
              <TrustCallout text={cue ?? ''} visible={Boolean(cue)} />
            </div>

            <div
              className={styles.stepWrap}
              onPointerOver={trackAmountHover}
              onPointerLeave={() => setHoverAmount(null)}
              onFocusCapture={trackFocus}
              onBlurCapture={clearFocus}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={finished ? 'result' : verifying ? 'otp' : step.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, position: 'absolute' }}
                  transition={{
                    duration: reduceMotion ? 0.16 : 0.28,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {finished ? (
                    <ResultScreen />
                  ) : verifying ? (
                    <div className={stepStyles.body}>
                      <header className={stepStyles.head}>
                        {renderCopy({
                          kind: 'heading',
                          text: phoneStep.heading,
                          className: stepStyles.heading,
                        })}
                        {phoneStep.subtext ? (
                          renderCopy({
                            kind: 'subtext',
                            text: phoneStep.subtext,
                            emphasis: phoneStep.subtextEmphasis,
                            className: stepStyles.subtext,
                          })
                        ) : null}
                      </header>
                    </div>
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
          </div>
        </main>

        <LegalFooter />
      </div>
    </div>
  );
}
