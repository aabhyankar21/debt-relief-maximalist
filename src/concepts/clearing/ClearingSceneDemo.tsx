import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  ClearingScene,
  DEBT_AMOUNT_OPTIONS,
  DEBT_TYPE_LABELS,
  DEBT_TYPE_OPTIONS,
} from './ClearingScene';
import clearing from './clearing.module.css';
import styles from './clearingSceneDemo.module.css';
import './theme.css';

const STEP_NOTES: Record<number, string> = {
  1: 'Ridge fades in from behind the fog. Height is mapped from debtAmount.',
  2: 'The formation matching debtType saturates; the other three stay hazy.',
  3: 'Path draws on over ~1.2s, then the name flag lands at its near end.',
  4: 'Light source shifts and rotates — the time of day moves on.',
  5: 'Beacon appears, still unlit grey.',
  6: 'Beacon warms and emits one expanding ring: verified.',
  7: 'Pronounced light scale-up and brightness pulse.',
  8: 'Foreground fog burns off, revealing the home marker at the path start.',
  9: 'Partner silhouette fades and scales in; the camera eases back.',
};

const DEBT_AMOUNT_LABELS: Record<string, string> = {
  '16-20': '$16K - $20K',
  '21-25': '$21K - $25K',
  '26-30': '$26K - $30K',
  '31-35': '$31K - $35K',
  '35-plus': '$35K+',
};

const NAME_OPTIONS = ['Alex', 'Priya', 'Jordan', 'Marcus', ''];

interface Preset {
  id: string;
  label: string;
  /** null means "fill whatever space is available". */
  width: number | null;
  height: number;
}

const PRESETS: Preset[] = [
  { id: 'mobile', label: 'Mobile · 375', width: 375, height: 720 },
  { id: 'tablet', label: 'Tablet · 768', width: 768, height: 900 },
  { id: 'laptop', label: 'Laptop · 1024', width: 1024, height: 720 },
  { id: 'desktop', label: 'Desktop · 1440', width: 1440, height: 840 },
  { id: 'fluid', label: 'Fluid', width: null, height: 720 },
];

/** Stand-in for the real form column, so the split view reads correctly. */
function MockForm({ step }: { step: number }) {
  return (
    <div className={clearing.main}>
      <header className={clearing.header}>
        <div className={clearing.headerRow}>
          <span className={styles.mockBrand}>Clearing</span>
          <span className={styles.mockBadge}>Trusted by 100k+ people</span>
        </div>
        <div className={clearing.progressSlot}>
          <div className={styles.mockTrack}>
            <div
              className={styles.mockFill}
              style={{ width: `${Math.round((step / 9) * 100)}%` }}
            />
          </div>
        </div>
      </header>
      <div className={clearing.content}>
        <div className={clearing.stepWrap}>
          <p className={styles.mockEyebrow}>Step {step} of 9</p>
          <h2 className={styles.mockHeading}>
            The form lives here once it is wired up.
          </h2>
          <p className={styles.mockBody}>{STEP_NOTES[step]}</p>
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

/** Review affordance, matching the journey's own `?s=` convention. */
function readParam(key: string, fallback: string) {
  return new URLSearchParams(window.location.search).get(key) ?? fallback;
}

function writeParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.history.replaceState(null, '', `?${params.toString()}`);
}

export function ClearingSceneDemo() {
  const reduceMotion = useReducedMotion() ?? false;

  const [step, setStep] = useState(() => {
    const parsed = Number(readParam('s', '1'));
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 9) : 1;
  });
  const [progressPercent, setProgressPercent] = useState(() =>
    Math.round(((step - 1) / 8) * 100),
  );
  const [debtAmount, setDebtAmount] = useState(() => readParam('amount', '26-30'));
  const [debtType, setDebtType] = useState(() => readParam('type', 'credit-card'));
  const [firstName, setFirstName] = useState(() => readParam('name', 'Alex'));
  const [presetId, setPresetId] = useState(() => readParam('w', 'desktop'));
  const [showChrome, setShowChrome] = useState(
    () => readParam('layout', 'split') === 'split',
  );

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[3];

  /* Scale the frame down when the preset is wider than the space we have.
     Container queries measure layout size, not painted size, so the
     breakpoints under test stay honest. */
  const holderRef = useRef<HTMLDivElement>(null);
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

  const setStepAndProgress = (next: number) => {
    setStep(next);
    setProgressPercent(Math.round(((next - 1) / 8) * 100));
    writeParam('s', String(next));
  };

  /* Left/right arrows scrub steps from anywhere on the page. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
      if (event.key === 'ArrowRight') setStepAndProgress(Math.min(9, step + 1));
      if (event.key === 'ArrowLeft') setStepAndProgress(Math.max(1, step - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  return (
    <div className={styles.lab} data-concept="clearing">
      <header className={styles.bar}>
        <div className={styles.title}>
          <h1>ClearingScene</h1>
          <p>
            Nine states, scrubbable. {reduceMotion ? 'Reduced motion is on — ambient drift and the path draw-on are disabled.' : 'Arrow keys step through.'}
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

      <div className={styles.controls}>
        <label className={styles.control} data-wide="true">
          <span className={styles.controlLabel}>
            Step <strong>{step}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={step}
            onChange={(event) => setStepAndProgress(Number(event.target.value))}
          />
          <span className={styles.note}>{STEP_NOTES[step]}</span>
        </label>

        <label className={styles.control} data-wide="true">
          <span className={styles.controlLabel}>
            progressPercent <strong>{progressPercent}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={progressPercent}
            onChange={(event) => setProgressPercent(Number(event.target.value))}
          />
          <span className={styles.note}>
            Warms the sky, grows the light, and sets the fog baseline.
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
          <span className={styles.controlLabel}>firstName</span>
          <select
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              writeParam('name', event.target.value);
            }}
          >
            {NAME_OPTIONS.map((option) => (
              <option key={option || 'empty'} value={option}>
                {option || '(empty → "You")'}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>Layout</span>
          <button
            type="button"
            className={styles.toggle}
            data-active={showChrome ? 'true' : undefined}
            onClick={() =>
              setShowChrome((value) => {
                writeParam('layout', value ? 'scene' : 'split');
                return !value;
              })
            }
          >
            {showChrome ? 'Split view' : 'Scene only'}
          </button>
        </label>
      </div>

      <div className={styles.holder} ref={holderRef}>
        <div
          className={styles.frame}
          style={{
            width: frameWidth ? `${frameWidth}px` : '100%',
            height: `${preset.height}px`,
            transform: zoom < 1 ? `scale(${zoom})` : undefined,
            marginBottom: zoom < 1 ? `${-preset.height * (1 - zoom)}px` : undefined,
          }}
        >
          {showChrome ? (
            <div className={clearing.root}>
              <div className={clearing.shell}>
                <aside className={clearing.visual}>
                  <ClearingScene
                    className={clearing.scene}
                    step={step}
                    debtAmount={debtAmount}
                    debtType={debtType}
                    firstName={firstName}
                    progressPercent={progressPercent}
                  />
                </aside>
                <MockForm step={step} />
              </div>
            </div>
          ) : (
            <ClearingScene
              step={step}
              debtAmount={debtAmount}
              debtType={debtType}
              firstName={firstName}
              progressPercent={progressPercent}
            />
          )}
        </div>
      </div>

      <p className={styles.footnote}>
        Frame is resizable from its bottom-right corner. Hover or tap the
        beacon, the highlighted formation, the home marker and the partner to
        reveal their labels.
      </p>
    </div>
  );
}
