import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  DEBT_AMOUNT_OPTIONS,
  THREAD_DOTS,
  ThreadScene,
  type ThreadOrientation,
} from './ThreadScene';
import thread from './thread.module.css';
import styles from './threadSceneDemo.module.css';
import './theme.css';

const STEP_NOTES: Record<number, string> = {
  1: 'Most coiled state. Tightness shifts a little with the selected band. First dot appears.',
  2: 'Second dot appears, the first brightens, the line eases a notch straighter.',
  3: 'The handwritten first name fades in beside its dot and follows the line from here on.',
  4: 'One bokeh disc cross-fades warm. Line eases straighter.',
  5: 'A dot appears further along, dim and unlit.',
  6: 'That dot lights and throws a single expanding ring, then holds.',
  7: 'The largest single straightening in the flow — most of the coil is pulled out at once.',
  8: 'A dot near the viewer end brightens. The line is nearly straight.',
  9: 'Fully straight, with one new dot at the far end. No extra flourish.',
};

const DEBT_AMOUNT_LABELS: Record<string, string> = {
  '16-20': '$16K - $20K',
  '21-25': '$21K - $25K',
  '26-30': '$26K - $30K',
  '31-35': '$31K - $35K',
  '35-plus': '$35K+',
};

/** Every `focusedField` value the journey can produce, plus the idle case. */
const FOCUS_OPTIONS = [
  '',
  ...Array.from(new Set(THREAD_DOTS.flatMap((dot) => dot.fields))),
];

const ORIENTATIONS: ThreadOrientation[] = ['auto', 'horizontal', 'vertical'];

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
  { id: 'laptop', label: 'Laptop · 1024', width: 1024, height: 700 },
  { id: 'desktop', label: 'Desktop · 1440', width: 1440, height: 840 },
  { id: 'fluid', label: 'Fluid', width: null, height: 700 },
];

/** Stand-in for the real form, so the glass-over-scene reading is honest. */
function MockCard({ step }: { step: number }) {
  return (
    <div className={thread.shell}>
      <header className={thread.header}>
        <div className={thread.headerRow}>
          <span className={styles.mockBrand}>Thread</span>
          <span className={styles.mockBadge}>Trusted by 100k+ people</span>
        </div>
        <div className={thread.progressSlot}>
          <div className={styles.mockTrack}>
            <div
              className={styles.mockFill}
              style={{ width: `${Math.round((step / 9) * 100)}%` }}
            />
          </div>
        </div>
      </header>
      <div className={thread.content}>
        <div className={thread.card}>
          <p className={styles.mockEyebrow}>Step {step} of 9</p>
          <h2 className={styles.mockHeading}>
            The form sits in glass, directly on the scene.
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

export function ThreadSceneDemo() {
  const reduceMotion = useReducedMotion() ?? false;

  const [step, setStep] = useState(() => {
    const parsed = Number(readParam('s', '1'));
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 9) : 1;
  });
  const [debtAmount, setDebtAmount] = useState(() => readParam('amount', '26-30'));
  const [firstName, setFirstName] = useState(() => readParam('name', 'Alex'));
  const [focusedField, setFocusedField] = useState(() => readParam('focus', ''));
  const [orientation, setOrientation] = useState<ThreadOrientation>(
    () => readParam('o', 'auto') as ThreadOrientation,
  );
  const [presetId, setPresetId] = useState(() => readParam('w', 'desktop'));
  const [showForm, setShowForm] = useState(
    () => readParam('layout', 'form') === 'form',
  );

  const preset = PRESETS.find((option) => option.id === presetId) ?? PRESETS[3];

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

  /* Left/right arrows scrub steps from anywhere on the page. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
      const next =
        event.key === 'ArrowRight'
          ? Math.min(9, step + 1)
          : event.key === 'ArrowLeft'
            ? Math.max(1, step - 1)
            : null;
      if (next === null) return;
      setStep(next);
      writeParam('s', String(next));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const scene = (
    <ThreadScene
      className={showForm ? thread.scene : undefined}
      step={step}
      debtAmount={debtAmount}
      firstName={firstName}
      focusedField={focusedField || null}
      orientation={orientation}
      floorProgress={false}
    />
  );

  return (
    <div className={styles.lab} data-concept="thread">
      <header className={styles.bar}>
        <div className={styles.title}>
          <h1>ThreadScene</h1>
          <p>
            Nine states, scrubbable in both directions — the journey itself
            never lets the line re-coil.{' '}
            {reduceMotion
              ? 'Reduced motion is on: idle wobble, bokeh drift and the ring are disabled.'
              : 'Arrow keys step through.'}
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
            onChange={(event) => {
              setStep(Number(event.target.value));
              writeParam('s', event.target.value);
            }}
          />
          <span className={styles.note}>{STEP_NOTES[step]}</span>
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
          <span className={styles.controlLabel}>firstName</span>
          <input
            type="text"
            placeholder="Alex"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              writeParam('name', event.target.value);
            }}
          />
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>focusedField</span>
          <select
            value={focusedField}
            onChange={(event) => {
              setFocusedField(event.target.value);
              writeParam('focus', event.target.value);
            }}
          >
            {FOCUS_OPTIONS.map((option) => (
              <option key={option || 'none'} value={option}>
                {option || '(nothing focused)'}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>orientation</span>
          <select
            value={orientation}
            onChange={(event) => {
              setOrientation(event.target.value as ThreadOrientation);
              writeParam('o', event.target.value);
            }}
          >
            {ORIENTATIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
            {showForm ? 'Glass form on top' : 'Scene only'}
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
          {showForm ? (
            <div className={thread.root}>
              {scene}
              <MockCard step={step} />
            </div>
          ) : (
            scene
          )}
        </div>
      </div>

      <p className={styles.footnote}>
        Frame is resizable from its bottom-right corner. `auto` runs the thread
        top-to-bottom once the frame is taller than it is wide.
      </p>
    </div>
  );
}
