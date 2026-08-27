import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { MotionConfig } from 'motion/react';
import { steps } from '../../data/journey';
import {
  DEBT_AMOUNT_OPTIONS,
  DEBT_TYPE_OPTIONS,
  PULSE_STEPS,
  PulseField,
  alignToDensitySide,
  pulseDensitySide,
  type PulseFieldStats,
  type PulseIntensity,
} from './PulseField';
import { useQuietZone } from './useQuietZone';
import { PulseTitle } from './PulseTitle';
import { InsightCaption } from './InsightCaption';
import { DataMoment } from './DataMoment';
import {
  PulseIntro,
  PULSE_INTRO_CONFIG,
  clearPulseIntroSeen,
} from './PulseIntro';
import {
  DATA_MOMENTS,
  JOURNEY_INDEX_BY_SCENE,
  PULSE_INSIGHTS,
  SCENE_NOTES,
  TITLE_TREATMENT,
  resolveDataMoment,
} from './copy';
import pulse from './pulse.module.css';
import styles from './pulseSceneDemo.module.css';
import './theme.css';

const DEBT_AMOUNT_LABELS: Record<string, string> = {
  '16-20': '$16K - $20K',
  '21-25': '$21K - $25K',
  '26-30': '$26K - $30K',
  '31-35': '$31K - $35K',
  '35-plus': '$35K+',
};

const DEBT_TYPE_LABELS: Record<string, string> = {
  'personal-loans': 'Personal Loans',
  'credit-card': 'Credit Card',
  medical: 'Medical',
  student: 'Student',
};

const INTENSITIES: (PulseIntensity | '')[] = [
  '',
  'chaos',
  'idle',
  'cluster',
  'orbit',
  'pulse',
  'energy',
  'settle',
  'merge',
];

interface Preset {
  id: string;
  label: string;
  /** null means "fill whatever space is available". */
  width: number | null;
  height: number;
}

const PRESETS: Preset[] = [
  { id: 'mobile', label: 'Mobile · 375', width: 375, height: 760 },
  { id: 'tablet', label: 'Tablet · 768', width: 768, height: 920 },
  { id: 'laptop', label: 'Laptop · 1024', width: 1024, height: 700 },
  { id: 'desktop', label: 'Desktop · 1440', width: 1440, height: 840 },
  { id: 'fluid', label: 'Fluid', width: null, height: 720 },
];

/** Review affordance, matching the journey's own `?s=` convention. */
function readParam(key: string, fallback: string) {
  return new URLSearchParams(window.location.search).get(key) ?? fallback;
}

function writeParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.history.replaceState(null, '', `?${params.toString()}`);
}

/**
 * Stand-in for the real form, carrying the actual frozen copy for whichever
 * step this scene belongs to — so the title treatment under review is the
 * one that will ship, not a lorem approximation.
 */
