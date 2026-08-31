import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react';
import { steps } from '../../data/journey';
import {
  LegalFooter,
  ProgressBar,
  TrustBadge,
} from '../../shell/Chrome';
import { CheckIcon } from '../../ui/icons';
import forbesAdvisorLogo from '../../assets/forbes-advisor-logo.png';
import { PulseTitle } from '../pulse/PulseTitle';
import { GenerativeGlow } from './GenerativeGlow';
import { TrustInsightLine } from './TrustInsightLine';
import {
  DEBT_AMOUNT_OPTIONS,
  PRESENCE_CONFIG,
  glowIntensityForBand,
} from './config';
import styles from './presence.module.css';
import './theme.css';

const STEP = steps[0];

export interface DebtAmountStepProps {
  selectedBand: string | null;
  onSelect: (band: string) => void;
  /** Optional looping video for the cinemagraph treatment. */
  videoSrc?: string;
  /** Optional still used when video is unavailable. */
  imageSrc?: string;
  /** Progress percent; defaults to the frozen journey value for step 1. */
  progress?: number;
  className?: string;
}

function ms(value: number) {
  return value / 1000;
}

/**
 * Presence — Step 1 only.
 * Full-bleed photo, scrim lighting, generative glow, and the debt-amount
 * question sitting directly on the image. Selection state is lifted so this
 * screen can plug into the multi-step form later without rework.
 */
