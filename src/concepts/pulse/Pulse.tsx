import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
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
import {
  PulseField,
  alignToDensitySide,
  pulseDensitySide,
} from './PulseField';
import { useQuietZone } from './useQuietZone';
import { PulseTitle } from './PulseTitle';
import { InsightCaption } from './InsightCaption';
import { DataMoment } from './DataMoment';
import { PulseIntro, hasSeenPulseIntro, markPulseIntroSeen } from './PulseIntro';
import {
  PULSE_INSIGHTS,
  SCENE_STEP_BY_INDEX,
  TITLE_TREATMENT,
  resolveDataMoment,
} from './copy';
import styles from './pulse.module.css';
import './theme.css';

/** The phone step, after which the OTP beat plays without a screen of its own. */
const PHONE_INDEX = 4;
/** Long enough for the ring to complete before the field relaxes. */
const VERIFY_HOLD_MS = 1250;

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
        <circle cx="12" cy="12" r="2.6" fill="currentColor" />
        <circle
          cx="12"
          cy="12"
          r="6.4"
          stroke="currentColor"
          strokeWidth="1.3"
          opacity="0.55"
        />
        <circle
          cx="12"
          cy="12"
          r="10.2"
          stroke="currentColor"
          strokeWidth="1.1"
          opacity="0.22"
        />
      </svg>
      Pulse
    </span>
  );
}

export function Pulse() {
  const journey = useJourney();
  const { step, index, progress, finished, choices } = journey;
  const reduceMotion = useReducedMotion() ?? false;
  const narrow = useMediaQuery('(max-width: 640px)');

  const rootRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [showIntro, setShowIntro] = useState(() => !hasSeenPulseIntro());

  /* Hold the verification beat on the way out of the phone step, so the tight
     cluster gets to fire its ring before the field relaxes into the income
     step's energy lift. */
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

  const sceneStep = finished
    ? 9
    : verifying
      ? 6
      : SCENE_STEP_BY_INDEX[index] ?? 1;

  /**
   * Focus moves the cluster to the control being answered, so the field is
   * visibly reacting to the form rather than running beside it. Only the
   * typed steps opt in: on a choice step the cluster's density is carrying
   * the answer itself, and dragging it to a hovered card would fight that.
   */
  const followsFocus = step.kind !== 'choice' && !finished;

  const anchorFromEvent = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!followsFocus) return;
      const root = rootRef.current;
      const target = (event.target as HTMLElement | null)?.closest(
        CONTROL_SELECTOR,
      );
      if (!root || !target) return;

      const frame = root.getBoundingClientRect();
      if (frame.width <= 0 || frame.height <= 0) return;
      const rect = target.getBoundingClientRect();

      /* Just off the control's leading edge, so particles settle beside the
         field rather than under the text being typed into it. */
      setAnchor({
        x: Math.min(
          Math.max((rect.left - frame.left) / frame.width - 0.05, 0.07),
          0.93,
        ),
        y: Math.min(
          Math.max(
            (rect.top + rect.height / 2 - frame.top) / frame.height,
            0.08,
          ),
          0.92,
        ),
      });
    },
    [followsFocus],
  );

  const clearAnchor = useCallback(() => setAnchor(null), []);

  useEffect(() => setAnchor(null), [index, finished]);

  /* The field sits under the copy with nothing between them, so it needs to
     know where the copy is. */
  const { quietZone, attachCopy } = useQuietZone(rootRef);

  /* ---------------------------- copy treatment ---------------------------- */

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
        /* The ramp belongs to the title, not to body copy. */
        animateWeight={slot.kind !== 'subtext' && treatment.animateWeight}
        tick={slot.kind === 'heading' && treatment.tick}
        /* Where this step has no reserved phrase, the journey's own
           emphasised words still get the treatment. */
        highlightPhrases={
          slot.kind === 'subtext'
            ? treatment.highlight ?? slot.emphasis
            : undefined
        }
      />
    ),
    [treatment],
  );

  const insight = PULSE_INSIGHTS[sceneStep];

  /*
   * A caption is a note pinned to the cluster, so it follows density to
   * whichever side of the copy the frame left room on.
   *
   * When density had nowhere to go — a phone, where the copy spans the frame —
   * the caption has nowhere to go either, and it drops rather than landing on
   * top of the headline. Same signal drives both, so the two can't disagree.
   */
  const densitySide = pulseDensitySide(sceneStep, quietZone);
  const insightAnchor =
    insight && densitySide !== 'none'
      ? alignToDensitySide(
          narrow ? insight.anchorNarrow : insight.anchor,
          densitySide,
        )
      : null;
  const dataMoment = resolveDataMoment(sceneStep, choices);

  if (showIntro) {
    return (
      <PulseIntro
        onComplete={markPulseIntroSeen}
        onContinue={() => {
          markPulseIntroSeen();
          setShowIntro(false);
        }}
      />
    );
  }

  return (
    <div className={styles.root} data-concept="pulse" ref={rootRef}>
      <PulseField
        className={styles.scene}
        step={sceneStep}
        clusterAnchor={anchor}
        quietZone={quietZone}
        debtAmount={choices['debt-amount'] ?? ''}
        debtType={choices['debt-type'] ?? ''}
      />

      <div className={styles.captions}>
        <AnimatePresence mode="wait" initial={false}>
          {insight && insightAnchor ? (
            <InsightCaption
              key={sceneStep}
              text={insight.text}
              tone={insight.tone}
              anchorPosition={insightAnchor}
            />
          ) : null}
        </AnimatePresence>
      </div>

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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={finished ? 'result' : step.id}
              ref={attachCopy}
              className={styles.stepWrap}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.34, ease: [0.22, 1, 0.36, 1] }}
              onFocusCapture={anchorFromEvent}
              onBlurCapture={clearAnchor}
            >
              {finished ? (
                <>
                  <DataMoment
                    key="match"
                    variant={dataMoment.variant}
                    value={dataMoment.value}
                    label={dataMoment.label}
                    marker={dataMoment.marker}
                    chips={dataMoment.chips}
                  />
                  <ResultScreen />
                </>
              ) : (
                <StepBody
                  step={step}
                  hideCallout
                  renderCopy={renderCopy}
                  addon={
                    dataMoment.variant === 'none' ? undefined : (
                      <DataMoment
                        key={sceneStep}
                        variant={dataMoment.variant}
                        value={dataMoment.value}
                        label={dataMoment.label}
                        marker={dataMoment.marker}
                        chips={dataMoment.chips}
                      />
                    )
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <LegalFooter />
      </div>
    </div>
  );
}