function MockForm({
  scene,
  moment,
  attachCopy,
}: {
  scene: number;
  moment: ReturnType<typeof resolveDataMoment>;
  /** Reports the prose block to the field, exactly as the journey does. */
  attachCopy: (node: HTMLElement | null) => void;
}) {
  const journeyIndex = JOURNEY_INDEX_BY_SCENE[scene];
  const step = journeyIndex == null ? null : steps[journeyIndex];
  const treatment = TITLE_TREATMENT[scene];

  return (
    <div className={pulse.shell}>
      <header className={pulse.header}>
        <div className={pulse.headerRow}>
          <span className={styles.mockBrand}>Pulse</span>
          <span className={styles.mockBadge}>Trusted by 100k+ people</span>
        </div>
        <div className={pulse.progressSlot}>
          <div className={styles.mockTrack}>
            <div
              className={styles.mockFill}
              style={{ width: `${Math.round((scene / 9) * 100)}%` }}
            />
          </div>
        </div>
      </header>

      <div className={pulse.content}>
        <div className={pulse.stepWrap} ref={attachCopy}>
          {/* Grouped in a header to match `StepBody`, because that grouping is
              what the field measures to find the prose. */}
          <header>
            {step ? (
              <>
                {step.eyebrow ? (
                  <p className={styles.mockEyebrow}>{step.eyebrow}</p>
                ) : null}
                <PulseTitle
                  key={`heading-${scene}`}
                  text={step.heading}
                  as="h2"
                  className={styles.mockHeading}
                  animateWeight={treatment.animateWeight}
                  tick={treatment.tick}
                />
                {step.question ? (
                  <PulseTitle
                    key={`question-${scene}`}
                    text={step.question}
                    as="h3"
                    className={styles.mockQuestion}
                    animateWeight={treatment.animateWeight}
                  />
                ) : null}
                {step.subtext ? (
                  <PulseTitle
                    key={`subtext-${scene}`}
                    text={step.subtext}
                    as="p"
                    className={styles.mockBody}
                    highlightPhrases={
                      treatment.highlight ?? step.subtextEmphasis
                    }
                  />
                ) : null}
              </>
            ) : (
              <PulseTitle
                key={`result-${scene}`}
                text="We Highly Recommend Getting Multiple Estimates"
                as="h2"
                className={styles.mockHeading}
                animateWeight={treatment.animateWeight}
                tick={treatment.tick}
              />
            )}
          </header>

          <div className={styles.mockMoment}>
            <DataMoment
              key={`moment-${scene}`}
              variant={moment.variant}
              value={moment.value}
              label={moment.label}
              marker={moment.marker}
              chips={moment.chips}
            />
            {moment.variant === 'none' ? (
              <p className={styles.emptyMoment}>DataMoment: none</p>
            ) : null}
          </div>

          <div className={styles.mockChoices}>
            {['Option one', 'Option two', 'Option three'].map((label) => (
              <span key={label} className={styles.mockChoice}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PulseSceneDemo() {
  const [scene, setScene] = useState(() => {
    const parsed = Number(readParam('s', '1'));
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 9) : 1;
  });
  const [debtAmount, setDebtAmount] = useState(() =>
    readParam('amount', '26-30'),
  );
  const [debtType, setDebtType] = useState(() => readParam('type', 'credit-card'));
  const [intensity, setIntensity] = useState(() => readParam('i', ''));
  const [presetId, setPresetId] = useState(() => readParam('w', 'desktop'));
  const [showForm, setShowForm] = useState(
    () => readParam('layout', 'form') === 'form',
  );
  const [simulateReduced, setSimulateReduced] = useState(
    () => readParam('rm', '0') === '1',
  );
  const [capInput, setCapInput] = useState(() => readParam('cap', ''));

  /* ------------------------- title playground ------------------------- */

  const [titleText, setTitleText] = useState(
    'Your birth date helps providers tailor offers. This has no impact on your credit score.',
  );
  const [phrasesText, setPhrasesText] = useState(
    'no impact on your credit score.',
  );
  const [countUpText, setCountUpText] = useState('');
  const [playgroundWeight, setPlaygroundWeight] = useState(true);
  const [playgroundTick, setPlaygroundTick] = useState(true);
  const [replay, setReplay] = useState(0);
  const [playingIntro, setPlayingIntro] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  const [introMs, setIntroMs] = useState<number | null>(null);
  const introStarted = useRef(0);

  const phrases = phrasesText
    .split(',')
    .map((phrase) => phrase.trim())
    .filter(Boolean);
  const countUpValue = countUpText.trim() ? Number(countUpText) : undefined;

  /* ------------------------------ stats ------------------------------ */

  const [stats, setStats] = useState<PulseFieldStats | null>(null);
  const logged = useRef('');

  const onStats = useCallback((next: PulseFieldStats) => {
    setStats(next);
    /* One line per meaningful change rather than one every half second, so
       the console stays readable while tuning. */
    const signature = `${next.particles}|${next.intensity}|${next.reducedMotion}|${next.wave.toFixed(2)}`;
    if (signature === logged.current) return;
    logged.current = signature;
    console.log(
      `[PulseField] particles=${next.particles} intensity=${next.intensity} wave=${next.wave.toFixed(2)} reducedMotion=${next.reducedMotion}`,
    );
  }, []);

  const preset = PRESETS.find((option) => option.id === presetId) ?? PRESETS[3];

  /* Scale the frame down when the preset is wider than the space we have.
     Container queries measure layout size, not painted size, so the
     breakpoints under test stay honest. */
  const holderRef = useRef<HTMLDivElement>(null);
  const frameRootRef = useRef<HTMLDivElement>(null);
  const { quietZone, attachCopy } = useQuietZone(frameRootRef);
  const [available, setAvailable] = useState(0);

  useLayoutEffect(() => {
    const node = holderRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setAvailable(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const frameWidth = preset.width;
  const zoom =
    frameWidth && available > 0 ? Math.min(1, available / frameWidth) : 1;

  /* Left/right arrows scrub scenes from anywhere on the page. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
      const next =
        event.key === 'ArrowRight'
          ? Math.min(9, scene + 1)
          : event.key === 'ArrowLeft'
            ? Math.max(1, scene - 1)
            : null;
      if (next === null) return;
      setScene(next);
      writeParam('s', String(next));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene]);

  const insight = PULSE_INSIGHTS[scene];
  const moment = resolveDataMoment(scene, {
    'debt-amount': debtAmount,
    'debt-type': debtType,
    income: '50-100k',
  });
  const momentMeta = DATA_MOMENTS[scene];
  const narrowFrame = (frameWidth ?? available) <= 640;
  const cap = capInput.trim() ? Number(capInput) : undefined;

  /* Only meaningful with the mock form up; field-only mode has no copy to
     keep clear of. */
  const activeQuiet = showForm ? quietZone : null;

  const field = (
    <PulseField
      className={showForm ? pulse.scene : undefined}
      step={scene}
      intensity={(intensity || undefined) as PulseIntensity | undefined}
      quietZone={activeQuiet}
      debtAmount={debtAmount}
      debtType={debtType}
      particleCap={Number.isFinite(cap) ? cap : undefined}
      onStats={onStats}
    />
  );

  const densitySide = pulseDensitySide(scene, activeQuiet);
  const insightAnchor =
    insight && densitySide !== 'none'
      ? alignToDensitySide(
          narrowFrame ? insight.anchorNarrow : insight.anchor,
          densitySide,
        )
      : null;

  return (
    <div className={styles.lab} data-concept="pulse">
      <header className={styles.bar}>
        <div className={styles.title}>
          <h1>PulseField</h1>
          <p>
            Nine states plus the one-time intro. Scrubbable in both directions
            with the arrow keys. Replay intro clears the session flag and
            remounts the chaos-to-calm wave; the CTA must appear in under{' '}
            {PULSE_INTRO_CONFIG.capMs / 1000}s.
          </p>
        </div>

        <div className={styles.presets} role="group" aria-label="Preview width">
          {PRESETS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={styles.preset}
              data-active={option.id === presetId ? 'true' : undefined}
              onClick={() => {
                setPresetId(option.id);
                writeParam('w', option.id);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.readout} role="status">
        <span className={styles.stat}>
          particles <strong>{stats?.particles ?? '–'}</strong>
        </span>
        <span className={styles.stat}>
          intensity{' '}
          <strong>{stats?.intensity ?? PULSE_STEPS[scene].intensity}</strong>
        </span>
        <span className={styles.stat}>
          fps <strong>{stats?.fps ?? '–'}</strong>
        </span>
        <span className={styles.stat}>
          reduced motion{' '}
          <strong>{stats?.reducedMotion ? 'on' : 'off'}</strong>
        </span>
        <span className={styles.stat}>
          DataMoment{' '}
          <strong>{moment.variant === 'none' ? 'none (empty)' : moment.variant}</strong>
        </span>
        <span className={styles.stat}>
          intro CTA{' '}
          <strong>
            {introMs == null
              ? '–'
              : `${Math.round(introMs)}ms${introMs > PULSE_INTRO_CONFIG.capMs ? ' OVER CAP' : ''}`}
          </strong>
        </span>
        <span className={styles.statNote}>
          Same figures are logged to the console on every change. Intro cap is{' '}
          {PULSE_INTRO_CONFIG.capMs}ms.
        </span>
      </div>

      <div className={styles.controls}>
        <label className={styles.control} data-wide="true">
          <span className={styles.controlLabel}>
            Scene <strong>{scene}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={scene}
            onChange={(event) => {
              setScene(Number(event.target.value));
              writeParam('s', event.target.value);
            }}
          />
          <span className={styles.note}>{SCENE_NOTES[scene]}</span>
          <span className={styles.note}>
            DataMoment: {momentMeta.variant}
            {momentMeta.variant === 'none' ? ' — not hidden, not rendered.' : ''}{' '}
            {momentMeta.note}
          </span>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>debtAmount</span>
          <select
            value={debtAmount}
            onChange={(event) => {
              setDebtAmount(event.target.value);
              writeParam('amount', event.target.value);
            }}
          >
            {DEBT_AMOUNT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {DEBT_AMOUNT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>debtType</span>
          <select
            value={debtType}
            onChange={(event) => {
              setDebtType(event.target.value);
              writeParam('type', event.target.value);
            }}
          >
            {DEBT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {DEBT_TYPE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>intensity override</span>
          <select
            value={intensity}
            onChange={(event) => {
              setIntensity(event.target.value);
              writeParam('i', event.target.value);
            }}
          >
            {INTENSITIES.map((option) => (
              <option key={option || 'step'} value={option}>
                {option || "(the scene's own)"}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>particle cap</span>
          <input
            type="number"
            min={0}
            max={250}
            placeholder="adaptive"
            value={capInput}
            onChange={(event) => {
              setCapInput(event.target.value);
              writeParam('cap', event.target.value);
            }}
          />
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>Layout</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={showForm ? 'true' : undefined}
            onClick={() =>
              setShowForm((value) => {
                writeParam('layout', value ? 'scene' : 'form');
                return !value;
              })
            }
          >
            {showForm ? 'Form on field' : 'Field only'}
          </button>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>prefers-reduced-motion</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={simulateReduced ? 'true' : undefined}
            onClick={() =>
              setSimulateReduced((value) => {
                writeParam('rm', value ? '0' : '1');
                return !value;
              })
            }
          >
            {simulateReduced ? 'Simulated on' : 'Following the OS'}
          </button>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>PulseIntro</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={playingIntro ? 'true' : undefined}
            onClick={() => {
              clearPulseIntroSeen();
              introStarted.current = performance.now();
              setIntroMs(null);
              setIntroKey((value) => value + 1);
              setPlayingIntro(true);
            }}
          >
            Replay intro
          </button>
        </label>
      </div>

      {/* Everything below the toggle sees the simulated setting, so both
          states can be reviewed without touching OS preferences. */}
      <MotionConfig reducedMotion={simulateReduced ? 'always' : 'user'}>
        <div className={styles.holder} ref={holderRef}>
          <div
            className={styles.frame}
            style={{
              width: frameWidth ? `${frameWidth}px` : '100%',
              height: `${preset.height}px`,
              transform: zoom < 1 ? `scale(${zoom})` : undefined,
              marginBottom:
                zoom < 1 ? `${-preset.height * (1 - zoom)}px` : undefined,
            }}
          >
            {playingIntro ? (
              <PulseIntro
                key={introKey}
                onComplete={() => {
                  const ms = performance.now() - introStarted.current;
                  setIntroMs(ms);
                  console.log(
                    `[PulseIntro] CTA ready in ${Math.round(ms)}ms (cap ${PULSE_INTRO_CONFIG.capMs}ms)`,
                  );
                }}
                onContinue={() => setPlayingIntro(false)}
              />
            ) : showForm ? (
              <div className={pulse.root} ref={frameRootRef}>
                {field}
                <div className={pulse.captions}>
                  {insight && insightAnchor ? (
                    <InsightCaption
                      key={scene}
                      text={insight.text}
                      tone={insight.tone}
                      anchorPosition={insightAnchor}
                    />
                  ) : null}
                </div>
                <MockForm
                  scene={scene}
                  moment={moment}
                  attachCopy={attachCopy}
                />
              </div>
            ) : (
              field
            )}
          </div>
        </div>

        <section className={styles.playground}>
          <div className={styles.playgroundHead}>
            <h2>PulseTitle</h2>
            <p>
              Arbitrary copy, so highlight matching and the count-up can be
              checked against strings the journey does not have yet. Phrases are
              comma-separated and matched case-insensitively.
            </p>
          </div>

          <div className={styles.controls}>
            <label className={styles.control} data-wide="true">
              <span className={styles.controlLabel}>text</span>
              <textarea
                rows={3}
                value={titleText}
                onChange={(event) => setTitleText(event.target.value)}
              />
            </label>

            <label className={styles.control}>
              <span className={styles.controlLabel}>highlightPhrases</span>
              <input
                type="text"
                value={phrasesText}
                onChange={(event) => setPhrasesText(event.target.value)}
              />
            </label>

            <label className={styles.control}>
              <span className={styles.controlLabel}>countUpValue</span>
              <input
                type="number"
                placeholder="none"
                value={countUpText}
                onChange={(event) => setCountUpText(event.target.value)}
              />
            </label>

            <label className={styles.control}>
              <span className={styles.controlLabel}>animateWeight</span>
              <button
                type="button"
                className={styles.toggle}
                data-active={playgroundWeight ? 'true' : undefined}
                onClick={() => setPlaygroundWeight((value) => !value)}
              >
                {playgroundWeight ? '300 → 560' : 'static'}
              </button>
            </label>

            <label className={styles.control}>
              <span className={styles.controlLabel}>tick</span>
              <button
                type="button"
                className={styles.toggle}
                data-active={playgroundTick ? 'true' : undefined}
                onClick={() => setPlaygroundTick((value) => !value)}
              >
                {playgroundTick ? 'underline on' : 'off'}
              </button>
            </label>

            <label className={styles.control}>
              <span className={styles.controlLabel}>replay</span>
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setReplay((value) => value + 1)}
              >
                Resolve again
              </button>
            </label>
          </div>

          <div className={styles.playgroundStage}>
            <PulseTitle
              key={replay}
              text={titleText}
              as="h3"
              className={styles.playgroundTitle}
              highlightPhrases={phrases}
              animateWeight={playgroundWeight}
              tick={playgroundTick}
              countUpValue={
                countUpValue != null && Number.isFinite(countUpValue)
                  ? countUpValue
                  : undefined
              }
            />
          </div>
        </section>
      </MotionConfig>

      <p className={styles.footnote}>
        Frame is resizable from its bottom-right corner. Insight captions and
        numeric DataMoment copy are placeholder text pending legal sign-off.
        Reserved word highlights on regulated copy also need compliance review
        before this ships.
      </p>
    </div>
  );
}