export function DebtAmountStep({
  selectedBand,
  onSelect,
  videoSrc,
  imageSrc,
  progress = STEP.progress,
  className,
}: DebtAmountStepProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { loadIn, colors } = PRESENCE_CONFIG;
  const intensity = glowIntensityForBand(selectedBand);

  const [insightVisible, setInsightVisible] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setInsightVisible(true);
      return;
    }
    const timer = window.setTimeout(
      () => setInsightVisible(true),
      loadIn.insightMs,
    );
    return () => window.clearTimeout(timer);
  }, [reduceMotion, loadIn.insightMs]);

  const variants = useMemo<Record<string, Variants>>(
    () =>
      reduceMotion
        ? {
            photo: {
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { duration: ms(loadIn.reducedMs) },
              },
            },
            chrome: {
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { duration: ms(loadIn.reducedMs) },
              },
            },
            choices: {
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { duration: ms(loadIn.reducedMs) },
              },
            },
          }
        : {
            photo: {
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  duration: ms(loadIn.photoMs),
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            },
            chrome: {
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  delay: ms(loadIn.photoMs),
                  duration: ms(loadIn.chromeMs - loadIn.photoMs),
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            },
            choices: {
              hidden: { opacity: 0, y: 14 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: ms(loadIn.choicesMs),
                  duration: ms(loadIn.choicesDurMs),
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            },
          },
    [reduceMotion, loadIn],
  );

  const resolveDur = reduceMotion
    ? ms(loadIn.reducedMs)
    : ms(loadIn.headlineDurMs);
  const questionDur = reduceMotion
    ? ms(loadIn.reducedMs)
    : ms(loadIn.questionDurMs);
  const helperDelay = reduceMotion
    ? 0
    : ms(loadIn.questionMs + loadIn.questionDurMs * 0.35);

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-concept="presence"
    >
      <motion.div
        className={styles.stage}
        variants={variants.photo}
        initial="hidden"
        animate="show"
      >
        {videoSrc && !reduceMotion ? (
          <video
            className={styles.media}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        ) : imageSrc ? (
          <img
            className={styles.media}
            src={imageSrc}
            alt=""
            aria-hidden="true"
          />
        ) : (
          /*
           * Cinemagraph loop is pending real footage of hands (tense/closed).
           * Until then this painted still + light-shift stands in for the
           * "alive" default state described in the Presence step-1 spec.
           */
          <div
            className={styles.photoFallback}
            data-alive={reduceMotion ? 'false' : 'true'}
            aria-hidden="true"
          />
        )}

        <div className={styles.glowSlot}>
          <GenerativeGlow intensity={intensity} color={colors.glow} />
        </div>

        <motion.div
          className={styles.scrim}
          variants={variants.chrome}
          initial="hidden"
          animate="show"
        />
      </motion.div>

      <div className={styles.shell}>
        <motion.header
          className={styles.header}
          variants={variants.chrome}
          initial="hidden"
          animate="show"
        >
          <div className={styles.headerRow}>
            <span className={styles.brand}>
              <img
                className={styles.brandLogo}
                src={forbesAdvisorLogo}
                alt="Forbes Advisor"
              />
            </span>
            <TrustBadge />
          </div>
          <div className={styles.progressSlot}>
            <ProgressBar value={progress} />
          </div>
        </motion.header>

        <main className={styles.content}>
          <div className={styles.column}>
            <div className={styles.copy}>
              {STEP.eyebrow ? (
                <DelayedMount
                  delayMs={reduceMotion ? 0 : loadIn.headlineMs}
                  placeholder={
                    <p className={styles.eyebrow} aria-hidden="true">
                      {STEP.eyebrow}
                    </p>
                  }
                >
                  <motion.p
                    className={styles.eyebrow}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: resolveDur, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {STEP.eyebrow}
                  </motion.p>
                </DelayedMount>
              ) : null}

              <DelayedMount
                delayMs={reduceMotion ? 0 : loadIn.headlineMs}
                placeholder={
                  <h1 className={styles.heading} aria-hidden="true">
                    {STEP.heading}
                  </h1>
                }
              >
                <PulseTitle
                  key="heading"
                  text={STEP.heading}
                  as="h1"
                  className={styles.heading}
                  animateWeight
                  tick
                  resolveDuration={resolveDur}
                  restingWeight={700}
                />
              </DelayedMount>

              <DelayedMount
                delayMs={reduceMotion ? 0 : loadIn.questionMs}
                placeholder={
                  <h2 className={styles.question} aria-hidden="true">
                    {STEP.question}
                  </h2>
                }
              >
                <PulseTitle
                  key="question"
                  text={STEP.question ?? ''}
                  as="h2"
                  className={styles.question}
                  animateWeight
                  resolveDuration={questionDur}
                />
              </DelayedMount>

              {STEP.subtext ? (
                <motion.p
                  className={styles.helper}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: helperDelay,
                    duration: questionDur,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {STEP.subtext}
                </motion.p>
              ) : null}

              <div className={styles.insight}>
                <TrustInsightLine visible={insightVisible} />
              </div>
            </div>

            <motion.div
              className={styles.choices}
              role="radiogroup"
              aria-label={STEP.question ?? STEP.heading}
              variants={variants.choices}
              initial="hidden"
              animate="show"
            >
              {DEBT_AMOUNT_OPTIONS.map((option) => {
                const selected = selectedBand === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-choice-id={option.id}
                    data-selected={selected}
                    className={styles.choice}
                    onClick={() => onSelect(option.id)}
                  >
                    <span className={styles.choiceLabel}>{option.label}</span>
                    <span className={styles.choiceMark} aria-hidden="true">
                      <CheckIcon />
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </div>
        </main>

        <motion.div
          className={styles.footerSlot}
          variants={variants.chrome}
          initial="hidden"
          animate="show"
        >
          <LegalFooter />
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Holds children off the tree until `delayMs` so resolve animations start
 * then. A visually-hidden placeholder keeps layout stable in the meantime.
 */
function DelayedMount({
  delayMs,
  placeholder,
  children,
}: {
  delayMs: number;
  placeholder: ReactNode;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) {
      setReady(true);
      return;
    }
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!ready) {
    return (
      <div style={{ visibility: 'hidden' }} aria-hidden="true">
        {placeholder}
      </div>
    );
  }
  return <>{children}</>;
}
